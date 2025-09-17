import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { BusinessService } from "../services/BusinessService";
import { BusinessKnowledgeDTO } from "../validators/BusinessKnowledgeValidator";
import { RootBusinessDTO } from "src/validators/RootBusinessValidator";

export class BusinessController extends BaseController {
  constructor(private bkService: BusinessService) {
    super();
  }

  getOwnBusinesses = async (req: Request, res: Response) => {
    try {
      const profileId = req.user?.id;
      const filter = req.filterQuery;
      const businesses = await this.bkService.getOwnBusinesses(
        profileId!,
        filter!
      );
      if (!businesses) return this.notFound(res);
      return this.sendSuccess(
        res,
        businesses.data,
        "Success",
        200,
        businesses.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getDetailBusiness = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const profileId = req.user?.id;
      const business = await this.bkService.getDetailBusiness(
        rootBusinessId,
        profileId!
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, business);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  createBusiness = async (req: Request, res: Response) => {
    try {
      const data = req.body as RootBusinessDTO;
      const profileId = req.user?.id;
      const business = await this.bkService.createBusiness(data, profileId!);
      return this.sendSuccess(res, business, "Berhasil membuat bisnis");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  editBusiness = async (req: Request, res: Response) => {
    try {
      const data = req.body as RootBusinessDTO;
      const profileId = req.user?.id;
      const { rootBusinessId } = req.params;
      const business = await this.bkService.editBusiness(
        data,
        profileId!,
        rootBusinessId
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, business, "Berhasil mengedit bisnis");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  deleteBusiness = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const profileId = req.user?.id;
      const business = await this.bkService.deleteBusiness(
        rootBusinessId,
        profileId!
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, null, "Berhasil menghapus bisnis");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
