import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { InstagramBusinessService } from "../services/InstagramBusinessService";
import { PostDTO } from "../validators/PostValidator";
import { DASHBOARD_URL } from "../constant";
import { POSTMATIC_ACCESS_TOKEN_KEY } from "../constant/key";

export class InstagramBusinessController extends BaseController {
  constructor(private instagram: InstagramBusinessService) {
    super();
  }

  // GET /api/auth/oauth/instagram_business/:rootBusinessId
  oauth = async (req: Request, res: Response) => {
    try {
      const {
        from = "/",
        [POSTMATIC_ACCESS_TOKEN_KEY]: postmaticAccessToken = "",
      } = req.query;
      const { rootBusinessId } = req.params as any;

      const oauth = await this.instagram.oauth(
        String(from),
        String(rootBusinessId || ""),
        String(postmaticAccessToken || "")
      );

      if (!oauth) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            "Terjadi kesalahan saat melakukan login Instagram Business",
          code: 500,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL + String(from),
        });
      }

      req.session.oauth_state = oauth?.state || "";
      return this.redirect(res, oauth?.authUrl || "");
    } catch (err) {
      return this.renderViewError(req, res, {
        title: "Terjadi Kesalahan",
        description:
          "Terjadi kesalahan saat melakukan login Instagram Business",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  // GET /api/auth/callback/instagram_business
  callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query;
      const sessionState = req.session.oauth_state;

      const result = await this.instagram.callback(
        String(code || ""),
        String(state || ""),
        String(sessionState || "")
      );

      if (!result) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            "Terjadi kesalahan saat melakukan login Instagram Business",
          code: 500,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL,
        });
      }

      const {
        from,
        rootBusinessId,
        igUserId,
        username,
        postmaticAccessToken,
        success,
      } = result;

      if (success !== true) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            result?.message ||
            "Terjadi kesalahan saat melakukan login Instagram Business",
          code: 400,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL + String(from),
        });
      }

      if (
        result.isLinked &&
        result.oldBusinessName &&
        result.newBusinessName &&
        result.code
      ) {
        return this.renderView(req, res, "social-confirmation", {
          code: result.code,
          from,
          rootBusinessId,
          postmaticAccessToken,
          platform: "instagram_business",
          title: "Konfirmasi Penghubungan Akun",
          message: `Akun Instagram Business anda terhubung ke bisnis "${result.oldBusinessName}"`,
          oldBusinessName: result.oldBusinessName,
          newBusinessName: result.newBusinessName,
        });
      }

      // kamu bisa hilangkan pageAccessToken di query jika tak ingin expose ke client
      return this.redirectToClient(
        res,
        `${from}?rootBusinessId=${encodeURIComponent(
          rootBusinessId || ""
        )}&igUserId=${encodeURIComponent(
          igUserId || ""
        )}&username=${encodeURIComponent(
          username || ""
        )}&${POSTMATIC_ACCESS_TOKEN_KEY}=${encodeURIComponent(
          String(postmaticAccessToken || "")
        )}`
      );
    } catch (err) {
      return this.renderViewError(req, res, {
        title: "Terjadi Kesalahan",
        description:
          "Terjadi kesalahan saat melakukan login Instagram Business",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  fallbackBusinessExists = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const fallbackCallback = await this.instagram.fallbackBusinessExists(
        data
      );

      if (fallbackCallback?.success !== true) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            fallbackCallback?.message ||
            "Terjadi kesalahan saat melakukan login Instagram Business",
          code: 400,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL,
        });
        return;
      }

      return this.redirectToClient(
        res,
        `${fallbackCallback?.from}?rootBusinessId=${fallbackCallback?.rootBusinessId}&${POSTMATIC_ACCESS_TOKEN_KEY}=${fallbackCallback?.postmaticAccessToken}`
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  // POST /api/instagram_business/:rootBusinessId/post
  post = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params as any;
      const data = req.body as PostDTO; // expected: generatedImageContentId, (opsional) caption override
      const result = await this.instagram.post(rootBusinessId, data);
      if (!result) {
        return this.sendError(
          res,
          new Error("Terjadi kesalahan saat memposting Instagram Business"),
          400
        );
      }
      if (typeof result === "string") {
        return this.sendError(res, new Error(result), 400);
      }
      return this.sendSuccess(res, result, "Post created successfully");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
