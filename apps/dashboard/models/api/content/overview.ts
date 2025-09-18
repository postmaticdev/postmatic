import { PlatformEnum } from "../knowledge/platform.type";
import { GeneratedImageContent } from "./scheduler.type";

export interface CountPostRes {
  total: number;
  detail: DetailUpcomingPost;
}

export type DetailUpcomingPost = Record<PlatformEnum, number>;

export interface UpcomingPostRes {
  id: number;
  date: string;
  images: string[];
  platforms: PlatformEnum[];
  type: "auto" | "manual";
  title: string;
  generatedImageContent: GeneratedImageContent;
  schedulerManualPostingId: number | null;
}
