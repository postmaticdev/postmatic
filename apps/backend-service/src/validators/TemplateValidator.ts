import { z } from "zod";

export const TemplateSaveSchema = z.object({
  templateImageContentId: z
    .string()
    .min(1, "Template image content ID is required"),
});

export type TemplateSaveDTO = z.infer<typeof TemplateSaveSchema>;
