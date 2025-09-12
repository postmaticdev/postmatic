import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ImageService } from "../services/ImageService";
import { ImageDTO } from "../validators/ImageValidator";

export class ImageController extends BaseController {
  constructor(private imageService: ImageService) {
    super();
  }

  uploadSingle = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        console.log("No file uploaded");
        return this.sendError(
          res,
          new Error("Tidak ada file yang diupload"),
          400
        );
      }

      return this.sendSuccess(res, req.file.path, "File berhasil diupload");
    } catch (error) {
      this.sendError(res, error);
    }
  };
  uploadMultiple = async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return this.sendError(
          res,
          new Error("Tidak ada file yang diupload"),
          400
        );
      }
      const upload = await this.imageService.uploadMultiple(
        req.files as Express.Multer.File[]
      );
      return this.sendSuccess(res, upload, "File berhasil diupload");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  deleteImage = async (req: Request, res: Response) => {
    try {
      const data = req.body as ImageDTO;
      const result = await this.imageService.deleteImage(data);
      return this.sendSuccess(res, result, "Image berhasil dihapus");
    } catch (error) {
      this.sendError(res, error);
    }
  };
}
