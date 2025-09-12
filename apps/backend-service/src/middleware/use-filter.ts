import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { BaseController } from "../controllers/BaseController";

const FilterQuerySchema = (sortCols: string[]) =>
  z.object({
    dateStart: z.coerce
      .date()
      .optional()
      .default(undefined as unknown as Date),
    dateEnd: z.coerce
      .date()
      .optional()
      .default(undefined as unknown as Date),
    search: z.string().default(""),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    sort: z.enum(["asc", "desc"]).default("desc"),
    skip: z.coerce.number().default(0),
    sortBy: z
      .enum(["createdAt", "updatedAt", ...sortCols])
      .default("createdAt"),
    category: z.string().optional().default(""),
  });

export type FilterQueryType = z.infer<ReturnType<typeof FilterQuerySchema>>;

export const useFilter =
  (sortCols: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const filter = FilterQuerySchema(sortCols).parse(query);
      filter.skip = (filter.page - 1) * filter.limit;
      req.filterQuery = filter;
      next();
    } catch (err) {
      const controller = new BaseController();
      return res.status(400).json({
        metaData: controller.metaData(400),
        responseMessage: "Invalid filter",
        errors: err instanceof ZodError ? err.errors : err,
      });
    }
  };
