"use client";

import React from "react";
import { useURLParams } from "@/hooks/use-url-params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Test component to verify URL parameters are working correctly
 */
export default function URLParamsTest() {
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

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>URL Parameters Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current State:</h3>
            <div className="text-sm space-y-1">
              <div>
                <strong>Search:</strong> {filters.searchTerm}
              </div>
              <div>
                <strong>Status:</strong> {filters.statusFilter}
              </div>
              <div>
                <strong>Department:</strong> {filters.departmentFilter}
              </div>
              <div>
                <strong>Tehsil:</strong> {filters.tehsilFilter}
              </div>
              <div>
                <strong>Pinned:</strong> {filters.pinnedFilter ? "Yes" : "No"}
              </div>
              <div>
                <strong>Sort By:</strong> {sortDescriptor.column}
              </div>
              <div>
                <strong>Sort Direction:</strong> {sortDescriptor.direction}
              </div>
              <div>
                <strong>Page:</strong> {pagination.currentPage}
              </div>
              <div>
                <strong>Rows Per Page:</strong> {pagination.rowsPerPage}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Controls:</h3>

            <div className="flex gap-2">
              <Input
                placeholder="Search term"
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
              />
              <Button onClick={() => updateFilter("statusFilter", "Open")}>
                Set Status to Open
              </Button>
              <Button
                onClick={() => updateFilter("departmentFilter", "Water Supply")}
              >
                Set Department
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  updateSort({ column: "title", direction: "ascending" })
                }
              >
                Sort by Title (A-Z)
              </Button>
              <Button
                onClick={() =>
                  updateSort({ column: "date", direction: "descending" })
                }
              >
                Sort by Date (Newest)
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => updatePagination({ currentPage: 2 })}>
                Go to Page 2
              </Button>
              <Button
                onClick={() =>
                  updatePagination({ rowsPerPage: 20, currentPage: 1 })
                }
              >
                Set 20 per page
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
              <Button onClick={resetAll} variant="destructive">
                Reset All
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Check the URL in your browser - it should update as you change the
              filters, sorting, and pagination.
            </p>
            <p>
              You can also manually edit the URL parameters and see the state
              update accordingly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
