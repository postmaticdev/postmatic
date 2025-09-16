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
import { useRateLimiter } from "../middleware/use-rate-limiter";

const router = express.Router();

router.use("/auth", useRateLimiter.loginIp, authRoute);
router.use("/knowledge", useAuth, useRateLimiter.auth, knowledgeRoute);
router.use("/business", useAuth, useRateLimiter.auth, businessRoute);
router.use("/helper", useAuth, useRateLimiter.uploads, helperRoute);
router.use("/library", useAuth, useRateLimiter.auth, libraryRoute);
router.use("/content", useAuth, useRateLimiter.heavy, contentRoute);
router.use("/member", useAuth, useRateLimiter.auth, memberRoute);
router.use("/product", useAuth, useRateLimiter.auth, productRoute);
router.use("/purchase", useAuth, useRateLimiter.auth, purchaseRoute);
router.use("/tier", useAuth, useRateLimiter.auth, tierRoute);
router.use("/role", useAuth, useRateLimiter.auth, roleRoute);

export default router;
