import { BaseService } from "./BaseService";
import crypto from "crypto";
import axios from "axios";
import db from "../config/db";
import { PostDTO } from "../validators/PostValidator";
import {
  META_APP_ID,
  META_APP_SECRET,
  META_GRAPH_VERSION,
  META_INSTAGRAM_BUSINESS_REDIRECT_URI, // tambahkan di constant/meta
} from "../constant/meta";
import { SocialPlatform } from "@prisma/client";
import { CloudinaryService } from "./CloudinaryService";

/* ---------------- Types ---------------- */

interface FbTokenResp {
  access_token: string;
  token_type?: string;
  expires_in?: number; // seconds
}

interface PageWithIG {
  id: string;
  name: string;
  instagram_business_account?: { id: string } | null;
}

interface IgPostReturn {
  id: string; // ig media id / published post id
  url: string; // permalink
  caption: string;
  images: string[];
  platform: SocialPlatform;
  generatedImageContentId: string;
}

/* --------------- Service --------------- */

export class InstagramBusinessService extends BaseService {
  private BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

  constructor(private cloudinary: CloudinaryService) {
    super();
  }

  /* ============= OAuth ============= */

  async oauth(from = "/", rootBusinessId = "", postmaticAccessToken = "") {
    try {
      // Perlu pages_show_list untuk menemukan IG yg tertaut ke Page
      const scopes = [
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
      ].join(",");

      const stateObj = {
        csrf: crypto.randomBytes(16).toString("hex"),
        from,
        rootBusinessId,
        postmaticAccessToken,
      };
      const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");

      const params = new URLSearchParams({
        client_id: META_APP_ID,
        redirect_uri: META_INSTAGRAM_BUSINESS_REDIRECT_URI,
        scope: scopes,
        response_type: "code",
        auth_type: "rerequest",
        state,
      });

      const authUrl = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
      return { state, authUrl };
    } catch (error) {
      this.handleError("InstagramBusinessService.oauth", error);
    }
  }

  async callback(code: string, stateFromFb: string, sessionState: string) {
    try {
      // decode state
      let from = "/";
      let rootBusinessId = "";
      let postmaticAccessToken = "";
      if (!stateFromFb || stateFromFb !== sessionState) {
        return {
          success: false,
          message: "Invalid state",
          from,
        };
      }

      try {
        const obj = JSON.parse(
          Buffer.from(stateFromFb, "base64").toString("utf8")
        );
        from = obj.from || "/";
        rootBusinessId = obj.rootBusinessId || "";
        postmaticAccessToken = obj.postmaticAccessToken || "";
      } catch (_) {}

      // 1) short-lived user token
      const t1 = await axios.get<FbTokenResp>(
        `${this.BASE}/oauth/access_token`,
        {
          params: {
            client_id: META_APP_ID,
            client_secret: META_APP_SECRET,
            redirect_uri: META_INSTAGRAM_BUSINESS_REDIRECT_URI,
            code,
          },
        }
      );

      // 2) long-lived user token
      const t2 = await axios.get<FbTokenResp>(
        `${this.BASE}/oauth/access_token`,
        {
          params: {
            grant_type: "fb_exchange_token",
            client_id: META_APP_ID,
            client_secret: META_APP_SECRET,
            fb_exchange_token: t1.data.access_token,
          },
        }
      );
      const userToken = t2.data.access_token;

      // 3) Temukan IG yg tertaut ke Page yg user punya akses
      const pagesResp = await axios.get<{ data: PageWithIG[] }>(
        `${this.BASE}/me/accounts`,
        {
          params: {
            access_token: userToken,
            fields: "id,name,instagram_business_account",
            limit: 200,
          },
        }
      );

      const pages = pagesResp.data?.data || [];
      const withIG = pages.filter((p) => p.instagram_business_account?.id);
      if (!withIG.length) {
        return {
          success: false,
          message:
            "Tidak ada Instagram Business/Creator yang tertaut ke Page Anda. Hubungkan IG → Page lalu coba lagi.",
          from,
        };
      }

      // Ambil IG pertama (optional: buat UI pemilihan IG di client)
      const igUserId = String(withIG[0].instagram_business_account!.id);

      // 4) Ambil info IG (username & profile picture)
      const igDetail = await axios.get(`${this.BASE}/${igUserId}`, {
        params: {
          fields: "username,profile_picture_url",
          access_token: userToken, // user token cukup
        },
      });

      const username = String(igDetail.data?.username || "");
      const pictureUrl: string | undefined = igDetail.data?.profile_picture_url;

      // Simpan foto ke Cloudinary (opsional)
      let uploadedPic: string | null = null;
      if (pictureUrl) {
        try {
          uploadedPic = await this.cloudinary.saveImageFromUrl(pictureUrl);
        } catch (_) {
          uploadedPic = pictureUrl; // fallback simpan URL asli
        }
      }

      // 5) Upsert ke DB SocialInstagramBusiness
      const [checkBusiness, checkIsLinkedAlready] = await Promise.all([
        db.rootBusiness.findUnique({
          where: { id: rootBusinessId },
          select: { socialInstagramBusiness: true },
        }),
        db.socialInstagramBusiness.findUnique({
          where: { instagramBusinessId: igUserId },
          select: {
            rootBusinessId: true,
          },
        }),
      ]);
      if (!checkBusiness)
        return {
          success: false,
          message: "Bisnis tidak ditemukan",
          from,
        };

      if (
        checkIsLinkedAlready &&
        checkIsLinkedAlready.rootBusinessId &&
        checkIsLinkedAlready.rootBusinessId !== rootBusinessId
      )
        return {
          success: false,
          message: "Akun Instagram Business sudah terhubung ke business lain",
          from,
        };

      await db.rootBusiness.update({
        where: { id: rootBusinessId },
        data: {
          socialInstagramBusiness: {
            connectOrCreate: {
              where: { instagramBusinessId: igUserId },
              create: {
                instagramBusinessId: igUserId,
                accessToken: userToken, // long-lived user token
                name: username,
                picture: uploadedPic,
                tokenExpiredAt: new Date(
                  Date.now() + (t2?.data?.expires_in || 60) * 1000
                ),
                deletedAt: null,
              },
            },
            upsert: {
              update: {
                instagramBusinessId: igUserId,
                accessToken: userToken,
                name: username,
                picture: uploadedPic,
                deletedAt: null,
              },
              create: {
                instagramBusinessId: igUserId,
                accessToken: userToken,
                name: username,
                picture: uploadedPic,
                deletedAt: null,
              },
            },
          },
        },
      });

      return {
        from,
        rootBusinessId,
        igUserId,
        username,
        postmaticAccessToken,
      };
    } catch (error) {
      this.handleError("InstagramBusinessService.callback", error);
    }
  }

  /* ============= Helpers ============= */

  private async getSocial(rootBusinessId: string) {
    try {
      const social = await db.socialInstagramBusiness.findUnique({
        where: { rootBusinessId },
        select: {
          instagramBusinessId: true,
          accessToken: true,
          name: true,
          picture: true,
        },
      });
      if (!social) return "Akun Instagram Business belum terhubung.";
      if (!social.accessToken)
        return "User access token tidak tersedia. Silakan hubungkan ulang.";
      return social;
    } catch (error) {
      this.handleError("InstagramBusinessService.getSocial", error);
    }
  }

  async checkSocial(rootBusinessId: string) {
    try {
      const social = await db.socialInstagramBusiness.findUnique({
        where: { rootBusinessId },
        select: { instagramBusinessId: true, accessToken: true },
      });
      if (!social)
        return "Akun Instagram Business tidak ditemukan atau belum terhubung.";
      return social;
    } catch (error) {
      this.handleError("InstagramBusinessService.checkSocial", error);
    }
  }

  /* ============= Post ============= */

  /**
   * Posting ke Instagram:
   * - Single image: POST /{igUserId}/media (image_url) → /media_publish
   * - Carousel: create child containers (is_carousel_item=true) → parent container (children=[]) → /media_publish
   */
  async post(rootBusinessId: string, data: PostDTO, caption?: string | null) {
    try {
      const [social, draft] = await Promise.all([
        this.getSocial(rootBusinessId),
        db.generatedImageContent.findUnique({
          where: { id: data.generatedImageContentId },
          select: { deletedAt: true, caption: true, images: true },
        }),
      ]);

      if (typeof social === "string") return social;
      if (!draft) return "Draft tidak ditemukan.";
      if (draft.deletedAt) return "Draft sudah dihapus.";
      if (!draft.images?.length) return "Gambar tidak ditemukan.";
      if (!social) return "Akun Instagram Business tidak ditemukan.";

      const igUserId = social.instagramBusinessId;
      const userToken = social.accessToken;
      const finalCaption = caption || draft.caption || "";

      // ===== Single image =====
      if (draft.images.length === 1) {
        const creation = await axios.post(
          `${this.BASE}/${igUserId}/media`,
          null,
          {
            params: {
              image_url: draft.images[0],
              caption: finalCaption,
              access_token: userToken,
            },
          }
        );

        const publish = await axios.post(
          `${this.BASE}/${igUserId}/media_publish`,
          null,
          {
            params: { creation_id: creation.data.id, access_token: userToken },
          }
        );

        const permalink = await axios.get(`${this.BASE}/${publish.data.id}`, {
          params: { fields: "permalink", access_token: userToken },
        });

        const payload: IgPostReturn = {
          id: String(publish.data.id),
          url: String(permalink.data?.permalink || ""),
          caption: finalCaption,
          images: draft.images,
          platform: "instagram_business" as SocialPlatform, // sesuaikan enum kamu
          generatedImageContentId: data.generatedImageContentId,
        };

        console.log("======================FUFUFAFA=======================");
        console.log(payload);
        console.log("======================FUFUFAFA=======================");

        await db.postedImageContent.create({
          data: {
            postId: payload.id,
            platform: payload.platform,
            url: payload.url,
            caption: payload.caption,
            images: payload.images,
            generatedImageContentId: payload.generatedImageContentId,
            rootBusinessId,
          },
        });

        return payload;
      }

      // ===== Carousel =====
      const childIds: string[] = [];
      for (const img of draft.images) {
        const child = await axios.post(`${this.BASE}/${igUserId}/media`, null, {
          params: {
            image_url: img,
            is_carousel_item: true,
            access_token: userToken,
          },
        });
        childIds.push(child.data.id);
      }

      const creation = await axios.post(
        `${this.BASE}/${igUserId}/media`,
        null,
        {
          params: {
            media_type: "CAROUSEL",
            caption: finalCaption,
            children: childIds.join(","), // IG menerima CSV
            access_token: userToken,
          },
        }
      );

      const publish = await axios.post(
        `${this.BASE}/${igUserId}/media_publish`,
        null,
        {
          params: { creation_id: creation.data.id, access_token: userToken },
        }
      );

      const permalink = await axios.get(`${this.BASE}/${publish.data.id}`, {
        params: { fields: "permalink", access_token: userToken },
      });

      const payload: IgPostReturn = {
        id: String(publish.data.id),
        url: String(permalink.data?.permalink || ""),
        caption: finalCaption,
        images: draft.images,
        platform: "instagram_business" as SocialPlatform,
        generatedImageContentId: data.generatedImageContentId,
      };

      await db.postedImageContent.create({
        data: {
          postId: payload.id,
          platform: payload.platform,
          url: payload.url,
          caption: payload.caption,
          images: payload.images,
          generatedImageContentId: payload.generatedImageContentId,
          rootBusinessId,
        },
      });

      return payload;
    } catch (error: any) {
      // Friendly error IG
      const fbErr = error?.response?.data?.error;
      if (fbErr) {
        // beberapa error umum IG publishing
        if (fbErr.code === 9007 || fbErr.code === 9004) {
          return "Gagal publish: pastikan akun IG adalah Professional dan ditautkan ke Facebook Page.";
        }
        if (fbErr.code === 10) {
          return "Izin kurang: butuh instagram_basic dan instagram_content_publish (reconnect).";
        }
      }
      this.handleError("InstagramBusinessService.post", error);
    }
  }
}
