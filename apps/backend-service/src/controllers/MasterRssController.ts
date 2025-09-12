import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { MasterRssService } from "../services/MasterRssService";

export class MasterRssController extends BaseController {
  constructor(private rss: MasterRssService) {
    super();
  }

  getAllArticlesByBusiness = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const ignoreCache = req.query.ignoreCache === "true";
      const rss = await this.rss.getAllArticlesByBusiness(
        rootBusinessId,
        ignoreCache
      );
      if (!rss) return this.notFound(res);
      return this.sendSuccess(res, rss);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllRsses = async (req: Request, res: Response) => {
    try {
      const filter = req.filterQuery;
      const rss = await this.rss.getAllRsses(filter!);
      if (!rss) return this.notFound(res);
      return this.sendSuccess(
        res,
        rss.data,
        "Berhasil diambil",
        200,
        rss.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.rss.getAllCategories();
      return this.sendSuccess(res, categories, "Berhasil diambil", 200);
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
