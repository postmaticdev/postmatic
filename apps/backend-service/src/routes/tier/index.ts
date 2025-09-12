import express from "express";
import tokenRoute from "./token";
import subscriptionRoute from "./subscription";

const tierRoute = express.Router();

tierRoute.use("/token", tokenRoute);
tierRoute.use("/subscription", subscriptionRoute);

export default tierRoute;
