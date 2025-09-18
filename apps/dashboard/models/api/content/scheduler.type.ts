import { PlatformEnum } from "../knowledge/platform.type";

/*
payload for auto scheduler
*/
export interface AutoSchedulerPld {
  isAutoPosting: boolean;
  schedulerAutoPostings: SchedulerAutoPosting[];
}

export interface SchedulerAutoPosting {
  dayId: number;
  day: string;
  isActive: boolean;
  schedulerAutoPostingTimes: {
    hhmm: string;
    platforms: PlatformEnum[];
  }[];
}

/*
response for get auto scheduler
*/
export interface AutoSchedulerRes {
  id: number;
  isAutoPosting: boolean;
  rootBusinessId: string;
  schedulerAutoPostings: SchedulerAutoPosting[];
}

export interface SchedulerAutoPosting {
  dayId: number;
  day: string;
  isActive: boolean;
  schedulerAutoPostingTimes: {
    hhmm: string;
    platforms: PlatformEnum[];
  }[];
}

/*
response for auto scheduler upsert
*/
export interface AutoSchedulerUpserRes {
  id: number;
  isAutoPosting: boolean;
  rootBusinessId: string;
  schedulerAutoPostings: SchedulerAutoPosting[];
}

/*
payload for queue
*/
export interface QueuePld {
  platforms: PlatformEnum[];
  generatedImageContentId: string;
  dateTime: string;
  caption: string;
}

/*
response for queue
*/
export interface QueuePostingRes {
  date: string;
  posts: Post[];
}

export interface Post {
  id: number;
  date: string;
  platforms: string[];
  rootBusinessId: string;
  generatedImageContentId: string;
  generatedImageContent: GeneratedImageContent;
}

export interface GeneratedImageContent {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

/*
response for queue
*/
export interface QueueRes {
  id: number;
  date: string;
  platforms: string[];
  rootBusinessId: string;
  generatedImageContentId: string;
}

/*
payload for timezone
*/
export interface TimezoneSettingPld {
  timezone: string;
}

/*
response for timezone
*/
export interface TimezoneSettingRes {
  rootBusinessId: string;
  timezone: string;
  offset: string;
}
