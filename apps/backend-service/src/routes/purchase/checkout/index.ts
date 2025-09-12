import express from "express";
import paymentRoute from "./payment";

const checkoutPurchaseRoute = express.Router();

checkoutPurchaseRoute.use("/payment", paymentRoute);

export default checkoutPurchaseRoute;
