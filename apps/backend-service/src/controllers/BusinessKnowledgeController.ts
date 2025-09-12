import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { BusinessKnowledgeService } from "../services/BusinessKnowledgeService";
import { BusinessKnowledgeDTO } from "../validators/BusinessKnowledgeValidator";

export class BusinessKnowledgeController extends BaseController {
  constructor(private bkService: BusinessKnowledgeService) {
    super();
  }

  getCurrentBusinessKnowledge = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const bk = await this.bkService.getBusinessKnowledge(rootBusinessId);
      if (!bk) return this.notFound(res);
      return this.sendSuccess(res, bk);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  upsertBusinessKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as BusinessKnowledgeDTO;
      const { rootBusinessId } = req.params;
      const bk = await this.bkService.upsertBusinessKnowledge(
        data,
        rootBusinessId
      );
      return this.sendCreated(res, bk, "Berhasil mengedit bisnis");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
