import express from "express";
import imageContentRoute from "./image";
import schedulerRoute from "./scheduler";
import imageContentOverviewRoute from "./overview";

const contentRoute = express.Router();

contentRoute.use("/image", imageContentRoute);
contentRoute.use("/scheduler", schedulerRoute);
contentRoute.use("/overview", imageContentOverviewRoute);

export default contentRoute;
