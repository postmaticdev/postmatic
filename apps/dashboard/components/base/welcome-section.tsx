import { TimezoneSelector } from "@/app/business/[businessId]/content-scheduler/(components)/timezone-selector";
import { useSubscribtionGetSubscription } from "@/services/tier/subscribtion.api";
import { useParams } from "next/navigation";
import { Badge } from "../ui/badge";
interface WelcomeSectionProps {
  title?: string;
  message?: string;
  showTimezoneSelector?: boolean;
  showSubscription?: boolean;
}

export function WelcomeSection({
  title = "IF THIS SHOW, IT MEANS ERROR",
  message = "IF THIS SHOW, IT MEANS ERROR",
  showTimezoneSelector = false,
  showSubscription = false,
}: WelcomeSectionProps) {
  const { businessId } = useParams() as { businessId: string };
  const { data: subscriptionData } = useSubscribtionGetSubscription(
    businessId || ""
  );
  const subscription = subscriptionData?.data?.data ?? null;
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-row mb-4 items-center gap-4 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {title}
            </h1>
            {showSubscription && (
              <Badge className="text-xs text-white w-fit">
                {subscription?.subscription?.productName || "Paket Gratis"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        {showTimezoneSelector && (
          <div className="flex items-center gap-4">
            <TimezoneSelector />
          </div>
        )}
      </div>
    </div>
  );
}
