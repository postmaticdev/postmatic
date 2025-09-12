import express from "express";
import { timeController } from "../../controllers";

const timeRoute = express.Router();

timeRoute.get("/", timeController.getAllTimes);
export default timeRoute;
