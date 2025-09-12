import express from "express";
import rssArticleRoute from "./rss-article";
import rssDataRoute from "./rss-data";
import rssCategoryRoute from "./rss-category";

const rssLibraryRoute = express.Router();

rssLibraryRoute.use("/article", rssArticleRoute);
rssLibraryRoute.use("/data", rssDataRoute);
rssLibraryRoute.use("/category",  rssCategoryRoute);

export default rssLibraryRoute;
