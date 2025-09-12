import express from "express";
import { masterRssController } from "../../../controllers";
import { useFilter } from "../../../middleware/use-filter";

const rssDataRoute = express.Router();

rssDataRoute.get("/", useFilter(["title"]), masterRssController.getAllRsses);

export default rssDataRoute;
