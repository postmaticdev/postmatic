import { BaseService } from "./BaseService";
import db from "../config/db";
import { RootBusinessDTO } from "../validators/RootBusinessValidator";
import { cachedOwnedBusinesses } from "../config/cache";
import { FilterQueryType } from "../middleware/use-filter";

export class BusinessService extends BaseService {
  async getOwnBusinesses(profileId: string, filter: FilterQueryType) {
    try {
      const [businesses, totalData] = await Promise.all([
        db.rootBusiness.findMany({
          where: {
            AND: [
              {
                members: {
                  some: {
                    profileId,
                  },
                },
              },
              {
                deletedAt: null,
              },
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            members: {
              select: {
                status: true,
                role: true,
                profile: {
                  select: {
                    name: true,
                    email: true,
                    image: true,
                    id: true,
                  },
                },
              },
              where: {
                status: "Accepted",
              },
            },
          },
          orderBy: {
            [filter.sortBy]: filter.sort,
          },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.rootBusiness.count({
          where: {
            AND: [
              {
                members: {
                  some: {
                    profileId,
                  },
                },
              },
              {
                deletedAt: null,
              },
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
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

      for (const business of businesses) {
        const userPosition = business.members.find(
          (member) => member?.profile?.id === profileId
        );
        if (!userPosition) {
          this.handleError(
            "getOwnBusinesses",
            new Error("User not found in business")
          );
        } else {
          business["userPosition"] = {
            ...userPosition,
          };
        }
      }

      return {
        data: businesses,
        pagination,
      };
    } catch (err) {
      this.handleError("getOwnBusinesses", err);
    }
  }

  async getDetailBusiness(id: string, profileId: string) {
    try {
      const business = await db.rootBusiness.findUnique({
        where: { id },
        include: {
          members: {
            select: {
              id: true,
              profileId: true,
              status: true,
              role: true,
              answeredAt: true,
            },
          },
          businessKnowledge: {
            select: {
              id: true,
            },
          },
          productKnowledges: {
            select: {
              id: true,
            },
            take: 1,
          },
          roleKnowledge: {
            select: {
              id: true,
            },
          },
          rssKnowledges: {
            select: {
              id: true,
            },
            take: 1,
          },
          socialLinkedIn: {
            select: {
              id: true,
            },
          },
          schedulerTimeZone: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!business || business.deletedAt) {
        return null;
      }

      const userPosition = business.members.find(
        (member) => member?.profileId === profileId
      );
      if (!userPosition) return null;

      const returnData = {
        id: business.id,
        name: business.name,
        description: business.description,
        logo: business.logo,
        members: business.members,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
        information: {
          knowledge: {
            business: business.businessKnowledge ? true : false,
            product: business.productKnowledges.length > 0 ? true : false,
            role: business.roleKnowledge ? true : false,
            rss: business.rssKnowledges.length > 0 ? true : false,
          },
          social: {
            linkedIn: business.socialLinkedIn ? true : false,
          },
          scheduler: {
            timeZone: business.schedulerTimeZone ? true : false,
          },
        },
        userPosition: userPosition,
      };

      return returnData;
    } catch (err) {
      this.handleError("getDetailBusiness", err);
    }
  }

  async createBusiness(data: RootBusinessDTO, profileId: string) {
    try {
      const business = await db.rootBusiness.create({
        data: {
          name: data.businessKnowledge.name,
          description: data.businessKnowledge.description,
          logo: data.businessKnowledge.primaryLogo,
          members: {
            create: {
              profileId,
              role: "Owner",
              status: "Accepted",
              answeredAt: new Date(),
            },
          },
          businessKnowledge: {
            create: {
              name: data.businessKnowledge.name,
              category: data.businessKnowledge.category,
              description: data.businessKnowledge.description || "",
              uniqueSellingPoint: data.businessKnowledge.uniqueSellingPoint,
              website: data.businessKnowledge.website,
              visionMission: data.businessKnowledge.visionMission,
              location: data.businessKnowledge.location,
              primaryLogo: data.businessKnowledge.primaryLogo || "",
            },
          },
          productKnowledges: {
            create: {
              name: data.productKnowledge.name,
              category: data.productKnowledge.category,
              description: data.productKnowledge.description,
              currency: data.productKnowledge.currency,
              price: data.productKnowledge.price,
              images: data.productKnowledge.images,
              composition: data.productKnowledge.composition,
            },
          },
          roleKnowledge: {
            create: {
              targetAudience: data.roleKnowledge.targetAudience,
              tone: data.roleKnowledge.tone,
              audiencePersona: data.roleKnowledge.audiencePersona,
              hashtags: data.roleKnowledge.hashtags,
              callToAction: data.roleKnowledge.callToAction,
              goals: data.roleKnowledge.goals,
            },
          },
        },
      });
      cachedOwnedBusinesses.delete(profileId);
      return business;
    } catch (err) {
      this.handleError("createBusiness", err);
    }
  }

  /**
   * DEPRECATED
   */
  async editBusiness(
    data: RootBusinessDTO,
    profileId: string,
    rootBusinessId: string
  ) {
    try {
      const check = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: {
          members: {
            select: {
              profileId: true,
              role: true,
            },
          },
        },
      });
      if (!check) {
        return null;
      }
      const isOwner = check.members.find(
        (member) => member.profileId === profileId && member.role === "Owner"
      );
      if (!isOwner) {
        return null;
      }
      const business = await db.rootBusiness.update({
        where: { id: rootBusinessId },
        data: {
          name: data.businessKnowledge.name,
          description: data.businessKnowledge.description,
          logo: data.businessKnowledge.primaryLogo,
        },
      });
      cachedOwnedBusinesses.delete(profileId);
      for (const member of check.members) {
        cachedOwnedBusinesses.delete(member.profileId);
      }
      return business;
    } catch (err) {
      this.handleError("createBusiness", err);
    }
  }

  async deleteBusiness(id: string, profileId: string) {
    try {
      const check = await db.rootBusiness.findUnique({
        where: { id },
        select: {
          members: {
            select: {
              profileId: true,
              role: true,
            },
          },
        },
      });
      if (!check) {
        return null;
      }
      const isOwner = check.members.find(
        (member) => member.profileId === profileId && member.role === "Owner"
      );
      if (!isOwner) {
        return null;
      }
      const business = await db.rootBusiness.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
      for (const member of check.members) {
        cachedOwnedBusinesses.delete(member.profileId);
      }
      return business;
    } catch (err) {
      this.handleError("deleteBusiness", err);
    }
  }
}
