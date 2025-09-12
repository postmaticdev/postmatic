import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { TimeService } from "../services/TimeService";

export class TimeController extends BaseController {
  constructor(private time: TimeService) {
    super();
  }

  getAllTimes = async (req: Request, res: Response) => {
    try {
      const times = this.time.getAllTimezonesWithOffset();
      return this.sendSuccess(res, times);
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
