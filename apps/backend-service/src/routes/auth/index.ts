import express from "express";
import oauthRoute from "./oauth";
import authPageRoute from "./auth-page";
import profileRoute from "./profile";
import callbackRoute from "./callback";
import { useAuth } from "../../middleware/use-auth";
import { useCsrf } from "../../middleware/use-csrf";

const authRoute = express.Router();

authRoute.use("/oauth", oauthRoute);
authRoute.use("/callback", callbackRoute);
authRoute.use("/page", useCsrf.protection, useCsrf.exposeToken, authPageRoute);
authRoute.use("/profile", useAuth, profileRoute);

export default authRoute;
