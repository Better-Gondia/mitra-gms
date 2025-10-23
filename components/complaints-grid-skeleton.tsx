"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ComplaintsGridSkeletonProps {
  count?: number;
}

const ComplaintsGridSkeleton: React.FC<ComplaintsGridSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ComplaintsGridSkeleton;
