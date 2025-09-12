import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { PlatformKnowledgeService } from "../services/PlatformKnowledgeService";
import { PlatformDTO } from "src/validators/PlatformValidator";

export class PlatformKnowledgeController extends BaseController {
  constructor(private platform: PlatformKnowledgeService) {
    super();
  }

  getConnected = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const { from = "/" } = req.query;
      const postmaticToken = req.user?.postmaticToken || "";
      const connected = await this.platform.getConnected(
        rootBusinessId,
        postmaticToken,
        String(from)
      );
      if (!connected) return this.notFound(res);
      return this.sendSuccess(res, connected);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  disconnect = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.params as PlatformDTO;
      const connected = await this.platform.disconnect(rootBusinessId, data);
      if (!connected) return this.notFound(res);
      if (typeof connected === "string")
        return this.sendError(res, new Error(connected), 400);
      return this.sendSuccess(res, connected, "Berhasil memutus koneksi");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
