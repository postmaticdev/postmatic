import { z } from "zod";

export const ProductKnowledgeSchema = z.object({
  images: z.array(z.string()).min(1, "Images is required").max(6, "Maximum 6 images"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Price is required"),
  currency: z.string().min(1, "Currency is required"),
  benefit: z.string().nullable().optional(),
  allergen: z.string().nullable().optional(),
});

export type ProductKnowledgeDTO = z.infer<typeof ProductKnowledgeSchema>;