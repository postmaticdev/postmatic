import { Request, Response } from "express";
import { TemplateService } from "../services/TemplateService";
import { BaseController } from "./BaseController";
import { TemplateSaveDTO } from "src/validators/TemplateValidator";

export class TemplateController extends BaseController {
  constructor(private templateService: TemplateService) {
    super();
  }

  getTemplateCategories = async (req: Request, res: Response) => {
    try {
      const templateCategories =
        await this.templateService.getTemplateCategories();
      return this.sendSuccess(
        res,
        templateCategories,
        "Kategori template berhasil diambil"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  getPublishedTemplates = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const publishedTemplates =
        await this.templateService.getPublishedTemplates(
          rootBusinessId,
          filter!
        );
      if (!publishedTemplates) return this.notFound(res);
      return this.sendSuccess(
        res,
        publishedTemplates.data,
        "Template publik berhasil diambil",
        200,
        publishedTemplates.pagination,
        filter
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  getSavedTemplates = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const savedTemplates = await this.templateService.getSavedTemplates(
        rootBusinessId,
        filter!
      );
      if (!savedTemplates) return this.notFound(res);
      return this.sendSuccess(
        res,
        savedTemplates.data,
        "Template berhasil diambil",
        200,
        savedTemplates.pagination,
        filter
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  saveTemplate = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as TemplateSaveDTO;
      const savedTemplate = await this.templateService.saveTemplate(
        rootBusinessId,
        data
      );
      if (!savedTemplate) return this.notFound(res);
      if (typeof savedTemplate === "string") {
        return this.sendError(res, new Error(savedTemplate), 400);
      }
      return this.sendSuccess(res, savedTemplate, "Template berhasil disimpan");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  deleteTemplate = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId, templateImageContentId } = req.params;
      const deletedTemplate = await this.templateService.deleteTemplate(
        rootBusinessId,
        templateImageContentId
      );
      if (!deletedTemplate) return this.notFound(res);
      if (typeof deletedTemplate === "string") {
        return this.sendError(res, new Error(deletedTemplate), 400);
      }
      return this.sendSuccess(
        res,
        deletedTemplate,
        "Template berhasil dihapus"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}
