/* payload for add & edit role */

export interface RoleKnowledgePld {
  targetAudience: string;
  tone: string;
  audiencePersona: string;
  hashtags: string[];
  callToAction: string;
  goals: string;
}

/* response for get role */
export interface RoleKnowledgeRes {
  id: string;
  audiencePersona: string;
  callToAction: string;
  goals: string;
  hashtags: string[];
  rootBusinessId: string;
  targetAudience: string;
  tone: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}
