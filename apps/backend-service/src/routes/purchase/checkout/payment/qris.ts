import express from "express";
import { purchaseController } from "../../../../controllers";
import { useValidate } from "../../../../middleware/use-validate";
import { EWalletCheckoutSchema } from "../../../../validators/CheckoutValidator";
import { useOwnedBusiness } from "../../../../middleware/use-owned-business";

const qrisRoute = express.Router();

qrisRoute.post(
  "/:rootBusinessId",
  useValidate({ body: EWalletCheckoutSchema }),
  useOwnedBusiness,
  purchaseController.eWalletCheckout
);

export default qrisRoute;
