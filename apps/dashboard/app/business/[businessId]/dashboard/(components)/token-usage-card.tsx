import { Progress } from "@/components/ui/progress";
import { dateFormat } from "@/helper/date-format";
import { useSubscribtionGetSubscription } from "@/services/tier/subscribtion.api";
import { useTokenGetTokenUsage } from "@/services/tier/token.api";
import { useParams } from "next/navigation";

export function TokenUsageCard() {
  const title = "Penggunaan Token";
  const subtitle = "Jumlah penggunaan token";
  const { businessId } = useParams() as { businessId: string };

  const { data: tokenUsageData } = useTokenGetTokenUsage(businessId);

  const usedValue = tokenUsageData?.data?.data?.totalUsedToken || 0;
  const availableValue = tokenUsageData?.data?.data?.availableToken || 0;
  const limitToken = tokenUsageData?.data?.data?.totalValidToken || 0;

  const { data: subscriptionDataTier } = useSubscribtionGetSubscription(
    businessId || ""
  );
  const subscription = subscriptionDataTier?.data?.data ?? null;

  const percentage = Math.min(
    tokenUsageData?.data?.data?.percentageUsage || 0,
    100
  );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border flex flex-col gap-2">
      <div className="flex flex-col mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>

        {subscription?.expiredAt && (
          <span className="text-sm text-red-500">
            (Valid sampai{" "}
            {dateFormat.indonesianDate(new Date(subscription?.expiredAt))})
          </span>
        )}
      </div>

      <div className="text-3xl font-bold text-foreground mb-4">
        {usedValue} / {limitToken}
      </div>
      <Progress value={percentage} />

      <div className="flex mt-2 justify-between flex-row text-sm">
        <span className="text-muted-foreground">
          {usedValue} digunakan ({percentage}%)
        </span>

        <span className="text-muted-foreground">{availableValue} tersisa</span>
      </div>
    </div>
  );
}
