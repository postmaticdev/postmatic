import z from "zod";

export const productKnowledgeSchema = z
  .object({
    images: z.array(z.string()).min(1, "Harap upload foto produk"),
    name: z
      .string()
      .min(1, "Harap masukkan nama produk")
      .max(100, "Nama produk harus kurang dari 100 karakter"),
    category: z.string().min(1, "Harap masukkan kategori produk"),
    description: z
      .string()
      .min(1, "Harap masukkan deskripsi produk")
      .max(1000, "Deskripsi produk harus kurang dari 1000 karakter"),
    price: z
      .number()
      .min(1, "Harap masukkan harga produk")
      .max(999999999, "Price is too high"),
    currency: z.string().min(1, "Harap masukkan mata uang"),
    benefit: z
      .string()
      .min(1, "Harap masukkan manfaat produk")
      .max(500, "Manfaat produk harus kurang dari 500 karakter"),
    allergen: z
      .string()
      .max(500, "Informasi alergi harus kurang dari 500 karakter"),
  })

export type ProductKnowledgePld = z.infer<typeof productKnowledgeSchema>;
