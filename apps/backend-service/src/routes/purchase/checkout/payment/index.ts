import express from "express";
import eWalletRoute from "./e-wallet";
import bankRoute from "./bank";
import actionRoute from "./action";

const paymentRoute = express.Router();

paymentRoute.use("/e-wallet", eWalletRoute);
paymentRoute.use("/bank", bankRoute);
paymentRoute.use("/action", actionRoute);

export default paymentRoute;
