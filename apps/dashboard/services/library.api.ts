import { api } from "@/config/api";
import {
  BaseResponse,
  BaseResponseFiltered,
  FilterQuery,
} from "@/models/api/base-response.type";
import {
  RssArticleRes,
  RssCategoryRes,
  RssLibraryRes,
} from "@/models/api/library/rss.type";
import {
  PublishedTemplateRes,
  SavedTemplatePld,
  SavedTemplateRes,
  TemplateCategoryRes,
} from "@/models/api/library/template.type";
import { TimezoneRes } from "@/models/api/library/time.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================== LIBRARY ==============================

const libraryService = {
  RSSArticle: (businessId: string) => {
    return api.get<BaseResponse<RssArticleRes[]>>(
      `/library/rss/article/${businessId}`,
      {
        params: {
          ignoreCache: "true",
        },
      }
    );
  },
  RSSData: (filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponse<RssLibraryRes[]>>(`/library/rss/data`, {
      params: filterQuery,
    });
  },
  RSSCategory: () => {
    return api.get<BaseResponse<RssCategoryRes[]>>(`/library/rss/category`);
  },
  time: () => {
    return api.get<BaseResponse<TimezoneRes[]>>(`/library/time`);
  },
};

export const useLibraryRSSArticle = (businessId: string) => {
  return useQuery({
    queryKey: ["libraryRSSArticle"],
    queryFn: () => libraryService.RSSArticle(businessId),
    enabled: !!businessId,
  });
};

export const useLibraryRSSData = (filterQuery?: Partial<FilterQuery>) => {
  return useQuery({
    queryKey: ["libraryRSSData", filterQuery],
    queryFn: () => libraryService.RSSData(filterQuery),
  });
};

export const useLibraryRSSCategory = () => {
  return useQuery({
    queryKey: ["libraryRSSCategory"],
    queryFn: () => libraryService.RSSCategory(),
  });
};
export const useLibraryTime = () => {
  return useQuery({
    queryKey: ["libraryTime"],
    queryFn: () => libraryService.time(),
  });
};

// ============================== TEMPLATE ==============================

const templateService = {
  saveTemplate: (businessId: string, formData: SavedTemplatePld) => {
    return api.post<BaseResponse<SavedTemplateRes[]>>(
      `/library/template/saved/${businessId}`,
      formData
    );
  },
  getSaved: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponseFiltered<SavedTemplateRes[]>>(
      `/library/template/saved/` + businessId,
      { params: filterQuery }
    );
  },
  getPublished: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponseFiltered<PublishedTemplateRes[]>>(
      `/library/template/published/${businessId}`,
      { params: filterQuery }
    );
  },
  getCategory: () => {
    return api.get<BaseResponse<TemplateCategoryRes[]>>(
      `/library/template/category`
    );
  },
  deleteSaved: (idBusiness: string, templateId: string) => {
    return api.delete<BaseResponse>(
      `/library/template/saved/${idBusiness}/${templateId}`
    );
  },
};

export const useLibraryTemplateSave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: SavedTemplatePld;
    }) => templateService.saveTemplate(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["libraryTemplateSaved"],
      });
      queryClient.invalidateQueries({
        queryKey: ["libraryTemplatePublished"],
      });
    },
  });
};

export const useLibraryTemplateGetSaved = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["libraryTemplateSaved", businessId, filterQuery],
    queryFn: () => templateService.getSaved(businessId, filterQuery),
    enabled: !!businessId,
  });
};

export const useLibraryTemplateGetPublished = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["libraryTemplatePublished", businessId, filterQuery],
    queryFn: () => templateService.getPublished(businessId, filterQuery),
    enabled: !!businessId,
  });
};

export const useLibraryTemplateGetCategory = () => {
  return useQuery({
    queryKey: ["libraryTemplateCategory"],
    queryFn: () => templateService.getCategory(),
    enabled: true,
  });
};

export const useLibraryTemplateDeleteSaved = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      templateId,
    }: {
      businessId: string;
      templateId: string;
    }) => templateService.deleteSaved(businessId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["libraryTemplateSaved"],
      });
      queryClient.invalidateQueries({
        queryKey: ["libraryTemplatePublished"],
      });
    },
  });
};
