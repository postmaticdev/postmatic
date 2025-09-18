import { api } from "@/config/api";
import { BaseResponse, FilterQuery } from "@/models/api/base-response.type";
import { CountPostRes, UpcomingPostRes } from "@/models/api/content/overview";
import { useQuery } from "@tanstack/react-query";

const overviewService = {
  getCountPosted: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponse<CountPostRes>>(
      `content/overview/posted-count/${businessId}`,
      { params: filterQuery }
    );
  },
  getCountUpcoming: (
    businessId: string,
    filterQuery?: Partial<FilterQuery>
  ) => {
    return api.get<BaseResponse<CountPostRes>>(
      `content/overview/upcoming-count/${businessId}`,
      { params: filterQuery }
    );
  },
  getUpcoming: (businessId: string, filterQuery?: Partial<FilterQuery>) => {
    return api.get<BaseResponse<UpcomingPostRes[]>>(
      `content/overview/upcoming-posts/${businessId}`,
      { params: filterQuery }
    );
  },
};

export const useContentOverviewGetCountPosted = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["contentOverviewCountPosted", businessId, filterQuery],
    queryFn: () => overviewService.getCountPosted(businessId, filterQuery),
    enabled: !!businessId,
  });
};

export const useContentOverviewGetCountUpcoming = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["contentOverviewCountUpcoming", businessId, filterQuery],
    queryFn: () => overviewService.getCountUpcoming(businessId, filterQuery),
  });
};

export const useContentOverviewGetUpcoming = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["contentOverviewUpcoming", businessId, filterQuery],
    queryFn: () => overviewService.getUpcoming(businessId, filterQuery),
  });
};
