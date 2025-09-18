import express from "express";
import userPurchaseRoute from "./user";
import businessPurchaseRoute from "./business";
import checkoutPurchaseRoute from "./checkout";
import webhookRoute from "./webhook";
import { useAuth } from "../../middleware/use-auth";
import { useRateLimiter } from "../../middleware/use-rate-limiter";

const purchaseRoute = express.Router();

purchaseRoute.use("/user", useAuth, useRateLimiter.auth, userPurchaseRoute);
purchaseRoute.use(
  "/business",
  useAuth,
  useRateLimiter.auth,
  businessPurchaseRoute
);
purchaseRoute.use(
  "/checkout",
  useAuth,
  useRateLimiter.auth,
  checkoutPurchaseRoute
);
purchaseRoute.use("/webhook", webhookRoute);

export default purchaseRoute;
