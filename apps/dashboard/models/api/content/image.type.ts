/* ----------------------------------------------------------------
  Draft Content
  --------------------------------------------------------------*/

import { PlatformEnum } from "../knowledge/platform.type";

/*
  Get All Draft Image Content
*/
export interface ImageContentRes {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  readyToPost: boolean;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
  postedImageContents?: PostedImageContent[];
  platforms?: PlatformEnum[];
}

/*
  Payload for Generate Content
*/
export type ValidRatio = "1:1" | "2:3" | "3:2";
export interface GenerateContentBase {
  ratio: ValidRatio;
  category: string;
  productKnowledgeId: string;
  designStyle: string | null;
  prompt: string | null;
  referenceImage: string | null;
}

export interface GenerateContentAdvanceBase {
  businessKnowledge: {
    name: boolean;
    category: boolean;
    description: boolean;
    location: boolean;
    logo: boolean;
    uniqueSellingPoint: boolean;
    website: boolean;
    visionMission: boolean;
  };
  productKnowledge: {
    name: boolean;
    category: boolean;
    description: boolean;
    price: boolean;
  };
  roleKnowledge: {
    hashtags: boolean;
  };
}

export interface GenerateContentRssBase {
  title: string;
  url: string;
  publishedAt: string;
  imageUrl: string | null;
  summary: string;
  publisher: string;
}

export interface GenerateContentBasicPld extends GenerateContentBase {
  advancedGenerate: GenerateContentAdvanceBase;
}

export interface GenerateContentRegeneratePld extends GenerateContentBase {
  advancedGenerate: GenerateContentAdvanceBase;
  referenceImage: string;
  caption: string;
}

export interface GenerateContentRssPld extends GenerateContentBase {
  rss: GenerateContentRssBase;
  advancedGenerate?: AdvancedGenerate;
}

export interface GenerateContentMaskPld extends GenerateContentBase {
  prompt: string;
  referenceImage: string;
  mask: string;
  caption: string | null;
}

/*
  Response for Generate Content by knowledge & by rss & regenerate
*/
export interface GenerateContentRes {
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  referenceImages: string[];
  productKnowledgeId: string;
  tokenUsed: number;
}

export interface GenerateDraftState {
  prompt: string;
  designStyle: string;
  ratio: string;
  productKnowledgeId: string;
  attachLogo: boolean;
  images: string[];
  category: string;
  caption: string;
}

/*
  Payload for Save Content
*/
export interface SaveContentPld {
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  referenceImages: string[];
  productKnowledgeId: string;
}

export interface SaveContentRes {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  readyToPost: boolean;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/*
  Payload for Edit Content
*/
export interface EditContentPld {
  images: string[];
  category: string;
  designStyle: string;
  caption: string;
  ratio: string;
}

/*
  Response for Set Ready To Post
*/
export interface SetReadyToPostRes {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  customPrompt: string | null;
  readyToPost: boolean;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

/*
  Payload for Direct Post
*/
export interface DirectPostContentPld {
  generatedImageContentId: string;
  platforms: PlatformEnum[];
  caption: string;
}

/*
  Response for Direct Post
*/

export interface DirectPostContentRes {
  id: string;
  url: string;
  caption: string;
  images: string[];
  platform: string;
  generatedImageContentId: string;
}

/*
  Response for Delete Content
*/
export interface DeleteContentRes {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string | null;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

/* ----------------------------------------------------------------
  Posted Content
  --------------------------------------------------------------*/

/*
  Payload for Repost Content
*/
export interface RepostContentPld {
  generatedImageContentId: string;
  platforms: string[];
  caption: string;
}

/* response for get posted images */
export interface PostedImageRes {
  id: string;
  images: string[];
  ratio: string;
  category: string;
  designStyle: string;
  caption: string;
  readyToPost: boolean;
  productKnowledgeId: string;
  rootBusinessId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  postedImageContents: PostedImageContent[];
  platforms: PlatformEnum[];
}

export interface PostedImageContent {
  id: string;
  platform: PlatformEnum;
  url: string;
  caption: string;
  images: string[];
  postId: string;
  generatedImageContentId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdvancedGenerate {
  businessKnowledge: {
    name: boolean;
    category: boolean;
    description: boolean;
    location: boolean;
    logo: boolean;
    uniqueSellingPoint: boolean;
    website: boolean;
    visionMission: boolean;
  };
  productKnowledge: {
    name: boolean;
    category: boolean;
    description: boolean;
    price: boolean;
  };
  roleKnowledge: {
    hashtags: boolean;
  };
}
