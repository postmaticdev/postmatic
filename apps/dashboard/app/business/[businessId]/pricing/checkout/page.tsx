"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OrderSummary } from "@/app/business/[businessId]/pricing/checkout/(components)/order-summary";
import { PaymentMethodGrid } from "@/app/business/[businessId]/pricing/checkout/(components)/payment-method-grid";
import { PromoCodeSection } from "@/app/business/[businessId]/pricing/checkout/(components)/promo-code-section";
import { PaymentConfirmation } from "@/app/business/[businessId]/pricing/checkout/(components)/payment-confirmation";
import { PaymentSuccess } from "@/app/business/[businessId]/pricing/checkout/(components)/payment-success";
import { CheckoutFooter } from "@/app/business/[businessId]/pricing/checkout/(components)/checkout-footer";
import { MobileBackButton } from "@/app/business/[businessId]/pricing/checkout/(components)/mobile-back-button";
import {
  useCheckoutPayBank,
  useCheckoutPayEWallet,
} from "@/services/purchase.api";
import { useCheckout } from "@/contexts/checkout-context";
import { showToast } from "@/helper/show-toast";
import { useParams } from "next/navigation";

export default function CheckoutPage() {
  const { businessId } = useParams() as { businessId: string };
  const mCheckoutPayBank = useCheckoutPayBank();
  const mCheckoutPayEWallet = useCheckoutPayEWallet();
  const { selectedPayment, product, setCheckoutResult, promoCode } =
    useCheckout();

  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const handleCheckout = async () => {
    try {
      if (!selectedPayment) {
        showToast("error", "Harap pilih metode pembayaran");
        return;
      }
      if (!product?.isValidCode) {
        showToast("error", "Kode promo tidak valid");
        return;
      }
      if (selectedPayment.type === "Virtual Account") {
        const res = await mCheckoutPayBank.mutateAsync({
          businessId,
          formData: {
            bank: selectedPayment.code,
            productId: product?.id,
            type: product?.type,
            discountCode: promoCode,
          },
        });
        setCheckoutResult(res.data.data);
        setShowPaymentConfirmation(true);
      } else if (selectedPayment.type === "E-Wallet") {
        const res = await mCheckoutPayEWallet.mutateAsync({
          businessId,
          formData: {
            productId: product?.id,
            type: product?.type,
            discountCode: promoCode,
            acquirer: selectedPayment.code as "gopay" | "qris",
          },
        });
        setCheckoutResult(res.data.data);
        setShowPaymentConfirmation(true);
      }
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left sidebar - Hidden on mobile */}
      <OrderSummary variant="sidebar" />

      {/* Main content */}
      <div className="flex-1 p-3 sm:p-4 lg:p-12 max-w-[800px] mx-auto">
        {/* Mobile back button */}
        <MobileBackButton />

        {/* Mobile Order Summary Card */}
        <OrderSummary variant="mobile" />

        <Card className="border border-border">
          <CardContent className="p-3 sm:p-4 lg:p-8">
            {showPaymentSuccess ? (
              /* Payment Success Card */
              <PaymentSuccess />
            ) : showPaymentConfirmation ? (
              /* Payment Confirmation Card */
              <PaymentConfirmation
                setShowPaymentSuccess={setShowPaymentSuccess}
              />
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  Payment Method
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  Harap pilih metode pembayaran untuk melanjutkan
                </p>

                {/* Payment method grid */}
                <PaymentMethodGrid />

                {/* Promo code section */}
                <PromoCodeSection />

                {/* Continue button */}
                <button
                  onClick={handleCheckout}
                  disabled={!selectedPayment || !product?.isValidCode}
                  className="bg-blue-600 dark:bg-blue-500 text-white text-sm sm:text-base lg:text-lg font-medium w-full py-3 sm:py-3 lg:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer links - Hidden on mobile */}
        <CheckoutFooter />
      </div>
    </div>
  );
}
