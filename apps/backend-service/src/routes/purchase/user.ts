import express from "express";
import { purchaseController } from "../../controllers";
import { useFilter } from "../../middleware/use-filter";

const userPurchaseRoute = express.Router();

userPurchaseRoute.get(
  "/",
  useFilter(["productName"]),
  purchaseController.getAllUserPurchases
);

userPurchaseRoute.get(
  "/:paymentPurchaseId",
  purchaseController.getUserPurchase
);

export default userPurchaseRoute;
