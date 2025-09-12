import { z } from "zod";

export const RootBusinessSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  logo: z.string().url("Logo must be a valid URL").optional().nullable(),
});

export type RootBusinessDTO = z.infer<typeof RootBusinessSchema>;

