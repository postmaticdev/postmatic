import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { AppProductService } from "../services/AppProductService";
import { DiscountDTO, ProductDetailDTO } from "../validators/DiscountValidator";

export class AppProductController extends BaseController {
  constructor(private prod: AppProductService) {
    super();
  }

  getAllSubscriptionAppProducts = async (req: Request, res: Response) => {
    try {
      const data = req.query as DiscountDTO;
      const { rootBusinessId } = req.params;
      const profileId = req?.user?.id;
      const prod = await this.prod.getAllSubscriptionAppProducts(
        profileId!,
        rootBusinessId,
        data
      );
      return this.sendSuccess(res, prod);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllTokenAppProducts = async (req: Request, res: Response) => {
    try {
      const data = req.query as DiscountDTO;
      const { rootBusinessId } = req.params;
      const profileId = req?.user?.id;
      const prod = await this.prod.getAllTokenAppProducts(
        profileId!,
        rootBusinessId,
        data
      );
      return this.sendSuccess(res, prod);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getProductDetail = async (req: Request, res: Response) => {
    try {
      const data = req.params as ProductDetailDTO;
      const code = typeof req.query.code === "string" ? req.query.code : null;
      const profileId = req?.user?.id;
      const prod = await this.prod.getProductDetail(data, code, profileId!);
      if (!prod) return this.notFound(res);
      return this.sendSuccess(res, prod);
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
