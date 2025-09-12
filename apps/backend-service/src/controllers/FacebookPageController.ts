import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { FacebookPageService } from "../services/FacebookPageService";
import { PostDTO } from "../validators/PostValidator";
import { DASHBOARD_URL } from "../constant";

export class FacebookPageController extends BaseController {
  constructor(private facebook: FacebookPageService) {
    super();
  }

  // /api/auth/oauth/facebook_page (versi Page-only)
  oauth = async (req: Request, res: Response) => {
    try {
      const { from = "/", postmaticToken = "" } = req.query;
      const { rootBusinessId } = req.params as any;

      const oauth = await this.facebook.oauth(
        String(from),
        String(rootBusinessId || ""),
        String(postmaticToken || "")
      );

      if (!oauth) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat melakukan login Facebook Page",
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
        description: "Terjadi kesalahan saat melakukan login Facebook Page",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  // /api/auth/callback/facebook_page (versi Page-only)
  callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query;
      const sessionState = req.session.oauth_state;

      const result = await this.facebook.callback(
        String(code || ""),
        String(state || ""),
        String(sessionState || "")
      );

      if (!result) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat melakukan login Facebook Page",
          code: 500,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL,
        });
      }

      const {
        from,
        rootBusinessId,
        pageId,
        pageName,
        pageAccessToken,
        postmaticToken,
        success,
      } = result;

      if (success !== true) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            result?.message ||
            "Terjadi kesalahan saat melakukan login Facebook Page",
          code: 400,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL + String(from),
        });
      }

      // kamu bisa hilangkan pageAccessToken di query jika tak ingin expose ke client
      return this.redirectToClient(
        res,
        `${from}?rootBusinessId=${encodeURIComponent(
          rootBusinessId || ""
        )}&pageId=${encodeURIComponent(
          pageId || ""
        )}&pageName=${encodeURIComponent(
          pageName || ""
        )}&pageAccessToken=${encodeURIComponent(
          String(pageAccessToken || "") || ""
        )}&postmaticToken=${encodeURIComponent(String(postmaticToken || ""))}`
      );
    } catch (err) {
      return this.renderViewError(req, res, {
        title: "Terjadi Kesalahan",
        description: "Terjadi kesalahan saat melakukan login Facebook Page",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  // POST ke Facebook Page (single/multi image & text)
  post = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as PostDTO; // berisi generatedImageContentId dsb
      const result = await this.facebook.post(rootBusinessId, data);

      if (!result) {
        return this.sendError(
          res,
          new Error("Terjadi kesalahan saat memposting Facebook Page"),
          400
        );
      }

      if (typeof result === "string") {
        return this.sendError(res, new Error(result), 400);
      }
      return this.sendSuccess(res, result, "Post berhasil dibuat");
    } catch (err) {
      return this.sendError(res, err);
    }
  };
}
