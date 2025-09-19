import express from "express";
import { businessController } from "../../controllers";
import { useValidate } from "../../middleware/use-validate";
import { RootBusinessSchema } from "../../validators/RootBusinessValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import { useFilter } from "../../middleware/use-filter";

const businessRoute = express.Router();

businessRoute.get(
  "/",
  useFilter(["name"]),
  businessController.getOwnBusinesses
);

businessRoute.get(
  "/:rootBusinessId",
  useOwnedBusiness,
  businessController.getDetailBusiness
);

businessRoute.post(
  "/",
  useValidate({ body: RootBusinessSchema }),
  businessController.createBusiness
);

businessRoute.put(
  "/:rootBusinessId",
  useValidate({ body: RootBusinessSchema }),
  businessController.editBusiness
);

businessRoute.delete(
  "/:rootBusinessId",
  useOwnedBusiness,
  businessController.deleteBusiness
);

businessRoute.delete(
  "/:rootBusinessId/out",
  useOwnedBusiness,
  businessController.outBusiness
);

export default businessRoute;
