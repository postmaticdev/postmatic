import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { TierService } from "src/services/TierService";

export class TierController extends BaseController {
  constructor(private tier: TierService) {
    super();
  }

  getBusinessAvailableToken = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const token = await this.tier.getBusinessAvailableToken(rootBusinessId);
      if (!token) return this.notFound(res);
      return this.sendSuccess(res, token);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAnalyticEachTypeToken = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const token = await this.tier.getAnalyticEachTypeToken(rootBusinessId);
      if (!token) return this.notFound(res);
      return this.sendSuccess(res, token);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getBusinessSubscription = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const subscription = await this.tier.getBusinessSubscription(
        rootBusinessId
      );
      return this.sendSuccess(res, subscription);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAnalyticsTokenUsage = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filterQuery = req.filterQuery;
      const token = await this.tier.getAnalyticsTokenUsage(
        rootBusinessId,
        filterQuery!
      );
      if (!token) return this.notFound(res);
      return this.sendSuccess(res, token);
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
