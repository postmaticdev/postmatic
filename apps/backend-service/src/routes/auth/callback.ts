import express from "express";
import { useValidate } from "../../middleware/use-validate";
import {
  authController,
  facebookPageController,
  instagramBusinessController,
  linkedInController,
} from "../../controllers";
import { RefreshTokenSchema } from "../../validators/ProfileValidator";

const callbackRoute = express.Router();

callbackRoute.get("/google", authController.googleCallback);
callbackRoute.get("/linked_in", linkedInController.callback);
callbackRoute.post("/linked_in", linkedInController.fallbackBusinessExists);
callbackRoute.get("/facebook_page", facebookPageController.callback);
callbackRoute.post("/facebook_page", facebookPageController.fallbackBusinessExists);
callbackRoute.get("/instagram_business", instagramBusinessController.callback);
callbackRoute.post("/instagram_business", instagramBusinessController.fallbackBusinessExists);

callbackRoute.post(
  "/refresh",
  useValidate({ body: RefreshTokenSchema }),
  authController.regenerateAccessTokens
);
callbackRoute.post(
  "/logout",
  useValidate({ body: RefreshTokenSchema }),
  authController.logout
);

export default callbackRoute;
