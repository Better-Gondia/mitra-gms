"use client";

import { useMemo } from "react";
import { useComplaints } from "./use-complaints";
import { useURLParams } from "./use-url-params";
import type { Complaint, UserRole } from "@/lib/types";
import { stakeholderRoles } from "@/lib/types";

interface UseComplaintsWithFiltersOptions {
  role: UserRole;
  pinnedComplaints: Set<string>;
  staleFilterIds: string[];
}

export function useComplaintsWithFilters({
  role,
  pinnedComplaints,
  staleFilterIds,
}: UseComplaintsWithFiltersOptions) {
  // Get URL-driven state
  const {
    filters,
    sortDescriptor,
    pagination,
    updateFilter,
    updateSort,
    updatePagination,
    resetFilters,
    resetAll,
  } = useURLParams();

  // Server-side query parameters with proper pagination
  const serverParams = useMemo(() => {
    const params: any = {
      page: pagination.currentPage,
      limit: pagination.rowsPerPage,
      sortBy:
        sortDescriptor.column === "date"
          ? "createdAt"
          : sortDescriptor.column === "last_updated"
          ? "updatedAt"
          : sortDescriptor.column === "attention"
          ? "updatedAt"
          : sortDescriptor.column,
      sortOrder: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    };

    // Add server-side filters
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }
    if (filters.statusFilter && filters.statusFilter !== "all") {
      params.status = filters.statusFilter;
    }
    // Role-based status scoping when no explicit status filter is set
    // All department roles (mapped to "Department Team" in UI) should see department statuses
    if (!filters.statusFilter || filters.statusFilter === "all") {
      if (role === "Department Team") {
        params.statuses = "Assigned,In Progress,Resolved,Backlog";
      }
      // Collector Team, Collector Team Advanced, and District Collector see all statuses (no restriction)
    }
    // Note: Department filtering by role is handled server-side in app/api/complaints/route.ts
    if (filters.departmentFilter && filters.departmentFilter !== "all") {
      params.department = filters.departmentFilter;
    }
    if (filters.tehsilFilter && filters.tehsilFilter !== "all") {
      params.tehsil = filters.tehsilFilter;
    }
    if (filters.dateRange?.from) {
      params.dateFrom = filters.dateRange.from.toISOString().split("T")[0];
    }
    if (filters.dateRange?.to) {
      params.dateTo = filters.dateRange.to.toISOString().split("T")[0];
    }

    return params;
  }, [filters, sortDescriptor, pagination]);

  const { data, isLoading, error } = useComplaints({ params: serverParams });

  // Client-side filtering for complex filters that aren't server-side yet
  const filteredComplaints = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Role-based filtering
    const isComplaintVisibleInRole = (complaint: Complaint) => {
      if (
        role === "District Collector" ||
        role === "Collector Team" ||
        role === "Collector Team Advanced" ||
        stakeholderRoles.includes(role as any)
      ) {
        return true;
      }
      if (role === "Department Team") {
        return ["Assigned", "In Progress", "Resolved", "Backlog"].includes(
          complaint.status
        );
      }
      return false;
    };

    filtered = filtered.filter(isComplaintVisibleInRole);

    // Stale filter
    if (staleFilterIds.length > 0) {
      const staleIdSet = new Set(staleFilterIds);
      return filtered.filter((c) => staleIdSet.has(c.id));
    }

    // Client-side filters
    if (filters.pinnedFilter) {
      filtered = filtered.filter((c) => pinnedComplaints.has(c.id));
    }
    if (filters.myRemarksFilter) {
      filtered = filtered.filter((c) => c.history.some((h) => h.role === role));
    }
    if (filters.mentionsFilter) {
      filtered = filtered.filter((c) =>
        c.history.some((h) => h.taggedUsers?.includes(role))
      );
    }
    if (filters.linkedFilter) {
      filtered = filtered.filter(
        (c) => c.linkedComplaintIds && c.linkedComplaintIds.length > 0
      );
    }

    // Client-side sorting for pinned complaints (always show pinned first)
    const sorted = [...filtered].sort((a, b) => {
      const aIsPinned = pinnedComplaints.has(a.id);
      const bIsPinned = pinnedComplaints.has(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });

    return sorted;
  }, [data?.data, role, filters, pinnedComplaints, staleFilterIds]);

  // Use server-side paginated data directly
  const paginatedComplaints = useMemo(() => {
    return filteredComplaints;
  }, [filteredComplaints]);

  // For KPI calculations, we need to fetch all data without pagination
  // This is a separate query for analytics purposes
  const kpiParams = useMemo(() => {
    const params: any = {
      page: 1,
      limit: 10000, // Large limit to get all data for KPI calculations
      sortBy: "updatedAt",
      sortOrder: "desc",
    };

    // Add server-side filters for KPI data
    // if (filters.searchTerm) {
    //   params.search = filters.searchTerm;
    // }
    // if (filters.statusFilter && filters.statusFilter !== "all") {
    //   params.status = filters.statusFilter;
    // }
    // if (filters.departmentFilter && filters.departmentFilter !== "all") {
    //   params.department = filters.departmentFilter;
    // }
    // if (filters.tehsilFilter && filters.tehsilFilter !== "all") {
    //   params.tehsil = filters.tehsilFilter;
    // }
    // if (filters.dateRange?.from) {
    //   params.dateFrom = filters.dateRange.from.toISOString().split("T")[0];
    // }
    // if (filters.dateRange?.to) {
    //   params.dateTo = filters.dateRange.to.toISOString().split("T")[0];
    // }

    return params;
    // }, [filters]);
  }, []);
  const { data: kpiData } = useComplaints({
    params: kpiParams,
    enabled: true, // Always fetch KPI data
  });

  // Process KPI data with client-side filters
  const allComplaintsForKPI = useMemo(() => {
    if (!kpiData?.data) return [];

    let filtered = kpiData.data;

    // Role-based filtering
    const isComplaintVisibleInRole = (complaint: Complaint) => {
      if (
        role === "District Collector" ||
        role === "Collector Team" ||
        role === "Collector Team Advanced" ||
        stakeholderRoles.includes(role as any)
      ) {
        return true;
      }
      if (role === "Department Team") {
        return ["Assigned", "In Progress", "Resolved", "Backlog"].includes(
          complaint.status
        );
      }
      return false;
    };

    filtered = filtered.filter(isComplaintVisibleInRole);

    return filtered;
  }, [kpiData?.data, role]);

  return {
    data: paginatedComplaints,
    allData: allComplaintsForKPI, // Use KPI data for allData
    isLoading,
    error,
    pagination: data?.pagination || {
      page: pagination.currentPage,
      limit: pagination.rowsPerPage,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    // URL-driven state and controls
    filters,
    sortDescriptor,
    paginationState: pagination,
    updateFilter,
    updateSort,
    updatePagination,
    resetFilters,
    resetAll,
  };
}
