import express from "express";
import { cronController } from "../../controllers";

const cronRoute = express.Router();

cronRoute.get("/", cronController.getAllCronTasks);
cronRoute.post("/", cronController.createCronTask);
cronRoute.delete("/:taskId", cronController.deleteCronTask);

export default cronRoute;
