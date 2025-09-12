import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { MemberService } from "../services/MemberService";
import {
  MemberDTO,
  MemberEditDTO,
  ResendEmailInvitationDTO,
} from "../validators/MemberValidator";
import { BACKEND_URL, DASHBOARD_URL, IS_PRODUCTION } from "../constant";

export class MemberController extends BaseController {
  constructor(private member: MemberService) {
    super();
  }

  sendInvitation = async (req: Request, res: Response) => {
    try {
      const data = req.body as MemberDTO;
      const { rootBusinessId } = req.params;
      const businesses = await this.member.sendInvitation(data, rootBusinessId);
      if (typeof businesses === "string")
        return this.sendError(res, new Error(businesses), 400);
      return this.sendSuccess(res, businesses, "Berhasil mengirim undangan");
    } catch (err) {
      return this.sendError(res, err);
    }
  };

  openLinkInvitation = async (req: Request, res: Response) => {
    try {
      const { inviteToken } = req.params;
      const decoded = await this.member.openLinkInvitation(inviteToken);
      if (!decoded)
        return this.renderView(req, res, "open-link-invitation-error", {
          title: "Terjadi kesalahan saat membuka undangan",
          message:
            "Undangan mungkin telah kedaluwarsa atau tidak valid. Minta pengirim untuk mengirim ulang undangan yang baru.",
          hint: "Jika menurut Anda ini sebuah kesalahan, silakan hubungi pemilik tim untuk mengirimkan undangan ulang.",
          isReload: false,
        });
      return this.renderView(req, res, "open-link-invitation", {
        businessName: decoded.businessName,
        email: decoded.email,
        role: decoded.role,
        link: BACKEND_URL + "/api/member/" + inviteToken + "/invitation",
        inviteToken,
      });
    } catch (error) {
      this.renderView(req, res, "open-link-invitation-error", {
        title: "Terjadi kesalahan saat membuka undangan",
        message:
          "Undangan mungkin telah kedaluwarsa atau tidak valid. Minta pengirim untuk mengirim ulang undangan yang baru.",
        hint: "Jika menurut Anda ini sebuah kesalahan, silakan hubungi pemilik tim untuk mengirimkan undangan ulang.",
        isReload: false,
      });
    }
  };

  answerLinkInvitation = async (req: Request, res: Response) => {
    try {
      if (req.turnstile?.ok === false) {
        return this.renderView(req, res, "open-link-invitation-error", {
          title: "Captcha tidak valid",
          message: req.turnstile?.message,
          hint: "Anda dapat memuat ulang halaman ini untuk mencoba kembali.",
          isReload: true,
        });
      }
      const { inviteToken } = req.params;
      const answer = req.body.answer;
      if (answer !== "accept" && answer !== "reject") {
        return this.renderView(req, res, "open-link-invitation-error", {
          title: "Terjadi kesalahan saat menjawab undangan",
          message: "Anda harus memilih opsi untuk menjawab undangan.",
          hint: "Anda dapat memuat ulang halaman ini untuk mencoba kembali.",
          isReload: true,
        });
      }
      const browser = req?.useragent?.browser || null;
      const platform = req?.useragent?.platform || null;
      const isAccepted = answer === "accept";
      const verify = await this.member.answerLinkInvitation(
        inviteToken,
        isAccepted,
        browser,
        platform
      );

      if (verify?.success === false) {
        return this.renderView(req, res, "open-link-invitation-error", {
          title: "Terjadi kesalahan saat menjawab undangan",
          message: verify?.message,
          hint: "Jika menurut Anda ini sebuah kesalahan, silakan hubungi pemilik tim untuk mengirimkan undangan ulang.",
          isReload: false,
        });
      }

      if (verify?.isAccepted === false) {
        return this.renderView(req, res, "reject-invitation");
      }

      res.cookie("__Host-pm_rt", verify?.refreshToken || "", {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "none", // penting: beda origin (dashboard -> api)
        path: "/", // wajib untuk prefix __Host-
        maxAge: 30 * 24 * 60 * 60 * 1000, // contoh: 30 hari
      });

      // 2) Opsi: set juga hint non-sensitif untuk UI/expiry (bukan token!)
      res.cookie("pm_rt_exp", Date.now() + 30 * 24 * 60 * 60 * 1000, {
        httpOnly: false,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        path: "/",
      });

      return this.redirect(res, verify?.redirectUrl || DASHBOARD_URL);
    } catch (error) {
      console.log(error);
      this.renderView(req, res, "open-link-invitation-error", {
        title: "Terjadi kesalahan saat menjawab undangan",
        message:
          "Undangan mungkin telah kedaluwarsa atau tidak valid. Minta pengirim untuk mengirim ulang undangan yang baru.",
        hint: "Jika menurut Anda ini sebuah kesalahan, silakan hubungi pemilik tim untuk mengirimkan undangan ulang.",
        isReload: false,
      });
    }
  };

  removeMember = async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const profileId = req.user?.id;
      const verify = await this.member.removeMember(memberId, profileId!);
      if (typeof verify === "string")
        return this.sendError(res, new Error(verify), 400);
      return this.sendSuccess(res, verify, "Berhasil menghapus member");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  getBusinessMembers = async (req: Request, res: Response) => {
    try {
      const { rootBusinessId } = req.params;
      const profileId = req.user?.id;
      const members = await this.member.getBusinessMembers(
        rootBusinessId,
        profileId!
      );
      return this.sendSuccess(res, members, "Berhasil mengambil member bisnis");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  editMember = async (req: Request, res: Response) => {
    try {
      const data = req.body as MemberEditDTO;
      const profileId = req.user?.id;
      const verify = await this.member.editMember(data, profileId!);
      if (typeof verify === "string")
        return this.sendError(res, new Error(verify), 400);
      return this.sendSuccess(res, verify, "Berhasil mengedit member");
    } catch (error) {
      return this.sendError(res, error);
    }
  };

  resendEmailInvitation = async (req: Request, res: Response) => {
    try {
      const data = req.body as ResendEmailInvitationDTO;
      const verify = await this.member.resendEmailInvitation(data);
      if (typeof verify === "string")
        return this.sendError(res, new Error(verify), 400);
      return this.sendSuccess(
        res,
        verify,
        "Berhasil mengirim undangan email kembali"
      );
    } catch (error) {
      return this.sendError(res, error);
    }
  };
}
