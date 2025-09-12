import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { RoleKnowledgeService } from "../services/RoleKnowledgeService";
import { RoleKnowledgeDTO } from "../validators/RoleKnowledgeValidator";

export class RoleKnowledgeController extends BaseController {
  constructor(private bkService: RoleKnowledgeService) {
    super();
  }

  getCurrentRoleKnowledge = async (req: Request, res: Response) => {
    try {
      try {
        const { rootBusinessId } = req.params;
        const rk = await this.bkService.getRoleKnowledge(rootBusinessId);
        return this.sendSuccess(res, rk);
      } catch (err) {
        return this.sendError(res, err);
      }
    } catch (error) {
      this.sendError(res, error);
    }
  };

  upsertRoleKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as RoleKnowledgeDTO;
      const { rootBusinessId } = req.params;
      const bk = await this.bkService.upsertRoleKnowledge(data, rootBusinessId);
      return this.sendCreated(res, bk, "Pengetahuan role berhasil diupdate");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
