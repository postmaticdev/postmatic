import express from "express";
import timeRoute from "./time";
import rssLibraryRoute from "./rss";
import templateLibraryRoute from "./template";

const libraryRoute = express.Router();

libraryRoute.use("/rss", rssLibraryRoute);
libraryRoute.use("/template", templateLibraryRoute);
libraryRoute.use("/time", timeRoute);

export default libraryRoute;
