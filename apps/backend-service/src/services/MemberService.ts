import {
  MemberDecodedDTO,
  MemberDecodedSchema,
  MemberDTO,
  MemberEditDTO,
  ResendEmailInvitationDTO,
} from "../validators/MemberValidator";
import { BaseService } from "./BaseService";
import db from "../config/db";
import { NodeMailerUtils } from "../utils/NodeMailerUtils";
import { BACKEND_URL, DASHBOARD_URL } from "../constant";
import { JWT_SECRET } from "../constant/auth";
import jwt from "jsonwebtoken";
import { Member } from ".prisma/client";
import { AuthService } from "./AuthService";

export class MemberService extends BaseService {
  constructor(
    private mailer: NodeMailerUtils,
    private authService: AuthService
  ) {
    super();
  }
  async sendInvitation(data: MemberDTO, rootBusinessId: string) {
    try {
      const { email } = data;
      const profile = await db.profile.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          members: {
            select: {
              rootBusinessId: true,
              answeredAt: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              id: true,
            },
          },
        },
      });

      const business = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: { name: true },
      });

      if (!business) return "Business tidak ditemukan.";

      const isExist = profile?.members?.find(
        (member) => member.rootBusinessId === rootBusinessId
      );

      if (isExist?.status === "Accepted") {
        return `${email} sudah menjadi anggota bisnis ini.`;
      }

      const now = new Date();
      const sevenDaysAfter = isExist?.updatedAt
        ? new Date(isExist.updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

      if (
        isExist &&
        sevenDaysAfter &&
        isExist?.status === "Pending" &&
        now < sevenDaysAfter &&
        !isExist?.answeredAt
      ) {
        return `${email} sudah diundang ke bisnis ini dalam 7 hari terakhir.`;
      }

      if (isExist?.status === "Rejected") {
        return `${email} sudah menolak undangan.`;
      }

      const payload: MemberDecodedDTO = {
        email: email,
        rootBusinessId: rootBusinessId,
        businessName: business.name,
        role: data.role,
        type: "email-verification",
        memberId: isExist?.id || "",
        profileId: profile?.id || "",
      };

      if (!profile) {
        const defaultName = email?.split?.("@")?.[0];
        const created = await db.profile.create({
          data: {
            email: email,
            name: defaultName,
            members: {
              create: {
                rootBusinessId: rootBusinessId,
                role: data.role,
                status: "Pending",
              },
            },
          },
          select: {
            id: true,
            members: {
              select: {
                id: true,
                rootBusinessId: true,
              },
            },
          },
        });
        const findMemberId = created?.members?.find(
          (member) => member.rootBusinessId === rootBusinessId
        )?.id;
        if (findMemberId) {
          payload.memberId = findMemberId;
        }
        payload.profileId = created?.id;
      } else {
        if (isExist) {
          const created = await db.member.update({
            where: {
              id: isExist.id,
            },
            data: {
              status: "Pending",
              updatedAt: new Date(),
              answeredAt: null,
            },
            select: {
              id: true,
              profileId: true,
            },
          });
          payload.memberId = created?.id;
          payload.profileId = created?.profileId;
        } else {
          const created = await db.profile.update({
            where: {
              email: email,
            },
            data: {
              members: {
                create: {
                  rootBusinessId: rootBusinessId,
                  role: data.role,
                  status: "Pending",
                },
              },
            },
            select: {
              id: true,
              members: {
                select: {
                  id: true,
                  rootBusinessId: true,
                },
              },
            },
          });
          const findMemberId = created?.members?.find(
            (member) => member.rootBusinessId === rootBusinessId
          )?.id;
          if (findMemberId) {
            payload.memberId = findMemberId;
          }
          payload.profileId = created?.id;
        }
      }

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      const link = `${BACKEND_URL}/api/member/${token}/invitation`;
      try {
        await this.mailer.sendEmailInvitation(email, link, business.name);
      } catch (error) {
        await db.member.delete({
          where: {
            id: payload.memberId,
          },
        });
      }
      return payload;
    } catch (err) {
      this.handleError("sendInvitation", err);
    }
  }

  async openLinkInvitation(inviteToken: string) {
    try {
      const decoded = jwt.verify(inviteToken, JWT_SECRET) as MemberDecodedDTO;
      const parsed = MemberDecodedSchema.parse(decoded);
      return parsed;
    } catch (err) {
      this.handleError("openLinkInvitation", err);
    }
  }
  async answerLinkInvitation(
    inviteToken: string,
    isAccepted: boolean,
    browser: string | null,
    platform: string | null
  ) {
    try {
      const decoded = jwt.verify(inviteToken, JWT_SECRET) as MemberDecodedDTO;
      const parsed = MemberDecodedSchema.parse(decoded);
      const check = await db.member.findUnique({
        where: {
          id: parsed.memberId,
        },
        select: {
          status: true,
          answeredAt: true,
          rootBusinessId: true,
          profile: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              users: {
                where: {
                  provider: "credentials",
                },
                take: 1,
                select: {
                  password: true,
                  provider: true,
                },
              },
            },
          },
        },
      });
      if (check?.status !== "Pending") {
        return {
          success: false,
          message: "Undangan sudah dijawab.",
          isAccepted: false,
        };
      }
      await db.member.update({
        where: {
          id: parsed.memberId,
        },
        data: {
          status: isAccepted ? "Accepted" : "Rejected",
          answeredAt: new Date(),
        },
      });
      const isCredentialPasswordSetUp = check?.profile?.users?.find(
        (user) => user.provider === "credentials"
      )?.password;

      const accessToken = await this.authService.generateAccessToken({
        id: check?.profile?.id,
        email: check?.profile?.email,
        name: check?.profile?.name,
        photo: check?.profile?.image,
      });

      const refreshToken = await this.authService.generateRefreshToken({
        id: check?.profile?.id,
        email: check?.profile?.email,
        name: check?.profile?.name,
        photo: check?.profile?.image,
      });

      await this.authService.saveSession(
        refreshToken,
        check?.profile?.id,
        browser,
        platform
      );

      const params = {
        rootBusinessId: check?.rootBusinessId,
        shouldSetupPassword: isCredentialPasswordSetUp ? "false" : "true",
        token: accessToken,
      };

      const redirectUrl = `${DASHBOARD_URL}?${new URLSearchParams(
        params
      ).toString()}`;
      return {
        success: true,
        isAccepted,
        message: "Undangan berhasil dijawab.",
        redirectUrl,
        refreshToken,
      };
    } catch (err) {
      this.handleError("answerLinkInvitation", err);
    }
  }

  async removeMember(memberId: string, profileId: string) {
    try {
      const [profile, check] = await Promise.all([
        db.profile.findUnique({
          where: {
            id: profileId,
          },
          select: {
            members: {
              select: {
                rootBusinessId: true,
                role: true,
              },
            },
          },
        }),
        db.member.findUnique({
          where: {
            id: memberId,
          },
          select: {
            status: true,
            role: true,
            rootBusinessId: true,
          },
        }),
      ]);
      if (!check) {
        return "Member tidak ditemukan";
      }
      const profileBusiness = profile?.members?.find(
        (member) => member.rootBusinessId === check.rootBusinessId
      );

      if (!profileBusiness) {
        return "Anda tidak menjadi anggota bisnis ini";
      }

      if (check.role === "Owner") {
        return "Tidak dapat menghapus Owner";
      }

      let data: Partial<Member> = {};

      switch (check.status) {
        case "Kicked":
          return "Member sudah dikeluarkan";
        case "Left":
          return "Member sudah meninggalkan bisnis";
        case "Rejected":
          data = await db.member.delete({
            where: {
              id: memberId,
            },
          });
          break;
        case "Pending":
          data = await db.member.delete({
            where: {
              id: memberId,
            },
          });
          break;
        case "Accepted":
          data = await db.member.update({
            where: {
              id: memberId,
            },
            data: {
              status: "Kicked",
            },
          });
          break;
        default:
          break;
      }

      return data;
    } catch (err) {
      this.handleError("removeMember", err);
    }
  }

  async getBusinessMembers(rootBusinessId: string, profileId: string) {
    try {
      const members = await db.member.findMany({
        where: {
          rootBusinessId: rootBusinessId,
        },
        select: {
          id: true,
          role: true,
          status: true,
          answeredAt: true,
          profile: {
            select: {
              name: true,
              email: true,
              image: true,
              id: true,
            },
          },
        },
      });
      const isOwner = members?.find(
        (member) => member.role === "Owner" && member.profile.id === profileId
      );
      const filteredMembers = isOwner
        ? members
        : members?.filter((member) => member.status === "Accepted");

      return filteredMembers?.map((member) => {
        const isYourself = member.profile.id === profileId;
        return {
          ...member,
          isYourself,
        };
      });
    } catch (err) {
      this.handleError("getBusinessMembers", err);
    }
  }

  async resendEmailInvitation(data: ResendEmailInvitationDTO) {
    try {
      const { memberId } = data;
      const member = await db.member.findUnique({
        where: { id: memberId },
        select: {
          rootBusiness: {
            select: {
              name: true,
              id: true,
            },
          },
          status: true,
          role: true,
          id: true,
          profile: {
            select: {
              email: true,
              id: true,
            },
          },
        },
      });
      if (!member) {
        return "Member tidak ditemukan";
      }
      if (member.status !== "Pending") {
        return "Member sudah dijawab";
      }

      if (member.role === "Owner") {
        return "Anda tidak diizinkan untuk mengirim ulang undangan email";
      }
      const payload: MemberDecodedDTO = {
        businessName: member?.rootBusiness?.name,
        email: member?.profile?.email,
        rootBusinessId: member?.rootBusiness?.id,
        role: member?.role,
        type: "email-verification",
        profileId: member?.profile?.id,
        memberId: member?.id,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      const link = `${BACKEND_URL}/api/member/${token}/invitation`;
      try {
        await this.mailer.sendEmailInvitation(
          member?.profile?.email,
          link,
          member?.rootBusiness?.name
        );
      } catch (error) {
        return "Gagal mengirim undangan email";
      }
      return payload;
    } catch (error) {
      this.handleError("resendEmailInvitation", error);
    }
  }

  async editMember(data: MemberEditDTO, profileId: string) {
    try {
      const member = await db.member.findUnique({
        where: { id: data.memberId },
        select: {
          profileId: true,
          role: true,
        },
      });
      if (!member) {
        return "Member tidak ditemukan";
      }
      if (member.role === "Owner") {
        return "Anda tidak diizinkan untuk mengubah peran Owner";
      }
      if (member.profileId === profileId) {
        return "Anda tidak diizinkan untuk mengubah diri sendiri";
      }
      const updatedMember = await db.member.update({
        where: { id: data.memberId },
        data: {
          role: data.role,
        },
      });
      return updatedMember;
    } catch (err) {
      this.handleError("editMember", err);
    }
  }
}
