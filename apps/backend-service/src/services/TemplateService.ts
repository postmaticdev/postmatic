import { BaseService } from "./BaseService";
import db from "../config/db";
import { TemplateSaveDTO } from "src/validators/TemplateValidator";
import { FilterQueryType } from "src/middleware/use-filter";

export class TemplateService extends BaseService {
  constructor() {
    super();
  }

  async getTemplateCategories() {
    const templateCategories = await db.templateImageCategory.findMany({
      where: {
        templateImageContents: {
          some: {
            isPublished: true,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            templateImageContents: true,
          },
        },
      },
    });
    return templateCategories;
  }

  async getPublishedTemplates(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const savedTemplateIds = await db.templateImageSaved.findMany({
        where: {
          rootBusinessId,
        },
        select: {
          templateImageContentId: true,
        },
      });

      const filterTemplates = savedTemplateIds.map(
        (template) => template.templateImageContentId
      );

      const [publishedTemplates, totalData] = await Promise.all([
        db.templateImageContent.findMany({
          where: {
            AND: [
              {
                id: { notIn: filterTemplates },
              },
              {
                isPublished: true,
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
              {
                templateImageCategories: {
                  some: {
                    name: {
                      contains: filter.category,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            publisher: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            templateImageCategories: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.templateImageContent.count({
          where: {
            AND: [
              { isPublished: true },
              { deletedAt: null },
              {
                id: { notIn: filterTemplates },
              },
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              {
                templateImageCategories: {
                  some: {
                    name: {
                      contains: filter.category,
                      mode: "insensitive",
                    },
                  },
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
      return { data: publishedTemplates, pagination };
    } catch (error) {
      this.handleError("TemplateService.getPublishedTemplates", error);
    }
  }

  async getSavedTemplates(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const [savedTemplates, totalData] = await Promise.all([
        db.templateImageSaved.findMany({
          where: {
            AND: [
              {
                rootBusinessId,
              },
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              filter.category !== ""
                ? {
                    category: {
                      hasSome: filter.category
                        .split(",")
                        .map((category) => category.trim()),
                    },
                  }
                : {},
            ],
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            category: true,
            templateImageContent: {
              select: {
                id: true,
                publisher: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { [filter.sortBy]: filter.sort },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.templateImageSaved.count({
          where: {
            AND: [
              {
                rootBusinessId,
              },
              {
                name: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              filter.category !== ""
                ? {
                    category: {
                      hasSome: filter.category
                        .split(",")
                        .map((category) => category.trim()),
                    },
                  }
                : {},
            ],
          },
        }),
      ]);
      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });
      return { data: savedTemplates, pagination };
    } catch (error) {
      this.handleError("TemplateService.getSavedTemplates", error);
    }
  }

  async saveTemplate(rootBusinessId: string, data: TemplateSaveDTO) {
    try {
      const { templateImageContentId } = data;
      const [checkTemplateImageContent, existTemplate] = await Promise.all([
        db.templateImageContent.findFirst({
          where: {
            id: templateImageContentId,
            deletedAt: null,
            isPublished: true,
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            templateImageCategories: {
              select: {
                name: true,
              },
            },
          },
        }),
        db.templateImageSaved.findFirst({
          where: {
            rootBusinessId,
            templateImageContentId,
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (!checkTemplateImageContent) {
        return "Template tidak ditemukan";
      }

      if (existTemplate) {
        return "Template sudah disimpan";
      }

      const savedTemplate = await db.templateImageSaved.create({
        data: {
          rootBusinessId,
          templateImageContentId,
          category: checkTemplateImageContent.templateImageCategories.map(
            (category) => category.name
          ),
          imageUrl: checkTemplateImageContent.imageUrl,
          name: checkTemplateImageContent.name,
        },
      });

      return savedTemplate;
    } catch (error) {
      this.handleError("TemplateService.saveTemplate", error);
    }
  }

  async deleteTemplate(rootBusinessId: string, templateImageContentId: string) {
    try {
      const templateImageSaved = await db.templateImageSaved.findFirst({
        where: {
          rootBusinessId,
          templateImageContentId,
        },
      });
      if (!templateImageSaved) {
        return "Template tidak ditemukan";
      }
      const deleted = await db.templateImageSaved.delete({
        where: { id: templateImageSaved.id },
      });
      return deleted;
    } catch (error) {
      this.handleError("TemplateService.deleteTemplate", error);
    }
  }
}
