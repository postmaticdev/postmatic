import { BaseService } from "../BaseService";
import db from "../../config/db";
import {
  ImageContentEditDTO,
  ImageContentSaveDTO,
} from "../../validators/ImageContentValidator";
import { OpenAiService, ValidRatio } from "../OpenAiService";
import { CloudinaryService } from "../CloudinaryService";
import { LinkedInService } from "../LinkedInService";
import { PostDTO } from "../../validators/PostValidator";
import { TierService } from "../TierService";
import { AutoSchedulerTaskManager } from "../../cron/AutoSchedulerTaskManager";
import { ImageManipulationService } from "../ImageManipulationService";
import { FilterQueryType } from "../../middleware/use-filter";
import {
  Prisma,
  ProductKnowledge,
  RootBusiness,
  RoleKnowledge,
  BusinessKnowledge,
} from "@prisma/client";
import { FacebookPageService } from "../FacebookPageService";
import { PlatformKnowledgeService } from "../PlatformKnowledgeService";
import { InstagramBusinessService } from "../InstagramBusinessService";
import { stringManipulation } from "../../helper/string-manipulation";

export interface ImageContentServiceDeps {
  openai: OpenAiService;
  cloudinary: CloudinaryService;
  token: TierService;
  manip: ImageManipulationService;
  platformService: PlatformKnowledgeService;
  platformDeps: {
    socialLinkedIn: LinkedInService;
    socialFacebookPage: FacebookPageService;
    socialInstagramBusiness: InstagramBusinessService;
  };
}

export class ImageContentService extends BaseService {
  constructor(protected deps: ImageContentServiceDeps) {
    super();
  }

  protected async getBusinessInformation(
    rootBusinessId: string,
    productKnowledgeId: string
  ) {
    return await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        businessKnowledge: {
          select: {
            name: true,
            description: true,
            category: true,
            location: true,
            primaryLogo: true,
            secondaryLogo: true,
            uniqueSellingPoint: true,
            website: true,
            visionMission: true,
          },
        },
        productKnowledges: {
          where: {
            id: productKnowledgeId,
          },
          select: {
            name: true,
            description: true,
            category: true,
            allergen: true,
            benefit: true,
            currency: true,
            price: true,
            images: true,
            composition: true,
          },
          take: 1,
        },
        roleKnowledge: {
          select: {
            audiencePersona: true,
            callToAction: true,
            goals: true,
            hashtags: true,
            platforms: true,
            tone: true,
            targetAudience: true,
          },
        },
      },
    });
  }

  protected verifyBusinessInformation(
    business: Partial<
      RootBusiness & {
        productKnowledges: Partial<ProductKnowledge>[];
        businessKnowledge: Partial<BusinessKnowledge> | null;
        roleKnowledge: Partial<RoleKnowledge> | null;
      }
    > | null,
    token: Awaited<
      ReturnType<typeof this.deps.token.getBusinessAvailableToken>
    >,
    subscription: Awaited<
      ReturnType<typeof this.deps.token.getBusinessSubscription>
    >
  ) {
    if (token === null) return "Tidak ada data ditemukan";
    if (!business) {
      return "Business tidak ditemukan";
    }

    if (!business?.productKnowledges?.length) {
      return "Product tidak ditemukan";
    }

    if (!business?.businessKnowledge) {
      return "Business knowledge belum diatur";
    }

    if (!business?.roleKnowledge) {
      return "Role knowledge belum diatur";
    }

    if (token?.availableToken <= 0) {
      return "Token tidak mencukupi";
    }

    if (!subscription?.valid) {
      return "Subscription sudah kadaluarsa. Silakan perbarui subscription Anda.";
    }
    return true;
  }

  private whereAllPostedContents(
    rootBusinessId: string,
    filter: FilterQueryType
  ): Prisma.GeneratedImageContentWhereInput {
    return {
      AND: [
        { rootBusinessId: rootBusinessId },
        { deletedAt: null },
        {
          caption: {
            contains: filter.search,
            mode: "insensitive",
          },
          category: {
            contains: filter.category,
          },
        },
        {
          postedImageContents: {
            some: {},
          },
        },
        {
          createdAt: {
            gte: filter.dateStart ? filter.dateStart : undefined,
            lte: filter.dateEnd ? filter.dateEnd : undefined,
          },
        },
      ],
    };
  }

  async getAllPostedContents(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [generatedImageContents, totalData] = await Promise.all([
        db.generatedImageContent.findMany({
          where: this.whereAllPostedContents(rootBusinessId, filter),
          include: {
            postedImageContents: true,
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.generatedImageContent.count({
          where: this.whereAllPostedContents(rootBusinessId, filter),
        }),
      ]);

      const mappedData = generatedImageContents.map((content) => ({
        ...content,
        platforms: Array.from(
          new Set(content.postedImageContents.map((post) => post.platform))
        ),
      }));

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });
      return { data: mappedData, pagination };
    } catch (err) {
      this.handleError("getAllImageContents", err);
    }
  }

  async saveGeneratedImage(data: ImageContentSaveDTO, rootBusinessId: string) {
    try {
      const images: string[] = [];

      await Promise.all(
        data.images.map(async (image) => {
          if (image.includes("cloudinary")) {
            images.push(image);
          } else {
            const imageUrl = await this.deps.cloudinary.saveImageFromUrl(image);
            images.push(imageUrl);
          }
        })
      );

      const generatedImageContent = await db.generatedImageContent.create({
        data: {
          category: data.category,
          images: images,
          productKnowledgeId: data.productKnowledgeId,
          rootBusinessId,
          designStyle: data.designStyle,
          ratio: data.ratio,
          caption: data.caption,
          readyToPost: false,
        },
      });

      await AutoSchedulerTaskManager.instance.add(rootBusinessId);
      return generatedImageContent;
    } catch (err) {
      this.handleError("saveGeneratedImage", err);
    }
  }

  async editGeneratedContent(
    data: ImageContentEditDTO,
    generatedImageContentId: string
  ) {
    try {
      const check = await db.generatedImageContent.findUnique({
        where: {
          id: generatedImageContentId,
        },
        select: {
          deletedAt: true,
        },
      });

      if (!check || check.deletedAt) return null;

      const images: string[] = [];
      await Promise.all(
        data.images.map(async (image) => {
          if (image.includes("cloudinary")) {
            images.push(image);
          } else {
            const imageUrl = await this.deps.cloudinary.saveImageFromUrl(image);
            images.push(imageUrl);
          }
        })
      );

      const generatedImageContent = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          images: images,
          designStyle: data.designStyle,
          caption: data.caption,
          ratio: data.ratio,
          category: data.category,
        },
      });
      await AutoSchedulerTaskManager.instance.add(
        generatedImageContent.rootBusinessId
      );
      return generatedImageContent;
    } catch (err) {
      this.handleError("editGeneratedContent", err);
    }
  }

  async setReadyToPost(generatedImageContentId: string) {
    try {
      const check = await db.generatedImageContent.findUnique({
        where: { id: generatedImageContentId },
        select: { deletedAt: true, readyToPost: true },
      });
      if (!check || check.deletedAt) return null;
      const posted = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          readyToPost: !check.readyToPost,
        },
      });
      await AutoSchedulerTaskManager.instance.add(posted.rootBusinessId);
      return posted;
    } catch (err) {
      this.handleError("setReadyToPost", err);
    }
  }

  async deleteGeneratedContent(generatedImageContentId: string) {
    try {
      const check = await db.generatedImageContent.findUnique({
        where: { id: generatedImageContentId },
        select: { deletedAt: true },
      });
      if (!check || check.deletedAt) return null;
      const deleted = await db.generatedImageContent.update({
        where: { id: generatedImageContentId },
        data: {
          deletedAt: new Date(),
        },
      });
      await AutoSchedulerTaskManager.instance.add(deleted.rootBusinessId);
      return deleted;
    } catch (err) {
      this.handleError("deleteGeneratedContent", err);
    }
  }

  async directPost(data: PostDTO, rootBusinessId: string) {
    try {
      const check = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: {
          deletedAt: true,
          socialFacebookPage: {
            select: {
              id: true,
            },
          },
          socialInstagramBusiness: {
            select: {
              id: true,
            },
          },
          socialLinkedIn: {
            select: {
              id: true,
            },
          },
          generatedImageContents: {
            where: {
              id: data.generatedImageContentId,
            },
            take: 1,
            select: {
              schedulerManualPostings: true,
            },
          },
        },
      });
      if (!check || check.deletedAt) return "Business tidak ditemukan";
      if (check.generatedImageContents.length === 0) {
        return "Konten tidak ditemukan";
      }
      const { unavailablePlatforms, availablePlatforms } =
        await this.deps.platformService.getPlatforms();
      if (
        data.platforms.some((platform) =>
          unavailablePlatforms.some((p) => p.platform === platform)
        )
      ) {
        const unavailablePlatformsString = unavailablePlatforms
          .filter((p) => data.platforms.includes(p.platform))
          .map((p) => p.name)
          .join(", ");
        return `${unavailablePlatformsString} saat ini tidak didukung. Silakan coba lagi nanti.`;
      }

      const promises: Promise<string | object>[] = [];

      for (const platform of data.platforms) {
        if (!check[stringManipulation.transformPlatform(platform)]) {
          return `${stringManipulation.snakeToReadable(
            platform
          )} tidak terhubung ke bisnis`;
        }
      }

      for (const platform of data.platforms) {
        if (availablePlatforms.some((p) => p.platform === platform)) {
          promises.push(
            this?.deps?.platformDeps[
              stringManipulation.transformPlatform(platform)
            ]?.post(rootBusinessId, data, data.caption) ||
              (() => "Terjadi kesalahan")()
          );
        }
      }

      const returnData = await Promise.all(promises);
      if (returnData?.filter((item) => typeof item === "string")?.length > 0) {
        return returnData?.filter((item) => typeof item === "string")[0];
      }

      if (check?.generatedImageContents[0]?.schedulerManualPostings) {
        await db.schedulerManualPosting.delete({
          where: {
            generatedImageContentId: data.generatedImageContentId,
          },
        });
      }

      await AutoSchedulerTaskManager.instance.add(rootBusinessId);
      return returnData;
    } catch (err) {
      this.handleError("directPost", err);
    }
  }

  private whereAllDraftContents(
    rootBusinessId: string,
    filter: FilterQueryType
  ): Prisma.GeneratedImageContentWhereInput {
    return {
      AND: [
        { rootBusinessId: rootBusinessId },
        { deletedAt: null },
        { schedulerManualPostings: null },
        {
          caption: {
            contains: filter.search,
            mode: "insensitive",
          },
        },
        {
          postedImageContents: {
            none: {},
          },
        },
        {
          createdAt: {
            gte: filter.dateStart ? filter.dateStart : undefined,
            lte: filter.dateEnd ? filter.dateEnd : undefined,
          },
        },
        filter.category === "readyToPost" ? { readyToPost: true } : {},
      ],
    };
  }

  async getAllDraftContents(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [generatedImageContents, totalData] = await Promise.all([
        db.generatedImageContent.findMany({
          where: this.whereAllDraftContents(rootBusinessId, filter),
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.generatedImageContent.count({
          where: this.whereAllDraftContents(rootBusinessId, filter),
        }),
      ]);

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });

      return { data: generatedImageContents, pagination };
    } catch (err) {
      this.handleError("getAllImageContents", err);
    }
  }
}
