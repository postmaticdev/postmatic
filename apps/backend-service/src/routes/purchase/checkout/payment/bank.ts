import express from "express";
import { useValidate } from "../../../../middleware/use-validate";
import { AwaitedBankCheckoutSchema } from "../../../../validators/CheckoutValidator";
import { useOwnedBusiness } from "../../../../middleware/use-owned-business";
import { purchaseController } from "../../../../controllers";

const bankRoute = express.Router();

bankRoute.post(
  "/:rootBusinessId",
  useValidate({ awaitedBody: AwaitedBankCheckoutSchema }),
  useOwnedBusiness,
  purchaseController.bankCheckout
);

export default bankRoute;
