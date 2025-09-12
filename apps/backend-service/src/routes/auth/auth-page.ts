import express from "express";
import { authController } from "../../controllers";
import { useTurnstile } from "../../middleware/use-turnstile";

const authPageRoute = express.Router();
authPageRoute.use(useTurnstile.expose);

authPageRoute.get("/login", authController.signInPage);
authPageRoute.post("/login", useTurnstile.softVerify, authController.signIn);

authPageRoute.get("/register", authController.signUpPage);
authPageRoute.post("/register", useTurnstile.softVerify, authController.signUp);

authPageRoute.get("/verify/:verifyAccountToken", authController.verifyEmail);

authPageRoute.get("/reset-password", authController.getResetPasswordPage);
authPageRoute.post(
  "/reset-password",
  useTurnstile.softVerify,
  authController.createResetPasswordToken
);
authPageRoute.get(
  "/reset-password/:resetPasswordToken",
  authController.verifyResetPasswordToken
);
authPageRoute.post(
  "/reset-password/:resetPasswordToken",
  useTurnstile.softVerify,
  authController.resetPassword
);

export default authPageRoute;
