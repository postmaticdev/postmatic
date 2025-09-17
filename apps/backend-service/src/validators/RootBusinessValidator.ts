import { z } from "zod";
import { BusinessKnowledgeSchema } from "./BusinessKnowledgeValidator";
import { ProductKnowledgeSchema } from "./ProductKnowledgeValidator";
import { RoleKnowledgeSchema } from "./RoleKnowledgeValidator";

export const RootBusinessSchema = z.object({
  businessKnowledge: BusinessKnowledgeSchema,
  productKnowledge: ProductKnowledgeSchema,
  roleKnowledge: RoleKnowledgeSchema,
});

export type RootBusinessDTO = z.infer<typeof RootBusinessSchema>;
