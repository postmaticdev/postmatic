import { BaseService } from "./BaseService";
import crypto from "crypto";
import {
  JWT_SECRET,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_REDIRECT_URI,
} from "../constant/auth";
import axios from "axios";
import jwt from "jsonwebtoken";
import db from "../config/db";
import { PostDTO } from "../validators/PostValidator";
import { SocialPlatform } from "@prisma/client";
import { z } from "zod";

const LinkedInCode = z.object({
  linkedInId: z.string(),
  authorUrn: z.string(),
  accessToken: z.string(),
  name: z.string(),
  picture: z.string().nullable(),
  scopes: z.string(),
  tokenExpiredAt: z.coerce.date(),
  rootBusinessId: z.string(),
  from: z.string(),
  postmaticAccessToken: z.string(),
});

type LinkedInCode = z.infer<typeof LinkedInCode>;

interface LinkedInAccessToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface LinkedInDecoded {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class LinkedInService extends BaseService {
  private baseUrlShare = "https://www.linkedin.com/feed/update/";

  async oauth(
    from?: string,
    rootBusinessId?: string,
    postmaticAccessToken?: string
  ) {
    try {
      const scope = "w_member_social openid profile";
      const stateObj = {
        csrf: crypto.randomBytes(16).toString("hex"),
        from: from || "/",
        rootBusinessId: rootBusinessId || "",
        postmaticAccessToken: postmaticAccessToken || "",
      };
      const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        LINKEDIN_REDIRECT_URI
      )}&scope=${encodeURIComponent(scope)}&state=${state}`;
      return {
        state,
        authUrl,
      };
    } catch (error) {
      this.handleError("LinkedInService.oauth", error);
    }
  }

  async callback(
    code: string,
    stateFromLinkedIn: string,
    sessionState: string
  ) {
    try {
      let from = "/";
      if (!stateFromLinkedIn || stateFromLinkedIn !== sessionState) {
        return {
          success: false,
          message: "State tidak valid",
          from,
        };
      }

      // Decode state
      let rootBusinessId = "";
      let postmaticAccessToken = "";
      try {
        const stateObj = JSON.parse(
          Buffer.from(stateFromLinkedIn, "base64").toString()
        );
        from = stateObj.from || "/";
        rootBusinessId = stateObj.rootBusinessId || "";
        postmaticAccessToken = stateObj.postmaticAccessToken || "";
      } catch (e) {
        // Fallback: tetap /, ""
      }

      const response = await this.getAccessToken(code);
      if (!response) {
        console.log(
          "=========== CALLBACK LINKEDIN ERROR [no response] ==========="
        );
        console.log("response", response);
        console.log("code", code);
        console.log("stateFromLinkedIn", stateFromLinkedIn);
        console.log("sessionState", sessionState);
        console.log("================================================");
        return {
          success: false,
          message: "Token tidak valid",
          from,
          isLinked: false,
        };
      }
      const accessToken = response.access_token;
      const idToken = response.id_token;
      if (!accessToken || !idToken) {
        console.log(
          "=========== CALLBACK LINKEDIN ERROR [no accessToken or idToken] ==========="
        );
        console.log("response", response);
        console.log("code", code);
        console.log("stateFromLinkedIn", stateFromLinkedIn);
        console.log("sessionState", sessionState);
        console.log("================================================");
        return {
          success: false,
          message: "Token tidak valid",
          from,
          isLinked: false,
        };
      }

      const decoded = jwt.decode(idToken) as LinkedInDecoded;
      if (!decoded.sub || !decoded.name || !decoded.picture || !decoded.exp) {
        console.log(
          "=========== CALLBACK LINKEDIN ERROR [no decoded.sub or decoded.name or decoded.picture or decoded.exp] ==========="
        );
        console.log("response", response);
        console.log("code", code);
        console.log("stateFromLinkedIn", stateFromLinkedIn);
        console.log("sessionState", sessionState);
        console.log("decoded", decoded);
        console.log("idToken", idToken);
        console.log("accessToken", accessToken);
        console.log("================================================");
        return {
          success: false,
          message: "Token tidak valid",
          from,
          isLinked: false,
        };
      }
      const authorUrn = `urn:li:person:${decoded.sub}`;

      const [checkBusiness, checkIsLinkedAlready] = await Promise.all([
        db.rootBusiness.findUnique({
          where: {
            id: rootBusinessId,
          },
          select: {
            name: true,
            socialLinkedIn: true,
          },
        }),
        db.socialLinkedIn.findUnique({
          where: {
            linkedInId: decoded?.sub || "",
          },
          select: {
            rootBusinessId: true,
            rootBusiness: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      if (!checkBusiness) {
        return {
          success: false,
          message: "Business tidak ditemukan",
          from,
          isLinked: false,
        };
      }

      const payloadCode: LinkedInCode = {
        linkedInId: decoded?.sub || "",
        authorUrn,
        accessToken,
        name: decoded?.name || "",
        picture: decoded?.picture || null,
        scopes: response?.scope || "",
        tokenExpiredAt: new Date(decoded.exp * 1000),
        rootBusinessId,
        from,
        postmaticAccessToken,
      };

      const createCode = jwt.sign(payloadCode, JWT_SECRET, {
        expiresIn: "5m",
      });

      if (
        checkIsLinkedAlready &&
        checkIsLinkedAlready.rootBusinessId &&
        checkIsLinkedAlready.rootBusinessId !== rootBusinessId
      ) {
        return {
          success: true,
          message: "Akun LinkedIn sudah terhubung ke business lain",
          from,
          isLinked: true,
          code: createCode,
          oldBusinessName: checkIsLinkedAlready.rootBusiness?.name,
          newBusinessName: checkBusiness.name,
        };
      }

      await db.rootBusiness.update({
        where: {
          id: rootBusinessId,
        },
        data: {
          socialLinkedIn: {
            connectOrCreate: {
              where: {
                linkedInId: decoded?.sub || "",
              },
              create: {
                linkedInId: decoded?.sub || "",
                authorUrn,
                accessToken,
                name: decoded?.name || "",
                picture: decoded?.picture || null,
                scopes: response?.scope || "",
                tokenExpiredAt: new Date(decoded.exp * 1000),
                deletedAt: null,
              },
            },
            upsert: {
              update: {
                linkedInId: decoded?.sub || "",
                authorUrn,
                accessToken,
                name: decoded?.name || "",
                picture: decoded?.picture || null,
                scopes: response?.scope || "",
                tokenExpiredAt: new Date(decoded.exp * 1000),
                deletedAt: null,
              },
              create: {
                linkedInId: decoded?.sub || "",
                authorUrn,
                accessToken,
                name: decoded?.name || "",
                picture: decoded?.picture || null,
                scopes: response?.scope || "",
                tokenExpiredAt: new Date(decoded.exp * 1000),
                deletedAt: null,
              },
            },
          },
        },
      });

      return {
        success: true,
        accessToken,
        authorUrn,
        postmaticAccessToken,
        decoded,
        from,
        rootBusinessId,
        isLinked: false,
        code: createCode,
      };
    } catch (error) {
      this.handleError("LinkedInService.callback", error);
    }
  }

  async fallbackBusinessExists(data: { code: string }) {
    try {
      const decoded = jwt.decode(data?.code);
      const parsedData = LinkedInCode.parse(decoded);
      await db.rootBusiness.update({
        where: {
          id: parsedData?.rootBusinessId,
        },
        data: {
          socialLinkedIn: {
            connectOrCreate: {
              where: {
                linkedInId: parsedData?.linkedInId,
              },
              create: {
                linkedInId: parsedData?.linkedInId,
                authorUrn: parsedData?.authorUrn,
                accessToken: parsedData?.accessToken,
                name: parsedData?.name,
                picture: parsedData?.picture || null,
                scopes: parsedData?.scopes || "",
                tokenExpiredAt: new Date(
                  parsedData?.tokenExpiredAt?.getTime() || 0
                ),
                deletedAt: null,
              },
            },
            upsert: {
              update: {
                linkedInId: parsedData?.linkedInId,
                authorUrn: parsedData?.authorUrn,
                accessToken: parsedData?.accessToken,
                name: parsedData?.name,
                picture: parsedData?.picture || null,
                scopes: parsedData?.scopes || "",
                tokenExpiredAt: new Date(
                  parsedData?.tokenExpiredAt?.getTime() || 0
                ),
                deletedAt: null,
              },
              create: {
                linkedInId: parsedData?.linkedInId,
                authorUrn: parsedData?.authorUrn,
                accessToken: parsedData?.accessToken || "",
                name: parsedData?.name,
                picture: parsedData?.picture || null,
                scopes: parsedData?.scopes || "",
                tokenExpiredAt: new Date(
                  parsedData?.tokenExpiredAt?.getTime() || 0
                ),
                deletedAt: null,
              },
            },
          },
        },
      });
      return {
        success: true,
        message: "Berhasil menghubungkan akun LinkedIn",
        from: parsedData?.from || "/",
        postmaticAccessToken: parsedData?.postmaticAccessToken || "",
        rootBusinessId: parsedData?.rootBusinessId || "",
      };
    } catch (error) {
      this.handleError("LinkedInService.fallbackCallback", error);
      return {
        success: false,
        message: "Token tidak valid",
      };
    }
  }

  private async getAccessToken(code: string) {
    try {
      const response = await axios.post<LinkedInAccessToken>(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: LINKEDIN_REDIRECT_URI,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError("LinkedInService.getAccessToken", error);
    }
  }

  async checkSocial(rootBusinessId: string) {
    try {
      const social = await db.socialLinkedIn.findUnique({
        where: { rootBusinessId },
        select: { linkedInId: true, authorUrn: true, accessToken: true },
      });
      if (!social) return "Akun LinkedIn tidak ditemukan atau belum terhubung.";
      return social;
    } catch (error) {
      this.handleError("LinkedInService.checkSocial", error);
    }
  }

  async post(rootBusinessId: string, data: PostDTO, caption?: string | null) {
    try {
      const [social, checkPost] = await Promise.all([
        this.checkSocial(rootBusinessId),
        db.generatedImageContent.findUnique({
          where: {
            id: data.generatedImageContentId,
          },
          select: {
            deletedAt: true,
            caption: true,
            images: true,
          },
        }),
      ]);

      let finalCaption = caption || checkPost?.caption || "";

      if (typeof social === "string") {
        return social;
      }
      if (!checkPost) {
        return "Draft tidak ditemukan";
      }
      if (checkPost?.deletedAt) {
        return "Draft sudah dihapus";
      }
      if (!checkPost?.images?.length) {
        return "Gambar tidak ditemukan";
      }
      if (!finalCaption) {
        return "Caption tidak ditemukan";
      }
      if (!social) return "Akun LinkedIn tidak ditemukan atau belum terhubung.";

      // 1. Upload SEMUA images ke LinkedIn
      const mediaAssets: string[] = [];

      for (const imageUrl of checkPost.images) {
        // 1a. Register upload untuk tiap gambar
        const registerRes = await axios.post(
          "https://api.linkedin.com/v2/assets?action=registerUpload",
          {
            registerUploadRequest: {
              owner: social.authorUrn,
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              serviceRelationships: [
                {
                  identifier: "urn:li:userGeneratedContent",
                  relationshipType: "OWNER",
                },
              ],
              supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${social.accessToken}`,
              "X-Restli-Protocol-Version": "2.0.0",
              "Content-Type": "application/json",
            },
          }
        );
        const asset = registerRes.data.value.asset;
        const uploadUrl =
          registerRes.data.value.uploadMechanism[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
          ].uploadUrl;

        // 1b. Download image dari URL
        const imageRes = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });

        // 1c. Upload ke LinkedIn
        await axios.put(uploadUrl, imageRes.data, {
          headers: {
            Authorization: `Bearer ${social.accessToken}`,
            "Content-Type": "image/jpeg", // Ganti jika file bukan jpg
          },
        });

        // 1d. Simpan asset URN
        mediaAssets.push(asset);
      }

      // 2. Siapkan array media untuk payload post
      const mediaArr = mediaAssets.map((asset, idx) => ({
        status: "READY",
        description: { text: finalCaption || "" },
        media: asset,
        title: { text: `Image ${idx + 1}` },
      }));

      // 3. Payload post ke LinkedIn
      const postData = {
        author: social.authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: finalCaption },
            shareMediaCategory: "IMAGE", // Untuk multiple, LinkedIn sekarang support multi image (max 9), gunakan "IMAGE"
            media: mediaArr,
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      // 4. POST ke LinkedIn UGC API
      const postRes = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postData,
        {
          headers: {
            Authorization: `Bearer ${social.accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
          },
        }
      );

      const returnData = {
        id: postRes.data.id,
        url: this.baseUrlShare + `${postRes.data.id}`,
        caption: finalCaption,
        images: checkPost.images,
        platform: SocialPlatform.linked_in,
        generatedImageContentId: data.generatedImageContentId,
      };

      await db.postedImageContent.create({
        data: {
          postId: returnData.id,
          platform: returnData.platform,
          url: returnData.url,
          caption: returnData.caption,
          images: returnData.images,
          generatedImageContentId: returnData.generatedImageContentId,
          rootBusinessId,
        },
      });

      return returnData;
    } catch (error) {
      this.handleError("LinkedinService.post", error);
    }
  }
}
