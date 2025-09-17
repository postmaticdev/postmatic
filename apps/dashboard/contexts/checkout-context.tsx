"use client";

import {
  DetailPricingItem,
  PricingByMethod,
  ProductDetailRes,
} from "@/models/api/app-product";
import { CheckoutRes } from "@/models/api/purchase/checkout.type";
import { useAppProductGetProductDetail } from "@/services/app-product.api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface SelectedPayment {
  code: string;
  type: "Virtual Account" | "E-Wallet";
}

interface CheckoutContext {
  promoState: string;
  setPromoState: (promoState: string) => void;
  promoCode: string;
  product: ProductDetailRes | undefined;
  onPromoSubmit: () => void;
  onClearPromo: () => void;
  selectedPayment: SelectedPayment | null;
  setSelectedPayment: (selectedPayment: SelectedPayment | null) => void;
  detailPricing: DetailPricingItem & { total: number };
  checkoutResult: CheckoutRes | null;
  setCheckoutResult: (checkoutResult: CheckoutRes | null) => void;
}

const CheckoutContext = createContext<CheckoutContext | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { businessId } = useParams() as { businessId: string };
  const [selectedPayment, setSelectedPayment] =
    useState<SelectedPayment | null>(null);
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const productId = searchParams.get("productId") || "";
  const promoCode = searchParams.get("promoCode") || "";
  const {
    data: productDetail,
    isLoading: isLoadingProductDetail,
    isError: isErrorProductDetail,
  } = useAppProductGetProductDetail({
    rootBusinessId: businessId,
    productId: productId,
    type: type as "subscription" | "token",
    code: promoCode,
  });
  const product = productDetail?.data?.data;
  const [checkoutResult, setCheckoutResult] = useState<CheckoutRes | null>(
    null
  );
  const findDetailPricing = product?.pricingByMethod
    ?.flatMap((method) => method.methods)
    .find((method) => method?.issued?.code === selectedPayment?.code);

  const detailPricing: DetailPricingItem & { total: number } = findDetailPricing?.detail ? {

    ...findDetailPricing.detail,
    total: findDetailPricing.subtotal?.total || product?.defaultPrice || 0,
  } : {
    admin: 0,
    discount: 0,
    item: product?.defaultPrice || 0,
    tax: 0,
    total: product?.defaultPrice || 0,
  };

  const [promoState, setPromoState] = useState<string>("");

  const onPromoSubmit = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("productId", productId);
    sp.set("type", type);
    if (promoState.trim()) {
      sp.set("promoCode", promoState);
    } else {
      sp.delete("promoCode");
    }
    router.push(`/business/${businessId}/pricing/checkout?${sp.toString()}`);
  };

  const onClearPromo = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.delete("promoCode");
    router.push(`/business/${businessId}/pricing/checkout?${sp.toString()}`);
  };

  useEffect(() => {
    if (promoCode) {
      setPromoState(promoCode);
    }
  }, [promoCode]);

  if (!isLoadingProductDetail && isErrorProductDetail) {
    router.push(`/business/${businessId}/pricing`);
  }

  return (
    <CheckoutContext.Provider
      value={{
        promoState,
        setPromoState,
        product,
        onPromoSubmit,
        onClearPromo,
        selectedPayment,
        setSelectedPayment,
        detailPricing,
        checkoutResult,
        setCheckoutResult,
        promoCode,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
