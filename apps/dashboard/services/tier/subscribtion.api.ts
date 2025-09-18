import { api } from "@/config/api";
import { BaseResponse } from "@/models/api/base-response.type";
import { StatusSubscribtionRes } from "@/models/api/tier/subsription.type";
import { useQuery } from "@tanstack/react-query";

const subscribtionService = {
  getSubscription: (businessId: string) => {
    return api.get<BaseResponse<StatusSubscribtionRes>>(
      `/tier/subscription/status/` + businessId
    );
  },
};

export const useSubscribtionGetSubscription = (businessId: string) => {
  return useQuery({
    queryKey: ["subscribtionSubscription", businessId],
    queryFn: () => subscribtionService.getSubscription(businessId),
    enabled: !!businessId,
  });
};
