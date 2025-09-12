import express from "express";
import templatePublishedRoute from "./template-published";
import templateCategoryRoute from "./template-category";
import templateSavedRoute from "./template-saved";

const templateLibraryRoute = express.Router();

templateLibraryRoute.use("/category", templateCategoryRoute);
templateLibraryRoute.use("/published", templatePublishedRoute);
templateLibraryRoute.use("/saved", templateSavedRoute);

export default templateLibraryRoute;