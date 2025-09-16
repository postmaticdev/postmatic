import { BusinessKnowledgeDTO } from "../validators/BusinessKnowledgeValidator";
import { BaseService } from "./BaseService";
import db from "../config/db";
import { BusinessKnowledge } from ".prisma/client";

export class BusinessKnowledgeService extends BaseService {
  async getBusinessKnowledge(rootBusinessId: string) {
    try {
      const data = await db.businessKnowledge.findUnique({
        where: { rootBusinessId },
      });
      return {
        id: data?.id || "CURRENTLY_NOT_CREATED",
        primaryLogo: data?.primaryLogo || "",
        secondaryLogo: data?.secondaryLogo || "",
        name: data?.name || "",
        category: data?.category || "",
        description: data?.description || "",
        uniqueSellingPoint: data?.uniqueSellingPoint || "",
        website: data?.website || "",
        visionMission: data?.visionMission || "",
        location: data?.location || "",
        rootBusinessId: data?.rootBusinessId || "",
        deletedAt: data?.deletedAt || null,
        createdAt: data?.createdAt || null,
        updatedAt: data?.updatedAt || null,
      };
    } catch (err) {
      this.handleError("getBusinessKnowledge", err);
    }
  }

  async upsertBusinessKnowledge(
    data: BusinessKnowledgeDTO,
    rootBusinessId: string
  ) {
    try {
      const [business, _] = await Promise.all([
        db.businessKnowledge.upsert({
          where: { rootBusinessId: rootBusinessId },
          update: data,
          create: {
            category: data.category,
            description: data.description,
            location: data.location,
            name: data.name,
            rootBusinessId: rootBusinessId,
            uniqueSellingPoint: data.uniqueSellingPoint,
            website: data.website,
            visionMission: data.visionMission,
            primaryLogo: data.primaryLogo,
            secondaryLogo: data.secondaryLogo,
          },
        }),
        db.rootBusiness.update({
          where: { id: rootBusinessId },
          data: {
            updatedAt: new Date(),
            logo: data.primaryLogo,
            name: data.name,
          },
        }),
      ]);
      return business;
    } catch (err) {
      this.handleError("upsertBusinessKnowledge", err);
    }
  }
}
