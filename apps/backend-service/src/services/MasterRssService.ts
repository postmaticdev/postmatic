import { BaseService } from "./BaseService";
import db from "../config/db";
import { CnbcUtils } from "../utils/rss/CnbcUtils";
import { AntaraUtils } from "../utils/rss/AntaraUtils";
import { FilterQueryType } from "src/middleware/use-filter";

export class MasterRssService extends BaseService {
  constructor(private antara: AntaraUtils, private cnbc: CnbcUtils) {
    super();
  }
  async getAllArticlesByBusiness(rootBusinessId: string, ignoreCache = false) {
    try {
      const [cnbc, antara] = await Promise.all([
        this.cnbc.getArticles(rootBusinessId, ignoreCache),
        this.antara.getArticles(rootBusinessId, ignoreCache),
      ]);
      const allArticles = [...cnbc, ...antara];
      const sorted = allArticles.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      );
      return sorted;
    } catch (err) {
      this.handleError("MasterRssService.getAllArticlesByBusiness", err);
    }
  }

  async getAllRsses(filter: FilterQueryType) {
    try {
      const [data, totalData] = await Promise.all([
        db.masterRss.findMany({
          where: {
            AND: [
              { deletedAt: null },
              {
                title: { contains: filter.search, mode: "insensitive" },
              },
              {
                masterRssCategoryId: {
                  contains: filter.category,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.masterRss.count({
          where: {
            AND: [
              { deletedAt: null },
              {
                title: { contains: filter.search, mode: "insensitive" },
              },
              {
                masterRssCategoryId: {
                  contains: filter.category,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      ]);
      return {
        data,
        pagination: this.createPagination({
          total: totalData,
          page: filter.page,
          limit: filter.limit,
        }),
      };
    } catch (err) {
      this.handleError("MasterRssService.getAllRsses", err);
    }
  }

  async getAllCategories() {
    try {
      const data = await db.masterRssCategory.findMany({
        where: {
          AND: [{ deletedAt: null }],
        },
        orderBy: { name: "asc" },
      });

      return data;
    } catch (err) {
      this.handleError("MasterRssService.getAllCategories", err);
    }
  }
}
