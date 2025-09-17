interface TokenCardProps {
  title: string;
  used: string;
  total: string;
  percentage: number;
  isSoon?: boolean;
}

export function TokenCard({
  title,
  used,
  total,
  percentage,
  isSoon = false,
}: TokenCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border relative w-full">
      {isSoon && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          SOON
        </div>
      )}
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <div className="text-lg font-bold mb-1">
        {used} / {total}
      </div>
      <div className="text-xs text-muted-foreground">
        {percentage}% digunakan
      </div>
    </div>
  );
}
