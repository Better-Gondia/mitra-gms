"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complaint, Department, ComplaintStatus } from "@/lib/types";
import { departments, allStatuses } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { Checkbox } from "./ui/checkbox";

interface SplitConfig {
  title?: string;
  description?: string;
  department?: Department;
  status?: ComplaintStatus;
  media?: any[];
}

interface SplitComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: Complaint;
  onSplit: (splits: SplitConfig[]) => Promise<void>;
}

export function SplitComplaintDialog({
  open,
  onOpenChange,
  complaint,
  onSplit,
}: SplitComplaintDialogProps) {
  const { t } = useLanguage();
  const [numSplits, setNumSplits] = useState(2);
  const [splits, setSplits] = useState<SplitConfig[]>(() =>
    Array(2)
      .fill(null)
      .map(() => ({}))
  );
  const [copyFromOriginal, setCopyFromOriginal] = useState<boolean[]>(
    Array(2).fill(false)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      setNumSplits(2);
      setSplits(
        Array(2)
          .fill(null)
          .map(() => ({}))
      );
      setCopyFromOriginal(Array(2).fill(false));
    }
  }, [open]);

  const handleNumSplitsChange = (value: string) => {
    const newNum = parseInt(value) || 2;
    setNumSplits(newNum);
    const newSplits = Array(newNum)
      .fill(null)
      .map((_, idx) => splits[idx] || {});
    setSplits(newSplits);
    const newCopyFlags = Array(newNum)
      .fill(false)
      .map((_, idx) => copyFromOriginal[idx] || false);
    setCopyFromOriginal(newCopyFlags);
  };

  const handleCopyFromOriginalChange = (index: number, checked: boolean) => {
    const newCopyFlags = [...copyFromOriginal];
    newCopyFlags[index] = checked;
    setCopyFromOriginal(newCopyFlags);

    if (checked) {
      // Fill split with original complaint data
      updateSplit(index, {
        title: complaint.title || undefined,
        description: complaint.description || undefined,
        department: complaint.department,
        status: complaint.status,
      });
    } else {
      // Clear all fields when unchecked
      updateSplit(index, {
        title: undefined,
        description: undefined,
        department: undefined,
        status: undefined,
      });
    }
  };

  const updateSplit = (index: number, updates: Partial<SplitConfig>) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], ...updates };
    setSplits(newSplits);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSplit(splits);
      onOpenChange(false);
    } catch (error) {
      console.error("Error splitting complaint:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    splits.length >= 2 &&
    splits.every(
      (split) =>
        (split.description && split.description.trim()) ||
        split.department ||
        split.status
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t("split_complaint")}</DialogTitle>
          <DialogDescription>
            {t("split_complaint_description").replace("{{id}}", complaint.id)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4 min-h-0">
          <div className="grid gap-2 flex-shrink-0 mx-1">
            <Label htmlFor="num-splits">{t("number_of_splits")}</Label>
            <Select
              value={numSplits.toString()}
              onValueChange={handleNumSplitsChange}
            >
              <SelectTrigger id="num-splits">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}{" "}
                    {num === 1
                      ? t("complaint_singular")
                      : t("complaints_plural")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border rounded-md">
            <div className="p-4 space-y-6">
              {splits.map((split, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">
                      {t("split_number").replace("{{num}}", String(index + 1))}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {t("split_will_be_created")
                        .replace("{{id}}", complaint.id)
                        .replace("{{num}}", String(index + 1))}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id={`copy-original-${index}`}
                      checked={copyFromOriginal[index]}
                      onCheckedChange={(checked) =>
                        handleCopyFromOriginalChange(index, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`copy-original-${index}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Copy from original complaint
                    </Label>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`split-title-${index}`}>
                        {t("title_optional")}
                      </Label>
                      <Input
                        id={`split-title-${index}`}
                        placeholder={complaint.title || t("complaint_title")}
                        value={split.title || ""}
                        onChange={(e) =>
                          updateSplit(index, { title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`split-description-${index}`}>
                        {t("description")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id={`split-description-${index}`}
                        placeholder={
                          split.description ||
                          complaint.description ||
                          t("enter_split_description")
                        }
                        value={split.description || ""}
                        onChange={(e) =>
                          updateSplit(index, { description: e.target.value })
                        }
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`split-dept-${index}`}>
                          {t("department")}
                        </Label>
                        <Select
                          value={split.department || ""}
                          onValueChange={(value) =>
                            updateSplit(index, {
                              department: value as Department,
                            })
                          }
                        >
                          <SelectTrigger id={`split-dept-${index}`}>
                            <SelectValue placeholder={t("select_department")} />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`split-status-${index}`}>
                          {t("status")}
                        </Label>
                        <Select
                          value={split.status || ""}
                          onValueChange={(value) =>
                            updateSplit(index, {
                              status: value as ComplaintStatus,
                            })
                          }
                        >
                          <SelectTrigger id={`split-status-${index}`}>
                            <SelectValue placeholder={t("select_status")} />
                          </SelectTrigger>
                          <SelectContent>
                            {allStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? t("splitting") : t("split_complaint")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
