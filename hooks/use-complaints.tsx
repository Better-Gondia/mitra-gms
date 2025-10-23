"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetchComplaints, ComplaintsQueryParams } from "@/lib/utils";
import type { Complaint } from "@/lib/types";

interface UseComplaintsOptions {
  params?: ComplaintsQueryParams;
  enabled?: boolean;
}

export function useComplaints({
  params,
  enabled = true,
}: UseComplaintsOptions = {}) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: async () => {
      const response = await apiFetchComplaints(params);
      return {
        data: response.data.map((c: any) => ({
          ...c,
          submittedDate: new Date(c.submittedDate),
          lastUpdated: new Date(c.lastUpdated),
          history: Array.isArray(c.history)
            ? c.history.map((h: any) => ({
                ...h,
                timestamp: new Date(h.timestamp),
                eta: h.eta ? new Date(h.eta) : undefined,
              }))
            : [],
        })) as Complaint[],
        pagination: response.pagination,
      };
    },
    enabled,
    staleTime: 30_000,
  });
}
