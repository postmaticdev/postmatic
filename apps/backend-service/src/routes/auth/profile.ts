import express from "express";
import { useValidate } from "../../middleware/use-validate";
import {
  PasswordSchema,
  ProfileSchema,
} from "../../validators/ProfileValidator";
import { RefreshTokenSchema } from "../../validators/ProfileValidator";
import { authController } from "../../controllers";

const profileRoute = express.Router();

profileRoute.get("/", authController.getProfile);
profileRoute.get("/session", authController.getSession);
profileRoute.put(
  "/",
  useValidate({ body: ProfileSchema }),
  authController.editProfile
);
profileRoute.patch(
  "/",
  useValidate({ body: PasswordSchema }),
  authController.editPassword
);
profileRoute.delete("/:userId", authController.disconnectUser);

profileRoute.post(
  "/session/logout",
  useValidate({ body: RefreshTokenSchema }),
  authController.logout
);
profileRoute.post("/session/logout-all", authController.logoutAll);

export default profileRoute;
