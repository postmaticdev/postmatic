import { api } from "@/config/api";
import { BaseResponse, FilterQuery } from "@/models/api/base-response.type";
import {
  AnalyticTokenUsageRes,
  AnalyticTypeTokenRes,
  TokenUsage,
} from "@/models/api/tier/token.type";
import { useQuery } from "@tanstack/react-query";

const tokenService = {
  getAnalyticUsage: (
    businessId: string,
    filterQuery?: Partial<FilterQuery>
  ) => {
    return api.get<BaseResponse<AnalyticTokenUsageRes[]>>(
      `/tier/token/analytics/` + businessId,
      { params: filterQuery }
    );
  },
  getAnalyticType: (businessId: string) => {
    return api.get<BaseResponse<AnalyticTypeTokenRes[]>>(
      `/tier/token/type/` + businessId
    );
  },
  getTokenUsage: (businessId: string) => {
    return api.get<BaseResponse<TokenUsage>>(`/tier/token/usage/` + businessId);
  },
};

export const useTokenGetAnalyticUsage = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["tokenAnalyticUsage", businessId, filterQuery],
    queryFn: () => tokenService.getAnalyticUsage(businessId, filterQuery),
  });
};

export const useTokenGetAnalyticType = (businessId: string) => {
  return useQuery({
    queryKey: ["tokenAnalyticType", businessId],
    queryFn: () => tokenService.getAnalyticType(businessId),
    enabled: !!businessId,
  });
};

export const useTokenGetTokenUsage = (businessId: string) => {
  return useQuery({
    queryKey: ["tokenUsage", businessId],
    queryFn: () => tokenService.getTokenUsage(businessId),
    enabled: !!businessId,
  });
};
