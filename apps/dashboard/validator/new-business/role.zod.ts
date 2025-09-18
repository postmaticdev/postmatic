import z from "zod";

export const roleKnowledgeSchema = z.object({
  targetAudience: z
    .string()
    .min(1, "Harap masukkan target audience")
    .max(200, "Target audience harus kurang dari 200 karakter"),
  tone: z
    .string()
    .min(1, "Harap masukkan content tone")
    .max(200, "Content tone harus kurang dari 200 karakter"),
  audiencePersona: z
    .string()
    .min(1, "Harap masukkan audience persona")
    .max(500, "Audience persona harus kurang dari 500 karakter"),
  hashtags: z
    .array(z.string())
    .min(1, "Harap masukkan setidaknya satu hashtag")
    .max(10, "Maksimal 10 hashtags yang diizinkan"),
  callToAction: z
    .string()
    .min(1, "Harap masukkan call to action")
    .max(200, "Call to action harus kurang dari 200 karakter"),
  goals: z
    .string()
    .min(1, "Harap masukkan content goals")
    .max(500, "Content goals harus kurang dari 500 karakter"),
});

export type RoleKnowledgePld = z.infer<typeof roleKnowledgeSchema>;
