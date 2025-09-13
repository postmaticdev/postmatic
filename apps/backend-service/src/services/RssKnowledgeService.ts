import { BaseService } from "./BaseService";
import db from "../config/db";
import { RssKnowledgeDTO } from "../validators/RssKnowledgeValidator";
import { FilterQueryType } from "src/middleware/use-filter";

export class RssKnowledgeService extends BaseService {
  async getAllRssKnowledges(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [data, totalData] = await Promise.all([
        db.rssKnowledge.findMany({
          where: {
            AND: [
              { rootBusinessId: rootBusinessId },
              { deletedAt: null },
              {
                title: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: { [filter.sortBy]: filter.sort },
          include: {
            masterRss: {
              select: {
                title: true,
                id: true,
                publisher: true,
                masterRssCategory: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
          take: filter.limit,
          skip: filter.skip,
        }),
        db.rssKnowledge.count({
          where: {
            AND: [
              { rootBusinessId: rootBusinessId },
              { deletedAt: null },
              {
                title: {
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
      return { data, pagination };
    } catch (err) {
      this.handleError("RssKnowledgeService.getAllRssKnowledges", err);
    }
  }

  async createNewRssKnowledge(data: RssKnowledgeDTO, rootBusinessId: string) {
    try {
      const [masterRss, business] = await Promise.all([
        db.masterRss.findUnique({
          where: { id: data.masterRssId },
          select: { id: true },
        }),
        db.rootBusiness.findUnique({
          where: { id: rootBusinessId },
          select: {
            id: true,
            rssKnowledges: {
              select: { id: true, deletedAt: true },
              where: { id: data.masterRssId },
              take: 1,
            },
          },
        }),
      ]);
      if (!masterRss) return null;
      if (!business) return null;
      const isExist = business?.rssKnowledges?.find(
        (rss) => rss.id === data.masterRssId
      );
      if (isExist && !isExist.deletedAt) return "Rss already exists";
      const [rss] = await Promise.all([
        db.rssKnowledge.create({
          data: {
            isActive: data.isActive,
            title: data.title,
            masterRssId: data.masterRssId,
            rootBusinessId: rootBusinessId,
          },
        }),
        isExist && isExist.deletedAt
          ? db.rootBusiness.update({
              where: { id: data.masterRssId },
              data: {
                updatedAt: new Date(),
                rssKnowledges: {
                  update: {
                    where: {
                      id: isExist.id,
                    },
                    data: { deletedAt: null },
                  },
                },
              },
            })
          : db.rootBusiness.update({
              where: { id: rootBusinessId },
              data: { updatedAt: new Date() },
            }),
      ]);
      return rss;
    } catch (err) {
      this.handleError("RssKnowledgeService.createNewRssKnowledge", err);
    }
  }

  async editRssKnowledge(data: RssKnowledgeDTO, id: string) {
    try {
      const [checkRssKnowledge, checkMasterRss] = await Promise.all([
        db.rssKnowledge.findUnique({
          where: { id: id },
          select: {
            deletedAt: true,
            rootBusinesses: {
              select: {
                id: true,
                rssKnowledges: {
                  select: {
                    id: true,
                    deletedAt: true,
                  },
                  where: {
                    NOT: {
                      id: data.masterRssId,
                    },
                  },
                },
              },
            },
          },
        }),
        db.masterRss.findUnique({
          where: { id: data.masterRssId },
          select: { deletedAt: true },
        }),
      ]);
      if (
        !checkRssKnowledge ||
        !checkMasterRss ||
        checkRssKnowledge.deletedAt ||
        checkMasterRss.deletedAt
      ) {
        return null;
      }
      const isExist = checkRssKnowledge?.rootBusinesses?.rssKnowledges?.find(
        (rss) => rss.id === data.masterRssId
      );
      if (isExist && !isExist.deletedAt) return "Rss already exists";
      const rss = await db.rssKnowledge.update({
        where: { id: id },
        data: {
          isActive: data.isActive,
          title: data.title,
          masterRss: {
            connect: {
              id: data.masterRssId,
            },
          },
          rootBusinesses: {
            update: {
              updatedAt: new Date(),
            },
          },
        },
      });
      return rss;
    } catch (err) {
      this.handleError("RssKnowledgeService.editRssKnowledge", err);
    }
  }

  async deleteRssKnowledge(id: string) {
    try {
      const rss = await db.rssKnowledge.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
          rootBusinesses: { update: { updatedAt: new Date() } },
        },
      });
      return rss;
    } catch (err) {
      this.handleError("RssKnowledgeService.deleteRssKnowledge", err);
    }
  }
}
