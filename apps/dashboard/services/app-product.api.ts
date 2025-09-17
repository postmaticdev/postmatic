import { api } from "@/config/api";
import {
  ProductDetailParamsPld,
  ProductDetailRes,
  SubscriptionProductRes,
  TokenProductRes,
} from "@/models/api/app-product";
import { BaseResponse } from "@/models/api/base-response.type";
import { useQuery } from "@tanstack/react-query";

const appProductService = {
  getSubscription: (businessId: string, code?: string) => {
    if (!businessId) return;
    return api.get<BaseResponse<SubscriptionProductRes>>(
      `/product/subscription/${businessId}`,
      {
        params: {
          code,
        },
      }
    );
  },
  getToken: (businessId: string, code?: string) => {
    if (!businessId) return;
    return api.get<BaseResponse<TokenProductRes>>(
      `/product/token/${businessId}`,
      {
        params: {
          code,
        },
      }
    );
  },
  getProductDetail: (payload: ProductDetailParamsPld) => {
    const { rootBusinessId, productId, type, code } = payload;
    return api.get<BaseResponse<ProductDetailRes>>(
      `/product/detail/${rootBusinessId}/${productId}/${type}`,
      {
        params: code?.trim()
          ? {
              code: code,
            }
          : {},
      }
    );
  },
};

export const useAppProductGetSubscription = (
  businessId: string,
  code?: string
) => {
  return useQuery({
    queryKey: ["appProductSubscription", businessId, code],
    queryFn: () => appProductService.getSubscription(businessId, code),
    enabled: !!businessId,
  });
};

export const useAppProductGetToken = (businessId: string, code?: string) => {
  return useQuery({
    queryKey: ["appProductToken", businessId, code],
    queryFn: () => appProductService.getToken(businessId, code),
    enabled: !!businessId,
  });
};

export const useAppProductGetProductDetail = (
  payload: ProductDetailParamsPld
) => {
  return useQuery({
    queryKey: ["appProductProductDetail", payload],
    queryFn: () => appProductService.getProductDetail(payload),
    enabled: !!payload.rootBusinessId && !!payload.productId && !!payload.type,
  });
};
