import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ImageContentGenerateService } from "../services/ImageContent/ImageContentGenerateService";
import {
  ImageContentDTO,
  ImageContentRegenerateDTO,
  ImageContentSaveDTO,
  ImageContentRssDTO,
  ImageContentMaskDTO,
} from "src/validators/ImageContentValidator";
import { PostDTO } from "src/validators/PostValidator";
import { ImageContentGenerateMockService } from "../services/ImageContent/ImageContentGenerateMockService";

export class ImageContentController extends BaseController {
  constructor(
    private content: ImageContentGenerateService,
    private mock: ImageContentGenerateMockService
  ) {
    super();
  }

  getAllPostedContents = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const contents = await this.content.getAllPostedContents(
        rootBusinessId,
        filter!
      );
      if (!contents) return this.notFound(res);

      return this.sendSuccess(
        res,
        contents.data,
        "Posted contents berhasil diambil",
        200,
        contents.pagination,
        filter
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllDraftContents = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const filter = req.filterQuery;
      const contents = await this.content.getAllDraftContents(
        rootBusinessId,
        filter!
      );
      if (!contents) return this.notFound(res);

      return this.sendSuccess(
        res,
        contents.data,
        "Draft contents berhasil diambil",
        200,
        contents.pagination,
        filter!
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  saveGeneratedImage = async (req: Request, res: Response) => {
    try {
      const data = req.body as ImageContentSaveDTO;
      const { rootBusinessId } = req.params;
      const business = await this.content.saveGeneratedImage(
        data,
        rootBusinessId
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, business, "Konten berhasil disimpan");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  editGeneratedContent = async (req: Request, res: Response) => {
    try {
      const data = req.body as ImageContentSaveDTO;
      const { generatedImageContentId } = req.params;
      const business = await this.content.editGeneratedContent(
        data,
        generatedImageContentId
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, business, "Konten berhasil diupdate");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  setReadyToPost = async (req: Request, res: Response) => {
    try {
      const { generatedImageContentId, rootBusinessId } = req.params;
      const business = await this.content.setReadyToPost(
        rootBusinessId,
        generatedImageContentId
      );
      if (!business) return this.notFound(res);
      if (typeof business === "string")
        return this.sendError(res, new Error(business), 400);
      return this.sendSuccess(
        res,
        business,
        business.readyToPost
          ? "Berhasil menandai sebagai siap diposting"
          : "Berhasil menandai sebagai tidak siap diposting"
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  deleteGeneratedContent = async (req: Request, res: Response) => {
    try {
      const { generatedImageContentId } = req.params;
      const business = await this.content.deleteGeneratedContent(
        generatedImageContentId
      );
      if (!business) return this.notFound(res);
      return this.sendSuccess(res, business, "Konten berhasil dihapus");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  directPost = async (req: Request, res: Response) => {
    try {
      const data = req.body as PostDTO;
      const { rootBusinessId } = req.params;
      const business = await this.content.directPost(data, rootBusinessId);
      if (typeof business === "string")
        return this.sendError(res, new Error(business), 400);
      return this.sendSuccess(res, business, "Konten berhasil diposting");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  // WITH JOB
  enqueueGenerateContentBasedOnKnowledge = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentDTO;
      const content = await this.content.enqueueGenerateContentBasedOnKnowledge(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  enqueueGenerateContentBasedOnRss = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentRssDTO;
      const content = await this.content.enqueueGenerateContentBasedOnRss(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  enqueueRegenerateContent = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentRegenerateDTO;
      const content = await this.content.enqueueRegenerateContent(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  enqueueGenerateContentBasedOnMask = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentMaskDTO;
      const content = await this.content.enqueueGenerateContentBasedOnMask(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  // QUERY

  getJob = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const job = await this.content.getJob(jobId);
      if (!job) return this.notFound(res);
      return this.sendSuccess(res, job, "Job berhasil diambil");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  listJobs = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const jobs = await this.content.listJobs(rootBusinessId);
      return this.sendSuccess(res, jobs, "Jobs berhasil diambil");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  // MOCK

  enqueueGenerateMockContent = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentDTO;
      const content = await this.mock.enqueueGenerateMockContent(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  enqueueRegenerateMockContent = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentRegenerateDTO;
      const content = await this.mock.enqueueRegenerateMockContent(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  enqueueGenerateMockContentBasedOnRss = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ImageContentRssDTO;
      const content = await this.mock.enqueueGenerateMockContentRss(
        data,
        rootBusinessId
      );
      if (!content) return this.notFound(res);
      if (typeof content === "string")
        return this.sendError(res, new Error(content), 400);
      return this.sendSuccess(res, content, "Konten berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  deleteJobById = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId, jobId } = req.params;
      const job = await this.content.deleteJobById(rootBusinessId, jobId);
      if (!job) return this.notFound(res);
      return this.sendSuccess(res, null, "Berhasil menghapus riwayat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
