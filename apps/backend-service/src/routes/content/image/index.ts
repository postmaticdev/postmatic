import express from "express";
import imageDraftRoute from "./draft";
import imagePostedRoute from "./posted";
import imageJobRoute from "./job";

const imageContentRoute = express.Router();

imageContentRoute.use("/draft", imageDraftRoute);
imageContentRoute.use("/posted", imagePostedRoute);
imageContentRoute.use("/job", imageJobRoute);

export default imageContentRoute;
