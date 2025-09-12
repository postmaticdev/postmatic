import express from "express";
import { masterRssController } from "../../../controllers";

const rssArticleRoute = express.Router();

rssArticleRoute.get(
  "/:rootBusinessId",
  masterRssController.getAllArticlesByBusiness
);

export default rssArticleRoute;
