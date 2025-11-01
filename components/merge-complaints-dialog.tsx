"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "@/components/badge";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/lib/types";
import { useRole } from "@/hooks/use-role";
import { useComplaints } from "@/hooks/use-complaints";
import { collectorStatuses, departmentStatuses } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";

interface MergeComplaintsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaints: Complaint[];
  selectedComplaintIds?: string[];
  onMerge: (
    complaintIds: string[],
    primaryComplaintId: string,
    mergeReason: string
  ) => Promise<void>;
}

export function MergeComplaintsDialog({
  open,
  onOpenChange,
  complaints: initialComplaints,
  selectedComplaintIds = [],
  onMerge,
}: MergeComplaintsDialogProps) {
  const { t } = useLanguage();
  const { role } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(selectedComplaintIds)
  );
  const [primaryId, setPrimaryId] = useState<string | null>(
    selectedComplaintIds[0] || null
  );
  const [mergeReason, setMergeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Determine role-based status filter
  const roleStatuses = useMemo(() => {
    if (role === "District Collector") return undefined; // Show all
    if (role === "Collector Team") {
      return collectorStatuses.join(",");
    }
    if (role === "Department Team") {
      return departmentStatuses.join(",");
    }
    return undefined;
  }, [role]);

  // Fetch complaints from API when searching or when dialog opens with empty search
  const shouldFetchInitial = open && !debouncedSearchTerm.trim();
  const shouldFetchSearch = open && debouncedSearchTerm.trim().length > 0;

  const { data: searchResults, isLoading: isSearching } = useComplaints({
    params: debouncedSearchTerm.trim()
      ? {
          search: debouncedSearchTerm.trim(),
          statuses: roleStatuses,
          limit: 50, // Limit results for merge dialog
          page: 1,
        }
      : {
          statuses: roleStatuses,
          limit: 50, // Initial load with role-based filtering
          page: 1,
        },
    enabled: shouldFetchInitial || shouldFetchSearch,
  });

  // Use API search results if available, otherwise use initial complaints
  const availableComplaints = useMemo(() => {
    if (searchResults?.data && searchResults.data.length > 0) {
      return searchResults.data;
    }
    // If no search results and we're not searching, use initial complaints
    if (!debouncedSearchTerm.trim()) {
      return initialComplaints;
    }
    return [];
  }, [debouncedSearchTerm, searchResults, initialComplaints]);

  React.useEffect(() => {
    if (open) {
      const initialIds = new Set(selectedComplaintIds);
      setSelectedIds(initialIds);
      setPrimaryId(selectedComplaintIds[0] || null);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setMergeReason("");
    }
  }, [open, selectedComplaintIds]);

  const filteredComplaints = useMemo(() => {
    let filtered = availableComplaints;

    // Filter out already merged complaints (unless they're already selected)
    filtered = filtered.filter((c) => {
      // Show merged complaints only if they're already selected
      if (c.isMerged && !selectedIds.has(c.id)) {
        return false;
      }
      return true;
    });

    return filtered;
  }, [availableComplaints, selectedIds]);

  const toggleComplaint = (complaintId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(complaintId)) {
      newSelected.delete(complaintId);
      if (primaryId === complaintId) {
        setPrimaryId(Array.from(newSelected)[0] || null);
      }
    } else {
      newSelected.add(complaintId);
      if (!primaryId) {
        setPrimaryId(complaintId);
      }
    }
    setSelectedIds(newSelected);
  };

  const handlePrimaryChange = (complaintId: string) => {
    if (selectedIds.has(complaintId)) {
      setPrimaryId(complaintId);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size < 2 || !primaryId) return;

    setIsSubmitting(true);
    try {
      await onMerge(Array.from(selectedIds), primaryId, mergeReason);
      onOpenChange(false);
    } catch (error) {
      console.error("Error merging complaints:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = selectedIds.size >= 2 && primaryId !== null;
  const selectedComplaintsList = availableComplaints.filter((c) =>
    selectedIds.has(c.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("merge_complaints")}</DialogTitle>
          <DialogDescription>
            {t("merge_complaints_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("search_complaints_merge")}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
              }}
              className="pl-10"
              autoFocus={false}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
            <div className="flex flex-col overflow-hidden min-h-0">
              <Label className="mb-2">
                {t("select_complaints_merge").replace(
                  "{{count}}",
                  String(selectedIds.size)
                )}
              </Label>
              <ScrollArea className="flex-1 min-h-0 border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => {
                      const isSelected = selectedIds.has(complaint.id);
                      const isPrimary = primaryId === complaint.id;
                      const isMerged = complaint.isMerged;

                      return (
                        <div
                          key={complaint.id}
                          onClick={() =>
                            !isMerged && toggleComplaint(complaint.id)
                          }
                          className={cn(
                            "p-3 rounded-md border cursor-pointer transition-colors",
                            isSelected && "bg-accent border-primary",
                            !isSelected && "hover:bg-muted/50",
                            isMerged && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={isSelected}
                              disabled={isMerged}
                              onCheckedChange={() =>
                                !isMerged && toggleComplaint(complaint.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {complaint.id}
                                </span>
                                {isPrimary && (
                                  <Badge variant="default" className="text-xs">
                                    {t("primary")}
                                  </Badge>
                                )}
                                {isMerged && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {t("merged")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {complaint.title || complaint.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{complaint.status}</span>
                                {complaint.department && (
                                  <>
                                    <span>•</span>
                                    <span>{complaint.department}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {t("searching")}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">
                      {searchTerm.trim()
                        ? t("no_complaints_found_search")
                        : t("start_typing_search")}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex flex-col overflow-hidden min-h-0">
              <Label className="mb-2">{t("selected_complaints_primary")}</Label>
              <ScrollArea className="flex-1 min-h-0 border rounded-md">
                {selectedComplaintsList.length > 0 ? (
                  <RadioGroup
                    value={primaryId || undefined}
                    onValueChange={handlePrimaryChange}
                    className="p-2"
                  >
                    <div className="space-y-2">
                      {selectedComplaintsList.map((complaint) => (
                        <div
                          key={complaint.id}
                          className={cn(
                            "p-3 rounded-md border",
                            primaryId === complaint.id &&
                              "border-primary bg-primary/5"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <RadioGroupItem
                              value={complaint.id}
                              id={`primary-${complaint.id}`}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`primary-${complaint.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-semibold text-sm mb-1">
                                {complaint.id}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {complaint.title || complaint.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{complaint.status}</span>
                                {complaint.department && (
                                  <>
                                    <span>•</span>
                                    <span>{complaint.department}</span>
                                  </>
                                )}
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground text-center p-4">
                    {t("select_at_least_two_merge")}
                  </p>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="merge-reason">{t("merge_reason_optional")}</Label>
            <Textarea
              id="merge-reason"
              placeholder={t("enter_merge_reason")}
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {selectedComplaintsList.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-2">{t("merge_preview")}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  • {t("primary_complaint")}:{" "}
                  <span className="font-semibold">
                    {selectedComplaintsList.find((c) => c.id === primaryId)
                      ?.id || t("not_selected")}
                  </span>
                </li>
                <li>
                  • {t("will_merge")}:{" "}
                  {selectedComplaintsList
                    .filter((c) => c.id !== primaryId)
                    .map((c) => c.id)
                    .join(", ") || t("none")}
                </li>
                <li>
                  • {t("total_history_entries")}:{" "}
                  {selectedComplaintsList.reduce(
                    (sum, c) => sum + (c.history?.length || 0),
                    0
                  )}
                </li>
                <li>
                  • {t("total_remarks")}:{" "}
                  {selectedComplaintsList.reduce(
                    (sum, c) => sum + (c.remarks?.length || 0),
                    0
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? t("merging") : t("merge_complaints")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
