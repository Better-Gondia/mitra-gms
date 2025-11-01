"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortOption {
  value: string;
  label: string;
}

interface PaginationControlsProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  setRowsPerPage: (value: number) => void;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  currentPageItems?: number; // Actual items on current page
  // Sort controls
  sortOptions?: SortOption[];
  currentSortColumn?: string;
  currentSortDirection?: "ascending" | "descending";
  onSortChange?: (column: string) => void;
  onSortDirectionToggle?: () => void;
}

export default function PaginationControls({
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage,
  setRowsPerPage,
  totalPages: serverTotalPages,
  hasNextPage,
  hasPrevPage,
  currentPageItems,
  sortOptions,
  currentSortColumn,
  currentSortDirection,
  onSortChange,
  onSortDirectionToggle,
}: PaginationControlsProps) {
  const { t } = useLanguage();

  // Calculate total pages correctly
  const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
  const totalPages =
    totalItems === 0
      ? 0
      : serverTotalPages && serverTotalPages > 0
      ? serverTotalPages
      : calculatedTotalPages;

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  // Calculate display values - handle edge cases
  // Use actual items on current page if provided, otherwise calculate
  const actualPageItems =
    currentPageItems ??
    Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems === 0 ? 0 : startItem + actualPageItems - 1;

  // Don't render if no items
  if (totalItems === 0 || totalPages === 0) {
    return null;
  }

  const currentSortLabel =
    sortOptions?.find((opt) => opt.value === currentSortColumn)?.label ||
    "Submitted Date";

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Top row: Results count and Sort */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 ">
            <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="rows-per-page"
                  className="text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  Rows per page
                </label>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    const newLimit = Number(value);
                    // Reset to page 1 when changing rows per page
                    setRowsPerPage(newLimit);
                  }}
                >
                  <SelectTrigger id="rows-per-page" className="h-9 w-[80px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-muted-foreground">Page</span>
                <span className="text-foreground">{currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="text-foreground">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-9 w-9 p-0 lg:flex"
                  onClick={handleFirst}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={handlePrevious}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-9 w-9 p-0 lg:flex"
                  onClick={handleLast}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Showing</span>
            <span className="font-medium text-foreground">
              {startItem}-{endItem}
            </span>
            <span className="text-muted-foreground">of</span>
            <span className="font-medium text-foreground">{totalItems}</span>
            <span className="text-muted-foreground">
              complaint{totalItems === 1 ? "" : "s"}
            </span>
          </div> */}
          {sortOptions && onSortChange && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <span className="text-sm">Sort by: {currentSortLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentSortColumn}
                    onValueChange={onSortChange}
                  >
                    {sortOptions.map((opt) => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {onSortDirectionToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onSortDirectionToggle}
                >
                  {currentSortDirection === "ascending" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Bottom row: Pagination controls */}
        {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t">
          <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <label
                htmlFor="rows-per-page"
                className="text-sm font-medium text-muted-foreground whitespace-nowrap"
              >
                Rows per page
              </label>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="rows-per-page" className="h-9 w-[80px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">Page</span>
              <span className="text-foreground">{currentPage}</span>
              <span className="text-muted-foreground">of</span>
              <span className="text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="hidden h-9 w-9 p-0 lg:flex"
                onClick={handleFirst}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={handlePrevious}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={handleNext}
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-9 w-9 p-0 lg:flex"
                onClick={handleLast}
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
