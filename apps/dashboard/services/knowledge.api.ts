import { api } from "@/config/api";
import {
  BaseResponse,
  BaseResponseFiltered,
  FilterQuery,
} from "@/models/api/base-response.type";
import { AdvancedGenerate } from "@/models/api/content/image.type";
import {
  BusinessKnowledgePld,
  BusinessKnowledgeRes,
} from "@/models/api/knowledge/business.type";
import {
  PlatformEnum,
  PlatformPld,
  PlatformRes,
} from "@/models/api/knowledge/platform.type";
import {
  ProductKnowledgeDeleteRes,
  ProductKnowledgePld,
  ProductKnowledgeRes,
} from "@/models/api/knowledge/product.type";
import {
  RoleKnowledgePld,
  RoleKnowledgeRes,
} from "@/models/api/knowledge/role.type";
import { AddRssPld, RssRes } from "@/models/api/knowledge/rss.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================== BUSINESS KNOWLEDGE ==============================

const businessKnowledgeService = {
  getById: (businessId: string) => {
    return api.get<BaseResponse<BusinessKnowledgeRes>>(
      `/knowledge/business/${businessId}`
    );
  },

  upsert: (businessId: string, formData: BusinessKnowledgePld) => {
    return api.post<BaseResponse<BusinessKnowledgeRes>>(
      `/knowledge/business/${businessId}`,
      { ...formData, secondaryLogo: null }
    );
  },
};

export const useBusinessKnowledgeGetById = (businessId: string) => {
  return useQuery({
    queryKey: ["businessKnowledge", businessId],
    queryFn: () => businessKnowledgeService.getById(businessId),
    enabled: !!businessId,
  });
};

export const useBusinessKnowledgeUpsert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: BusinessKnowledgePld;
    }) => businessKnowledgeService.upsert(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["businessKnowledge", data.data.id],
      });
    },
    onError: (error) => {
      throw error;
    },
  });
};

// ============================== PRODUCT KNOWLEDGE ==============================

const productKnowledgeService = {
  getStatus(businessId: string, productKnowledgeId: string) {
    return api.get<BaseResponse<AdvancedGenerate>>(
      `/knowledge/product/${businessId}/${productKnowledgeId}`
    );
  },
  getAll: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponseFiltered<ProductKnowledgeRes[]>>(
      `/knowledge/product/${businessId}`,
      { params: filterQuery }
    );
  },

  create: (businessId: string, formData: ProductKnowledgePld) => {
    return api.post<BaseResponse<ProductKnowledgeRes>>(
      `/knowledge/product/${businessId}`,
      { ...formData, price: Number(formData.price) }
    );
  },
  update: (productId: string, formData: ProductKnowledgePld) => {
    return api.put<BaseResponse<ProductKnowledgeRes>>(
      `/knowledge/product/${productId}`,
      { ...formData, price: Number(formData.price) }
    );
  },

  delete: (productId: string) => {
    return api.delete<BaseResponse<ProductKnowledgeDeleteRes>>(
      `/knowledge/product/${productId}`
    );
  },
};

export const useProductKnowledgeGetStatus = (
  businessId: string,
  productKnowledgeId: string
) => {
  return useQuery({
    queryKey: ["productKnowledgeStatus", productKnowledgeId],
    queryFn: () =>
      productKnowledgeService.getStatus(businessId, productKnowledgeId),
    enabled: !!businessId && !!productKnowledgeId,
  });
};

export const useProductKnowledgeGetAll = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["productKnowledge", filterQuery],
    queryFn: () => productKnowledgeService.getAll(businessId, filterQuery),
    enabled: !!businessId,
  });
};

export const useProductKnowledgeCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: ProductKnowledgePld;
    }) => productKnowledgeService.create(businessId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["productKnowledge"],
      });
    },
  });
};

export const useProductKnowledgeUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      formData,
    }: {
      productId: string;
      formData: ProductKnowledgePld;
    }) => productKnowledgeService.update(productId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["productKnowledge"],
      });
    },
  });
};

export const useProductKnowledgeDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      productKnowledgeService.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productKnowledge"],
      });
    },
  });
};

// ============================== ROLE KNOWLEDGE ==============================

const roleKnowledgeService = {
  getById: (businessId: string) => {
    return api.get<BaseResponse<RoleKnowledgeRes>>(
      `/knowledge/role/${businessId}`
    );
  },

  upsert: (businessId: string, formData: RoleKnowledgePld) => {
    return api.post<BaseResponse<RoleKnowledgeRes>>(
      `/knowledge/role/${businessId}`,
      { ...formData }
    );
  },
};

export const useRoleKnowledgeGetById = (businessId: string) => {
  return useQuery({
    queryKey: ["roleKnowledge", businessId],
    queryFn: () => roleKnowledgeService.getById(businessId),
    enabled: !!businessId,
  });
};

export const useRoleKnowledgeUpsert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: RoleKnowledgePld;
    }) => roleKnowledgeService.upsert(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["roleKnowledge", data?.data?.rootBusinessId],
      });
    },
    onError: (error) => {
      throw error;
    },
  });
};

// ============================== RSS KNOWLEDGE ==============================

const rssKnowledgeService = {
  getById: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponse<RssRes[]>>(`/knowledge/rss/${businessId}`, {
      params: filterQuery,
    });
  },
  create: (businessId: string, formData: AddRssPld) => {
    return api.post<BaseResponse<RssRes>>(
      `/knowledge/rss/${businessId}`,
      formData
    );
  },

  update: (rssKnId: string, formData: AddRssPld) => {
    return api.put<BaseResponse<RssRes>>(`/knowledge/rss/${rssKnId}`, formData);
  },

  delete: (businessId: string) => {
    return api.delete<BaseResponse<RssRes>>(`/knowledge/rss/${businessId}`);
  },
};

export const useRssKnowledgeGetById = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["rssKnowledge", businessId, filterQuery],
    queryFn: () => rssKnowledgeService.getById(businessId, filterQuery),
    enabled: !!businessId,
  });
};

export const useRssKnowledgeCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: AddRssPld;
    }) => rssKnowledgeService.create(businessId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["rssKnowledge"],
      });
      queryClient.invalidateQueries({
        queryKey: ["libraryRSSArticle"],
      });
    },
  });
};

export const useRssKnowledgeUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rssKnId,
      formData,
    }: {
      rssKnId: string;
      formData: AddRssPld;
    }) => rssKnowledgeService.update(rssKnId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["rssKnowledge"],
      });
      queryClient.invalidateQueries({
        queryKey: ["libraryRSSArticle"],
      });
    },
  });
};

export const useRssKnowledgeDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rssKnowledgeId: string) =>
      rssKnowledgeService.delete(rssKnowledgeId),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["rssKnowledge"],
      });
      queryClient.invalidateQueries({
        queryKey: ["libraryRSSArticle"],
      });
    },
  });
};

// ============================== PLATFORM KNOWLEDGE ==============================

const platformService = {
  getAll: (businessId: string, from?: string) => {
    return api.get<BaseResponse<PlatformRes[]>>(
      `/knowledge/platform/${businessId}`,
      { params: { from } }
    );
  },
  disconnect: (businessId: string, platform: PlatformEnum) => {
    return api.post<BaseResponse<PlatformRes>>(
      `/knowledge/platform/${businessId}/${platform}`
    );
  },
};

export const usePlatformKnowledgeGetAll = (
  businessId: string,
  from?: string
) => {
  return useQuery({
    queryKey: ["platformKnowledge", businessId, from],
    queryFn: () => platformService.getAll(businessId, from),
    enabled: !!businessId,
  });
};

export const usePlatformKnowledgeDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      platform,
    }: {
      businessId: string;
      platform: PlatformEnum;
    }) => platformService.disconnect(businessId, platform),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["platformKnowledge"],
      });
    },
  });
};
