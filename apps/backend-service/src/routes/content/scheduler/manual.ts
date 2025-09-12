import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import {
  ManualParamsSchema,
  ManualSchedulerSchema,
} from "../../../validators/SchedulerValidator";
import { schedulerController } from "../../../controllers";

const manualSchedulerRoute = express.Router();

manualSchedulerRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  schedulerController.getAllQueuePosts
);

manualSchedulerRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: ManualSchedulerSchema }),
  schedulerController.addToQueue
);

manualSchedulerRoute.delete(
  "/:rootBusinessId/:schedulerManualPostingId",
  useOwnedBusiness,
  useValidate({ params: ManualParamsSchema }),
  schedulerController.deleteFromQueue
);

export default manualSchedulerRoute;
