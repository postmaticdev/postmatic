import { SocialPlatform } from "@prisma/client";
import { z } from "zod";

export const PostSchema = z.object({
  generatedImageContentId: z
    .string()
    .min(1, "Generated image content ID is required"),
  platforms: z
    .array(
      z.enum(
        Object.values(SocialPlatform) as [SocialPlatform, ...SocialPlatform[]]
      )
    )
    .min(1, "Platforms is required"),
  caption: z.string().nullable().optional(),
});

export type PostDTO = z.infer<typeof PostSchema>;
