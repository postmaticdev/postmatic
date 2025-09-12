import { BaseService } from "../BaseService";
import db from "../../config/db";
import {
  ImageContentDTO,
  ImageContentRegenerateDTO,
  ImageContentRssDTO,
} from "../../validators/ImageContentValidator";

import { ProductKnowledge } from "@prisma/client";
import { ImageGenJob, ImageGenJobStore } from "../../store/ImageGenJobStore";
import { Server as SocketIOServer } from "socket.io";
import { io } from "../../socket";
import { LOGO } from "../../constant";

export class ImageContentGenerateMockService extends BaseService {
  constructor() {
    super();
  }

  private jobs = new ImageGenJobStore();
  private get io(): SocketIOServer {
    return io();
  }

  /** helper: patch + emit */
  private async patchAndEmit(
    rootBusinessId: string,
    jobId: string,
    patch: Partial<ImageGenJob>
  ) {
    const j = await this.jobs.patchJob(jobId, patch);
    if (j) this.io.to(this.room(rootBusinessId)).emit("imagegen:update", j);
    return j;
  }

  /** room untuk broadcast: semua device bisnis join ke room ini */
  private room(rootBusinessId: string) {
    return `rb:${rootBusinessId}`;
  }

  private async getBusinessInformation(
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
            secondaryLogo: true,
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
            allergen: true,
            benefit: true,
            currency: true,
            price: true,
            images: true,
            composition: true,
          },
          take: 1,
        },
        roleKnowledge: {
          select: {
            audiencePersona: true,
            callToAction: true,
            goals: true,
            hashtags: true,
            platforms: true,
            tone: true,
            targetAudience: true,
          },
        },
      },
    });
  }

  /** ========== MOCK ========== */

  private async sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
  }

  /** Enqueue mock job (input sama dengan generate knowledge) */
  async enqueueGenerateMockContent(
    data: ImageContentDTO,
    rootBusinessId: string
  ) {
    const job = await this.jobs.createJob("mock", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      prompt: data.prompt || null,
      referenceImage: data.referenceImage ?? null,
      caption: null,
      rss: null,
      advancedGenerate: data.advancedGenerate,
    });

    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() => this.processMock(job.id, data, rootBusinessId));
    return { jobId: job.id };
  }

  /** Processor mock: tidak pakai OpenAI/Cloudinary, hanya simulasi progress */
  private async processMock(
    jobId: string,
    data: ImageContentDTO,
    rootBusinessId: string
  ) {
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({ status: "processing", progress: 2, stage: "processing" });

      // Ambil info bisnis (untuk tampilkan product di job)
      const business = await this.getBusinessInformation(
        rootBusinessId,
        data.productKnowledgeId
      );
      const product = business?.productKnowledges?.[0] as
        | Partial<ProductKnowledge>
        | undefined;
      if (product) await emit({ product });
      await this.sleep(2000);
      await emit({ progress: 8, stage: "verifying_business_information" });

      // Verifikasi sederhana (tanpa token/subscription)
      if (
        !business?.businessKnowledge ||
        !business?.roleKnowledge ||
        !product
      ) {
        await emit({
          status: "error",
          error: { message: "Business/product/role knowledge is incomplete" },
        });
        return;
      }

      // Simulasikan langkah-langkah kerja dengan progress granular
      await this.sleep(2500);
      await emit({ progress: 12, stage: "preparing_knowledge" });

      await this.sleep(2500);
      await emit({ progress: 12, stage: "preparing_assets" });

      // “Generate” N gambar secara dummy
      const dummyImages: string[] = [];
      const total = Math.max(1, 1);
      for (let i = 0; i < total; i++) {
        await this.sleep(3000);
        dummyImages.push(LOGO);
        const prog = 12 + Math.floor(((i + 1) / total) * 48); // 12 → 60
        await emit({
          progress: Math.min(60, prog),
          stage: "generating_images",
        });
      }

      // “Write temp”
      for (let i = 0; i < dummyImages.length; i++) {
        await this.sleep(1500);
        const prog = 60 + Math.floor(((i + 1) / dummyImages.length) * 10); // 60 → 70
        await emit({
          progress: Math.min(70, prog),
          stage: "generating_images",
        });
      }

      // “Upload” (skip sungguhan)
      for (let i = 0; i < dummyImages.length; i++) {
        await this.sleep(1500);
        const prog = 70 + Math.floor(((i + 1) / dummyImages.length) * 10); // 70 → 80
        await emit({
          progress: Math.min(80, prog),
          stage: "generating_images",
        });
      }

      // “Generate caption” dummy
      await this.sleep(2500);
      await emit({ progress: 90, stage: "generating_caption" });

      const caption =
        `Mock caption for ${product.name ?? "product"} • ` +
        new Date().toISOString();

      // Selesai (tidak ada catat token usage / DB write)

      const jDone = await this.jobs.setResult(jobId, {
        caption,
        category: data.category,
        designStyle: data.designStyle,
        images: dummyImages,
        productKnowledgeId: data.productKnowledgeId,
        ratio: data.ratio,
        referenceImages: data.referenceImage || null,
        tokenUsed: 0,
      });
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } catch (err) {
      const jErr = await this.jobs.setError(jobId, err);
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jErr);
    }
  }

  /** Enqueue mock job for RSS (tanpa OpenAI/Cloudinary) */
  async enqueueGenerateMockContentRss(
    data: ImageContentRssDTO,
    rootBusinessId: string
  ) {
    const job = await this.jobs.createJob("mock_rss", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      prompt: data.prompt || null,
      referenceImage: data.referenceImage || null,
      rss: data.rss || null,
      caption: null,
      advancedGenerate: data.advancedGenerate,
    });

    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() => this.processMockRss(job.id, data, rootBusinessId));
    return { jobId: job.id };
  }

  /** Processor mock RSS: simulasi progress + hasil dummy */
  private async processMockRss(
    jobId: string,
    data: ImageContentRssDTO,
    rootBusinessId: string
  ) {
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({ status: "processing", progress: 2, stage: "processing" });

      // Ambil informasi bisnis agar bisa kirim 'product' ke job
      const business = await this.getBusinessInformation(
        rootBusinessId,
        data.productKnowledgeId
      );
      const product = business?.productKnowledges?.[0] as
        | Partial<ProductKnowledge>
        | undefined;
      if (product) await emit({ product });

      await this.sleep(1500);
      await emit({ progress: 8, stage: "verifying_business_information" });

      // Validasi minimal (tanpa token/subscription)
      if (
        !business?.businessKnowledge ||
        !business?.roleKnowledge ||
        !product
      ) {
        await emit({
          status: "error",
          error: { message: "Business/product/role knowledge is incomplete" },
          stage: "error",
        });
        return;
      }

      // Siapkan "assets" (reference image & rss image) — simulasi saja
      await this.sleep(200);
      await emit({ progress: 12, stage: "preparing_assets" });

      if (data.referenceImage) {
        await this.sleep(1200);
        await emit({ progress: 14, stage: "preparing_assets" });
      }

      if (data.rss?.imageUrl) {
        await this.sleep(1500);
        await emit({ progress: 16, stage: "preparing_rss_image" });
      }

      // Generate N gambar dummy berbasis ratio
      const dummyImages: string[] = [];
      const total = Math.max(1, 1);
      for (let i = 0; i < total; i++) {
        await this.sleep(2800);
        dummyImages.push(LOGO);
        const prog = 16 + Math.floor(((i + 1) / total) * 44); // 16 → 60
        await emit({
          progress: Math.min(60, prog),
          stage: "generating_images",
        });
      }

      // “Write temp”
      for (let i = 0; i < dummyImages.length; i++) {
        await this.sleep(1200);
        const prog = 60 + Math.floor(((i + 1) / dummyImages.length) * 10); // 60 → 70
        await emit({ progress: Math.min(70, prog), stage: "writing_temp" });
      }

      // “Upload”
      for (let i = 0; i < dummyImages.length; i++) {
        await this.sleep(1200);
        const prog = 70 + Math.floor(((i + 1) / dummyImages.length) * 10); // 70 → 80
        await emit({ progress: Math.min(80, prog), stage: "uploading" });
      }

      // “Generate caption” dummy (gunakan judul RSS bila ada)
      await this.sleep(2200);
      await emit({ progress: 90, stage: "generating_caption" });

      const captionBase = data.rss?.title?.trim().length
        ? data.rss.title
        : product.name ?? "product";
      const caption = `Mock RSS caption: ${captionBase} • ${new Date().toISOString()}`;

      const jDone = await this.jobs.setResult(jobId, {
        caption,
        category: data.category,
        designStyle: data.designStyle,
        images: dummyImages,
        productKnowledgeId: data.productKnowledgeId,
        ratio: data.ratio,
        referenceImages: data.referenceImage || null,
        tokenUsed: 0,
      });
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } catch (err) {
      const jErr = await this.jobs.setError(jobId, err);
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jErr);
    }
  }

  /** Enqueue mock untuk regenerate (tanpa OpenAI/Cloudinary, hanya simulasi progress) */
  async enqueueRegenerateMockContent(
    data: ImageContentRegenerateDTO,
    rootBusinessId: string
  ) {
    const job = await this.jobs.createJob("mock_regenerate", rootBusinessId, {
      productKnowledgeId: data.productKnowledgeId,
      ratio: data.ratio,
      category: data.category,
      designStyle: data.designStyle,
      caption: data.caption,
      referenceImage: data.referenceImage,
      prompt: data.prompt || null,
      rss: null,
      advancedGenerate: data.advancedGenerate,
    });

    this.io.to(this.room(rootBusinessId)).emit("imagegen:update", job);
    setImmediate(() =>
      this.processRegenerateMock(job.id, data, rootBusinessId)
    );
    return { jobId: job.id };
  }

  /** Processor mock regenerate: simulasi tahapan + progress rinci */
  private async processRegenerateMock(
    jobId: string,
    data: ImageContentRegenerateDTO,
    rootBusinessId: string
  ) {
    const emit = (patch: Partial<ImageGenJob>) =>
      this.patchAndEmit(rootBusinessId, jobId, patch);

    try {
      await emit({ status: "processing", progress: 3, stage: "processing" });

      // Ambil informasi bisnis agar bisa kirim 'product' ke job
      const business = await this.getBusinessInformation(
        rootBusinessId,
        data.productKnowledgeId
      );
      const product = business?.productKnowledges?.[0] as
        | Partial<ProductKnowledge>
        | undefined;
      if (product) await emit({ product });

      await this.sleep(1500);
      await emit({ progress: 8, stage: "verifying_business_information" });

      // Validasi minimal (tanpa token/subscription)
      if (
        !business?.businessKnowledge ||
        !business?.roleKnowledge ||
        !product
      ) {
        await emit({
          status: "error",
          error: { message: "Business/product/role knowledge is incomplete" },
          stage: "error",
        });
        return;
      }

      // Siapkan “assets”
      await this.sleep(2000);
      await emit({ progress: 15, stage: "preparing_assets" });

      // “Input image” (data.images[0]) — hanya disimulasikan
      await this.sleep(1500);
      await emit({ progress: 28, stage: "generating_images" });

      // “Regenerate” 1 gambar (mock)
      const total = 1;
      const dummyImages: string[] = [];
      for (let i = 0; i < total; i++) {
        await this.sleep(3500);
        dummyImages.push(LOGO);

        const prog = 28 + Math.floor(((i + 1) / total) * 40); // 28 → 68
        await emit({
          progress: Math.min(68, prog),
          stage: "generating_images",
        });
      }

      // “Write temp”
      await this.sleep(1500);
      await emit({ progress: 74, stage: "generating_images" });

      // “Upload”
      await this.sleep(1500);
      await emit({ progress: 82, stage: "uploading" });

      // “Caption” (pakai caption existing bila ada, kalau tidak mock)
      await this.sleep(2000);
      await emit({ progress: 90, stage: "generating_caption" });

      const caption =
        data.caption && data.caption.trim().length > 0
          ? data.caption
          : `Mock regenerated caption for ${
              product.name ?? "product"
            } • ${new Date().toISOString()}`;

      // Selesai — tidak ada token usage/DB write
      const result = {
        images: dummyImages,
        ratio: data.ratio,
        category: data.category,
        designStyle: data.designStyle,
        caption,
        referenceImages: data.referenceImage,
        productKnowledgeId: data.productKnowledgeId,
        tokenUsed: 0,
      };

      const jDone = await this.jobs.setResult(jobId, result);
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jDone);
    } catch (err) {
      const jErr = await this.jobs.setError(jobId, err);
      this.io.to(this.room(rootBusinessId)).emit("imagegen:update", jErr);
    }
  }
}
