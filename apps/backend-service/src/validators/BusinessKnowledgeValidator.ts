import { z } from "zod";

export const BusinessKnowledgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  uniqueSellingPoint: z.string(),
  website: z.string().nullable(),
  visionMission: z.string().min(1, "Vision mission is required"),
  location: z.string().min(1, "Location is required"),
  primaryLogo: z.string().url(),
});

export type BusinessKnowledgeDTO = z.infer<typeof BusinessKnowledgeSchema>;