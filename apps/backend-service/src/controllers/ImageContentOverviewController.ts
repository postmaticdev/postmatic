import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ImageContentOverviewService } from "../services/ImageContent/ImageContentOverviewService";

export class ImageContentOverviewController extends BaseController {
  constructor(private service: ImageContentOverviewService) {
    super();
  }

  getCountPosted = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const overview = await this.service.getCountPosted(
        rootBusinessId,
        filter!
      );
      if (!overview) {
        return this.sendError(res, "Overview tidak ditemukan");
      }
      return this.sendSuccess(
        res,
        overview,
        "Overview berhasil diambil",
        200,
        undefined,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getCountUpcoming = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const overview = await this.service.getCountUpcoming(
        rootBusinessId,
        filter!
      );
      if (!overview) {
        return this.sendError(res, "Overview tidak ditemukan");
      }
      return this.sendSuccess(
        res,
        overview,
        "Overview berhasil diambil",
        200,
        undefined,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getUpcomingPost = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const upcomingPost = await this.service.getUpcomingPost(
        rootBusinessId,
        filter!
      );
      return this.sendSuccess(
        res,
        upcomingPost,
        "Upcoming post berhasil diambil",
        200,
        undefined,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
