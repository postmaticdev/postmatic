import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ProductKnowledgeService } from "../services/ProductKnowledgeService";
import { ProductKnowledgeDTO } from "../validators/ProductKnowledgeValidator";

export class ProductKnowledgeController extends BaseController {
  constructor(private pkService: ProductKnowledgeService) {
    super();
  }

  getAllProductKnowledges = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const rk = await this.pkService.getAllProductKnowledges(
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

  getStatusProductKnowledge = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId, productKnowledgeId } = req.params;
      const bk = await this.pkService.getStatusProductKnowledge(
        rootBusinessId,
        productKnowledgeId
      );
      if (!bk) return this.notFound(res);
      return this.sendSuccess(res, bk, "Berhasil diambil");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  createNewProductKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as ProductKnowledgeDTO;
      const { rootBusinessId } = req.params;
      const bk = await this.pkService.createNewProductKnowledge(
        data,
        rootBusinessId
      );
      return this.sendCreated(res, bk, "Berhasil menambahkan produk");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  editProductKnowledge = async (req: Request, res: Response) => {
    try {
      const data = req.body as ProductKnowledgeDTO;
      const { productKnowledgeId } = req.params;
      const bk = await this.pkService.editProductKnowledge(
        data,
        productKnowledgeId
      );
      if (!bk) return this.notFound(res);
      return this.sendCreated(res, bk, "Berhasil mengedit produk");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  deleteProductKnowledge = async (req: Request, res: Response) => {
    try {
      const { productKnowledgeId } = req.params;
      const bk = await this.pkService.deleteProductKnowledge(
        productKnowledgeId
      );
      if (!bk) return this.notFound(res);
      return this.sendCreated(res, bk, "Berhasil menghapus produk");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
