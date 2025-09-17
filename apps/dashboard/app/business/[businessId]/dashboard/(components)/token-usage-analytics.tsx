import { TokenCard } from "./token-card";
import { AdvancedTokenChart } from "./advanced-token-chart";
import { useTokenGetAnalyticType } from "@/services/tier/token.api";
import { useParams } from "next/navigation";

export function TokenUsageAnalytics() {
  const { businessId } = useParams() as { businessId: string };
  const { data: tokenUsageData } = useTokenGetAnalyticType(businessId);
  const data = tokenUsageData?.data?.data || [];
  return (
    <div className="flex-1 gap-6 mb-6 w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {data.map((item) => (
          <TokenCard
            key={item.type}
            title={item.type}
            used={item.result.totalUsedToken.toString()}
            total={item.result.totalValidToken.toString()}
            percentage={Math.min(item.result.percentageUsage, 100)}
            isSoon={item.type !== "Image"}
          />
        ))}
      </div>

      {/* Advanced Token Chart with Period Filter */}
      <AdvancedTokenChart />
    </div>
  );
}
