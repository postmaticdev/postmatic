import express from "express";
import { tierController } from "../../controllers";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { useFilter } from "../../middleware/use-filter";

const tierRoute = express.Router();

tierRoute.get(
  "/usage/:rootBusinessId",
  useOwnedBusiness,
  tierController.getBusinessAvailableToken
);

tierRoute.get(
  "/type/:rootBusinessId",
  useOwnedBusiness,
  tierController.getAnalyticEachTypeToken
);

tierRoute.get(
  "/analytics/:rootBusinessId",
  useOwnedBusiness,
  useFilter([]),
  tierController.getAnalyticsTokenUsage
);

export default tierRoute;
