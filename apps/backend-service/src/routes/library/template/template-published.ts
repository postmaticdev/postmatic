import express from "express";
import { useFilter } from "../../../middleware/use-filter";
import { useOwnedBusiness } from "../../../middleware/use-owned-business";
import { templateController } from "../../../controllers";

const templatePublishedRoute = express.Router();

templatePublishedRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  useFilter(["name"]),
  templateController.getPublishedTemplates
);

export default templatePublishedRoute;
