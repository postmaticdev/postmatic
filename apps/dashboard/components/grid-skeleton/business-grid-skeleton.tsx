"use client";

import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";


interface BusinessGridSkeletonProps {
  count?: number;
}

export function BusinessGridSkeleton({ count = 8 }: BusinessGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <Card
              key={i}
              className="group transition-all duration-300 hover:scale-105 bg-card border-border shadow-sm my-7 cursor-pointer"
            >
              <CardContent className="py-4 md:py-6">
                <div className="space-y-3">
                  <Skeleton className="h-[380px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
  );
}
