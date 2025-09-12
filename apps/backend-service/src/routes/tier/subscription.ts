import express from "express";
import { tierController } from "../../controllers";
import { useOwnedBusiness } from "../../middleware/use-owned-business";

const tierRoute = express.Router();

tierRoute.get(
  "/status/:rootBusinessId",
  useOwnedBusiness,
  tierController.getBusinessSubscription
);

export default tierRoute;
