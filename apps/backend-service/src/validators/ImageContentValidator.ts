import { z } from "zod";

// BASE SCHEMA

export const ImageContentBaseSchema = z.object({
  ratio: z.enum(["1:1", "2:3", "3:2"]),
  category: z.string().min(1, "Category is required"),
  productKnowledgeId: z.string().min(1, "Product knowledge ID is required"),
  designStyle: z.string().nullable(),
  prompt: z.string().nullable().optional(),
  referenceImage: z.string().url().nullable().optional(),
});

export type ImageContentBaseDTO = z.infer<typeof ImageContentBaseSchema>;

export const ImageContentAdvancedGenerateSchema = z.object({
  businessKnowledge: z.object({
    name: z.boolean(),
    category: z.boolean(),
    description: z.boolean(),
    location: z.boolean(),
    logo: z
      .object({
        primaryLogo: z.boolean(),
        secondaryLogo: z.boolean(),
      })
      .refine(
        (data) => {
          let count = 0;
          Object.values(data).forEach((value) => value && count++);
          return !(count === 2);
        },
        {
          message: "Hanya boleh ada 1 logo atau tidak sama sekali",
        }
      ),
    uniqueSellingPoint: z.boolean(),
    website: z.boolean(),
    visionMission: z.boolean(),
  }),
  productKnowledge: z.object({
    name: z.boolean(),
    category: z.boolean(),
    description: z.boolean(),
    price: z.boolean(),
    benefit: z.boolean(),
    allergen: z.boolean(),
    composition: z.boolean(),
  }),
  roleKnowledge: z.object({
    hashtags: z.boolean(),
  }),
});

export type ImageContentAdvancedGenerateDTO = z.infer<
  typeof ImageContentAdvancedGenerateSchema
>;

// GENERATE SCHEMA

export const ImageContentSchema = z.object({
  ...ImageContentBaseSchema.shape,
  advancedGenerate: ImageContentAdvancedGenerateSchema,
});

export type ImageContentDTO = z.infer<typeof ImageContentSchema>;

export const ImageContentRegenerateSchema = z.object({
  ...ImageContentBaseSchema.shape,
  advancedGenerate: ImageContentAdvancedGenerateSchema,
  referenceImage: z.string().url(),
  caption: z.string(),
});

export type ImageContentRegenerateDTO = z.infer<
  typeof ImageContentRegenerateSchema
>;

export const ImageContentRssSchema = z.object({
  ...ImageContentBaseSchema.shape,
  advancedGenerate: ImageContentAdvancedGenerateSchema,
  rss: z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url().min(1, "URL is required"),
    publishedAt: z.string().min(1, "Published at is required"),
    imageUrl: z
      .string()
      .url()
      .min(1, "Image URL is required")
      .nullable()
      .optional(),
    summary: z.string().min(1, "Summary is required"),
    publisher: z.string().min(1, "Publisher is required"),
  }),
});

export type ImageContentRssDTO = z.infer<typeof ImageContentRssSchema>;

export const ImageContentMaskSchema = z.object({
  ...ImageContentBaseSchema.shape,
  prompt: z.string().min(1, "Prompt is required"),
  referenceImage: z.string().min(1, "Reference image is required").url(),
  mask: z.string().min(1, "Mask is required").url(),
  caption: z.string().nullable().optional(),
});

export type ImageContentMaskDTO = z.infer<typeof ImageContentMaskSchema>;

// BELOW IS HAVE NO RESPONSBILITY FOR GENERATE CONTENT

// SAVE SCHEMA
export const ImageContentSaveSchema = z.object({
  images: z.array(z.string()).min(1),
  ratio: z.enum(["1:1", "2:3", "3:2"]),
  category: z.string(),
  designStyle: z.string().nullable(),
  caption: z.string(),
  productKnowledgeId: z.string(),
});

export type ImageContentSaveDTO = z.infer<typeof ImageContentSaveSchema>;

// EDIT SCHEMA

export const ImageContentEditSchema = z.object({
  images: z.array(z.string()).min(1),
  designStyle: z.string().nullable(),
  caption: z.string().min(1, "Caption is required"),
  ratio: z.enum(["1:1", "2:3", "3:2"]),
  category: z.string(),
});

export type ImageContentEditDTO = z.infer<typeof ImageContentEditSchema>;
