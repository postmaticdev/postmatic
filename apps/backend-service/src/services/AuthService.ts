import {
  PasswordDTO,
  ProfileDTO,
  ResetPasswordDecodedSchema,
  ResetPassword1DTO,
  SignInDTO,
  SignUpDTO,
  ResetPassword2DTO,
} from "../validators/ProfileValidator";
import { cachedResetPasswordUser, cachedUser } from "../config/cache";
import db from "../config/db";
import { BaseService } from "../services/BaseService";
import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from "../constant/auth";
import { AppUser, AppUserSchema } from "../utils/auth";
import bcrypt from "bcryptjs";
import { BACKEND_URL, DASHBOARD_URL } from "../constant";
import { NodeMailerUtils } from "../utils/NodeMailerUtils";
import { ZodError } from "zod";
import { DiscountService } from "./DiscountService";
import { redisClient } from "../config/redis";
import { Profile } from "@prisma/client";

// --- Bentuk data sesi yang disimpan di Redis ---
type SessionRecord = {
  refreshToken: string;
  browser: string;
  platform: string;
  profileId: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// --- Helper kunci Redis ---
const sessKey = (rt: string) => `sess:rt:${rt}`; // value JSON SessionRecord
const sessIndexKey = (pid: string) => `sess:pid:${pid}`; // SET<refreshToken>

// --- TTL dari refresh token JWT (pakai exp kalau ada) ---
function ttlFromJwt(refreshToken: string): number | null {
  try {
    const decoded: any = jwt.decode(refreshToken);
    if (!decoded?.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;
    return ttl > 0 ? ttl : null;
  } catch {
    return null;
  }
}

export class AuthService extends BaseService {
  constructor(
    private mailer: NodeMailerUtils,
    private discount: DiscountService
  ) {
    super();
  }
  async getProfileByProfileId(id: string) {
    try {
      const profile = await db.profile.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          countryCode: true,
          phone: true,
          users: {
            select: { id: true, email: true, provider: true, password: true },
          },
          // RELASI LAIN TETAP
          discountCodes: {
            select: {
              id: true,
              code: true,
              expiredAt: true,
              type: true,
              discount: true,
              maxDiscount: true,
              maxUses: true,
              isReusable: true,
              _count: {
                select: {
                  discountUsages: {
                    where: { paymentPurchase: { status: "Success" } },
                  },
                },
              },
            },
          },
        },
      });

      if (!profile) return null;

      if (profile.discountCodes.length === 0) {
        const createdDiscount = await this.discount.createFirstUserDiscount(
          profile.id,
          profile.name
        );
        profile.discountCodes = [
          {
            code: createdDiscount.code,
            discount: createdDiscount.discount,
            type: createdDiscount.type,
            isReusable: createdDiscount.isReusable,
            maxDiscount: createdDiscount.maxDiscount,
            maxUses: createdDiscount.maxUses,
            expiredAt: createdDiscount.expiredAt,
            id: createdDiscount.id,
            _count: {
              discountUsages: 0,
            },
          },
        ];
      }

      // Tarik "sessions" dari Redis (pengganti user.sessions dari Prisma)
      const idxKey = sessIndexKey(id);
      const tokens = await redisClient.smembers(idxKey);
      let sessions: Array<{
        refreshToken: string;
        browser: string;
        platform: string;
        createdAt: Date;
        updatedAt: Date;
      }> = [];

      if (tokens.length) {
        const pipeline = redisClient.multi();
        for (const t of tokens) pipeline.get(sessKey(t));
        const results = (await pipeline.exec()) as Array<
          [Error | null, string | null]
        >;
        for (let i = 0; i < tokens.length; i++) {
          const raw = results[i][1];
          if (!raw) continue; // key mungkin expired
          const rec: SessionRecord = JSON.parse(raw);
          sessions.push({
            refreshToken: rec.refreshToken,
            browser: rec.browser,
            platform: rec.platform,
            createdAt: new Date(rec.createdAt),
            updatedAt: new Date(rec.updatedAt),
          });
        }
      }

      // urutkan seperti orderBy createdAt desc
      sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const isCredentialPasswordSetUp = !!profile.users.find(
        (user) => user.provider === "credentials"
      )?.password;

      // gabungkan ke objek hasil (meniru shape lama yang punya "sessions")
      return {
        ...profile,
        users: profile.users.map((user) => ({
          id: user.id,
          email: user.email,
          provider: user.provider,
        })),
        sessions,
        isCredentialPasswordSetUp,
      };
    } catch (err) {
      this.handleError("getProfileByProfileId", err);
      return null;
    }
  }

  async getProfileInCache(id: string) {
    try {
      return cachedUser.get(id);
    } catch (err) {
      this.handleError("getUserInCache", err);
      return null;
    }
  }

  async deleteProfileFromCache(id: string) {
    try {
      cachedUser.delete(id);
    } catch (err) {
      this.handleError("deleteProfileFromCache", err);
    }
  }

  async setProfileInCache(id: string, user: AppUser) {
    try {
      await cachedUser.set(id, user);
    } catch (err) {
      this.handleError("setProfileInCache", err);
    }
  }

  async editProfile(id: string, data: ProfileDTO) {
    try {
      const user = await db.profile.findUnique({
        where: { id },
        select: {
          id: true,
          countryCode: true,
          phone: true,
        },
      });
      if (!user)
        return this.handleError(
          "editProfile",
          new Error("Pengguna tidak ditemukan")
        );
      const updatedUser = await db.profile.update({
        where: { id },
        data: data,
      });
      await this.deleteProfileFromCache(id);
      const mappedUser: AppUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        photo: updatedUser.image,
      };
      await this.setProfileInCache(id, mappedUser);
      const accessToken = await this.generateAccessToken(mappedUser);
      return {
        ...mappedUser,
        accessToken,
      };
    } catch (err) {
      this.handleError("editProfile", err);
      return null;
    }
  }

  async generateAccessToken(user: AppUser) {
    return jwt.sign(user, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }

  async generateRefreshToken(user: AppUser) {
    return jwt.sign(user, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }

  async saveSession(
    refreshToken: string,
    profileId: string,
    browser: string | null,
    platform: string | null
  ) {
    try {
      const nowIso = new Date().toISOString();
      const record: SessionRecord = {
        refreshToken,
        profileId,
        browser: browser || "Unknown",
        platform: platform || "Unknown",
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const ttl = ttlFromJwt(refreshToken); // detik, atau null
      const key = sessKey(refreshToken);
      const idx = sessIndexKey(profileId);

      const pipeline = redisClient.multi();
      if (ttl) {
        pipeline.set(key, JSON.stringify(record), "EX", ttl);
      } else {
        // fallback: tanpa TTL (atau ganti default, mis. 30 hari => EX, 2592000)
        pipeline.set(key, JSON.stringify(record));
      }
      pipeline.sadd(idx, refreshToken);
      // opsional: set TTL index agar bersih otomatis (gunakan TTL terpanjang)
      if (ttl) pipeline.expire(idx, ttl);

      await pipeline.exec();
    } catch (err) {
      this.handleError("saveSession", err);
    }
  }

  async regenerateAccessTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as AppUser;
      const parsed = AppUserSchema.safeParse(decoded);
      if (!parsed.success) return null;

      // pastikan sesi ini ada di Redis (dan belum expired)
      const raw = await redisClient.get(sessKey(refreshToken));
      if (!raw) return null;

      const session: SessionRecord = JSON.parse(raw);

      // ambil profil dari DB (kita tetap pakai source-of-truth profil di DB)
      const profile = await db.profile.findUnique({
        where: { id: session.profileId },
        select: { id: true, name: true, email: true, image: true },
      });
      if (!profile) return null;

      const accessToken = await this.generateAccessToken({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        photo: profile.image,
      });
      // opsional: perbarui updatedAt & perpanjang TTL sesuai exp baru
      const ttl = ttlFromJwt(refreshToken);
      session.updatedAt = new Date().toISOString();
      if (ttl) {
        await redisClient.set(
          sessKey(refreshToken),
          JSON.stringify(session),
          "EX",
          ttl
        );
        // jaga index tetap hidup
        await redisClient.expire(sessIndexKey(session.profileId), ttl);
      } else {
        await redisClient.set(sessKey(refreshToken), JSON.stringify(session));
      }

      return { accessToken, refreshToken };
    } catch (_err) {
      // verify gagal / expired
      return null;
    }
  }

  async logout(refreshToken: string) {
    try {
      // perlu tahu profileId untuk bersihkan index
      const raw = await redisClient.get(sessKey(refreshToken));
      if (raw) {
        const rec: SessionRecord = JSON.parse(raw);
        await redisClient.srem(sessIndexKey(rec.profileId), refreshToken);
      }
      await redisClient.del(sessKey(refreshToken));
    } catch (err) {
      this.handleError("logout", err);
    }
  }

  async changePassword(id: string, data: PasswordDTO) {
    try {
      const profile = await db.profile.findUnique({
        where: {
          id,
        },
        select: {
          email: true,
          users: {
            select: {
              provider: true,
              password: true,
              id: true,
            },
          },
        },
      });
      if (!profile) return null;
      const credentialAccount = profile.users.find(
        (user) => user.provider === "credentials"
      );
      if (!credentialAccount) {
        const hashPassword = await this.hashPassword(data.newPassword);
        await db.user.create({
          data: {
            profileId: id,
            provider: "credentials",
            email: profile.email,
            password: hashPassword,
            isVerified: true,
          },
        });
      } else if (!credentialAccount.password) {
        const hashPassword = await this.hashPassword(data.newPassword);
        await db.user.update({
          where: {
            id: credentialAccount.id,
          },
          data: {
            password: hashPassword,
          },
        });
      } else {
        const checkPassword = await bcrypt.compare(
          data.oldPassword,
          credentialAccount.password
        );
        if (!checkPassword)
          return this.handleError(
            "changePassword",
            new Error("Password lama tidak valid")
          );
        const hashPassword = await this.hashPassword(data.newPassword);
        await db.user.update({
          where: {
            id: credentialAccount.id,
          },
          data: {
            password: hashPassword,
          },
        });
      }
    } catch (err) {
      this.handleError("changePassword", err);
      return null;
    }
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async disconnectUser(id: string) {
    try {
      const check = await db.user.findUnique({
        where: {
          id: id,
        },
        select: {
          provider: true,
        },
      });
      if (!check) return "Pengguna tidak ditemukan";
      if (check.provider === "credentials")
        return "Tidak dapat memutus koneksi pengguna dengan credentials";

      await db.user.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (err) {
      this.handleError("disconnectUser", err);
      return "Error memutus koneksi pengguna";
    }
  }

  validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string) {
    // Password must be at least 6 characters long
    return password.length >= 6;
  }

  validateSignUp(data: SignUpDTO) {
    const errors: Record<string, string> = {};
    if (!this.validateEmail(data.email)) {
      errors.email = "Email tidak valid";
    }
    if (!this.validatePassword(data.password)) {
      errors.password = "Password minimal 8 karakter";
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi tidak cocok";
    }
    if (!data.givenName || data.givenName.length < 2) {
      errors.givenName = "Nama depan wajib diisi dan minimal 2 karakter";
    }
    if (!data.familyName || data.familyName.length < 2) {
      errors.familyName = "Nama belakang wajib diisi dan minimal 2 karakter";
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  async isUserProviderExist(email: string) {
    try {
      const user = await db.user.findFirst({
        where: {
          AND: [{ email: email }, { provider: "credentials" }],
        },
        select: { provider: true },
      });

      return !!user;
    } catch (err) {
      throw this.handleError("isUserExist", err);
    }
  }

  createUser = async (data: SignUpDTO) => {
    try {
      const name = `${data.givenName} ${data.familyName}`.trim();
      const hashPassword = await this.hashPassword(data.password);
      const user = await db.user.create({
        data: {
          email: data.email,
          password: hashPassword,
          provider: "credentials",
          isVerified: false,
          profile: {
            connectOrCreate: {
              where: { email: data.email },
              create: {
                name: name,
                description: null,
                image: null,
                email: data.email,
              },
            },
          },
        },
      });
      await this.sendVerfication(data.email, name);
      return user;
    } catch (err) {
      this.handleError("createUser", err);
      return null;
    }
  };

  async sendVerfication(email: string, name: string) {
    try {
      const token = jwt.sign(
        { email, name, type: "email-verification" },
        JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      const confirmUrl = `${BACKEND_URL}/api/auth/page/verify/${token}`;
      await this.mailer.sendEmailVerification(email, name, confirmUrl);
      console.log(`Sending verification email to ${email}`);
    } catch (err) {
      this.handleError("sendEmailVerification", err);
      return null;
    }
  }

  async signIn(data: SignInDTO, ip: string) {
    const profile: { id: string; name: string; image: string | null } = {
      id: "",
      name: "",
      image: null,
    };
    const key = `login:fail:${data.email}:${ip}`;

    try {
      const user = await db.user.findFirst({
        where: {
          AND: [
            {
              email: data.email,
            },
            {
              provider: "credentials",
            },
          ],
        },
        select: {
          id: true,
          email: true,
          password: true,
          isVerified: true,
          profile: {
            select: {
              id: true,
              name: true,
              image: true,
              _count: {
                select: {
                  discountCodes: true,
                },
              },
            },
          },
        },
      });

      if (!user)
        return {
          success: false,
          errros: {
            email: "Pengguna tidak ditemukan",
          },
          email: data.email,
          profile,
        };
      profile.id = user.profile.id;
      profile.name = user.profile.name;
      profile.image = user.profile.image;
      if (!user.isVerified) {
        await this.sendVerfication(data.email, user.profile.name);
        return {
          success: false,
          errors: {
            email:
              "Email belum terverifikasi, harap verifikasi email terlebih dahulu",
          },
          email: data.email,
          profile,
        };
      }

      if (user.profile._count.discountCodes === 0) {
        await this.discount.createFirstUserDiscount(
          user.profile.id,
          user.profile.name
        );
      }

      if (!user.password) {
        // If user is has no password, set the password (case: user sign up with member invitation)
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: await this.hashPassword(data.password),
          },
        });
        return {
          success: true,
          errors: {},
          message: "Password berhasil diatur",
          email: data.email,
          profile,
        };
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        const fails = await redisClient.incr(key);
        console.log("signIn fails:", fails);
        if (fails === 1) await redisClient.expire(key, 15 * 60); // window 15 menit

        if (fails > 5) {
          console.log("signIn fails > 5");
          const wait = Math.min((fails - 5) * 10, 300); // backoff 10s naik sampai 5 menit
          return {
            success: false,
            errors: {
              password: `Terlalu banyak percobaan login, harap coba lagi setelah ${wait} detik`,
              wait: wait,
            },
            email: data.email,
            profile,
          };
        }

        return {
          success: false,
          errors: {
            password: "Password tidak valid",
          },
          email: data.email,
          profile,
        };
      }

      return {
        success: true,
        errors: {},
        email: data.email,
        profile,
      };
    } catch (err) {
      this.handleError("signIn", err);
      return {
        success: false,
        errors: {
          password: "Terjadi kesalahan saat memvalidasi password",
        },
        email: data.email,
        profile,
      };
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (
        decoded.type !== "email-verification" ||
        !decoded.email ||
        typeof decoded.email !== "string"
      ) {
        return {
          success: false,
          message: "Link verifikasi tidak valid",
          email: "Error",
        };
      }
      const user = await db.user.findFirst({
        where: {
          AND: [
            {
              email: decoded.email,
            },
            {
              provider: "credentials",
            },
          ],
        },
      });
      if (!user) {
        return {
          success: false,
          message: "Pengguna tidak ditemukan",
          email: decoded.email,
        };
      }
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      });
      return {
        success: true,
        message: "Email berhasil diverifikasi",
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.message === "jwt expired") {
          return {
            success: false,
            message: "Link verifikasi sudah kadaluarsa",
            email: "Error",
          };
        } else if (error.message === "invalid signature") {
          return {
            success: false,
            message: "Link verifikasi tidak valid",
            email: "Error",
          };
        } else {
          return {
            success: false,
            message: "Terjadi kesalahan saat memverifikasi email",
            email: "Error",
          };
        }
      }
    }
  }

  async createResetPasswordToken(data: ResetPassword1DTO) {
    try {
      const user = await db.user.findFirst({
        where: {
          AND: [{ email: data.email }, { provider: "credentials" }],
        },
        select: {
          profile: {
            select: {
              id: true,
              name: true,
            },
          },
          deletedAt: true,
        },
      });
      if (!user || user.deletedAt) {
        return {
          success: false,
          message: "Pengguna tidak ditemukan",
          email: data.email,
          name: "",
          profileId: "",
          canBeRequestedAgainAt: null,
        };
      }

      const checkLastAttempt = await cachedResetPasswordUser.get(data.email);
      const now = Date.now();
      const MINUTES = 60 * 1000;
      const canBeRequestedAgainAt = checkLastAttempt
        ? checkLastAttempt.time + MINUTES
        : null;
      if (checkLastAttempt && checkLastAttempt?.time + MINUTES > now) {
        return {
          success: false,
          message:
            "Anda hanya dapat meminta link reset password sekali setiap 1 menit",
          email: data.email,
          name: "",
          profileId: "",
          canBeRequestedAgainAt,
        };
      }
      const token = jwt.sign(
        {
          email: data.email,
          name: user.profile.name,
          type: "reset-password",
          profileId: user.profile.id,
        },
        JWT_SECRET,
        { expiresIn: "10m" }
      );
      const link = `${BACKEND_URL}/api/auth/page/reset-password/${token}`;
      await this.mailer.sendEmailResetPassword(
        data.email,
        user.profile.name,
        link
      );
      await cachedResetPasswordUser.set(data.email, {
        time: now,
        token,
      });
      return {
        success: true,
        message: "Link reset password berhasil dikirim",
        email: data.email,
        name: user.profile.name,
        profileId: user.profile.id,
        canBeRequestedAgainAt: MINUTES + now,
      };
    } catch (err) {
      this.handleError("createResetPasswordToken", err);
      return {
        success: false,
        message: "Terjadi kesalahan saat membuat link reset password",
        email: data.email,
        name: "",
        profileId: "",
        canBeRequestedAgainAt: null,
      };
    }
  }

  async verifyResetPasswordToken(token: string) {
    let email = "";
    let name = "";
    let profileId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const parsed = ResetPasswordDecodedSchema.parse(decoded);
      email = parsed.email;
      name = parsed.name;
      profileId = parsed.profileId;
      const check = await cachedResetPasswordUser.get(parsed.email);
      if (!check || check.token !== token)
        return {
          success: false,
          message: "Link verifikasi tidak valid",
          email: email,
          name: name,
          profileId: profileId,
        };

      return {
        success: true,
        message: "Link verifikasi berhasil",
        email: email,
        name: name,
        profileId: profileId,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.message === "jwt expired") {
          return {
            success: false,
            message: "Link verifikasi sudah kadaluarsa",
            email: email,
            name: name,
            profileId: profileId,
          };
        } else if (error.message === "invalid signature") {
          return {
            success: false,
            message: "Link verifikasi tidak valid",
            email: email,
            name: name,
            profileId: profileId,
          };
        }
      }
      return {
        success: false,
        message: "Terjadi kesalahan saat memverifikasi email",
        email: email,
        name: name,
        profileId: profileId,
      };
    }
  }

  async resetPassword(data: ResetPassword2DTO, token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const parsed = ResetPasswordDecodedSchema.parse(decoded);
      if (data.password !== data.confirmPassword)
        return "Konfirmasi kata sandi tidak cocok";
      if (data.password.length < 8) return "Kata sandi minimal 8 karakter";

      const user = await db.user.findFirst({
        where: {
          AND: [
            {
              email: parsed.email,
            },
            {
              provider: "credentials",
            },
          ],
        },
        select: {
          deletedAt: true,
          id: true,
        },
      });
      if (!user || user.deletedAt) return "Pengguna tidak ditemukan";
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
      await cachedResetPasswordUser.delete(parsed.email);
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.message === "jwt expired") {
          return "Link verifikasi sudah kadaluarsa";
        } else if (error.message === "invalid signature") {
          return "Link verifikasi tidak valid";
        } else {
          return "Terjadi kesalahan saat memverifikasi email";
        }
      }
      if (error instanceof ZodError) {
        return "Link verifikasi tidak valid";
      }
      return "Terjadi kesalahan saat memverifikasi email";
    }
  }

  async decodingResetPasswordToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const parsed = ResetPasswordDecodedSchema.parse(decoded);
      return parsed;
    } catch (error) {
      return {
        email: "Email tidak valid",
        name: "",
        type: "",
        profileId: "",
      };
    }
  }

  async logoutAll(profileId: string) {
    const idx = sessIndexKey(profileId);
    const tokens = await redisClient.smembers(idx);
    if (tokens.length) {
      const pipe = redisClient.multi();
      for (const t of tokens) pipe.del(sessKey(t));
      pipe.del(idx);
      await pipe.exec();
    }
  }
}
