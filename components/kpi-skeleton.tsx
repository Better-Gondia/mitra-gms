"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface KpiSkeletonProps {
  count?: number;
}

const KpiSkeleton: React.FC<KpiSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-0">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-5" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-20 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiSkeleton;
