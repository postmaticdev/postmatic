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
import {
  ImageContentService,
  ImageContentServiceDeps,
} from "./ImageContentService";

/** ====== Service Utama ====== */
export class ImageContentGenerateService extends ImageContentService {
  constructor(deps: ImageContentServiceDeps) {
    super(deps);
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

    const job = await this.jobs.createJob("knowledge", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle || null,
      prompt: data.prompt || null,
      referenceImage: data.referenceImage || null,
      caption: null,
      rss: null,
      advancedGenerate: data.advancedGenerate,
    });
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

    const job = await this.jobs.createJob("rss", rootBusinessId, {
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
    return this.runWithRetry(jobId, rootBusinessId, "knowledge", (attempt) =>
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
    return this.runWithRetry(jobId, rootBusinessId, "rss", (attempt) =>
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
          stage: "error",
          error: { message: bundle, stack: null, attempt },
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
        advancedGenerate: data.advancedGenerate,
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
      await this.emitProgress(rootBusinessId, jobId, 100, "done");
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
          stage: "error",
          error: { message: bundle, stack: null, attempt },
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
        advancedGenerate: data.advancedGenerate,
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
      await this.emitProgress(rootBusinessId, jobId, 100, "done");
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
          stage: "error",
          error: {
            message: "Bisnis atau data tidak ditemukan",
            stack: null,
            attempt,
          },
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
          stage: "error",
          error: { message: verify, stack: null, attempt },
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
      await this.emitProgress(rootBusinessId, jobId, 100, "done");
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
          stage: "error",
          error: {
            message: "Bisnis atau data tidak ditemukan",
            stack: null,
            attempt,
          },
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
          stage: "error",
          error: { message: verify, stack: null, attempt },
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

      this.logger("mask", jobId, "normalized base+mask", {
        baseFixedPath,
        fixedMaskPath,
      });

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
      await this.emitProgress(rootBusinessId, jobId, 100, "done");
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

  async deleteJobById(rootBusinessId: string, jobId: string) {
    const check = await this.jobs.getJob(jobId);
    if (!check) return null;
    if (check.rootBusinessId !== rootBusinessId) return null;
    return this.jobs.deleteJobById(jobId);
  }
}
