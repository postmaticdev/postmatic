import express from "express";
import { appProductController } from "../../controllers";
import { useValidate } from "../../middleware/use-validate";
import { DiscountSchema } from "../../validators/DiscountValidator";
import { useOwnedBusiness } from "../../middleware/use-owned-business";

const productRoute = express.Router();

productRoute.get(
  "/subscription/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ query: DiscountSchema }),
  appProductController.getAllSubscriptionAppProducts
);

productRoute.get(
  "/token/:rootBusinessId",
  useOwnedBusiness,
  useValidate({ query: DiscountSchema }),
  appProductController.getAllTokenAppProducts
);

export default productRoute;
