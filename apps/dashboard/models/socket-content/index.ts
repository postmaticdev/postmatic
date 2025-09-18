import {
  GenerateContentAdvanceBase,
  GenerateContentRssBase,
  ValidRatio,
} from "@/models/api/content/image.type";

export type JobType =
  | "knowledge"
  | "rss"
  | "regenerate"
  | "mask"
  | "mock_knowledge"
  | "mock_rss"
  | "mock_regenerate"
  | "mock_mask";

// --------------------
// INPUT & RESULT TYPES
// --------------------
export interface ImageGenInput {
  productKnowledgeId: string;
  numOfImgs: number;
  ratio: string;
  category: string;
  designStyle: string;
  referenceImage: string | null;
}

export interface ImageGenResult {
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  referenceImages: string[];
  productKnowledgeId: string;
  tokenUsed: number;
}

// --------------------
// WRAPPER DARI API
// --------------------
export interface ProductKnowledgeWithJobs {
  productKnowledgeId: string;
  latestUpdate: string;
  latestImage: string;
  name: string;
  jobs: JobData[];
}

export interface JobRes {
  jobId: string;
}

// Get ALL JOBS
export interface GetAllJob {
  productKnowledgeId: string;
  latestUpdate: string;
  latestImage: string;
  name: string;
  jobs: JobData[];
}

export type JobStatus =
  | "queued"
  | "processing"
  | "done"
  | "error"
  | "retrying"
  | "waiting_before_retry";

export type JobStage =
  | "queued"
  | "processing"
  | "verifying_business_information"
  | "preparing_knowledge"
  | "preparing_assets"
  | "generating_images"
  | "uploading"
  | "generating_caption"
  | "preparing_rss_image"
  | "writing_temp"
  | "error"
  | "done"
  | "retrying"
  | "waiting_before_retry";

export interface JobData {
  id: string;
  type: JobType;
  rootBusinessId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  progress: number;
  input: {
    rss: GenerateContentRssBase | null;
    ratio: ValidRatio;
    prompt: string | null;
    caption: string | null;
    category: string;
    designStyle: string;
    referenceImage: string | null;
    advancedGenerate: GenerateContentAdvanceBase;
    productKnowledgeId: string;
  };
  error: { message: string; stack: string | null; attempt: number } | null;
  stage: JobStage;
  product: Product;
  result: Result | null;
}

export interface Product {
  name: string;
  description: string;
  category: string;
  currency: string;
  price: number;
  images: string[];
}

export interface Result {
  images: string[];
  ratio: ValidRatio;
  category: string;
  designStyle: string;
  caption: string;
  referenceImages: string[] | null;
  productKnowledgeId: string;
  tokenUsed: number;
}
