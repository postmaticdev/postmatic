import express from "express";
import { purchaseController } from "../../controllers";

const webhookRoute = express.Router();

webhookRoute.use("/midtrans", purchaseController.midtransWebhook);

export default webhookRoute;
