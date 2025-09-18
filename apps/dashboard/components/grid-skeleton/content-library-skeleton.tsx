import { Skeleton } from "@/components/ui/skeleton";

interface ContentLibrarySkeletonProps {
  count?: number;
}

export function ContentLibrarySkeleton({ count = 8 }: ContentLibrarySkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative group border border-border bg-card shadow-sm p-3 rounded-lg"
        >
          {/* Image skeleton with aspect-square */}
          <div className="aspect-square  rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
            
            {/* Category badge skeleton */}
         
          </div>

          <div className="mt-4 space-y-3">
            {/* Caption skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex space-x-2">
              <Skeleton className="h-8 flex-1 rounded" />
              <Skeleton className="h-8 flex-1 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
