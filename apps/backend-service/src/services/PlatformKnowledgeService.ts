import { BaseService } from "./BaseService";
import db from "../config/db";
import { PlatformDTO } from "../validators/PlatformValidator";
import { BACKEND_URL } from "../constant";
import { SocialPlatform } from "@prisma/client";
import { POSTMATIC_ACCESS_TOKEN_KEY } from "../constant/key";

export class PlatformKnowledgeService extends BaseService {
  async getPlatforms() {
    const platforms = await db.appSocialPlatform.findMany();
    const availablePlatforms = platforms.filter(
      (platform) => platform.isActive
    );
    const unavailablePlatforms = platforms.filter(
      (platform) => !platform.isActive
    );
    return { availablePlatforms, unavailablePlatforms };
  }

  // string manipulation transform "linked_in" to "socialLinkedIn"
  transformPlatform = (platform: string) => {
    const splitted = platform.split("_");
    return (
      "social" +
      splitted
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    );
  };

  getDisconnectUrl = ({
    platform,
    rootBusinessId,
  }: {
    platform: SocialPlatform;
    rootBusinessId: string;
  }) => {
    return `${BACKEND_URL}/api/knowledge/platform/${rootBusinessId}/${platform}`;
  };

  getConnectUrl = ({
    platform,
    rootBusinessId,
    postmaticAccessToken,
    from,
  }: {
    platform: SocialPlatform;
    rootBusinessId: string;
    postmaticAccessToken: string;
    from?: string;
  }) => {
    return `${BACKEND_URL}/api/auth/oauth/${platform}/${rootBusinessId}?${POSTMATIC_ACCESS_TOKEN_KEY}=${postmaticAccessToken}&from=${from}`;
  };

  async getConnected(
    rootBusinessId: string,
    postmaticAccessToken: string,
    from: string
  ) {
    try {
      const business = await db.rootBusiness.findUnique({
        where: {
          id: rootBusinessId,
        },
        select: {
          socialLinkedIn: {
            select: {
              name: true,
              picture: true,
            },
          },
          socialFacebookPage: {
            select: {
              name: true,
              picture: true,
            },
          },
          socialInstagramBusiness: {
            select: {
              name: true,
              picture: true,
            },
          },
        },
      });

      if (!business) return null;

      const result: PlatformResult[] = [];

      const { availablePlatforms, unavailablePlatforms } =
        await this.getPlatforms();

      unavailablePlatforms.forEach((platform) => {
        result.push({
          name: platform.name,
          platform: platform.platform,
          image: platform.logo,
          status: "unavailable",
          accountDisplayName: null,
          accountDisplayImage: null,
          connectUrl: null,
          disconnectUrl: null,
        });
      });

      availablePlatforms.forEach((platform) => {
        result.push({
          name: platform.name,
          platform: platform.platform,
          image: platform.logo,
          status: "unconnected",
          accountDisplayName: null,
          accountDisplayImage: null,
          connectUrl: this.getConnectUrl({
            platform: platform.platform,
            rootBusinessId,
            postmaticAccessToken,
            from,
          }),
          disconnectUrl: null,
        });
      });

      for (const availPlatform of availablePlatforms) {
        const socialPlatform = this.transformPlatform(availPlatform.platform);
        const socialPlatformInstance =
          business[socialPlatform as keyof typeof business];
        if (socialPlatformInstance) {
          const platformResult = result.find(
            (p) => p.platform === availPlatform.platform
          );
          if (platformResult) {
            platformResult.status = "connected";
            platformResult.accountDisplayName = socialPlatformInstance.name;
            platformResult.accountDisplayImage = socialPlatformInstance.picture;
            platformResult.disconnectUrl = this.getDisconnectUrl({
              platform: availPlatform.platform,
              rootBusinessId,
            });
          }
        }
      }

      return result;
    } catch (err) {
      this.handleError("PlatformKnowledgeService.getConnected", err);
    }
  }

  async disconnect(rootBusinessId: string, data: PlatformDTO) {
    try {
      let check = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: {
          socialLinkedIn: true,
          socialFacebookPage: true,
          socialInstagramBusiness: true,
          deletedAt: true,
        },
      });

      if (!check || check.deletedAt) {
        return null;
      }

      const { unavailablePlatforms } = await this.getPlatforms();

      if (
        unavailablePlatforms.find((platform) => platform.name === data.platform)
      ) {
        return "Platform sedang tidak tersedia";
      }

      if (data.platform === "linked_in") {
        if (!check?.socialLinkedIn?.id)
          return "Linkedin account tidak terhubung";
        await db.socialLinkedIn.update({
          where: { id: check.socialLinkedIn.id },
          data: {
            rootBusinessId: null,
          },
        });
      }

      if (data.platform === "facebook_page") {
        if (!check?.socialFacebookPage?.id)
          return "Facebook page account tidak terhubung";
        await db.socialFacebookPage.update({
          where: { id: check.socialFacebookPage.id },
          data: {
            rootBusinessId: null,
          },
        });
      }

      if (data.platform === "instagram_business") {
        if (!check?.socialInstagramBusiness?.id)
          return "Instagram business account tidak terhubung";
        await db.socialInstagramBusiness.update({
          where: { id: check.socialInstagramBusiness.id },
          data: {
            rootBusinessId: null,
          },
        });
      }

      return check;
    } catch (err) {
      this.handleError("PlatformKnowledgeService.disconnect", err);
    }
  }
}

interface PlatformResult {
  name: string;
  platform: SocialPlatform;
  image: string;
  status: PlatformStatus;
  accountDisplayName: string | null;
  accountDisplayImage: string | null;
  connectUrl: string | null;
  disconnectUrl: string | null;
}

type PlatformStatus = "unavailable" | "unconnected" | "connected";
