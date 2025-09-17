import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-card">
          <div className="p-4">
            {/* Image skeleton */}
            <Skeleton className="w-full h-32 rounded-lg mb-3" />
            
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4 mb-2" />
            
            {/* Publisher skeleton */}
            <Skeleton className="h-3 w-1/2 mb-2" />
            
            {/* Categories skeleton */}
            <div className="flex gap-1 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            
            {/* Action button skeleton */}
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}
