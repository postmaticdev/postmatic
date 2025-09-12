import express from "express";
import imageRoute from "./image";
import cronRoute from "./cron";

const helperRoute = express.Router();

helperRoute.use("/image", imageRoute);
helperRoute.use("/cron", cronRoute);

export default helperRoute;
