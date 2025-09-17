/** Business knowledge payload */
export interface BusinessKnowledgePld {
  primaryLogo: string | null;
  name: string;
  category: string;
  description: string;
  visionMission: string;
  website: string;
  location: string;
  uniqueSellingPoint: string;
}

/** Business knowledge response */
export interface BusinessKnowledgeRes {
  id: string;
  primaryLogo: string;
  secondaryLogo: string;
  name: string;
  category: string;
  description: string;
  visionMission: string;
  website: string;
  location: string;
  uniqueSellingPoint: string;
  rootBusinessId: string;
  deletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
