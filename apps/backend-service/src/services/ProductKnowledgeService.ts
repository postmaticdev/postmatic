import { BaseService } from "./BaseService";
import db from "../config/db";
import { ProductKnowledgeDTO } from "../validators/ProductKnowledgeValidator";
import { FilterQueryType } from "src/middleware/use-filter";

export class ProductKnowledgeService extends BaseService {
  async getAllProductKnowledges(
    rootBusinessId: string,
    filter: FilterQueryType
  ) {
    try {
      const [data, totalData] = await Promise.all([
        db.productKnowledge.findMany({
          where: {
            AND: [
              { rootBusinessId: rootBusinessId },
              { deletedAt: null },
              {
                name: { contains: filter.search, mode: "insensitive" },
              },
            ],
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.productKnowledge.count({
          where: {
            AND: [
              { rootBusinessId: rootBusinessId },
              { deletedAt: null },
              {
                name: { contains: filter.search, mode: "insensitive" },
              },
            ],
          },
        }),
      ]);
      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });
      return {
        data,
        pagination,
      };
    } catch (err) {
      this.handleError("getAllProductKnowledges", err);
    }
  }

  async getStatusProductKnowledge(
    rootBusinessId: string,
    productKnowledgeId: string
  ) {
    try {
      const business = await db.rootBusiness.findUnique({
        where: {
          id: rootBusinessId,
        },
        select: {
          businessKnowledge: {
            select: {
              name: true,
              category: true,
              description: true,
              primaryLogo: true,
              secondaryLogo: true,
              location: true,
              uniqueSellingPoint: true,
              website: true,
              visionMission: true,
            },
          },
          productKnowledges: {
            where: {
              id: productKnowledgeId,
            },
            take: 1,
            select: {
              name: true,
              category: true,
              description: true,
              price: true,
              benefit: true,
              allergen: true,
              composition: true,
            },
          },
          roleKnowledge: {
            select: {
              hashtags: true,
            },
          },
        },
      });

      if (!business) return null;
      if (!business.productKnowledges[0]) return null;

      const returnData = {
        businessKnowledge: {
          name: !!business?.businessKnowledge?.name,
          category: !!business?.businessKnowledge?.category,
          description: !!business?.businessKnowledge?.description,
          location: !!business?.businessKnowledge?.location,
          logo: {
            primaryLogo: !!business?.businessKnowledge?.primaryLogo,
            secondaryLogo: !!business?.businessKnowledge?.secondaryLogo,
          },
          uniqueSellingPoint: !!business?.businessKnowledge?.uniqueSellingPoint,
          website: !!business?.businessKnowledge?.website,
          visionMission: !!business?.businessKnowledge?.visionMission,
        },
        productKnowledge: {
          name: !!business?.productKnowledges[0]?.name,
          category: !!business?.productKnowledges[0]?.category,
          description: !!business?.productKnowledges[0]?.description,
          price: !!business?.productKnowledges[0]?.price,
          benefit: !!business?.productKnowledges[0]?.benefit,
          allergen: !!business?.productKnowledges[0]?.allergen,
          composition: !!business?.productKnowledges[0]?.composition,
        },
        roleKnowledge: {
          hashtags: (business?.roleKnowledge?.hashtags?.length || 0) > 0,
        },
      };
      return returnData;
    } catch (error) {
      this.handleError(
        "ProductKnowledgeService.getStatusProductKnowledge",
        error
      );
    }
  }

  async createNewProductKnowledge(
    data: ProductKnowledgeDTO,
    rootBusinessId: string
  ) {
    try {
      const [product, _] = await Promise.all([
        db.productKnowledge.create({
          data: {
            category: data.category,
            description: data.description,
            images: data.images,
            name: data.name,
            price: data.price,
            currency: data.currency,
            benefit: data.benefit,
            allergen: data.allergen,
            rootBusinessId,
          },
        }),
        db.rootBusiness.update({
          where: { id: rootBusinessId },
          data: { updatedAt: new Date() },
        }),
      ]);
      return product;
    } catch (err) {
      this.handleError("createNewProductKnowledge", err);
    }
  }

  async editProductKnowledge(data: ProductKnowledgeDTO, id: string) {
    try {
      const check = await db.productKnowledge.findUnique({
        where: { id },
        select: { deletedAt: true },
      });
      if (!check || check.deletedAt) return null;
      const product = await db.productKnowledge.update({
        where: { id },
        data: {
          category: data.category,
          description: data.description,
          images: data.images,
          name: data.name,
          price: data.price,
          currency: data.currency,
          benefit: data.benefit,
          allergen: data.allergen,
          rootBusinesses: {
            update: {
              updatedAt: new Date(),
            },
          },
        },
      });
      return product;
    } catch (err) {
      this.handleError("editProductKnowledge", err);
    }
  }

  async deleteProductKnowledge(id: string) {
    try {
      const check = await db.productKnowledge.findUnique({
        where: { id: id },
        select: { deletedAt: true },
      });
      if (!check || check.deletedAt) return null;
      const product = await db.productKnowledge.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
          rootBusinesses: { update: { updatedAt: new Date() } },
        },
      });
      return product;
    } catch (err) {
      this.handleError("deleteProductKnowledge", err);
    }
  }
}
