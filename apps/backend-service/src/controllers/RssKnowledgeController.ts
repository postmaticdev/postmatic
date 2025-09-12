import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { RssKnowledgeService } from "../services/RssKnowledgeService";
import { RssKnowledgeDTO } from "../validators/RssKnowledgeValidator";

export class RssKnowledgeController extends BaseController {
  constructor(private pkService: RssKnowledgeService) {
    super();
  }

  getAllRssKnowledges = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const rk = await this.pkService.getAllRssKnowledges(
        rootBusinessId,
        filter!
      );
      if (!rk) return this.notFound(res);
      return this.sendSuccess(
        res,
        rk.data,
        "Berhasil diambil",
        200,
        rk.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  createNewRssKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as RssKnowledgeDTO;
      const { rootBusinessId } = req.params;
      const rk = await this.pkService.createNewRssKnowledge(
        data,
        rootBusinessId
      );
      if (!rk) return this.notFound(res);
      if (typeof rk === "string")
        return this.sendError(res, new Error(rk), 400);
      return this.sendCreated(
        res,
        rk,
        "Berhasil menambahkan pengetahuan RSS baru"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  editRssKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as RssKnowledgeDTO;
      const { rssKnowledgeId } = req.params;
      const rk = await this.pkService.editRssKnowledge(data, rssKnowledgeId);
      if (!rk) return this.notFound(res);
      return this.sendCreated(res, rk, "Berhasil mengedit pengetahuan RSS");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  deleteRssKnowledge = async (req: Request, res: Response) => {
    try {
      const { rssKnowledgeId } = req.params;
      const rk = await this.pkService.deleteRssKnowledge(rssKnowledgeId);
      if (!rk) return this.notFound(res);
      return this.sendCreated(res, rk, "Berhasil menghapus pengetahuan RSS");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
