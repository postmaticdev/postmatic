import express from "express";
import { useValidate } from "../../../middleware/use-validate";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { TimeZoneSchema } from "../../../validators/SchedulerValidator";
import { schedulerController } from "../../../controllers";

const timezoneRoute = express.Router();

timezoneRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  schedulerController.getTimezone
);

timezoneRoute.post(
  "/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ body: TimeZoneSchema }),
  schedulerController.upsertTimezone
);

export default timezoneRoute;
