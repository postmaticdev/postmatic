import { api } from "@/config/api";
import { BaseResponse } from "@/models/api/base-response.type";
import { BusinessPurchaseRes } from "@/models/api/purchase/business.type";
import {
  BankPld,
  CheckoutRes,
  EWalletPld,
} from "@/models/api/purchase/checkout.type";
import { UserPurchaseRes } from "@/models/api/purchase/user.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================== USER PURCHASE ==============================

const userPurchaseService = {
  getHistory: () => {
    return api.get<BaseResponse<UserPurchaseRes[]>>(`/purchase/user`);
  },
  getDetail: (businessId: string) => {
    return api.get<BaseResponse<UserPurchaseRes>>(
      `/purchase/user/${businessId}`
    );
  },
};

export const useUserPurchaseGetHistory = () => {
  return useQuery({
    queryKey: ["userPurchaseHistory", "purchase"],
    queryFn: () => userPurchaseService.getHistory(),
  });
};

export const useUserPurchaseGetDetail = (businessId: string) => {
  return useQuery({
    queryKey: ["userPurchaseDetail", businessId, "purchase"],
    queryFn: () => userPurchaseService.getDetail(businessId),
  });
};

// ============================== BUSINESS PURCHASE ==============================

export const businessPurchaseService = {
  getHistory: (businessId: string) => {
    return api.get<BaseResponse<BusinessPurchaseRes[]>>(
      `/purchase/business/${businessId}`
    );
  },
  getDetail: (businessId: string, paymentId: string) => {
    return api.get<BaseResponse<BusinessPurchaseRes>>(
      `/purchase/business/${businessId}/${paymentId}`
    );
  },
};

export const useBusinessPurchaseGetHistory = (businessId: string) => {
  return useQuery({
    queryKey: ["businessPurchaseHistory", businessId],
    queryFn: () => businessPurchaseService.getHistory(businessId),
    enabled: !!businessId,
  });
};

export const useBusinessPurchaseGetDetail = (
  businessId: string,
  paymentId: string
) => {
  return useQuery({
    queryKey: ["businessPurchaseDetail", paymentId],
    queryFn: () => businessPurchaseService.getDetail(businessId, paymentId),
    enabled: !!businessId && !!paymentId,
  });
};

// ============================== CHECKOUT PAY ==============================

const checkoutPayService = {
  eWallet: (businessId: string, formData: EWalletPld) => {
    return api.post<BaseResponse<CheckoutRes>>(
      `purchase/checkout/payment/e-wallet/${businessId}`,
      formData
    );
  },
  bank: (businessId: string, formData: BankPld) => {
    return api.post<BaseResponse<CheckoutRes>>(
      `purchase/checkout/payment/bank/${businessId}`,
      formData
    );
  },
};

export const useCheckoutPayEWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: EWalletPld;
    }) => checkoutPayService.eWallet(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [data?.data?.rootBusinessId],
      });
    },
  });
};

export const useCheckoutPayBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: BankPld;
    }) => checkoutPayService.bank(businessId, formData),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [data?.data?.rootBusinessId],
      });
    },
  });
};
