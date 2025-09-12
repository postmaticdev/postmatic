import { SocialPlatform } from "@prisma/client";
import { z } from "zod";

export const PlatformSchema = z.object({
  platform: z.enum(
    Object.values(SocialPlatform) as [SocialPlatform, ...SocialPlatform[]]
  ),
  rootBusinessId: z.string(),
});

export type PlatformDTO = z.infer<typeof PlatformSchema>;
