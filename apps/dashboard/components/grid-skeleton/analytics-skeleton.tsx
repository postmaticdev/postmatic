import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Analytics Card 1 - Jumlah Postingan */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-8 w-16 mb-4" />
        
        {/* Breakdown items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Card 2 - Konten mendatang */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-8 w-12 mb-4" />
        
        {/* Breakdown items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Token Usage Card */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-8 w-20 mb-4" />
        
        {/* Progress bar */}
        <Skeleton className="h-2 w-full mb-2" />
        
        {/* Progress details */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
