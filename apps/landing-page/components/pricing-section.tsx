"use client";
import { Check, Star, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { SIGNUP_URL } from "@/constants";

// Type definitions for the data structures
interface PlanItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  tokenValidFor: number;
  tokenImage: number;
  originalPrice?: number;
}

interface Plan {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  popular: boolean;
  benefits: string[];
  items: PlanItem[];
}

const iconsMap = { Star, Zap, Crown };

export default function PricingSection() {
  const t = useTranslations('pricing');
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: t('currency'),
      minimumFractionDigits: 0,
    }).format(amount);

  function openSignIn() {
    window.location.href = SIGNUP_URL;
  }


  return (
    <section id="pricing" className="py-20 bg-indigo-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {t('title')}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {t.raw('plans').map((plan: Plan) => {
              const Icon = iconsMap[plan.icon as keyof typeof iconsMap];
              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl shadow-lg border-2 my-4 lg:my-0 transition-all duration-300 bg-card border-border hover:border-blue-500 hover:scale-105 hover:dark:border-blue-400"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                        {t('badge')}
                      </Badge>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 mb-12">
                    <div className="flex items-center space-x-3 mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Pricing cards - harga di atas/bawah */}
                    {plan.items.length === 1 ? (
                      // Jika hanya 1 item, tampilkan langsung
                      <div className="p-4 rounded-lg border dark:border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.items[0].name}
                          </span>
                          {plan.items[0].description && (
                            <Badge
                              variant="secondary"
                              className="text-xs text-gray-900 dark:text-white"
                            >
                              {t('saveBadge')}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                                                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                          {plan.items[0].price === 0
                            ? "Gratis"
                            : formatCurrency(plan.items[0].price)}
                        </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {plan.items[0].tokenImage.toLocaleString("id-ID")}{" "}
                          {t('tokenUnit')} •{" "}
                          {t('validFor', { days: plan.items[0].tokenValidFor })}
                        </p>
                      </div>
                    ) : (
                      // Jika lebih dari 1 item, gunakan nested tabs
                      <Tabs
                        defaultValue={plan.items[0].id}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
                          {plan.items.map((item) => (
                            <TabsTrigger
                              key={item.id}
                              value={item.id}
                              className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-primary transition-all duration-200"
                            >
                              {item.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {plan.items.map((item) => (
                          <TabsContent key={item.id} value={item.id}>
                            <div className="p-4 rounded-lg border dark:border-slate-600">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {item.name}
                                </span>
                                {item.description && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs text-gray-900 dark:text-white"
                                  >
                                    {t('saveBadge')}
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1">
                                {item.originalPrice &&
                                  item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                      {formatCurrency(item.originalPrice)}
                                    </span>
                                  )}
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                  {item.price === 0
                                    ? "Gratis"
                                    : formatCurrency(item.price)}
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {item.tokenImage.toLocaleString("id-ID")}{" "}
                                {t('tokenUnit')} •{" "}
                                {t('validFor', { days: item.tokenValidFor })}
                              </p>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}

                    {/* Benefits */}
                    <div className="space-y-3 mb-8 mt-3">
                      {plan.benefits.map((b, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button

                      onClick={openSignIn}

                      className={`bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary hover:scale-[1.02] text-white m-12 absolute bottom-0 left-0 right-0`}
                    >
                      {plan.name === "Free"
                        ? t('cta.free')
                        : t('cta.paid')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>


        </div>
      </div>
    </section>
  );
}
