"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import type { Complaint, SortDescriptor } from "@/lib/types";

interface FilterState {
  searchTerm: string;
  dateRange?: DateRange;
  statusFilter: string;
  departmentFilter: string;
  tehsilFilter: string;
  pinnedFilter: boolean;
  myRemarksFilter: boolean;
  mentionsFilter: boolean;
  linkedFilter: boolean;
}

interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
}

interface URLParamsState {
  filters: FilterState;
  sortDescriptor: SortDescriptor;
  pagination: PaginationState;
}

const defaultFilters: FilterState = {
  searchTerm: "",
  dateRange: undefined,
  statusFilter: "all",
  departmentFilter: "all",
  tehsilFilter: "all",
  pinnedFilter: false,
  myRemarksFilter: false,
  mentionsFilter: false,
  linkedFilter: false,
};

const defaultSort: SortDescriptor = {
  column: "id",
  direction: "descending",
};

const defaultPagination: PaginationState = {
  currentPage: 1,
  rowsPerPage: 10,
};

export function useURLParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters into state
  const urlState = useMemo((): URLParamsState => {
    const filters: FilterState = {
      searchTerm: searchParams.get("search") || defaultFilters.searchTerm,
      dateRange: (() => {
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        if (dateFrom && dateTo) {
          const from = parseISO(dateFrom);
          const to = parseISO(dateTo);
          if (isValid(from) && isValid(to)) {
            return { from, to };
          }
        }
        return defaultFilters.dateRange;
      })(),
      statusFilter: searchParams.get("status") || defaultFilters.statusFilter,
      departmentFilter:
        searchParams.get("department") || defaultFilters.departmentFilter,
      tehsilFilter: searchParams.get("tehsil") || defaultFilters.tehsilFilter,
      pinnedFilter: searchParams.get("pinned") === "true",
      myRemarksFilter: searchParams.get("myRemarks") === "true",
      mentionsFilter: searchParams.get("mentions") === "true",
      linkedFilter: searchParams.get("linked") === "true",
    };

    const sortOrderParam = searchParams.get("sortOrder");
    // Handle both "asc"/"desc" and "ascending"/"descending" formats
    let sortDirection: "ascending" | "descending" = defaultSort.direction;
    if (sortOrderParam === "asc" || sortOrderParam === "ascending") {
      sortDirection = "ascending";
    } else if (sortOrderParam === "desc" || sortOrderParam === "descending") {
      sortDirection = "descending";
    }

    const sortDescriptor: SortDescriptor = {
      column:
        (searchParams.get("sortBy") as
          | keyof Complaint
          | "date"
          | "details"
          | "last_updated"
          | "attention") || defaultSort.column,
      direction: sortDirection,
    };

    const pagination: PaginationState = {
      currentPage: parseInt(searchParams.get("page") || "1", 10),
      rowsPerPage: parseInt(searchParams.get("limit") || "10", 10),
    };

    return { filters, sortDescriptor, pagination };
  }, [searchParams]);

  // Update URL parameters
  const updateURL = useCallback(
    (updates: Partial<URLParamsState>) => {
      const current = new URLSearchParams(searchParams.toString());

      // Update filters
      if (updates.filters) {
        const { filters } = updates;

        if (filters.searchTerm !== undefined) {
          if (filters.searchTerm) {
            current.set("search", filters.searchTerm);
          } else {
            current.delete("search");
          }
        }

        if ("dateRange" in filters) {
          // Date range is being updated (either set or cleared)
          if (filters.dateRange?.from && filters.dateRange?.to) {
            // Set date params if both dates are present
            current.set(
              "dateFrom",
              format(filters.dateRange.from, "yyyy-MM-dd")
            );
            current.set("dateTo", format(filters.dateRange.to, "yyyy-MM-dd"));
          } else {
            // Clear date params if dateRange is undefined, null, or incomplete
            current.delete("dateFrom");
            current.delete("dateTo");
          }
        }

        if (filters.statusFilter !== undefined) {
          if (filters.statusFilter !== "all") {
            current.set("status", filters.statusFilter);
          } else {
            current.delete("status");
          }
        }

        if (filters.departmentFilter !== undefined) {
          if (filters.departmentFilter !== "all") {
            current.set("department", filters.departmentFilter);
          } else {
            current.delete("department");
          }
        }

        if (filters.tehsilFilter !== undefined) {
          if (filters.tehsilFilter !== "all") {
            current.set("tehsil", filters.tehsilFilter);
          } else {
            current.delete("tehsil");
          }
        }

        if (filters.pinnedFilter !== undefined) {
          if (filters.pinnedFilter) {
            current.set("pinned", "true");
          } else {
            current.delete("pinned");
          }
        }

        if (filters.myRemarksFilter !== undefined) {
          if (filters.myRemarksFilter) {
            current.set("myRemarks", "true");
          } else {
            current.delete("myRemarks");
          }
        }

        if (filters.mentionsFilter !== undefined) {
          if (filters.mentionsFilter) {
            current.set("mentions", "true");
          } else {
            current.delete("mentions");
          }
        }

        if (filters.linkedFilter !== undefined) {
          if (filters.linkedFilter) {
            current.set("linked", "true");
          } else {
            current.delete("linked");
          }
        }
      }

      // Update sorting - always set the values to ensure they're in the URL
      if (updates.sortDescriptor) {
        const { sortDescriptor } = updates;

        // Always set sortBy to ensure it's in the URL
        current.set("sortBy", sortDescriptor.column);
        //
        // Always set sortOrder to ensure it's in the URL
        current.set("sortOrder", sortDescriptor.direction);
      }

      // Update pagination
      if (updates.pagination) {
        const { pagination } = updates;

        if (pagination.currentPage !== defaultPagination.currentPage) {
          current.set("page", pagination.currentPage.toString());
        } else {
          current.delete("page");
        }

        if (pagination.rowsPerPage !== defaultPagination.rowsPerPage) {
          current.set("limit", pagination.rowsPerPage.toString());
        } else {
          current.delete("limit");
        }
      }

      // Update URL
      const newURL = `${window.location.pathname}${
        current.toString() ? `?${current.toString()}` : ""
      }`;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  // Helper functions for common operations
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      updateURL({
        filters: { ...urlState.filters, [key]: value },
        pagination: { ...urlState.pagination, currentPage: 1 }, // Reset to first page on filter change
      });
    },
    [updateURL, urlState.filters, urlState.pagination]
  );

  const updateSort = useCallback(
    (sortDescriptor: SortDescriptor) => {
      updateURL({ sortDescriptor });
    },
    [updateURL]
  );

  const updatePagination = useCallback(
    (pagination: Partial<PaginationState>) => {
      // Get current pagination state from URL to avoid stale state
      const currentPagination: PaginationState = {
        currentPage: parseInt(searchParams.get("page") || "1", 10),
        rowsPerPage: parseInt(searchParams.get("limit") || "10", 10),
      };
      updateURL({ pagination: { ...currentPagination, ...pagination } });
    },
    [updateURL, searchParams]
  );

  const resetFilters = useCallback(() => {
    updateURL({
      filters: defaultFilters,
      pagination: { ...urlState.pagination, currentPage: 1 },
    });
  }, [updateURL, urlState.pagination]);

  const resetAll = useCallback(() => {
    updateURL({
      filters: defaultFilters,
      sortDescriptor: defaultSort,
      pagination: defaultPagination,
    });
  }, [updateURL]);

  return {
    ...urlState,
    updateFilter,
    updateSort,
    updatePagination,
    resetFilters,
    resetAll,
  };
}
