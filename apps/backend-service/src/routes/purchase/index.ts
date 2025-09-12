import express from "express";
import userPurchaseRoute from "./user";
import businessPurchaseRoute from "./business";
import checkoutPurchaseRoute from "./checkout";
import webhookRoute from "./webhook";
import { useAuth } from "../../middleware/use-auth";

const purchaseRoute = express.Router();

purchaseRoute.use("/user", useAuth, userPurchaseRoute);
purchaseRoute.use("/business", useAuth, businessPurchaseRoute);
purchaseRoute.use("/checkout", useAuth, checkoutPurchaseRoute);
purchaseRoute.use("/webhook", webhookRoute);

export default purchaseRoute;
