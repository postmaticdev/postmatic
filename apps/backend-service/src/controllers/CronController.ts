import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { isValidCron } from "cron-validator";
import { AutoSchedulerTaskManager } from "../cron/AutoSchedulerTaskManager";
import { ManualSchedulerTaskManager } from "../cron/ManualSchedulerTaskManager";

export class CronController extends BaseController {
  constructor() {
    super();
  }

  getAllCronTasks = async (req: Request, res: Response) => {
    try {
      const auto = await AutoSchedulerTaskManager.instance.list();
      const manual = await ManualSchedulerTaskManager.instance.list();
      const tasks = {
        auto,
        manual,
      };
      return this.sendSuccess(res, tasks);
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  createCronTask = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.body;
      if (!rootBusinessId || typeof rootBusinessId !== "string") {
        return this.sendError(res, new Error("ID bisnis tidak valid"), 400);
      }

      await AutoSchedulerTaskManager.instance.add(rootBusinessId);

      return this.sendSuccess(res, { message: "Cron task berhasil dibuat" });
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  deleteCronTask = async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      await AutoSchedulerTaskManager.instance.remove(taskId);
      return this.sendSuccess(res, { message: "Task berhasil dihapus" });
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
