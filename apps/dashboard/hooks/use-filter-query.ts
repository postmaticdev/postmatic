import { FilterQuery } from "@/models/api/base-response.type";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

const FilterQuerySchema = z.object({
  dateStart: z.coerce
    .string()
    .optional()
    .default(undefined as unknown as string),
  dateEnd: z.coerce
    .string()
    .optional()
    .default(undefined as unknown as string),
  search: z.string().default(""),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  sort: z.string().default("desc"),
  skip: z.coerce.number().default(0),
  sortBy: z.string().default("createdAt"),
  category: z.string().optional().default(""),
});

export const useFilterQuery = (): FilterQuery | undefined => {
  const sp = useSearchParams();
  const filterQuery = FilterQuerySchema.safeParse(Object.fromEntries(sp));
  return filterQuery.data || undefined;
};
