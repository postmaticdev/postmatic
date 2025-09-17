import z from "zod";

export const rssKnowledgeSchema = z.object({
  title: z
    .string()
    .min(1, "Harap masukkan judul feed")
    .max(100, "Judul feed harus kurang dari 100 karakter"),
  masterRssCategoryId: z.string().min(1, "Harap pilih kategori RSS"),
  masterRssId: z.string().min(1, "Harap pilih sumber RSS"),
  isActive: z.boolean(),
});

export type RssKnowledgePld = z.infer<typeof rssKnowledgeSchema>;
