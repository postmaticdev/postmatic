import { z } from "zod";

export const LinkedInSchema = z.object({
 
});

export type LinkedInDTO = z.infer<typeof LinkedInSchema>;
