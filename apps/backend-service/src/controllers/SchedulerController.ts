import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { SchedulerService } from "../services/SchedulerService";
import {
  AutoSchedulerDTO,
  ManualParamsDTO,
  ManualSchedulerDTO,
  TimeZoneDTO,
} from "../validators/SchedulerValidator";

export class SchedulerController extends BaseController {
  constructor(private sched: SchedulerService) {
    super();
  }

  getAutoPostingSchedule = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const bk = await this.sched.getAutoPostingSchedule(rootBusinessId);
      if (!bk) return this.notFound(res);
      return this.sendSuccess(res, bk);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  upsertAutoPostingSchedule = async (req: Request, res: Response) => {
    try {
      const data = req.body as AutoSchedulerDTO;
      const { rootBusinessId } = req.params;
      const edit = await this.sched.upsertAutoPostingSchedule(
        data,
        rootBusinessId
      );
      return this.sendCreated(
        res,
        edit,
        "Jadwal posting otomatis berhasil diupdate"
      );
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  getAllQueuePosts = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const posts = await this.sched.getAllQueuePosts(rootBusinessId);
      return this.sendSuccess(res, posts);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  addToQueue = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as ManualSchedulerDTO;
      const post = await this.sched.addToQueue(data, rootBusinessId);
      if (!post) return this.notFound(res);
      if (typeof post === "string")
        return this.sendError(res, new Error(post), 400);
      return this.sendCreated(
        res,
        post,
        "Post berhasil ditambahkan ke antrian"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  editFromQueue = async (req: Request, res: Response) => {
    try {
      const data = req.body as ManualSchedulerDTO;
      const { schedulerManualPostingId, rootBusinessId } = req.params as unknown as ManualParamsDTO;
      const post = await this.sched.editFromQueue(
        data,
        rootBusinessId,
        schedulerManualPostingId
      );
      if (!post) return this.notFound(res);
      if (typeof post === "string")
        return this.sendError(res, new Error(post), 400);
      return this.sendSuccess(res, post, "Post berhasil diupdate");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  deleteFromQueue = async (req: Request, res: Response) => {
    try {
      const data = req.params as unknown as ManualParamsDTO;
      const post = await this.sched.deleteFromQueue(data);
      if (!post) return this.notFound(res);
      return this.sendSuccess(res, post, "Post berhasil dihapus dari antrian");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  getTimezone = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const timezone = await this.sched.getTimezone(rootBusinessId);
      if (!timezone) return this.notFound(res);
      return this.sendSuccess(res, timezone);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  upsertTimezone = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as TimeZoneDTO;
      const timezone = await this.sched.upsertTimezone(data, rootBusinessId);
      return this.sendCreated(res, timezone, "Zona waktu berhasil diupdate");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
