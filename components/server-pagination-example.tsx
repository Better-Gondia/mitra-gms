"use client";

import React, { useState } from "react";
import { useComplaints } from "@/hooks/use-complaints";
import ComplaintsGridSkeleton from "@/components/complaints-grid-skeleton";
import PaginationControls from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, RefreshCw } from "lucide-react";
import type { ComplaintsQueryParams } from "@/lib/utils";

/**
 * Example component demonstrating server-side pagination and filtering
 * This shows how to use the new API endpoints with loading states
 */
export default function ServerPaginationExample() {
  const [filters, setFilters] = useState<ComplaintsQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    department: "",
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error, refetch } = useComplaints({
    params: filters,
  });

  const handleFilterChange = (key: keyof ComplaintsQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRowsPerPageChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load complaints</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Server-Side Filtering & Pagination Example
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || ""}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="NEED_DETAILS">Need Details</SelectItem>
                <SelectItem value="INVALID">Invalid</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.department || ""}
              onValueChange={(value) => handleFilterChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="Public Works">Public Works</SelectItem>
                <SelectItem value="Water Supply">Water Supply</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                <SelectItem value="Police">Police</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy || "updatedAt"}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {data?.pagination ? (
                <>
                  Showing{" "}
                  {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{" "}
                  {Math.min(
                    (filters.page || 1) * (filters.limit || 10),
                    data.pagination.totalCount
                  )}{" "}
                  of {data.pagination.totalCount} complaints
                </>
              ) : (
                "Loading..."
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <ComplaintsGridSkeleton count={filters.limit || 10} />
          ) : data?.data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((complaint) => (
                <div key={complaint.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{complaint.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>ID: {complaint.id}</span>
                        <span>Status: {complaint.status}</span>
                        <span>Department: {complaint.department || "N/A"}</span>
                        <span>Category: {complaint.category || "N/A"}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>
                        Created:{" "}
                        {new Date(complaint.submittedDate).toLocaleDateString()}
                      </div>
                      <div>
                        Updated:{" "}
                        {new Date(complaint.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No complaints found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <PaginationControls
          currentPage={data.pagination.page}
          setCurrentPage={handlePageChange}
          totalItems={data.pagination.totalCount}
          itemsPerPage={data.pagination.limit}
          setRowsPerPage={handleRowsPerPageChange}
          totalPages={data.pagination.totalPages}
          hasNextPage={data.pagination.hasNextPage}
          hasPrevPage={data.pagination.hasPrevPage}
        />
      )}
    </div>
  );
}
