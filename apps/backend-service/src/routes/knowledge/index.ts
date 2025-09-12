import express from "express";
import businessKnowledgeRoute from "./business";
import roleKnowledgeRoute from "./role";
import productKnowledgeRoute from "./product";
import rssKnowledgeRoute from "./rss";
import platformKnowledgeRoute from "./platform";

const knowledgeRoute = express.Router();

knowledgeRoute.use("/business", businessKnowledgeRoute);
knowledgeRoute.use("/role", roleKnowledgeRoute);
knowledgeRoute.use("/product", productKnowledgeRoute);
knowledgeRoute.use("/rss", rssKnowledgeRoute);
knowledgeRoute.use("/platform", platformKnowledgeRoute);

export default knowledgeRoute;
