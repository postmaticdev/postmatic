import express from "express";
import autoSchedulerRoute from "./auto";
import manualSchedulerRoute from "./manual";
import timezoneRoute from "./timezone";
const schedulerRoute = express.Router();

schedulerRoute.use("/auto", autoSchedulerRoute);
schedulerRoute.use("/manual", manualSchedulerRoute);
schedulerRoute.use("/timezone", timezoneRoute);

export default schedulerRoute;
