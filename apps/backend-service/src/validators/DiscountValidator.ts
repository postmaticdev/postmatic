import { z } from "zod";

export const DiscountSchema = z.object({
  code: z.string().optional().nullable(),
});

export type DiscountDTO = z.infer<typeof DiscountSchema>;

export const DiscountCalculateSchema = z.object({
  code: z.string().min(1, "Code is required").optional().nullable(),
  profileId: z.string().min(1, "Profile ID is required").optional().nullable(),
  rootBusinessId: z
    .string()
    .min(1, "Root business ID is required")
    .optional()
    .nullable(),
});

export type DiscountCalculateDTO = z.infer<typeof DiscountCalculateSchema>;

export const ProductDetailSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(["subscription", "token"]),
  rootBusinessId: z.string().min(1, "Root business ID is required"),
});

export type ProductDetailDTO = z.infer<typeof ProductDetailSchema>;
