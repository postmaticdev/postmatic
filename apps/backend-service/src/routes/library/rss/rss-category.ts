import express from "express";
import { masterRssController } from "../../../controllers";

const rssCategoryRoute = express.Router();

rssCategoryRoute.get("/", masterRssController.getAllCategories);

export default rssCategoryRoute;
