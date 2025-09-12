import express from "express";
import { purchaseController } from "../../controllers";
import { useFilter } from "../../middleware/use-filter";

const businessPurchaseRoute = express.Router();

businessPurchaseRoute.get(
  "/:rootBusinessId",
  useFilter(["productName"]),
  purchaseController.getAllBusinessPurchases
);

businessPurchaseRoute.get(
  "/:rootBusinessId/:paymentPurchaseId",
  purchaseController.getBusinessPurchase
);

export default businessPurchaseRoute;
