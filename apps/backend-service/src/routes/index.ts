import express from "express";
import { useAuth } from "../middleware/use-auth";
import knowledgeRoute from "./knowledge";
import authRoute from "./auth/index";
import businessRoute from "./business";
import helperRoute from "./helper";
import libraryRoute from "./library";
import contentRoute from "./content";
import memberRoute from "./member";
import productRoute from "./product";
import purchaseRoute from "./purchase";
import tierRoute from "./tier";
import roleRoute from "./role";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/knowledge", useAuth, knowledgeRoute);
router.use("/business", useAuth, businessRoute);
router.use("/helper", useAuth, helperRoute);
router.use("/library", useAuth, libraryRoute);
router.use("/content", useAuth, contentRoute);
router.use("/member", memberRoute);
router.use("/product", useAuth, productRoute);
router.use("/purchase", purchaseRoute);
router.use("/tier", useAuth, tierRoute);
router.use("/role", useAuth, roleRoute);

export default router;
