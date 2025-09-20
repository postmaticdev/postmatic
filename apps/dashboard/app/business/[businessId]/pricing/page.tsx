"use client";

import { useState } from "react";
import { Header } from "@/components/base/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";
import {
  useAppProductGetSubscription,
  useAppProductGetToken,
} from "@/services/app-product.api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatIdr } from "@/helper/formatter";
import {
  AppProductSubscriptionItem,
  ProductSubscription,
} from "@/models/api/app-product";
import { showToast } from "@/helper/show-toast";
import { useCheckoutPayBank } from "@/services/purchase.api";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscribtionGetSubscription } from "@/services/tier/subscribtion.api";

export default function Pricing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"package" | "extraToken">(
    (searchParams.get("tab") as "package" | "extraToken") || "package"
  );
  const queryClient = useQueryClient();
  const { businessId } = useParams() as { businessId: string };
  const { data: tokenData } = useAppProductGetToken(businessId || "");
  const { data: subscriptionData } = useAppProductGetSubscription(
    businessId || ""
  );

  const tokenPackages = tokenData?.data?.data.products || [];

  // Expecting products as SubscriptionPlan[] with items: SubscriptionItem[]
  const subscriptionPlans = subscriptionData?.data?.data.products || [];

  // Per-plan selected item (keyed by planId -> itemId)
  const [selectedItemsByPlan, setSelectedItemsByPlan] = useState<
    Record<string, string | undefined>
  >({});

  const setPlanSelectedItem = (planId: string, itemId: string) => {
    setSelectedItemsByPlan((prev) => ({ ...prev, [planId]: itemId }));
  };

  const getSelectedItem = (
    plan: ProductSubscription
  ): AppProductSubscriptionItem | undefined => {
    const chosenId = selectedItemsByPlan[plan.id];
    if (chosenId)
      return plan.appProductSubscriptionItems.find((i) => i.id === chosenId);
    return plan.appProductSubscriptionItems?.[0]; // default ke item pertama jika belum dipilih
  };

  const { data: subscriptionDataTier } = useSubscribtionGetSubscription(
    businessId || ""
  );
  const notShowToken = !subscriptionDataTier?.data?.data?.valid;

  const mCheckoutBank = useCheckoutPayBank();

  const checkoutFreeProduct = async (id: string) => {
    try {
      await mCheckoutBank.mutateAsync({
        businessId,
        formData: {
          bank: "bni",
          productId: id,
          type: "subscription",
        },
      });
      queryClient.clear();
      showToast("success", "Berhasil mengklaim free trial");
      router.push(`/business/${businessId}/content-generate`);
    } catch {}
  };

  const onSelectItem = (type: "token" | "subscription", id: string) => {
    queryClient.clear();
    router.push(
      `/business/${businessId}/pricing/checkout?type=${type}&productId=${id}`
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Pilih Paket Anda</h1>
              <p className="text-muted-foreground">
                Pilih paket yang tepat untuk kebutuhan konten media sosial Anda
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              {!notShowToken && (
                <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
                  <button
                    onClick={() => setActiveTab("package")}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === "package"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Paket
                  </button>
                  <button
                    onClick={() => setActiveTab("extraToken")}
                    className={`flex-1 py-3 px-4 text-center font-medium ${
                      activeTab === "extraToken"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Token Tambahan
                  </button>
                </div>
              )}
            </div>

            {activeTab === "extraToken" && !notShowToken ? (
              /* Token Packages */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokenPackages?.map((pkg, index) => (
                  <Card
                    key={pkg?.id ?? index}
                    className="group relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-border hover:border-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 hover:dark:border-blue-400"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <CardContent className="relative p-6">
                      {/* Header with Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                          {pkg.tokenType}
                        </div>
                      </div>

                      {/* Token Amount */}
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {pkg.token}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Token
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatIdr(pkg.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pembelian sekali
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>Aktivasi instan</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>Tidak ada tanggal kedaluwarsa</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>Dapat digunakan untuk semua fitur</span>
                        </div>
                      </div>

                      {/* Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => onSelectItem("token", pkg.id)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Dapatkan Token
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Subscription Plans */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => {
                  const selectedItem = getSelectedItem(plan);
                  const showToggle =
                    (plan.appProductSubscriptionItems?.length ?? 0) > 1;

                  return (
                    <Card
                      key={plan.id}
                      className="relative rounded-2xl shadow-lg border-2 my-4 lg:my-0 transition-all duration-300 bg-card border-border hover:border-blue-500 hover:scale-105 hover:dark:border-blue-400"
                    >
                      <div className="p-6 mb-12">
                        {/* Plan Icon and Name */}
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                              // TODO: create enum to map icon to subscription plans
                              plan.name === "Free"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : plan.name === "Professional"
                                ? "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {plan.name !== "Free" ? (
                              <Crown size={16} />
                            ) : (
                              <span className="text-sm">F</span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {plan.name}
                          </h3>
                        </div>

                        {/* Item Toggle (only if > 1) */}
                        <div className="flex justify-center mb-4">
                          {showToggle && (
                            <div className="flex items-center p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                              {plan.appProductSubscriptionItems.map((item) => {
                                const activeId =
                                  selectedItemsByPlan[plan.id] ??
                                  plan.appProductSubscriptionItems[0]?.id;
                                const isActive = activeId === item.id;

                                return (
                                  <button
                                    key={item.id}
                                    onClick={() =>
                                      setPlanSelectedItem(plan.id, item.id)
                                    }
                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                      isActive
                                        ? "bg-blue-600 text-white"
                                        : "bg-transparent text-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    {item.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="mb-4">
                          <div
                            className={`${
                              plan.name === "Free"
                                ? ""
                                : "font-semibold mb-1 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {plan.name === "Free"
                              ? "Gratis"
                              : selectedItem?.name || "Bulanan"}
                          </div>
                          <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                            {formatIdr(selectedItem?.price || 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedItem?.tokenImage} token • Valid untuk{" "}
                            {selectedItem?.subscriptionValidFor} hari
                          </div>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-2 mb-6">
                          {plan.benefits.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Renewal Notice */}
                        {/* <div className="text-xs text-muted-foreground mb-4">
                          Pembelian ulang tersedia H-7 sebelum langganan
                          berakhir. (TODO: kayanya gaperlu)
                        </div> */}

                        {/* Button */}
                        <Button
                          className={`m-12 absolute bottom-0 left-0 right-0 ${
                            plan.appProductSubscriptionItems?.[0]?.isClaimed
                              ? "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed opacity-60"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          disabled={
                            plan.appProductSubscriptionItems?.[0]?.isClaimed
                          }
                          onClick={() => {
                            if (
                              plan.appProductSubscriptionItems?.[0]?.isClaimed
                            ) {
                              return; // Prevent action if already claimed
                            }

                            if (selectedItem?.price === 0) {
                              checkoutFreeProduct(selectedItem?.id);
                            } else {
                              onSelectItem(
                                "subscription",
                                selectedItem?.id || ""
                              );
                            }
                          }}
                        >
                          {plan.appProductSubscriptionItems?.[0]?.isClaimed
                            ? "Sudah Diambil"
                            : plan.name === "Free"
                            ? "Mulai Sekarang"
                            : "Pilih"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
