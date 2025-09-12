import express from "express";
import { roleController } from "../../controllers";

const roleRoute = express.Router();

roleRoute.get("/", roleController.getRoles);

export default roleRoute;
