import { z } from "zod";
import moment from "moment-timezone";
import { SocialPlatform } from "@prisma/client";

const isValidTimezone = (tz: string): boolean => {
  return moment.tz.zone(tz) !== null;
};

// Zod schema
export const TimeZoneSchema = z.object({
  timezone: z.string().refine(isValidTimezone, {
    message: "Invalid timezone format (e.g., Asia/Jakarta)",
  }),
});

export type TimeZoneDTO = z.infer<typeof TimeZoneSchema>;
export const AutoSchedulerSchema = z.object({
  isAutoPosting: z.boolean(),
  schedulerAutoPostings: z
    .array(
      z.object({
        dayId: z.number().min(0).max(6),
        day: z.string(),
        isActive: z.boolean(),
        schedulerAutoPostingTimes: z.array(
          z.object({
            hhmm: z
              .string()
              .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "Time must be in hh:mm format"
              ),
            platforms: z.array(
              z.enum(
                Object.values(SocialPlatform) as [
                  SocialPlatform,
                  ...SocialPlatform[]
                ]
              )
            ),
          })
        ),
      })
    )
    .length(7, "All of days must be filled"),
});

export type AutoSchedulerDTO = z.infer<typeof AutoSchedulerSchema>;

export const ManualSchedulerSchema = z.object({
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
  dateTime: z.coerce.date(),
  caption: z.string(),
});

export type ManualSchedulerDTO = z.infer<typeof ManualSchedulerSchema>;

export const ManualParamsSchema = z.object({
  schedulerManualPostingId: z.coerce.number(),
  rootBusinessId: z.string().min(1, "Root business ID is required"),
});

export type ManualParamsDTO = z.infer<typeof ManualParamsSchema>;
