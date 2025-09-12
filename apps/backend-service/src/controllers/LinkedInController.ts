import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { LinkedInService } from "../services/LinkedInService";
import { PostDTO } from "../validators/PostValidator";
import { DASHBOARD_URL } from "../constant";

export class LinkedInController extends BaseController {
  constructor(private linkedin: LinkedInService) {
    super();
  }

  oauth = async (req: Request, res: Response) => {
    try {
      const { from = "/", postmaticToken = "" } = req.query;
      const { rootBusinessId } = req.params;
      const oauth = await this.linkedin.oauth(
        String(from),
        String(rootBusinessId),
        String(postmaticToken)
      );
      if (!oauth) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat melakukan login LinkedIn",
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
        description: "Terjadi kesalahan saat melakukan login LinkedIn",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  callback = async (req: Request, res: Response) => {
    try {
      const { state, code } = req.query;
      const stateSession = req.session.oauth_state;
      if (!state || !code || !stateSession) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat melakukan login LinkedIn",
          code: 400,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL,
        });
      }
      const callback = await this.linkedin.callback(
        String(code),
        String(state),
        stateSession
      );
      if (!callback) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat melakukan login LinkedIn",
          code: 500,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL,
        });
      }
      const {
        from,
        rootBusinessId,
        accessToken,
        authorUrn,
        postmaticToken,
        success,
      } = callback;

      if (success !== true) {
        return this.renderViewError(req, res, {
          title: "Terjadi Kesalahan",
          description:
            callback?.message ||
            "Terjadi kesalahan saat melakukan login LinkedIn",
          code: 400,
          ctaText: "Kembali ke Dashboard",
          ctaHref: DASHBOARD_URL + String(from),
        });
      }

      return this.redirectToClient(
        res,
        `${from}?accessToken=${accessToken}&authorUrn=${authorUrn}&rootBusinessId=${rootBusinessId}&postmaticToken=${postmaticToken}`
      );
    } catch (err) {
      return this.renderViewError(req, res, {
        title: "Terjadi Kesalahan",
        description: "Terjadi kesalahan saat melakukan login LinkedIn",
        code: 500,
        ctaText: "Kembali ke Dashboard",
      });
    }
  };

  post = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const data = req.body as PostDTO;
      const posting = await this.linkedin.post(rootBusinessId, data);
      if (typeof posting === "string")
        return this.sendError(res, new Error(posting), 400);
      return this.sendSuccess(res, posting, "Berhasil memposting");
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}
