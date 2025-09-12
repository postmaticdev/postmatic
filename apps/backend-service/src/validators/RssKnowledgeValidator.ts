import { z } from "zod";

export const RssKnowledgeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  masterRssId: z.string().min(1, "Master RSS is required"),
  isActive: z.boolean().default(true),
});

export type RssKnowledgeDTO = z.infer<typeof RssKnowledgeSchema>;
