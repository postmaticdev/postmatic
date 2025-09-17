interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  value: string;
  breakdown?: Array<{ label: string; value: number; color: string }>;
  details?: Array<{ label: string; value: string }>;
}

export function AnalyticsCard({
  title,
  subtitle,
  value,
  breakdown,
  details,
}: AnalyticsCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>

      <div className="text-3xl font-bold text-foreground mb-4">{value}</div>

      {breakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
              <span className="text-muted-foreground">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      )}

      {details && (
        <div className="space-y-1">
          {details.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
