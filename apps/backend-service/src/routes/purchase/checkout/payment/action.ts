import express from "express";
import { purchaseController } from "../../../../controllers";
import { useOwnedBusiness } from "../../../../middleware/use-owned-business";

const actionRoute = express.Router();

actionRoute.post(
  "/cancel/:paymentPurchaseId",
  useOwnedBusiness,
  purchaseController.cancelPurchase
);

export default actionRoute;
