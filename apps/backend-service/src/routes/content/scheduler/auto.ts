import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { AutoSchedulerSchema } from "../../../validators/SchedulerValidator";
import { schedulerController } from "../../../controllers";

const autoSchedulerRoute = express.Router();

autoSchedulerRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  schedulerController.getAutoPostingSchedule
);

autoSchedulerRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: AutoSchedulerSchema }),
  schedulerController.upsertAutoPostingSchedule
);

export default autoSchedulerRoute;
