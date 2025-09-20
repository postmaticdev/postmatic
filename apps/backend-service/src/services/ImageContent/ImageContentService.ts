import { BaseService } from "../BaseService";
import db from "../../config/db";
import {
  ImageContentDTO,
  ImageContentEditDTO,
  ImageContentRegenerateDTO,
  ImageContentSaveDTO,
} from "../../validators/ImageContentValidator";
import { OpenAiService, ValidRatio } from "../OpenAiService";
import { CloudinaryService } from "../CloudinaryService";
import { LinkedInService } from "../LinkedInService";
import { PostDTO } from "../../validators/PostValidator";
import { TierService } from "../TierService";
import { AutoSchedulerTaskManager } from "../../cron/AutoSchedulerTaskManager";
import { ImageManipulationService } from "../ImageManipulationService";
import { FilterQueryType } from "../../middleware/use-filter";
import {
  Prisma,
  ProductKnowledge,
  RootBusiness,
  RoleKnowledge,
  BusinessKnowledge,
  ImageGenJobType,
} from "@prisma/client";
import { FacebookPageService } from "../FacebookPageService";
import { PlatformKnowledgeService } from "../PlatformKnowledgeService";
import { InstagramBusinessService } from "../InstagramBusinessService";
import { stringManipulation } from "../../helper/string-manipulation";
import { ImageGenJob, ImageGenJobStore } from "../../store/ImageGenJobStore";
import { Server as SocketIOServer } from "socket.io";
import { io } from "../../socket";
import axios from "axios";
import sharp from "sharp";

export interface ImageContentServiceDeps {
  openai: OpenAiService;
  cloudinary: CloudinaryService;
  token: TierService;
  manip: ImageManipulationService;
  platformService: PlatformKnowledgeService;
  platformDeps: {
    socialLinkedIn: LinkedInService;
    socialFacebookPage: FacebookPageService;
    socialInstagramBusiness: InstagramBusinessService;
  };
}

export class ImageContentService extends BaseService {
  constructor(protected deps: ImageContentServiceDeps) {
    super();
  }

  protected jobs = new ImageGenJobStore();
  protected get io(): SocketIOServer {
    return io();
  }

  /** room untuk broadcast: semua device bisnis join ke room ini */
  protected room(rootBusinessId: string) {
    return `rb:${rootBusinessId}`;
  }

  /** ====== Helpers umum ====== */

  /** Download URL → Buffer, untuk validasi cepat */
  protected async fetchImageBuffer(
    url?: string | null
  ): Promise<Buffer | null> {
    try {
      if (!url) return null;
      const r = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
      });
      return Buffer.from(r.data);
    } catch (e) {
      this.warn("mask", "-", "fetchImageBuffer failed", {
        url,
        error: String(e),
      });
      return null;
    }
  }

  /** Validasi mask & referenceImage sesuai syarat OpenAI */
  protected async validateMaskAndReference(params: {
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
      const { min } = alphaStats; // 0..255
      const hasTransparent = min < 250; // toleransi
      if (!hasTransparent) {
        return "Mask tidak memiliki area transparan. Area transparan (alpha=0) menandakan bagian yang akan diedit.";
      }
    }

    return null;
  }

  /** Normalisasi base+mask → PNG biner, dimensi match, tulis ke temp via manipulasi deps */
  protected async normalizeBaseAndMask(
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

  /** Penentu retry — default FALSE supaya tidak retry membabi-buta */
  protected isRetryable(err: unknown): boolean {
    let retry = false;
    const e = err as { code?: string; name?: string; message?: string };
    const msg = String(e?.message || err || "");
    const code = String(e?.code || e?.name || "");
    const retryCodes = [
      "ETIMEDOUT",
      "ECONNRESET",
      "EAI_AGAIN",
      "ENOTFOUND",
      "ECONNABORTED",
      "ECONNREFUSED",
      "EHOSTUNREACH",
      "EHOSTDOWN",
      "URL",
      "CLOUDINARY",
      "OPENAI",
      "OPEN_AI",
      "OPENAI_API_ERROR",
      "OPENAI_API_ERROR_RATE_LIMIT_EXCEEDED",
    ];
    retryCodes.forEach((item) => {
      if (code?.toLowerCase().includes(item?.toLowerCase()) && !retry)
        retry = true;
    });
    retryCodes.forEach((item) => {
      if (msg?.toLowerCase().includes(item?.toLowerCase()) && !retry)
        retry = true;
    });
    if (retryCodes.includes(code) || retryCodes.includes(msg)) retry = true;
    if (/\b(timeout|rate limit|429|temporar(y|ily)|try again)\b/i.test(msg))
      return true;
    return retry;
  }

  /**
   * Wrapper retry yang menyimpan JobError terstruktur (message, stack, attempt).
   * Saat retry habis, menandai status error TANPA memanggil setError (agar attempt tidak ter-set 1).
   */
  protected async runWithRetry<T>(
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
        this.logger(opName, jobId, "attempt start", { attempt });
        const res = await fn(attempt);
        this.logger(opName, jobId, "attempt success", { attempt });
        return res;
      } catch (err: unknown) {
        const e = err as { message?: string; stack?: string };
        const message = String(e?.message || err || "Unknown error");
        const stack = e?.stack ?? null;

        const retry = attempt < max && this.isRetryable(err);

        // simpan error terbaru + attempt
        await this.patchAndEmit(rootBusinessId, jobId, {
          error: { message, stack, attempt },
        });

        this.err(opName, jobId, "attempt failed", {
          attempt,
          message,
          retry,
        });

        if (!retry) {
          // tandai job error final, simpan stage & status error + error object lengkap
          const finalErr = await this.jobs.patchJob(jobId, {
            status: "error",
            stage: "error",
            error: { message, stack, attempt },
          });
          if (finalErr) {
            this.io
              .to(this.room(rootBusinessId))
              .emit("imagegen:update", finalErr);
          }
          return;
        }

        // backoff: 1s → 3s (+ jitter)
        const base = attempt === 1 ? 1000 : 3000;
        const jitter = Math.floor(Math.random() * 250);
        await this.patchAndEmit(rootBusinessId, jobId, {
          stage: "waiting_before_retry",
        });
        await this.wait(base + jitter);
      }
    }
  }

  /** Pastikan tidak lebih dari N active jobs */
  protected async checkActiveJobsOrErr(
    rootBusinessId: string,
    max = 3
  ): Promise<string | null> {
    const active = await this.countActiveJobs(rootBusinessId);
    if (active >= max)
      return "Anda sedang memproses 3 konten. Silakan tunggu beberapa saat.";
    return null;
  }

  /** Ambil bundle bisnis+quota+sub, verifikasi hak akses/kuota */
  protected async getAndVerifyBundle(
    rootBusinessId: string,
    productKnowledgeId: string
  ) {
    const [business, token, subscription] = await Promise.all([
      this.getBusinessInformation(rootBusinessId, productKnowledgeId),
      this.deps.token.getBusinessAvailableToken(rootBusinessId, "Image"),
      this.deps.token.getBusinessSubscription(rootBusinessId),
    ]);

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
  protected async emitProgress(
    rootBusinessId: string,
    jobId: string,
    progress: number,
    stage: ImageGenJob["stage"]
  ): Promise<void> {
    await this.patchAndEmit(rootBusinessId, jobId, { progress, stage });
  }

  protected wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  protected async getBusinessInformation(
    rootBusinessId: string,
    productKnowledgeId: string
  ) {
    return await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        businessKnowledge: {
          select: {
            name: true,
            description: true,
            category: true,
            location: true,
            primaryLogo: true,
            uniqueSellingPoint: true,
            website: true,
            visionMission: true,
          },
        },
        productKnowledges: {
          where: {
            id: productKnowledgeId,
          },
          select: {
            name: true,
            description: true,
            category: true,
            currency: true,
            price: true,
            images: true,
          },
          take: 1,
        },
        roleKnowledge: {
          select: {
            audiencePersona: true,
            callToAction: true,
            goals: true,
            hashtags: true,
            tone: true,
            targetAudience: true,
          },
        },
      },
    });
  }

  protected verifyBusinessInformation(
    business: Partial<
      RootBusiness & {
        productKnowledges: Partial<ProductKnowledge>[];
        businessKnowledge: Partial<BusinessKnowledge> | null;
        roleKnowledge: Partial<RoleKnowledge> | null;
      }
    > | null,
    token: Awaited<
      ReturnType<typeof this.deps.token.getBusinessAvailableToken>
    >,
    subscription: Awaited<
      ReturnType<typeof this.deps.token.getBusinessSubscription>
    >
  ) {
    if (token === null) return "Tidak ada data ditemukan";
    if (!business) {
      return "Business tidak ditemukan";
    }

    if (!business?.productKnowledges?.length) {
      return "Product tidak ditemukan";
    }

    if (!business?.businessKnowledge) {
      return "Business knowledge belum diatur";
    }

    if (!business?.roleKnowledge) {
      return "Role knowledge belum diatur";
    }

    if (token?.availableToken < 8000) {
      return `Token tidak mencukupi. Anda memiliki ${token?.availableToken} token. Untuk menggunakan fitur ini, Anda membutuhkan minimal 8000 token.`;
    }

    if (!subscription?.valid) {
      return "Subscription sudah kadaluarsa. Silakan perbarui subscription Anda.";
    }
    return true;
  }

  /** patch job + emit */
  protected async patchAndEmit(
    rootBusinessId: string,
    jobId: string,
    patch: Partial<ImageGenJob>
  ): Promise<ImageGenJob | null> {
    const j = await this.jobs.patchJob(jobId, patch);
    // jika attempt terakhir & error → tandai error
    if (j?.attempt === 3 && j.error) {
      j.stage = "error";
      await this.jobs.patchJob(jobId, { stage: "error", status: "error" });
    }
    if (j) this.io.to(this.room(rootBusinessId)).emit("imagegen:update", j);
    return j || null;
  }

  private whereAllPostedContents(
    rootBusinessId: string,
    filter: FilterQueryType
  ): Prisma.GeneratedImageContentWhereInput {
    return {
      AND: [
        { rootBusinessId: rootBusinessId },
        { deletedAt: null },
        {
          caption: {
            contains: filter.search,
            mode: "insensitive",
          },
          category: {
            contains: filter.category,
          },
        },
        {
          postedImageContents: {
            some: {},
          },
        },
        {
          createdAt: {
            gte: filter.dateStart ? filter.dateStart : undefined,
            lte: filter.dateEnd ? filter.dateEnd : undefined,
          },
        },
      ],
    };
  }

  async getAllPostedContents(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [generatedImageContents, totalData] = await Promise.all([
        db.generatedImageContent.findMany({
          where: this.whereAllPostedContents(rootBusinessId, filter),
          include: {
            postedImageContents: true,
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.generatedImageContent.count({
          where: this.whereAllPostedContents(rootBusinessId, filter),
        }),
      ]);

      const mappedData = generatedImageContents.map((content) => ({
        ...content,
        platforms: Array.from(
          new Set(content.postedImageContents.map((post) => post.platform))
        ),
      }));

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });
      return { data: mappedData, pagination };
    } catch (err) {
      this.handleError("getAllImageContents", err);
    }
  }

  async saveGeneratedImage(data: ImageContentSaveDTO, rootBusinessId: string) {
    try {
      const images: string[] = [];

      await Promise.all(
        data.images.map(async (image) => {
          if (image.includes("cloudinary")) {
            images.push(image);
          } else {
            const imageUrl = await this.deps.cloudinary.saveImageFromUrl(image);
            images.push(imageUrl);
          }
        })
      );

      const generatedImageContent = await db.generatedImageContent.create({
        data: {
          category: data.category,
          images: images,
          productKnowledgeId: data.productKnowledgeId,
          rootBusinessId,
          designStyle: data.designStyle,
          ratio: data.ratio,
          caption: data.caption,
          readyToPost: false,
        },
      });

      await AutoSchedulerTaskManager.instance.add(rootBusinessId);
      return generatedImageContent;
    } catch (err) {
      this.handleError("saveGeneratedImage", err);
    }
  }

  async editGeneratedContent(
    data: ImageContentEditDTO,
    generatedImageContentId: string
  ) {
    try {
      const check = await db.generatedImageContent.findUnique({
        where: {
          id: generatedImageContentId,
        },
        select: {
          deletedAt: true,
        },
      });

      if (!check || check.deletedAt) return null;

      const images: string[] = [];
      await Promise.all(
        data.images.map(async (image) => {
          if (image.includes("cloudinary")) {
            images.push(image);
          } else {
            const imageUrl = await this.deps.cloudinary.saveImageFromUrl(image);
            images.push(imageUrl);
          }
        })
      );

      const generatedImageContent = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          images: images,
          designStyle: data.designStyle,
          caption: data.caption,
          ratio: data.ratio,
          category: data.category,
        },
      });
      await AutoSchedulerTaskManager.instance.add(
        generatedImageContent.rootBusinessId
      );
      return generatedImageContent;
    } catch (err) {
      this.handleError("editGeneratedContent", err);
    }
  }

  async setReadyToPost(
    rootBusinessId: string,
    generatedImageContentId: string
  ) {
    try {
      const [check, autopost] = await Promise.all([
        db.generatedImageContent.findUnique({
          where: { id: generatedImageContentId },
          select: { deletedAt: true, readyToPost: true },
        }),
        db.schedulerAutoPreference.findUnique({
          where: {
            rootBusinessId: rootBusinessId,
          },
          select: {
            isAutoPosting: true,
            schedulerAutoPostings: {
              select: {
                isActive: true,
                schedulerAutoPostingTimes: {
                  select: {
                    hhmm: true,
                  },
                },
              },
            },
          },
        }),
      ]);
      if (!check || check.deletedAt) return null;
      if (!autopost) return null;

      const totalHhMm = autopost.schedulerAutoPostings
        .flatMap((autoPosting) =>
          autoPosting.schedulerAutoPostingTimes.flatMap((time) => ({
            time: time.hhmm,
            isActive: autoPosting.isActive,
          }))
        )
        .filter((item) => item.isActive).length;

      const isAllDisabled =
        autopost.isAutoPosting === false ||
        autopost.schedulerAutoPostings.every(
          (autoPosting) => autoPosting.isActive === false
        ) ||
        totalHhMm === 0;

      if (isAllDisabled && !check.readyToPost)
        return "Semua waktu posting otomatis dinonaktifkan. Silakan aktifkan kembali untuk memposting konten ini.";

      const posted = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          readyToPost: !check.readyToPost,
        },
      });
      await AutoSchedulerTaskManager.instance.add(posted.rootBusinessId);
      return posted;
    } catch (err) {
      this.handleError("setReadyToPost", err);
    }
  }

  async deleteGeneratedContent(generatedImageContentId: string) {
    try {
      const check = await db.generatedImageContent.findUnique({
        where: { id: generatedImageContentId },
        select: { deletedAt: true },
      });
      if (!check || check.deletedAt) return null;
      const deleted = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          deletedAt: new Date(),
        },
      });
      await AutoSchedulerTaskManager.instance.add(deleted.rootBusinessId);
      return deleted;
    } catch (err) {
      this.handleError("deleteGeneratedContent", err);
    }
  }

  async directPost(data: PostDTO, rootBusinessId: string) {
    try {
      const check = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: {
          deletedAt: true,
          socialFacebookPage: {
            select: {
              id: true,
            },
          },
          socialInstagramBusiness: {
            select: {
              id: true,
            },
          },
          socialLinkedIn: {
            select: {
              id: true,
            },
          },
          generatedImageContents: {
            where: {
              id: data.generatedImageContentId,
            },
            take: 1,
            select: {
              schedulerManualPostings: true,
              caption: true,
            },
          },
        },
      });
      if (!check || check.deletedAt) return "Business tidak ditemukan";
      if (check.generatedImageContents.length === 0) {
        return "Konten tidak ditemukan";
      }
      if (data.caption) {
        await db.generatedImageContent.update({
          where: { id: data.generatedImageContentId },
          data: {
            caption: data.caption,
          },
        });
        check.generatedImageContents[0].caption = data.caption || "";
      }
      const { unavailablePlatforms, availablePlatforms } =
        await this.deps.platformService.getPlatforms();
      if (
        data.platforms.some((platform) =>
          unavailablePlatforms.some((p) => p.platform === platform)
        )
      ) {
        const unavailablePlatformsString = unavailablePlatforms
          .filter((p) => data.platforms.includes(p.platform))
          .map((p) => p.name)
          .join(", ");
        return `${unavailablePlatformsString} saat ini tidak didukung. Silakan coba lagi nanti.`;
      }

      const promises: Promise<string | object>[] = [];

      for (const platform of data.platforms) {
        if (!check[stringManipulation.transformPlatform(platform)]) {
          return `${stringManipulation.snakeToReadable(
            platform
          )} tidak terhubung ke bisnis`;
        }
      }

      for (const platform of data.platforms) {
        if (availablePlatforms.some((p) => p.platform === platform)) {
          promises.push(
            this?.deps?.platformDeps[
              stringManipulation.transformPlatform(platform)
            ]?.post(rootBusinessId, data, data.caption) ||
              (() => "Terjadi kesalahan")()
          );
        }
      }

      const returnData = await Promise.all(promises);
      if (returnData?.filter((item) => typeof item === "string")?.length > 0) {
        return returnData?.filter((item) => typeof item === "string")[0];
      }

      if (check?.generatedImageContents[0]?.schedulerManualPostings) {
        await db.schedulerManualPosting.delete({
          where: {
            generatedImageContentId: data.generatedImageContentId,
          },
        });
      }

      await AutoSchedulerTaskManager.instance.add(rootBusinessId);
      return returnData;
    } catch (err) {
      this.handleError("directPost", err);
    }
  }

  private whereAllDraftContents(
    rootBusinessId: string,
    filter: FilterQueryType
  ): Prisma.GeneratedImageContentWhereInput {
    return {
      AND: [
        { rootBusinessId: rootBusinessId },
        { deletedAt: null },
        { schedulerManualPostings: null },
        {
          caption: {
            contains: filter.search,
            mode: "insensitive",
          },
        },
        {
          postedImageContents: {
            none: {},
          },
        },
        {
          createdAt: {
            gte: filter.dateStart ? filter.dateStart : undefined,
            lte: filter.dateEnd ? filter.dateEnd : undefined,
          },
        },
        filter.category === "readyToPost" ? { readyToPost: true } : {},
      ],
    };
  }

  async getAllDraftContents(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [generatedImageContents, totalData] = await Promise.all([
        db.generatedImageContent.findMany({
          where: this.whereAllDraftContents(rootBusinessId, filter),
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.generatedImageContent.count({
          where: this.whereAllDraftContents(rootBusinessId, filter),
        }),
      ]);

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });

      return { data: generatedImageContents, pagination };
    } catch (err) {
      this.handleError("getAllImageContents", err);
    }
  }

  async countActiveJobs(rootBusinessId: string) {
    const jobs = await this.jobs.listJobs(rootBusinessId);
    return jobs.filter((job) => job.stage !== "done" && job.stage !== "error")
      .length;
  }

  /** ====== Logging helper ====== */
  protected warn(
    op: ImageGenJobType,
    jobId: string,
    msg: string,
    extra?: Record<string, unknown>
  ) {
    const base = { op, jobId, msg, ts: new Date().toISOString() };
    // eslint-disable-next-line no-console
    console.warn(
      "[IMGJOB]",
      JSON.stringify({ ...base, level: "warn", ...extra })
    );
  }
  protected err(
    op: ImageGenJobType,
    jobId: string,
    msg: string,
    extra?: Record<string, unknown>
  ) {
    const base = { op, jobId, msg, ts: new Date().toISOString() };
    // eslint-disable-next-line no-console
    console.error(
      "[IMGJOB]",
      JSON.stringify({ ...base, level: "error", ...extra })
    );
  }

  /** Siapkan logo sesuai flag advancedGenerate */
  protected async prepareLogoIfAny(
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

    if (
      advancedGenerate?.businessKnowledge?.logo &&
      business?.businessKnowledge?.primaryLogo
    ) {
      const p = await this.deps.manip.write(
        business.businessKnowledge?.primaryLogo
      );
      temps.push(p);
      return p;
    }
    if (
      advancedGenerate?.businessKnowledge?.logo &&
      business?.businessKnowledge?.primaryLogo
    ) {
      const p = await this.deps.manip.write(
        business.businessKnowledge?.primaryLogo
      );
      temps.push(p);
      return p;
    }
    return null;
  }

  protected logger(
    op: ImageGenJobType,
    jobId: string,
    msg: string,
    extra?: Record<string, unknown>
  ) {
    const base = { op, jobId, msg, ts: new Date().toISOString() };
    if (extra) {
      // eslint-disable-next-line no-console
      console.info("[IMGJOB]", JSON.stringify({ ...base, ...extra }));
    } else {
      // eslint-disable-next-line no-console
      console.info("[IMGJOB]", JSON.stringify(base));
    }
  }

  /** Tulis base64 (image) ke temp-file → path */
  protected async writeBase64Temps(
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
  protected async uploadTemps(paths: string[]): Promise<string[]> {
    const out: string[] = [];
    for (let i = 0; i < paths.length; i++) {
      out.push(await this.deps.cloudinary.saveImageFromUrl(paths[i]));
    }
    return out;
  }
}
