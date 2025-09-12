import express from "express";
import { imageContentOverviewController } from "../../../controllers";
import { useFilter } from "../../../middleware/use-filter";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";

const imageContentOverviewRoute = express.Router();

imageContentOverviewRoute.get(
  "/posted-count/:rootBusinessId",
  useOwnedBusiness,
  useFilter([]),
  imageContentOverviewController.getCountPosted
);

imageContentOverviewRoute.get(
  "/upcoming-count/:rootBusinessId",
  useOwnedBusiness,
  useFilter([]),
  imageContentOverviewController.getCountUpcoming
);

imageContentOverviewRoute.get(
  "/upcoming-posts/:rootBusinessId",
  useOwnedBusiness,
  useFilter([]),
  imageContentOverviewController.getUpcomingPost
);

export default imageContentOverviewRoute;
