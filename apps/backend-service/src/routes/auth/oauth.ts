import express from "express";
import { useAuth } from "../../middleware/use-auth";
import { useOwnedBusiness } from "../../middleware/use-owned-business";
import {
  authController,
  facebookPageController,
  linkedInController,
  instagramBusinessController,
} from "../../controllers";

const oauthRoute = express.Router();

oauthRoute.get("/google", authController.googleAuth);
oauthRoute.get(
  "/linked_in/:rootBusinessId",
  useAuth,
  useOwnedBusiness,
  linkedInController.oauth
);

oauthRoute.get("/facebook_page/:rootBusinessId", facebookPageController.oauth);

oauthRoute.get(
  "/instagram_business/:rootBusinessId",
  instagramBusinessController.oauth
);

export default oauthRoute;
