// src/services/ImageGenJobStore.ts
import { v4 as uuidv4 } from "uuid";
import db from "../config/db";
import type {
  ProductKnowledge,
  Prisma,
  HistoryGeneratedImageContent,
} from "@prisma/client";
import {
  ImageGenJobStage as PrismaJobStage,
  ImageGenJobStatus as PrismaJobStatus,
  ImageGenJobType as PrismaJobType,
} from "@prisma/client";
import { ValidRatio } from "src/services/OpenAiService";
import {
  ImageContentAdvancedGenerateDTO,
  ImageContentRssDTO,
} from "src/validators/ImageContentValidator";

/** ===== Aliases enum ke nama lama agar kompatibel dengan kode lain ===== */
export type ImageGenJobType = PrismaJobType;
export type ImageGenJobStatus = PrismaJobStatus;
export type ImageGenJobStage = PrismaJobStage;

/** ===== Tipe input & output yang dipakai di seluruh app (tanpa any) ===== */
export interface InputCreateJob {
  productKnowledgeId: string;
  ratio: ValidRatio;
  category: string;
  designStyle: string | null;
  referenceImage: string | null;
  caption: string | null;
  prompt: string | null;
  advancedGenerate: ImageContentAdvancedGenerateDTO | null;
  rss: ImageContentRssDTO["rss"] | null;
}

export interface JobResult {
  images: string[];
  ratio: string;
  category: string;
  designStyle: string | null;
  caption: string | null;
  referenceImages: string | null;
  productKnowledgeId: string;
  tokenUsed: number;
}

export type JobError = {
  message: string;
  stack?: string;
  attempt?: number;
  op?: string;
} | null;

export type ImageGenJob = {
  id: string;
  type: ImageGenJobType;
  rootBusinessId: string;
  status: ImageGenJobStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  progress: number;
  input: InputCreateJob;
  result: JobResult | null;
  error: JobError;
  product: Partial<ProductKnowledge>;
  stage: ImageGenJobStage;
  attempt: number;
  tokenUsed: number;
};

export interface JobData {
  id: string;
  type: ImageGenJobType;
  rootBusinessId: string;
  status: ImageGenJobStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  progress: number;
  input: InputCreateJob;
  error: string | null;
  stage: ImageGenJobStage;
  product: {
    name: string;
    description: string;
    category: string;
    allergen: string | null;
    benefit: string | null;
    currency: string;
    price: number;
    images: string[];
    composition: string | null;
  };
  result: JobResult | null;
}

/** ===== Util konversi JSON Prisma <-> TS ===== */
const toJson = (v: unknown): Prisma.InputJsonValue =>
  v as Prisma.InputJsonValue;

function rowToImageGenJob(row: HistoryGeneratedImageContent): ImageGenJob {
  // Prisma JSON -> TS
  const input = row.input as unknown as InputCreateJob;
  const result = row.result as unknown as JobResult | null;
  const product = ((row.product as unknown) || {}) as Partial<ProductKnowledge>;
  const error = row.error as unknown as JobError;

  return {
    id: row.id,
    type: row.type,
    rootBusinessId: row.rootBusinessId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    progress: row.progress,
    input,
    result,
    error,
    product,
    stage: row.stage,
    attempt: row.attempt,
    tokenUsed: row.tokenUsed,
  };
}

function imageGenJobToUpdateData(
  job: Partial<ImageGenJob>
): Prisma.HistoryGeneratedImageContentUpdateInput {
  const data: Prisma.HistoryGeneratedImageContentUpdateInput = {
    updatedAt: new Date(),
  };

  if (job.type) data.type = job.type;
  if (job.status) data.status = job.status;
  if (typeof job.progress === "number") data.progress = job.progress;
  if (job.input) data.input = toJson(job.input);
  if (typeof job.result !== "undefined") data.result = toJson(job.result);
  if (typeof job.error !== "undefined") data.error = toJson(job.error);
  if (job.product) data.product = toJson(job.product);
  if (job.stage) data.stage = job.stage;
  if (typeof job.attempt === "number") data.attempt = job.attempt;
  if (typeof job.tokenUsed === "number") data.tokenUsed = job.tokenUsed;

  return data;
}

/** ===== Store berbasis Prisma (persistent DB) ===== */
export class ImageGenJobStore {
  constructor() {}

  private now() {
    return new Date();
  }

  private async fetchProductPartial(
    productKnowledgeId: string
  ): Promise<Partial<ProductKnowledge>> {
    const product = await db.productKnowledge.findUnique({
      where: { id: productKnowledgeId },
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
    });
    return product ?? {};
  }

  async createJob(
    type: ImageGenJobType,
    rootBusinessId: string,
    input: InputCreateJob
  ): Promise<ImageGenJob> {
    const id = uuidv4();
    const product = input.productKnowledgeId
      ? await this.fetchProductPartial(input.productKnowledgeId)
      : {};

    const now = this.now();

    const row = await db.historyGeneratedImageContent.create({
      data: {
        id,
        type,
        rootBusinessId,
        status: "queued",
        createdAt: now,
        updatedAt: now,
        progress: 0,
        input: toJson(input),
        result: undefined,
        error: undefined,
        product: toJson(product),
        stage: "queued",
        attempt: 1,
        tokenUsed: 0,
      },
    });

    return rowToImageGenJob(row);
  }

  async patchJob(
    id: string,
    patch: Partial<ImageGenJob>
  ): Promise<ImageGenJob | undefined> {
    const exists = await db.historyGeneratedImageContent.findUnique({
      where: { id },
    });
    if (!exists) return undefined;

    // stage fallback: kalau tidak ada di patch, pakai stage existing
    const data = imageGenJobToUpdateData({
      stage: patch.stage ?? (exists.stage as ImageGenJobStage),
      ...patch,
    });

    const row = await db.historyGeneratedImageContent.update({
      where: { id },
      data,
    });

    return rowToImageGenJob(row);
  }

  async setStatus(
    id: string,
    status: ImageGenJobStatus,
    extra?: Partial<ImageGenJob>
  ): Promise<ImageGenJob | undefined> {
    return this.patchJob(id, { status, ...(extra ?? {}) });
  }

  async setProgress(
    id: string,
    progress: number
  ): Promise<ImageGenJob | undefined> {
    return this.patchJob(id, { progress });
  }

  async setResult(
    id: string,
    result: JobResult,
    tokenUsed?: number
  ): Promise<ImageGenJob | undefined> {
    // Back-compat: bila tokenUsed tidak dikirim, coba ambil dari result.tokenUsed
    const tk =
      typeof tokenUsed === "number"
        ? tokenUsed
        : (result as unknown as { tokenUsed?: number })?.tokenUsed ?? 0;

    return this.patchJob(id, {
      status: "done",
      progress: 100,
      result,
      stage: "done",
      tokenUsed: tk,
    });
  }

  async setError(id: string, error: unknown): Promise<ImageGenJob | undefined> {
    const err: JobError =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };

    return this.patchJob(id, { status: "error", error: err });
  }

  async getJob(id: string): Promise<ImageGenJob | null> {
    const row = await db.historyGeneratedImageContent.findUnique({
      where: { id },
    });
    return row ? rowToImageGenJob(row) : null;
  }

  async listJobs(rootBusinessId: string, limit = 50): Promise<JobData[]> {
    const rows = await db.historyGeneratedImageContent.findMany({
      where: { rootBusinessId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const out: JobData[] = rows.map((row) => {
      const job = rowToImageGenJob(row);

      // error (string) untuk kompatibilitas JobData
      const errorStr =
        job.error?.message ?? (job.error ? JSON.stringify(job.error) : null);

      // pastikan bentuk product sesuai JobData.product
      const product = (job.product ?? {}) as JobData["product"];

      return {
        id: job.id,
        type: job.type,
        rootBusinessId: job.rootBusinessId,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        progress: job.progress,
        input: job.input,
        error: errorStr,
        stage: job.stage,
        product,
        result: job.result,
      };
    });

    // Sudah diorder by createdAt desc dari DB, tapi kita jaga kompatibilitas
    out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return out;
  }

  async deleteJobById(id: string): Promise<string> {
    await db.historyGeneratedImageContent.delete({ where: { id } });
    return id;
  }
}
