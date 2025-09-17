import { Progress } from "@/components/ui/progress";
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
  const percentage = Math.min(
    tokenUsageData?.data?.data?.percentageUsage || 0,
    100
  );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>

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
