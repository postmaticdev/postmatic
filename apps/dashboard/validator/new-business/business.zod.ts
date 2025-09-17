import z from "zod";

export const businessKnowledgeSchema = z
  .object({
    primaryLogo: z.string().min(1, "Harap upload logo bisnis"),
    name: z
      .string()
      .min(1, "Harap masukkan nama bisnis")
      .max(100, "Nama bisnis harus kurang dari 100 karakter"),
    category: z.string().min(1, "Harap masukkan kategori bisnis"),
    description: z
      .string()
      .min(1, "Harap masukkan deskripsi bisnis")
      .max(1000, "Deskripsi bisnis harus kurang dari 1000 karakter"),
    visionMission: z
      .string()
      .min(1, "Harap masukkan visi dan misi bisnis")
      .max(1000, "Visi dan misi bisnis harus kurang dari 1000 karakter"),
    website: z.string().url("Harap masukkan URL yang valid (https://www.example.com) atau di kosongkan apabila tidak ada").or(z.literal("")),
    uniqueSellingPoint: z
      .string()
      .min(1, "Harap masukkan unique selling point bisnis")
      .max(500, "Unique selling point bisnis harus kurang dari 500 karakter"),
    location: z
      .string()
      .min(1, "Harap masukkan lokasi bisnis")
      .max(200, "Lokasi bisnis harus kurang dari 200 karakter"),
  })

export type BusinessKnowledgePld = z.infer<typeof businessKnowledgeSchema>;
