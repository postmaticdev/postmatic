import { z } from "zod";

export const RoleKnowledgeSchema = z.object({
  targetAudience: z.string().min(1, "Target audience is required"),
  tone: z.string().min(1, "Tone is required"),
  audiencePersona: z.string().min(1, "Audience persona is required"),
  hashtags: z.array(z.string()).min(1, "Hashtags is required"),
  callToAction: z.string().min(1, "Call to action is required"),
  goals: z.string().min(1, "Goals is required"),
});

export type RoleKnowledgeDTO = z.infer<typeof RoleKnowledgeSchema>;
