interface WelcomeSectionProps {
  title?: string;
  message?: string;
  showTimezoneSelector?: boolean;
}

import { TimezoneSelector } from "@/app/business/[businessId]/content-scheduler/(components)/timezone-selector";

export function WelcomeSection({
  title = "IF THIS SHOW, IT MEANS ERROR",
  message = "IF THIS SHOW, IT MEANS ERROR",
  showTimezoneSelector = false,
}: WelcomeSectionProps) {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {title}
          </h1>
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
