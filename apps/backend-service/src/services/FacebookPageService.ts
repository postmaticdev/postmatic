import { BaseService } from "./BaseService";
import crypto from "crypto";
import axios from "axios";
import db from "../config/db";
import { PostDTO } from "../validators/PostValidator";
import {
  META_APP_ID,
  META_APP_SECRET,
  META_FACEBOOK_PAGE_REDIRECT_URI,
  META_GRAPH_VERSION,
} from "../constant/meta";
import { SocialPlatform } from "@prisma/client";
import { CloudinaryService } from "./CloudinaryService";

// ———————————————————————————————————————————————————————————————
// Types
// ———————————————————————————————————————————————————————————————

interface FbTokenResp {
  access_token: string;
  token_type?: string;
  expires_in?: number; // seconds
}

interface FbPageItem {
  id: string;
  name: string;
  access_token?: string;
  tasks?: string[];
}

interface FbPostReturn {
  id: string; // post id
  url: string; // permalink_url
  caption: string;
  images: string[];
  platform: SocialPlatform;
  generatedImageContentId: string;
}

// ———————————————————————————————————————————————————————————————
// Service
// ———————————————————————————————————————————————————————————————

export class FacebookPageService extends BaseService {
  private BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

  constructor(private cloudinary: CloudinaryService) {
    super();
  }

  /* ======================== OAuth ======================== */

  async oauth(from = "/", rootBusinessId = "", postmaticAccessToken = "") {
    try {
      // scopes: hanya yang diperlukan untuk posting Page
      const scopes = [
        "public_profile",
        "pages_show_list",
        "pages_manage_metadata",
        "pages_manage_posts",
        "pages_read_engagement",
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
        redirect_uri: META_FACEBOOK_PAGE_REDIRECT_URI,
        scope: scopes,
        response_type: "code",
        auth_type: "rerequest",
        state,
      });

      const authUrl = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;

      return { state, authUrl };
    } catch (error) {
      this.handleError("FacebookPageService.oauth", error);
    }
  }

  async checkSocial(rootBusinessId: string) {
    try {
      const social = await db.socialFacebookPage.findUnique({
        where: { rootBusinessId },
        select: { facebookPageId: true, accessToken: true },
      });
      if (!social) return "Facebook Page tidak ditemukan atau belum terhubung.";
      return social;
    } catch (error) {
      this.handleError("FacebookPageService.checkSocial", error);
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
          message: "State tidak valid",
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
      } catch (_) {
        /* ignore */
      }

      // 1) short-lived user token
      const t1 = await axios.get<FbTokenResp>(
        `${this.BASE}/oauth/access_token`,
        {
          params: {
            client_id: META_APP_ID,
            client_secret: META_APP_SECRET,
            redirect_uri: META_FACEBOOK_PAGE_REDIRECT_URI,
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

      // 3) list pages user
      const pagesResp = await axios.get<{ data: FbPageItem[] }>(
        `${this.BASE}/me/accounts`,
        {
          params: {
            access_token: userToken,
            fields: "id,name,access_token,tasks",
            limit: 200,
          },
        }
      );
      console.log("pagesResp", pagesResp.data);
      const pages = pagesResp.data?.data || [];
      if (!pages.length)
        return {
          success: false,
          message: "Tidak ditemukan Facebook Page yang dapat diakses.",
          from,
        };

      // ambil page pertama (atau pilih via UI di client)
      const page = pages[0];
      if (!page.access_token) {
        // jika access_token tidak muncul di /me/accounts karena permission/tugas kurang
        return {
          success: false,
          message:
            "Token Facebook Page tidak tersedia. Pastikan izin pages_manage_* disetujui dan Anda memiliki Full control.",
          from,
        };
      }

      const pictureUrl = await this.getPagePictureUrl(
        page.id,
        page.access_token
      );
      let uploadPictureUrl: string | null = null;
      if (pictureUrl) {
        try {
          uploadPictureUrl = await this.cloudinary.saveImageFromUrl(pictureUrl);
        } catch (_) {
          uploadPictureUrl = pictureUrl; // fallback simpan URL asli
        }
      }

      const [checkBusiness, checkFacebookPage] = await Promise.all([
        db.rootBusiness.findUnique({
          where: { id: rootBusinessId },
          select: { socialFacebookPage: true },
        }),
        db.socialFacebookPage.findUnique({
          where: { facebookPageId: page.id },
          select: {
            rootBusinessId: true,
          },
        }),
      ]);
      if (!checkBusiness)
        return {
          success: false,
          message: "Business tidak ditemukan",
          from,
        };

      if (
        checkFacebookPage &&
        checkFacebookPage.rootBusinessId &&
        checkFacebookPage.rootBusinessId !== rootBusinessId
      )
        return {
          success: false,
          message: "Facebook Page sudah terhubung ke business lain",
          from,
        };

      await db.rootBusiness.update({
        where: { id: rootBusinessId },
        data: {
          socialFacebookPage: {
            connectOrCreate: {
              where: { facebookPageId: page.id },
              create: {
                facebookPageId: page.id,
                name: page.name,
                picture: uploadPictureUrl || null,
                accessToken: page.access_token,
                tokenExpiredAt: new Date(
                  Date.now() + (t2?.data?.expires_in || 60) * 1000
                ),
                deletedAt: null,
              },
            },
            upsert: {
              update: {
                facebookPageId: page.id,
                name: page.name,
                picture: uploadPictureUrl || null,
                accessToken: page.access_token,
                deletedAt: null,
              },
              create: {
                facebookPageId: page.id,
                name: page.name,
                picture: uploadPictureUrl || null,
                accessToken: page.access_token,
                deletedAt: null,
              },
            },
          },
        },
      });

      return {
        from,
        rootBusinessId,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        postmaticAccessToken,
        success: true,
      };
    } catch (error) {
      this.handleError("FacebookPageService.callback", error);
    }
  }

  /* ======================== Helpers ======================== */

  private async getSocial(rootBusinessId: string) {
    try {
      const social = await db.socialFacebookPage.findUnique({
        where: { rootBusinessId },
        select: {
          facebookPageId: true,
          name: true,
          accessToken: true,
        },
      });
      if (!social) return "Akun Facebook Page belum terhubung.";
      if (!social.accessToken)
        return "Token Facebook Page tidak tersedia. Silakan hubungkan ulang.";
      return social;
    } catch (error) {
      this.handleError("FacebookPageService.getSocial", error);
    }
  }

  /* ======================== Post ======================== */

  /**
   * Posting ke Page:
   * - Jika 1 gambar: POST /{pageId}/photos (published=true, caption=message)
   * - Jika >1 gambar: upload unpublished photos → kumpulkan media_fbid → POST /{pageId}/feed dengan attached_media
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
      if (!social) return "Akun Facebook Page tidak ditemukan.";

      const pageId = social.facebookPageId;
      const pageToken = social.accessToken;
      const finalCaption = caption || draft.caption || "";

      // Single image → /photos (published)
      if (draft.images.length === 1) {
        console.log("======================FUFUFAFA=======================");

        const photo = await axios.post(`${this.BASE}/${pageId}/photos`, null, {
          params: {
            url: draft.images[0],
            caption: finalCaption,
            published: true,
            access_token: pageToken,
          },
        });

        console.log("======================FUFUFAFA2=======================");
        // ambil permalink dari post_id
        const postId = photo.data?.post_id || photo.data?.id;
        const permalink = await axios.get(`${this.BASE}/${postId}`, {
          params: { fields: "permalink_url", access_token: pageToken },
        });
        console.log("======================FUFUFAFA3=======================");
        const payload: FbPostReturn = {
          id: String(postId),
          url: String(permalink.data?.permalink_url || ""),
          caption: finalCaption,
          images: draft.images,
          platform: "facebook_page",
          generatedImageContentId: data.generatedImageContentId,
        };
        console.log("======================FUFUFAFA4=======================");
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
        console.log("======================FUFUFAFA5=======================");
        return payload;
      }

      // Multi image → upload unpublished photos → attached_media[] → /feed
      const mediaFbids: string[] = [];
      for (const img of draft.images) {
        const r = await axios.post(`${this.BASE}/${pageId}/photos`, null, {
          params: {
            url: img,
            published: false,
            access_token: pageToken,
          },
        });
        mediaFbids.push(r.data?.id);
      }

      // Build params dengan attached_media[index]={"media_fbid":"ID"}
      const feedParams: Record<string, any> = {
        message: finalCaption,
        access_token: pageToken,
      };
      mediaFbids.forEach((id, idx) => {
        feedParams[`attached_media[${idx}]`] = JSON.stringify({
          media_fbid: id,
        });
      });

      const feedPost = await axios.post(`${this.BASE}/${pageId}/feed`, null, {
        params: feedParams,
      });

      const feedPermalink = await axios.get(
        `${this.BASE}/${feedPost.data?.id}`,
        { params: { fields: "permalink_url", access_token: pageToken } }
      );

      const payload: FbPostReturn = {
        id: String(feedPost.data?.id),
        url: String(feedPermalink.data?.permalink_url || ""),
        caption: finalCaption,
        images: draft.images,
        platform: "facebook_page",
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
    } catch (error) {
      this.handleError("FacebookPageService.post", error);
    }
  }

  private async getPagePictureUrl(
    pageId: string,
    pageAccessToken: string
  ): Promise<string | undefined> {
    // ukuran bebas, contoh 256x256; Facebook akan menjaga aspect ratio di sisi mereka
    const resp = await axios.get(`${this.BASE}/${pageId}/picture`, {
      params: {
        redirect: false,
        height: 256,
        width: 256,
        access_token: pageAccessToken,
      },
    });
    // bentuk respons: { data: { height, width, is_silhouette, url } }
    return resp.data?.data?.url as string | undefined;
  }
}
