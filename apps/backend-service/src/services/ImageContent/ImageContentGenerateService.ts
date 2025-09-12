import db from "../../config/db";
import {
  ImageContentDTO,
  ImageContentMaskDTO,
  ImageContentRegenerateDTO,
  ImageContentRssDTO,
} from "../../validators/ImageContentValidator";
import { ValidRatio } from "../OpenAiService";
import {
  BusinessKnowledge,
  ProductKnowledge,
  RoleKnowledge,
  RootBusiness,
} from "@prisma/client";
import {
  ImageGenJob,
  ImageGenJobStore,
  ImageGenJobType,
  JobData,
} from "../../store/ImageGenJobStore";
import { Server as SocketIOServer } from "socket.io";
import { io } from "../../socket";
import {
  ImageContentService,
  ImageContentServiceDeps,
} from "./ImageContentService";
import sharp from "sharp";
import axios from "axios";

/** ====== Service Utama ====== */
export class ImageContentGenerateService extends ImageContentService {
  constructor(deps: ImageContentServiceDeps) {
    super(deps);
  }

  private jobs = new ImageGenJobStore();
  private get io(): SocketIOServer {
    return io();
  }

  /** ====== Helpers umum ====== */

  /** Download URL → Buffer, untuk validasi cepat */
  private async fetchImageBuffer(url?: string | null): Promise<Buffer | null> {
    try {
      if (!url) return null;
      const r = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
      });
      return Buffer.from(r.data);
    } catch {
      return null;
    }
  }

  /** Validasi mask & referenceImage sesuai syarat OpenAI */
  private async validateMaskAndReference(params: {
    maskUrl?: string | null;
    referenceUrl?: string | null;
  }): Promise<string | null> {
    const { maskUrl, referenceUrl } = params;

    if (!referenceUrl) return "Gambar referensi tidak ditemukan.";
    if (!maskUrl) return "Mask tidak ditemukan.";

    const [refBuf, maskBuf] = await Promise.all([
      this.fetchImageBuffer(referenceUrl),
      this.fetchImageBuffer(maskUrl),
    ]);

    if (!refBuf) return "Gagal mengunduh gambar referensi.";
    if (!maskBuf) return "Gagal mengunduh mask.";

    const FOUR_MB = 4 * 1024 * 1024;
    if (maskBuf.byteLength > FOUR_MB) {
      return "Ukuran mask melebihi 4MB. Kecilkan ukuran atau resolusi mask.";
    }

    const [refMeta, maskMeta] = await Promise.all([
      sharp(refBuf).metadata(),
      sharp(maskBuf).metadata(),
    ]);

    if ((maskMeta.format || "").toLowerCase() !== "png") {
      return "Mask harus berformat PNG dengan alpha channel (transparansi).";
    }
    if (!maskMeta.hasAlpha) {
      return "Mask PNG harus memiliki alpha channel (transparansi).";
    }

    if (
      !refMeta.width ||
      !refMeta.height ||
      !maskMeta.width ||
      !maskMeta.height
    ) {
      return "Tidak dapat membaca dimensi gambar/mask.";
    }
    if (
      refMeta.width !== maskMeta.width ||
      refMeta.height !== maskMeta.height
    ) {
      return `Dimensi mask harus sama dengan gambar referensi: expected ${refMeta.width}x${refMeta.height}, got ${maskMeta.width}x${maskMeta.height}.`;
    }

    const stats = await sharp(maskBuf).ensureAlpha().stats();
    const alphaStats = stats.channels[3]; // A
    if (alphaStats) {
      const { min, max } = alphaStats; // 0..255
      const hasTransparent = min < 250; // toleransi
      if (!hasTransparent) {
        return "Mask tidak memiliki area transparan. Area transparan (alpha=0) menandakan bagian yang akan diedit.";
      }
    }

    return null;
  }

  /** Normalisasi base+mask → PNG biner, dimensi match, tulis ke temp via manipulasi deps */
  private async normalizeBaseAndMask(
    basePath: string,
    maskPath: string
  ): Promise<{
    baseFixedPath: string;
    fixedMaskPath: string;
    tempsNormalize: string[];
  }> {
    const temps: string[] = [];

    const baseBuf = await sharp(basePath)
      .rotate()
      .png({ progressive: false })
      .toBuffer();
    const baseMeta = await sharp(baseBuf).metadata();
    temps.push(basePath);

    let maskBuf = await sharp(maskPath)
      .rotate()
      .ensureAlpha()
      .png({ progressive: false })
      .toBuffer();
    let maskMeta = await sharp(maskBuf).metadata();
    temps.push(maskPath);

    if (
      maskMeta.width !== baseMeta.width ||
      maskMeta.height !== baseMeta.height
    ) {
      maskBuf = await sharp(maskBuf)
        .resize(baseMeta.width!, baseMeta.height!, { fit: "fill" })
        .png({ progressive: false })
        .toBuffer();
      maskMeta = await sharp(maskBuf).metadata();
    }

    // deps.manip.write mengharapkan base64 (tanpa prefix data:)
    const baseFixedPath = await this.deps.manip.write(
      baseBuf.toString("base64"),
      ".png"
    );
    const fixedMaskPath = await this.deps.manip.write(
      maskBuf.toString("base64"),
      ".png"
    );
    temps.push(baseFixedPath, fixedMaskPath);

    return { baseFixedPath, fixedMaskPath, tempsNormalize: temps };
  }

  /** patch job + emit */
  private async patchAndEmit(
    rootBusinessId: string,
    jobId: string,
    patch: Partial<ImageGenJob>
  ): Promise<ImageGenJob | null> {
    const j = await this.jobs.patchJob(jobId, patch);
    // jika attempt terakhir & error → tandai error
    if (j?.attempt === 3 && j.error) {
      j.stage = "error";
      await this.jobs.patchJob(jobId, j);
    }
    if (j) this.io.to(this.room(rootBusinessId)).emit("imagegen:update", j);
    return j || null;
  }

  private wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  private isRetryable(err: unknown): boolean {
    const e = err as { code?: string; name?: string; message?: string };
    const msg = String(e?.message || err || "");
    const code = String(e?.code || e?.name || "");
    const retryCodes = [
      "ETIMEDOUT",
      "ECONNRESET",
      "EAI_AGAIN",
      "ENOTFOUND",
      "ECONNABORTED",
    ];
    if (retryCodes.includes(code)) return true;
    if (/\b(timeout|rate limit|429|temporar(y|ily)|try again)\b/i.test(msg))
      return true;
    // default: retry — bisa diperketat sesuai kebutuhan
    return true;
  }

  private async runWithRetry<T>(
    jobId: string,
    rootBusinessId: string,
    opName: ImageGenJobType,
    fn: (attempt: number) => Promise<T>
  ): Promise<T | void> {
    const max = 3;
    for (let attempt = 1; attempt <= max; attempt++) {
      await this.patchAndEmit(rootBusinessId, jobId, {
        attempt,
        stage: attempt === 1 ? "processing" : "retrying",
        status: "processing",
      });

      try {
        const res = await fn(attempt);
        return res;
      } catch (err: unknown) {
        const retry = attempt < max && this.isRetryable(err);
        const message = String(
          (err as { message?: string })?.message || err || "Unknown error"
        );

        await this.patchAndEmit(rootBusinessId, jobId, {
          error: { message, op: opName, attempt },
        });

        if (!retry) {
          const jErr = await this.jobs.setError(jobId, err);
          this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jErr);
          return;
        }

        const base = attempt === 1 ? 1000 : 3000;
        const jitter = Math.floor(Math.random() * 250);
        await this.patchAndEmit(rootBusinessId, jobId, {
          stage: "waiting_before_retry",
        });
        await this.wait(base + jitter);
      }
    }
  }

  private room(rootBusinessId: string) {
    return `rb:${rootBusinessId}`;
  }

  /** Pastikan tidak lebih dari N active jobs */
  private async checkActiveJobsOrErr(
    rootBusinessId: string,
    max = 3
  ): Promise<string | null> {
    const active = await this.countActiveJobs(rootBusinessId);
    if (active >= max)
      return "Anda sedang memproses 3 konten. Silakan tunggu beberapa saat.";
    return null;
  }

  /** Ambil bundle bisnis+quota+sub, verifikasi hak akses/kuota */
  private async getAndVerifyBundle(
    rootBusinessId: string,
    productKnowledgeId: string
  ) {
    const [business, token, subscription] = await Promise.all([
      this.getBusinessInformation(rootBusinessId, productKnowledgeId),
      this.deps.token.getBusinessAvailableToken(rootBusinessId, "Image"),
      this.deps.token.getBusinessSubscription(rootBusinessId),
    ]);

    // verifikasi kuota/subscription (fungsi existing)
    const verify = this.verifyBusinessInformation(
      business,
      token,
      subscription
    );
    if (typeof verify === "string") {
      return verify;
    }

    if (!business || !business.businessKnowledge || !business.roleKnowledge) {
      return "Bisnis atau data tidak ditemukan";
    }

    return business;
  }

  /** Emit pembaruan progres */
  private async emitProgress(
    rootBusinessId: string,
    jobId: string,
    progress: number,
    stage: ImageGenJob["stage"]
  ): Promise<void> {
    await this.patchAndEmit(rootBusinessId, jobId, { progress, stage });
  }

  /** Siapkan logo sesuai flag advancedGenerate */
  private async prepareLogoIfAny(
    advancedGenerate:
      | ImageContentDTO["advancedGenerate"]
      | ImageContentRegenerateDTO["advancedGenerate"],
    business: Partial<RootBusiness> & {
      businessKnowledge: Partial<BusinessKnowledge> | null;
      roleKnowledge: Partial<RoleKnowledge> | null;
    },
    temps: string[]
  ): Promise<string | null> {
    if (!advancedGenerate) return null;
    const wantPrimary = advancedGenerate?.businessKnowledge?.logo.primaryLogo;
    const wantSecondary =
      advancedGenerate?.businessKnowledge?.logo.secondaryLogo;

    if (wantPrimary && business?.businessKnowledge?.primaryLogo) {
      const p = await this.deps.manip.write(
        business.businessKnowledge?.primaryLogo
      );
      temps.push(p);
      return p;
    }
    if (wantSecondary && business?.businessKnowledge?.secondaryLogo) {
      const p = await this.deps.manip.write(
        business.businessKnowledge?.secondaryLogo
      );
      temps.push(p);
      return p;
    }
    return null;
  }

  /** Tulis base64 (image) ke temp-file → path */
  private async writeBase64Temps(
    imagesBase64: string[],
    temps: string[]
  ): Promise<string[]> {
    const out: string[] = [];
    for (let i = 0; i < imagesBase64.length; i++) {
      const tempImage = await this.deps.manip.write(imagesBase64[i]);
      out.push(tempImage);
      temps.push(tempImage);
    }
    return out;
  }

  /** Upload ke Cloudinary dari path lokal */
  private async uploadTemps(paths: string[]): Promise<string[]> {
    const out: string[] = [];
    for (let i = 0; i < paths.length; i++) {
      out.push(await this.deps.cloudinary.saveImageFromUrl(paths[i]));
    }
    return out;
  }

  /** Catat token usage */
  private async saveTokenUsage(
    rootBusinessId: string,
    total: number
  ): Promise<void> {
    await db.tokenUsage.create({
      data: { total, rootBusinessId, type: "Image" },
    });
  }

  /** ================= ENQUEUE (DRY) ================= */

  async enqueueGenerateContentBasedOnKnowledge(
    data: ImageContentDTO,
    rootBusinessId: string
  ) {
    const activeErr = await this.checkActiveJobsOrErr(rootBusinessId);
    if (activeErr) return activeErr;

    const bundle = await this.getAndVerifyBundle(
      rootBusinessId,
      data.productKnowledgeId
    );
    if (typeof bundle === "string") return bundle;

    const job = await this.jobs.createJob(
      "genBasedOnKnowledge",
      rootBusinessId,
      {
        productKnowledgeId: data.productKnowledgeId,
        ratio: data.ratio,
        category: data.category,
        designStyle: data.designStyle || null,
        prompt: data.prompt || null,
        referenceImage: data.referenceImage || null,
        caption: null,
        rss: null,
        advancedGenerate: data.advancedGenerate,
      }
    );
    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() =>
      this.processGenerateBasedOnKnowledge(job.id, data, rootBusinessId)
    );
    return { jobId: job.id };
  }

  async enqueueGenerateContentBasedOnRss(
    data: ImageContentRssDTO,
    rootBusinessId: string
  ) {
    const activeErr = await this.checkActiveJobsOrErr(rootBusinessId);
    if (activeErr) return activeErr;

    const bundle = await this.getAndVerifyBundle(
      rootBusinessId,
      data.productKnowledgeId
    );
    if (typeof bundle === "string") return bundle;

    const job = await this.jobs.createJob("genBasedOnRss", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      prompt: data.prompt || null,
      referenceImage: data.referenceImage || null,
      rss: data.rss,
      caption: null,
      advancedGenerate: data.advancedGenerate,
    });
    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() =>
      this.processGenerateBasedOnRss(job.id, data, rootBusinessId)
    );
    return { jobId: job.id };
  }

  async enqueueRegenerateContent(
    data: ImageContentRegenerateDTO,
    rootBusinessId: string
  ) {
    const activeErr = await this.checkActiveJobsOrErr(rootBusinessId);
    if (activeErr) return activeErr;

    const bundle = await this.getAndVerifyBundle(
      rootBusinessId,
      data.productKnowledgeId
    );
    if (typeof bundle === "string") return bundle;

    const job = await this.jobs.createJob("regenerate", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      caption: data.caption,
      referenceImage: data.referenceImage || null,
      prompt: data.prompt || null,
      rss: null,
      advancedGenerate: data.advancedGenerate,
    });
    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() => this.processRegenerate(job.id, data, rootBusinessId));
    return { jobId: job.id };
  }

  async enqueueGenerateContentBasedOnMask(
    data: ImageContentMaskDTO,
    rootBusinessId: string
  ) {
    const activeErr = await this.checkActiveJobsOrErr(rootBusinessId);
    if (activeErr) return activeErr;

    const bundle = await this.getAndVerifyBundle(
      rootBusinessId,
      data.productKnowledgeId
    );
    if (typeof bundle === "string") return bundle;

    const maskErr = await this.validateMaskAndReference({
      maskUrl: data.mask,
      referenceUrl: data.referenceImage,
    });
    if (maskErr) return maskErr;

    const job = await this.jobs.createJob("mask", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      caption: data.caption || null,
      referenceImage: data.referenceImage || null,
      prompt: data.prompt || null,
      rss: null,
      advancedGenerate: null,
    });
    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() => this.processMask(job.id, data, rootBusinessId));
    return { jobId: job.id };
  }

  /** ================= PROCESSORS (wrapper retry) ================= */

  private async processGenerateBasedOnKnowledge(
    jobId: string,
    data: ImageContentDTO,
    rootBusinessId: string
  ) {
    return this.runWithRetry(
      jobId,
      rootBusinessId,
      "genBasedOnKnowledge",
      (attempt) =>
        this.processGenerateBasedOnKnowledgeOnce(
          jobId,
          data,
          rootBusinessId,
          attempt
        )
    );
  }

  private async processGenerateBasedOnRss(
    jobId: string,
    data: ImageContentRssDTO,
    rootBusinessId: string
  ) {
    return this.runWithRetry(
      jobId,
      rootBusinessId,
      "genBasedOnRss",
      (attempt) =>
        this.processGenerateBasedOnRssOnce(jobId, data, rootBusinessId, attempt)
    );
  }

  private async processRegenerate(
    jobId: string,
    data: ImageContentRegenerateDTO,
    rootBusinessId: string
  ) {
    return this.runWithRetry(jobId, rootBusinessId, "regenerate", (attempt) =>
      this.processRegenerateOnce(jobId, data, rootBusinessId, attempt)
    );
  }

  private async processMask(
    jobId: string,
    data: ImageContentMaskDTO,
    rootBusinessId: string
  ) {
    return this.runWithRetry(jobId, rootBusinessId, "mask", (attempt) =>
      this.processMaskOnce(jobId, data, rootBusinessId, attempt)
    );
  }

  /** ================= PROCESSORS ONCE ================= */

  private async processGenerateBasedOnKnowledgeOnce(
    jobId: string,
    data: ImageContentDTO,
    rootBusinessId: string,
    attempt: number
  ) {
    const temps: string[] = [];
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({
        status: "processing",
        progress: attempt === 1 ? 2 : 3,
        stage: "processing",
      });

      const bundle = await this.getAndVerifyBundle(
        rootBusinessId,
        data.productKnowledgeId
      );
      await this.emitProgress(
        rootBusinessId,
        jobId,
        5,
        "verifying_business_information"
      );

      if (typeof bundle === "string") {
        await emit({
          status: "error",
          error: { message: bundle },
          stage: "error",
        });
        return;
      }

      const business = bundle;
      const product =
        (business?.productKnowledges?.[0] as
          | Partial<ProductKnowledge>
          | undefined) || undefined;
      if (product) await emit({ product });

      let tokenUsed = 0;
      let refImg = data.referenceImage || null;

      // Normalisasi ref ke cloudinary jika perlu (menjaga logika asli)
      if (refImg && !refImg.includes("cloudinary")) {
        refImg = await this.deps.cloudinary.saveImageFromUrl(refImg);
      }
      await this.emitProgress(rootBusinessId, jobId, 10, "preparing_assets");

      const [tempProductImage, tempRefImg] = await Promise.all([
        this.deps.manip.write(business!.productKnowledges![0].images[0]),
        this.deps.manip.write(refImg),
      ]);
      temps.push(tempProductImage, tempRefImg);
      await this.emitProgress(rootBusinessId, jobId, 20, "preparing_assets");

      const logo = await this.prepareLogoIfAny(
        data.advancedGenerate,
        business,
        temps
      );
      temps.push(logo || "");

      // Generate image
      const base64Images: string[] = [];
      const resImg = await this.deps.openai.generateImages({
        logo,
        productImage: tempProductImage,
        templateImage: tempRefImg,
        prompt: data.prompt || null,
        ratio: data.ratio,
        body: data,
        product: business!.productKnowledges![0],
        role: business!.roleKnowledge!,
        business: business!.businessKnowledge!,
        advancedGenerate: data.advancedGenerate,
      });
      base64Images.push(resImg.image);
      tokenUsed += this.deps.openai.getTokenUsage([resImg.usage]);
      await this.emitProgress(rootBusinessId, jobId, 60, "generating_images");

      // Tulis temp & upload
      const tempImageResults = await this.writeBase64Temps(base64Images, temps);
      await this.emitProgress(rootBusinessId, jobId, 70, "uploading");
      const uploadedImages = await this.uploadTemps(tempImageResults);

      // Caption
      const genCaptions = await this.deps.openai.generateCaption({
        body: data,
        business: business!.businessKnowledge!,
        images: uploadedImages,
        product: business!.productKnowledges![0],
        role: business!.roleKnowledge!,
        rss: null,
      });
      tokenUsed += this.deps.openai.getTokenUsage([genCaptions.usage]);
      await this.emitProgress(rootBusinessId, jobId, 90, "generating_caption");

      await this.saveTokenUsage(rootBusinessId, tokenUsed);

      const jDone = await this.jobs.setResult(
        jobId,
        {
          caption: genCaptions.caption || null,
          category: data.category,
          designStyle: data.designStyle,
          images: uploadedImages,
          productKnowledgeId: data.productKnowledgeId,
          ratio: data.ratio,
          referenceImages: data.referenceImage || null,
          tokenUsed,
        },
        tokenUsed
      );
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } finally {
      this.deps.manip.removeIfExists(temps);
    }
  }

  private async processGenerateBasedOnRssOnce(
    jobId: string,
    data: ImageContentRssDTO,
    rootBusinessId: string,
    attempt: number
  ) {
    const temps: string[] = [];
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({
        status: "processing",
        progress: attempt === 1 ? 2 : 3,
        stage: "processing",
      });

      const bundle = await this.getAndVerifyBundle(
        rootBusinessId,
        data.productKnowledgeId
      );
      await this.emitProgress(
        rootBusinessId,
        jobId,
        5,
        "verifying_business_information"
      );

      if (typeof bundle === "string") {
        await emit({
          status: "error",
          error: { message: bundle },
          stage: "error",
        });
        return;
      }

      const business = bundle;
      const product =
        (business?.productKnowledges?.[0] as
          | Partial<ProductKnowledge>
          | undefined) || undefined;
      if (product) await emit({ product });

      let tokenUsed = 0;
      let refImg = data.referenceImage || null;

      if (refImg && !refImg.includes("cloudinary")) {
        refImg = await this.deps.cloudinary.saveImageFromUrl(refImg);
      }
      await this.emitProgress(rootBusinessId, jobId, 10, "preparing_assets");

      const [tempProductImage, tempRefImg, tempRefRss] = await Promise.all([
        this.deps.manip.write(business!.productKnowledges![0].images[0]),
        this.deps.manip.write(refImg),
        this.deps.manip.write(data.rss?.imageUrl || null),
      ]);
      temps.push(tempProductImage, tempRefImg, tempRefRss);
      await this.emitProgress(rootBusinessId, jobId, 20, "preparing_assets");

      const logo = await this.prepareLogoIfAny(
        data.advancedGenerate,
        business,
        temps
      );

      const base64Images: string[] = [];
      const resImg = await this.deps.openai.generateImageFromRss({
        logo,
        productImage: tempProductImage,
        templateImage: tempRefImg,
        prompt: data.prompt || null,
        ratio: data.ratio,
        body: data,
        product: business!.productKnowledges![0],
        role: business!.roleKnowledge!,
        business: business!.businessKnowledge!,
        rss: data.rss,
        rssImage: tempRefRss,
        advancedGenerate: data.advancedGenerate,
      });
      base64Images.push(resImg.image);
      tokenUsed += this.deps.openai.getTokenUsage([resImg.usage]);
      await this.emitProgress(rootBusinessId, jobId, 60, "generating_images");

      const tempImageResults = await this.writeBase64Temps(base64Images, temps);
      await this.emitProgress(rootBusinessId, jobId, 70, "uploading");
      const uploadedImages = await this.uploadTemps(tempImageResults);

      const genCaptions = await this.deps.openai.generateCaption({
        body: data,
        business: business?.businessKnowledge!,
        images: uploadedImages,
        product: business?.productKnowledges![0],
        role: business?.roleKnowledge!,
        rss: data.rss,
      });
      tokenUsed += this.deps.openai.getTokenUsage([genCaptions.usage]);
      await this.emitProgress(rootBusinessId, jobId, 90, "generating_caption");

      await this.saveTokenUsage(rootBusinessId, tokenUsed);

      const jDone = await this.jobs.setResult(
        jobId,
        {
          caption: genCaptions.caption || null,
          category: data.category,
          designStyle: data.designStyle,
          images: uploadedImages,
          productKnowledgeId: data.productKnowledgeId,
          ratio: data.ratio,
          referenceImages: data.referenceImage || null,
          tokenUsed,
        },
        tokenUsed
      );
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } finally {
      this.deps.manip.removeIfExists(temps);
    }
  }

  private async processRegenerateOnce(
    jobId: string,
    data: ImageContentRegenerateDTO,
    rootBusinessId: string,
    attempt: number
  ) {
    const temps: string[] = [];
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({
        status: "processing",
        progress: attempt === 1 ? 5 : 6,
        stage: "processing",
      });

      const [token, tmpImage, business, subscription] = await Promise.all([
        this.deps.token.getBusinessAvailableToken(rootBusinessId, "Image"),
        this.deps.manip.write(data.referenceImage),
        this.getBusinessInformation(rootBusinessId, data.productKnowledgeId),
        this.deps.token.getBusinessSubscription(rootBusinessId),
      ]);
      temps.push(tmpImage);

      if (
        !business ||
        !business.businessKnowledge ||
        !business.roleKnowledge ||
        !business.productKnowledges?.length
      ) {
        await emit({
          status: "error",
          error: { message: "Bisnis atau data tidak ditemukan" },
          stage: "error",
        });
        return;
      }

      const verify = this.verifyBusinessInformation(
        business,
        token,
        subscription
      );
      if (typeof verify === "string") {
        await emit({
          status: "error",
          error: { message: verify },
          stage: "error",
        });
        return;
      }
      await this.emitProgress(
        rootBusinessId,
        jobId,
        15,
        "verifying_business_information"
      );

      const biz = business;
      const logo = await this.prepareLogoIfAny(
        data.advancedGenerate,
        biz,
        temps
      );
      await this.emitProgress(rootBusinessId, jobId, 25, "preparing_assets");

      const copiedData = {
        ...data,
        image: tmpImage,
        ratio: data.ratio as ValidRatio,
      };

      const regenerated = await this.deps.openai.regenerateContent({
        body: copiedData,
        business: biz.businessKnowledge!,
        product: biz.productKnowledges![0],
        role: biz.roleKnowledge!,
        logo,
        advancedGenerate: data.advancedGenerate,
      });
      await this.emitProgress(rootBusinessId, jobId, 65, "generating_images");

      const resultTmp = await this.deps.manip.write(regenerated.image || null);
      temps.push(resultTmp);
      await this.emitProgress(rootBusinessId, jobId, 75, "generating_images");

      const uploaded = await this.deps.cloudinary.saveImageFromUrl(resultTmp);
      await this.emitProgress(rootBusinessId, jobId, 85, "uploading");

      const tokenUsed = this.deps.openai.getTokenUsage([regenerated.usage]);
      await this.saveTokenUsage(rootBusinessId, tokenUsed);

      const jDone = await this.jobs.setResult(
        jobId,
        {
          caption: data.caption || null,
          category: data.category,
          designStyle: data.designStyle,
          images: [uploaded],
          productKnowledgeId: data.productKnowledgeId,
          ratio: data.ratio,
          referenceImages: data.referenceImage || null,
          tokenUsed,
        },
        tokenUsed
      );
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } finally {
      this.deps.manip.removeIfExists(temps);
    }
  }

  private async processMaskOnce(
    jobId: string,
    data: ImageContentMaskDTO,
    rootBusinessId: string,
    attempt: number
  ) {
    const temps: string[] = [];
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({
        status: "processing",
        progress: attempt === 1 ? 5 : 6,
        stage: "processing",
      });

      const [token, tmpRefImage, tmpMaskImage, business, subscription] =
        await Promise.all([
          this.deps.token.getBusinessAvailableToken(rootBusinessId, "Image"),
          this.deps.manip.write(data.referenceImage),
          this.deps.manip.write(data.mask),
          this.getBusinessInformation(rootBusinessId, data.productKnowledgeId),
          this.deps.token.getBusinessSubscription(rootBusinessId),
        ]);
      temps.push(tmpRefImage, tmpMaskImage);

      if (
        !business ||
        !business.businessKnowledge ||
        !business.roleKnowledge ||
        !business.productKnowledges?.length
      ) {
        await emit({
          status: "error",
          error: { message: "Bisnis atau data tidak ditemukan" },
          stage: "error",
        });
        return;
      }

      const verify = this.verifyBusinessInformation(
        business,
        token,
        subscription
      );
      await this.emitProgress(
        rootBusinessId,
        jobId,
        15,
        "verifying_business_information"
      );
      if (typeof verify === "string") {
        await emit({
          status: "error",
          error: { message: verify },
          stage: "error",
        });
        return;
      }

      await this.emitProgress(rootBusinessId, jobId, 25, "preparing_assets");

      const copiedData = {
        ...data,
        image: tmpRefImage,
        mask: tmpMaskImage,
        ratio: data.ratio as ValidRatio,
      };

      // Normalisasi & sinkron dimensi sebelum call OpenAI
      const { baseFixedPath, fixedMaskPath, tempsNormalize } =
        await this.normalizeBaseAndMask(tmpRefImage, tmpMaskImage);
      temps.push(...tempsNormalize);

      const regenerated = await this.deps.openai.maskContent({
        body: copiedData,
        referenceImage: baseFixedPath,
        mask: fixedMaskPath,
      });

      await this.emitProgress(rootBusinessId, jobId, 65, "generating_images");

      const resultTmp = await this.deps.manip.write(regenerated.image || null);
      temps.push(resultTmp);
      await this.emitProgress(rootBusinessId, jobId, 75, "generating_images");

      const uploaded = await this.deps.cloudinary.saveImageFromUrl(resultTmp);
      await this.emitProgress(rootBusinessId, jobId, 85, "uploading");

      const tokenUsed = this.deps.openai.getTokenUsage([regenerated.usage]);
      await this.saveTokenUsage(rootBusinessId, tokenUsed);

      const jDone = await this.jobs.setResult(
        jobId,
        {
          caption: data.caption || null,
          category: data.category,
          designStyle: data.designStyle,
          images: [uploaded],
          productKnowledgeId: data.productKnowledgeId,
          ratio: data.ratio,
          referenceImages: data.referenceImage || null,
          tokenUsed,
        },
        tokenUsed
      );
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } finally {
      this.deps.manip.removeIfExists(temps);
    }
  }

  /** ========== QUERY HISTORY ========== */
  async getJob(jobId: string) {
    return this.jobs.getJob(jobId);
  }

  async listJobs(rootBusinessId: string) {
    const jobs = await this.jobs.listJobs(rootBusinessId);

    const grouppedJobsByProduct: {
      productKnowledgeId: string;
      name: string;
      latestUpdate: Date;
      latestImage: string;
      jobs: JobData[];
    }[] = [];

    for (const job of jobs) {
      const productKnowledgeId = job.input?.productKnowledgeId;
      if (!productKnowledgeId) continue;
      const found = grouppedJobsByProduct.find(
        (p) => p.productKnowledgeId === productKnowledgeId
      );

      if (found) {
        if (new Date(job.updatedAt) > found.latestUpdate) {
          found.latestUpdate = new Date(job.updatedAt);
          found.latestImage =
            job?.result?.images?.[0] ||
            job.result?.images?.[1] ||
            job?.product?.images?.[0] ||
            found.latestImage ||
            "";
        }
        found.jobs.push(job);
      } else {
        grouppedJobsByProduct.push({
          productKnowledgeId: productKnowledgeId,
          latestUpdate: new Date(job.updatedAt),
          latestImage:
            job?.result?.images?.[0] ||
            job.result?.images?.[1] ||
            job?.product?.images?.[0] ||
            "",
          name: job.product?.name || "",
          jobs: [job],
        });
      }
    }

    grouppedJobsByProduct.sort(
      (a, b) => b.latestUpdate.getTime() - a.latestUpdate.getTime()
    );
    for (const group of grouppedJobsByProduct) {
      group.jobs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return grouppedJobsByProduct;
  }

  async countActiveJobs(rootBusinessId: string) {
    const jobs = await this.jobs.listJobs(rootBusinessId);
    return jobs.filter((job) => job.stage !== "done" && job.stage !== "error")
      .length;
  }

  async deleteJobById(rootBusinessId: string, jobId: string) {
    const check = await this.jobs.getJob(jobId);
    if (!check) return null;
    if (check.rootBusinessId !== rootBusinessId) return null;
    return this.jobs.deleteJobById(jobId);
  }
}
