import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function UpcomingPostsSkeleton() {
  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {/* Image skeleton */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>

              {/* Content skeleton */}
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>

              {/* Dropdown button skeleton */}
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
