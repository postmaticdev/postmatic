import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import passport from "passport";
import {
  APP_NAME,
  BACKEND_URL,
  DASHBOARD_URL,
  IS_PRODUCTION,
} from "../constant/index";
import { AuthService } from "../services/AuthService";
import { AppUser } from "../utils/auth";

import {
  PasswordDTO,
  ProfileDTO,
  RefreshTokenDTO,
  ResetPassword1DTO,
  ResetPassword2DTO,
  SignInDTO,
  SignUpDTO,
} from "../validators/ProfileValidator";

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  signInPage = async (req: Request, res: Response) => {
    try {
      return this.renderView(req, res, "sign-in", {
        email: "",
        errors: {},
      });
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  signUp = async (req: Request, res: Response) => {
    try {
      const data = req.body as SignUpDTO;

      if (req.turnstile?.ok === false) {
        return this.renderView(req, res, "sign-up", {
          email: data.email,
          givenName: data.givenName,
          familyName: data.familyName,
          errors: { captcha: req.turnstile?.message || "Captcha tidak valid" },
        });
      }

      const isErrors = this.authService.validateSignUp(data);

      if (isErrors) {
        return this.renderView(req, res, "sign-up", {
          email: data.email,
          givenName: data.givenName,
          familyName: data.familyName,
          errors: isErrors,
        });
      }

      const user = await this.authService.isUserProviderExist(data.email);
      if (user) {
        return this.renderView(req, res, "sign-up", {
          email: data.email,
          givenName: data.givenName,
          familyName: data.familyName,
          errors: { email: "Email sudah digunakan" },
        });
      }

      await this.authService.createUser(data);

      return this.renderView(req, res, "verification", {
        success: true,
        title: `${APP_NAME} - Verifikasi`,
        email: data.email,
        message: `Email verifikasi telah dikirim ke ${data.email}. Silakan cek inbox Anda dan ikuti instruksi untuk memverifikasi akun Anda.`,
        cta: "Kembali ke halaman login",
        redirect: `${BACKEND_URL}/api/auth/page/login`,
      });
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  signIn = async (req: Request, res: Response) => {
    try {
      const data = req.body as SignInDTO;
      if (req.turnstile?.ok === false) {
        console.log("captcha tidak valid");
        console.log({ turnstile: req.turnstile });
        return this.renderView(
          req,
          res,
          "sign-in",
          {
            email: data.email,
            errors: {
              captcha: req.turnstile?.message || "Captcha tidak valid",
            },
          },
          400
        );
      }
      const ip = req.ip || "";
      const user = await this.authService.signIn(data, ip);
      const { redirect = "", type } = req.query;
      if (user.success === false) {
        console.log("user tidak valid");
        console.log({ user });
        return this.renderView(req, res, "sign-in", {
          email: data.email,
          errors: user.errors,
        }, 400);
      }

      const mappedUser: AppUser = {
        id: user.profile.id,
        email: user.email,
        name: user.profile.name,
        photo: user.profile.image,
      };
      const token = await this.authService.generateAccessToken(mappedUser);
      const browser = req?.useragent?.browser;
      const platform = req?.useragent?.platform;
      const refreshToken = await this.authService.generateRefreshToken(
        mappedUser
      );
      await this.authService.saveSession(
        refreshToken,
        mappedUser.id,
        browser || null,
        platform || null
      );

      res.cookie("__Host-pm_rt", refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "none", // penting: beda origin (dashboard -> api)
        path: "/", // wajib untuk prefix __Host-
        maxAge: 30 * 24 * 60 * 60 * 1000, // contoh: 30 hari
      });

      if (type === "json") {
        return this.sendSuccess(res, { ...mappedUser, token, refreshToken });
      }

      console.log("redirect to client");
      console.log({ redirect: `/${redirect}?token=${token}` });
      return this.redirectToClient(res, `/${redirect}?token=${token}`);
    } catch (error) {
      console.log("error signIn SERVER ERROR");
      console.log({ error });
      this.renderViewError(req, res);
    }
  };

  signUpPage = async (req: Request, res: Response) => {
    try {
      return this.renderView(req, res, "sign-up", {
        email: "",
        errors: {},
      });
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  googleAuth = async (req: Request, res: Response) => {
    try {
      passport.authenticate("google", { scope: ["profile", "email"] })(
        req,
        res
      );
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  googleCallback = async (req: Request, res: Response) => {
    try {
      passport.authenticate(
        "google",
        { failureRedirect: "/" },
        async (err, user: AppUser, info) => {
          if (err || !user) {
            return this.redirectToServer(res, "/api/auth");
          }

          const token = await this.authService.generateAccessToken(user);
          const refreshToken = await this.authService.generateRefreshToken(
            user
          );

          req.logIn(user, (err) => {
            if (err) {
              console.log(err);
              return this.redirectToServer(res, "/api/auth/page/login");
            }
            res.cookie("__Host-pm_rt", refreshToken, {
              httpOnly: true,
              secure: IS_PRODUCTION,
              sameSite: "none", // penting: beda origin (dashboard -> api)
              path: "/", // wajib untuk prefix __Host-
              maxAge: 30 * 24 * 60 * 60 * 1000, // contoh: 30 hari
            });
            return this.redirectToClient(res, `?token=${token}`);
          });
        }
      )(req, res);
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  getSession = async (req: Request, res: Response) => {
    return this.sendSuccess(
      res,
      req.user,
      "User session retrieved successfully"
    );
  };

  getProfile = async (req: Request, res: Response) => {
    const profileId = req.user?.id;
    const profileFromDb = await this.authService.getProfileByProfileId(
      profileId!
    );
    if (!profileFromDb) {
      return this.notFound(res);
    }
    return this.sendSuccess(res, profileFromDb);
  };

  editProfile = async (req: Request, res: Response) => {
    const profileId = req.user?.id;
    const data = req.body as ProfileDTO;
    const profileFromDb = await this.authService.editProfile(profileId!, data);
    return this.sendSuccess(
      res,
      profileFromDb,
      "User profile berhasil diupdate"
    );
  };

  editPassword = async (req: Request, res: Response) => {
    try {
      const profileId = req.user?.id;
      const data = req.body as PasswordDTO;
      await this.authService.changePassword(profileId!, data);
      return this.sendSuccess(res, undefined, "Password berhasil diupdate");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  disconnectUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const profileFromDb = await this.authService.disconnectUser(userId);
      if (typeof profileFromDb === "string") {
        return this.sendError(res, new Error(profileFromDb), 400);
      }
      return this.sendSuccess(
        res,
        profileFromDb,
        "User profile berhasil diupdate"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { verifyAccountToken } = req.params;
      if (!verifyAccountToken) {
        return this.renderView(req, res, "verification", {
          success: true,
          title: `${APP_NAME} - Verifikasi`,
          email: "Error",
          message: `Token verifikasi tidak valid. Silakan coba lagi.`,
          cta: "Kembali ke halaman login",
          redirect: `${BACKEND_URL}/api/auth/page/login`,
        });
      }
      const verify = await this.authService.verifyEmail(verifyAccountToken);
      if (!verify) {
        return this.renderView(req, res, "verification", {
          success: false,
          title: `${APP_NAME} - Verifikasi`,
          email: "Error",
          message: `Token verifikasi tidak valid. Silakan coba lagi.`,
        });
      }
      return this.renderView(req, res, "verification", {
        success: verify.success,
        title: `${APP_NAME} - Verifikasi`,
        email: verify.email,
        message: verify.message,
        cta: "Kembali ke halaman login",
        redirect: `${BACKEND_URL}/api/auth/page/login`,
      });
    } catch (error) {
      this.renderViewError(req, res);
    }
  };

  getResetPasswordPage = async (req: Request, res: Response) => {
    try {
      return this.renderView(req, res, "reset-password");
    } catch (error) {
      return this.renderViewError(req, res);
    }
  };

  createResetPasswordToken = async (req: Request, res: Response) => {
    try {
      const data = req.body as ResetPassword1DTO;
      if (req.turnstile?.ok === false) {
        return this.renderView(req, res, "reset-password", {
          error: req.turnstile?.message || "Captcha tidak valid",
          email: data.email,
          canBeRequestedAgainAt: null,
          afterSubmit: false,
        });
      }
      const decoded = await this.authService.createResetPasswordToken(data);
      if (decoded.success === false) {
        return this.renderView(req, res, "reset-password", {
          error: decoded.message,
          email: decoded.email,
          canBeRequestedAgainAt: decoded.canBeRequestedAgainAt,
          afterSubmit: false,
        });
      }

      return this.renderView(req, res, "reset-password", {
        success:
          "Berhasil mengirimkan link reset password. Silakan cek email Anda",
        canBeRequestedAgainAt: decoded.canBeRequestedAgainAt,
        email: decoded.email,
        afterSubmit: true,
      });
    } catch (error) {
      this.renderView(req, res, "reset-password", {
        error: "Terjadi kesalahan, silakan coba lagi",
        email: "",
        canBeRequestedAgainAt: null,
        afterSubmit: false,
      });
    }
  };

  verifyResetPasswordToken = async (req: Request, res: Response) => {
    try {
      const { resetPasswordToken } = req.params;
      const decoded = await this.authService.verifyResetPasswordToken(
        resetPasswordToken
      );
      if (decoded.success === false) {
        return this.renderView(req, res, "confirm-reset-password", {
          errors: decoded.message,
          validToken: false,
          email: decoded.email,
          name: decoded.name,
          resetPasswordToken,
        });
      }
      return this.renderView(req, res, "confirm-reset-password", {
        errors: undefined,
        validToken: true,
        email: decoded.email,
        name: decoded.name,
        resetPasswordToken,
      });
    } catch (error) {
      return this.renderView(req, res, "confirm-reset-password", {
        errors: "Terjadi kesalahan, silahkan coba lagi",
        validToken: false,
        email: "",
        name: "",
        resetPasswordToken: "",
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { resetPasswordToken } = req.params;
      const data = req.body as ResetPassword2DTO;

      const decoded = await this.authService.decodingResetPasswordToken(
        resetPasswordToken
      );
      if (req.turnstile?.ok === false) {
        return this.renderView(req, res, "confirm-reset-password", {
          error: req.turnstile?.message || "Captcha tidak valid",
          validToken: decoded.email !== "",
          resetPasswordToken,
          email: decoded?.email || "",
          name: decoded?.name || "",
        });
      }
      const reset = await this.authService.resetPassword(
        data,
        resetPasswordToken
      );
      if (typeof reset === "string") {
        return this.renderView(req, res, "confirm-reset-password", {
          error: reset,
          validToken: decoded.email !== "",
          resetPasswordToken,
          email: decoded?.email || "",
          name: decoded?.name || "",
        });
      }
      return this.redirectToServer(res, "/api/auth/page/login");
    } catch (error) {
      return this.renderViewError(req, res);
    }
  };

  regenerateAccessTokens = async (req: Request, res: Response) => {
    try {
      const data = req.body as RefreshTokenDTO;
      const rt = String(req.cookies["__Host-pm_rt"]);
      const tokens = await this.authService.regenerateAccessTokens(
        data.refreshToken || rt
      );
      res.cookie("__Host-pm_rt", tokens?.refreshToken || "", {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "none", // penting: beda origin (dashboard -> api)
        path: "/", // wajib untuk prefix __Host-
        maxAge: 30 * 24 * 60 * 60 * 1000, // contoh: 30 hari
      });

      if (!tokens)
        return this.sendError(res, new Error("Token refresh tidak valid"), 400);
      return this.sendSuccess(res, tokens, "Tokens berhasil diupdate");
    } catch (error) {
      this.sendError(res, error);
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      req.logOut({ keepSessionInfo: false }, () => {});
      const data = req.body as RefreshTokenDTO;
      const logout = await this.authService.logout(data.refreshToken);
      res.clearCookie("__Host-pm_rt", {
        path: "/",
        secure: IS_PRODUCTION,
        sameSite: "none",
      });
      return this.sendSuccess(
        res,
        logout,
        "Berhasil melakukan logout di perangkat ini"
      );
    } catch (error) {
      this.sendError(res, error);
    }
  };

  logoutAll = async (req: Request, res: Response) => {
    try {
      const profileId = req.user?.id;
      const logout = await this.authService.logoutAll(profileId!);
      return this.sendSuccess(
        res,
        logout,
        "Berhasil melakukan logout di semua perangkat"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}
