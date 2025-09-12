import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { PurchaseService } from "../services/PurchaseService";
import {
  AwaitedBankCheckoutDTO,
  EWalletCheckoutDTO,
} from "../validators/CheckoutValidator";

export class PurchaseController extends BaseController {
  constructor(private pur: PurchaseService) {
    super();
  }

  getAllUserPurchases = async (req: Request, res: Response) => {
    try {
      const profileId = req.user?.id;
      const filter = req.filterQuery;
      const data = await this.pur.getAllUserPurchases(profileId!, filter!);
      if (!data) return this.notFound(res);
      return this.sendSuccess(
        res,
        data.data,
        "Berhasil mengambil pembelian user",
        200,
        data.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getUserPurchase = async (req: Request, res: Response) => {
    try {
      const profileId = req.user?.id;
      const { paymentPurchaseId } = req.params;
      const data = await this.pur.getUserPurchase(
        profileId!,
        paymentPurchaseId
      );
      if (!data) return this.notFound(res);
      return this.sendSuccess(res, data);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllBusinessPurchases = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const data = await this.pur.getAllBusinessPurchases(
        rootBusinessId,
        filter!
      );
      if (!data) return this.notFound(res);
      return this.sendSuccess(
        res,
        data.data,
        "Berhasil mengambil pembelian bisnis",
        200,
        data.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getBusinessPurchase = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId, paymentPurchaseId } = req.params;
      const data = await this.pur.getBusinessPurchase(
        rootBusinessId,
        paymentPurchaseId
      );
      if (!data) return this.notFound(res);
      return this.sendSuccess(res, data);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  eWalletCheckout = async (req: Request, res: Response) => {
    try {
      const data = req.body as EWalletCheckoutDTO;
      const { rootBusinessId } = req.params;
      const profileId = req.user?.id;
      const checkout = await this.pur.eWalletCheckout(
        data,
        rootBusinessId,
        profileId!
      );
      if (!checkout) return this.notFound(res);
      if (typeof checkout === "string")
        return this.sendError(res, new Error(checkout), 400);
      return this.sendCreated(res, checkout, "Checkout berhasil dibuat");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  bankCheckout = async (req: Request, res: Response) => {
    try {
      const data = req.body as AwaitedBankCheckoutDTO;
      const { rootBusinessId } = req.params;
      const profileId = req.user?.id;
      const checkout = await this.pur.bankCheckout(
        data,
        rootBusinessId,
        profileId!
      );
      if (!checkout) return this.notFound(res);
      if (typeof checkout === "string")
        return this.sendError(res, new Error(checkout), 400);
      return this.sendCreated(res, checkout, "Checkout berhasil dibuat");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  midtransWebhook = async (req: Request, res: Response) => {
    res.setHeader("ngrok-skip-browser-warning", "true");
    if (req.headers["user-agent"] !== "Veritrans") {
      return this.forbidden(res);
    }
    const check = await this.pur.midtransWebhook(req.body);

    return this.sendSuccess(res, check);
  };

  cancelPurchase = async (req: Request, res: Response) => {
    try {
      const { paymentPurchaseId } = req.params;
      const data = await this.pur.cancelPurchase(paymentPurchaseId);
      if (!data) return this.notFound(res);
      if (typeof data === "string")
        return this.sendError(res, new Error(data), 400);
      return this.sendSuccess(res, data, "Berhasil membatalkan pembelian");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
