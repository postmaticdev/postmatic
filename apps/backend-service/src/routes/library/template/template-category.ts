import express from "express";
import { templateController } from "../../../controllers";

const templateCategoryRoute = express.Router();

templateCategoryRoute.get("/", templateController.getTemplateCategories);

export default templateCategoryRoute;
