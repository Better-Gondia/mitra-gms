"use client";

import React, { useState, useEffect, useMemo } from "react";
import type {
  Complaint,
  UserRole,
  ComplaintHistoryEntry,
  RemarkVisibility,
} from "@/lib/types";
import { stakeholderRoles, userRoles, departments } from "@/lib/types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import toast from "react-hot-toast";
import {
  Clock,
  MessageSquare,
  User,
  CheckCircle2,
  Pencil,
  Milestone,
  Inbox,
  ShieldAlert,
  Ban,
  BrainCircuit,
  Loader2,
  RotateCcw,
  X,
  Hourglass,
  Folder,
  Building,
  Link2,
  Search,
  Unlink2,
  ChevronsRight,
  Sparkles,
  Printer,
  Edit,
  Bot,
  Check,
  Lock,
  Globe,
  Eye,
  Share2,
  MoreVertical,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import {
  cn,
  formatBusinessDuration,
  formatComplaintIdDisplay,
} from "@/lib/utils";
import { Badge } from "@/components/badge";
import { useLanguage } from "@/hooks/use-language";
import type { ComplaintSummary } from "@/ai/flows/summarize-complaint-flow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import RelativeTime from "@/components/relative-time";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";
import { useRole } from "@/hooks/use-role";
import { useAdvancedFeatures } from "@/hooks/use-advanced-features";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MahaGovLogo } from "@/components/mahagov-logo";
import { Combobox } from "@/components/combobox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SplitComplaintDialog } from "@/components/split-complaint-dialog";
import { GitBranch, GitMerge } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Utility function to highlight @tags in remark text
function highlightTags(text: string): React.ReactNode[] {
  if (!text) return [];

  // Valid role names that can be tagged
  const validRoles = [
    "District Collector",
    "Collector Team Advanced",
    "Collector Team",
    "Department Team",
    "Superintendent of Police",
    "MP Rajya Sabha",
    "MP Lok Sabha",
    "MLA Gondia",
    "MLA Tirora",
    "MLA Sadak Arjuni",
    "MLA Deori",
    "MLC",
    "Zila Parishad",
  ];

  // Sort roles by length (longest first) to match longer names before shorter ones
  // e.g., "Collector Team Advanced" before "Collector Team"
  const sortedRoles = [...validRoles].sort((a, b) => b.length - a.length);

  // Escape special regex characters in role names
  const escapedRoles = sortedRoles.map((role) =>
    role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Create regex pattern: @ followed by role name, then word boundary or end
  const rolePattern = `@(${escapedRoles.join("|")})(?=\\s|$|[.,;:!?])`;
  const tagRegex = new RegExp(rolePattern, "gi");

  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted tag
    const tagText = match[0]; // Full match including @
    parts.push(
      <span
        key={match.index}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border border-primary/20 dark:border-primary/30"
      >
        {tagText}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface TimelineTimestampProps {
  date: Date | string;
}

const TimelineTimestamp: React.FC<{ date: Date | string }> = ({ date }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span className="text-xs text-muted-foreground">...</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">
            <RelativeTime date={date} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{format(new Date(date), "PPpp")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Component for a single history entry
const HistoryEntry: React.FC<{
  entry: ComplaintHistoryEntry;
  isFirst: boolean;
  getActionInfo: (action: string) => string;
  t: (key: string) => string;
}> = ({ entry, isFirst, getActionInfo, t }) => {
  const [isExpanded, setIsExpanded] = useState(isFirst); // Expand the first entry by default
  const isStakeholderRemark =
    (entry.role === "District Collector" ||
      stakeholderRoles.includes(entry.role as any)) &&
    entry.action === "Remark added";
  const isInternalRemark = entry.visibility === "internal" && entry.notes;
  const isSubmission = entry.action === "Complaint Submitted";

  const remarkBubbleClass = cn(
    "bg-muted/50 dark:bg-muted/20 border-border",
    isStakeholderRemark &&
      "bg-amber-50 dark:bg-amber-950/40 border-amber-500/50",
    isInternalRemark &&
      !isSubmission &&
      "bg-slate-50 dark:bg-slate-900/20 border-slate-500/30"
  );

  const remarkTextClass = cn(
    "text-muted-foreground",
    isSubmission && "text-foreground",
    isStakeholderRemark && "text-amber-900 dark:text-amber-200",
    isInternalRemark && !isSubmission && "text-slate-600 dark:text-slate-400"
  );

  const userInitials =
    entry.user
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2) || "S";

  const hasRemark = !!entry.notes;
  const previewText = entry.notes?.substring(0, 120) || "";
  const needsTruncation = (entry.notes?.length || 0) > 120;

  // Attempt to parse a status change target from the action string
  const parsedStatusChange = React.useMemo(() => {
    const actionText = entry.action || "";
    const match = actionText.match(/Status changed to\s+(.+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Common action variants
    const known = [
      "Open",
      "Assigned",
      "In Progress",
      "Resolved",
      "Backlog",
      "Need Details",
      "Invalid",
      "Reopened",
    ];
    const found = known.find((k) => actionText.includes(k));
    return found || null;
  }, [entry.action]);

  return (
    <div
      key={entry.id}
      className="relative flex items-start gap-4 group/entry print:mb-4 print:gap-3"
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full z-10 print:size-5",
            isFirst ? "bg-primary" : "bg-muted border"
          )}
        >
          <HistoryIcon
            action={entry.action}
            role={entry.role}
            isCurrent={isFirst}
          />
        </div>
        {!isFirst && <div className="w-px h-full bg-border grow" />}
      </div>

      <div className="w-full -mt-1.5 print:mt-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold print:text-sm">
            {getActionInfo(entry.action)}
          </p>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span className="print:hidden text-xs text-muted-foreground">
            <TimelineTimestamp date={entry.timestamp} />
          </span>
          <span className="hidden print:inline text-xs text-muted-foreground">
            {format(new Date(entry.timestamp), "PPp")}
          </span>
        </div>

        {hasRemark ? (
          <Collapsible
            open={isExpanded}
            onOpenChange={setIsExpanded}
            className="mt-2"
          >
            <div className={cn("rounded-lg border", remarkBubbleClass)}>
              <div className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-6 w-6 text-xs">
                    <AvatarFallback
                      className={cn(
                        "text-muted-foreground",
                        isStakeholderRemark &&
                          "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                      )}
                    >
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight">
                      {entry.user} (
                      {t(entry.role.toLowerCase().replace(/ /g, "_"))})
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <TimelineTimestamp date={entry.timestamp} />
                  </div>
                  {isStakeholderRemark && (
                    <ShieldAlert className="size-3.5 text-amber-500 ml-auto" />
                  )}
                  {isInternalRemark && !isSubmission && (
                    <Lock className="size-3.5 text-slate-500 ml-auto" />
                  )}
                </div>

                <CollapsibleContent className="max-h-96 overflow-y-auto">
                  <p
                    className={cn(
                      "text-sm whitespace-pre-wrap break-words",
                      remarkTextClass
                    )}
                  >
                    {highlightTags(entry.notes || "")}
                  </p>
                </CollapsibleContent>

                {!isExpanded && needsTruncation && (
                  <CollapsibleTrigger asChild>
                    <div className="text-sm">
                      <p className={cn("whitespace-pre-wrap", remarkTextClass)}>
                        {highlightTags(previewText)}
                        <button className="text-primary cursor-pointer hover:underline ml-1">
                          ... see more
                        </button>
                      </p>
                    </div>
                  </CollapsibleTrigger>
                )}
                {isExpanded && needsTruncation && (
                  <CollapsibleTrigger asChild>
                    <button className="text-primary text-sm cursor-pointer hover:underline mt-2">
                      ... see less
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
            </div>
          </Collapsible>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground print:text-xs">
            <User className="size-3" />
            <span>
              {entry.user} ({t(entry.role.toLowerCase().replace(/ /g, "_"))})
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {parsedStatusChange && (
            <Badge
              variant={
                (statusColors as any)[parsedStatusChange]
                  ? (statusColors as any)[parsedStatusChange]
                  : "secondary"
              }
              className="gap-1.5 text-xs"
            >
              {t("status")}: {parsedStatusChange}
            </Badge>
          )}
          {entry.department && (
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Building className="size-3" />
              {entry.department}
            </Badge>
          )}
          {entry.priority && (
            <Badge variant="destructive" className="gap-1.5 text-xs">
              {t("high_priority")}
              <ShieldAlert className="size-3.5" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

interface ComplaintDetailsProps {
  complaint: Complaint;
  complaints: Complaint[];
  onUpdate: (data: any) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onViewMedia: (url: string) => void;
  onClose: () => void;
  onNavigate: (complaintId: string) => void;
  onEditCategory: (complaint: Complaint) => void;
  onPrint: () => void;
}

const HistoryIcon = ({
  action,
  role,
  isCurrent,
}: {
  action: string;
  role: string;
  isCurrent?: boolean;
}) => {
  const colorClass = isCurrent
    ? "text-primary-foreground"
    : "text-muted-foreground";
  const isStakeholder =
    (role === "District Collector" || stakeholderRoles.includes(role as any)) &&
    action === "Remark added";

  if (action === "Complaint Linked") {
    return <Link2 className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action === "Complaint Unlinked") {
    return <Unlink2 className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (isStakeholder) {
    return (
      <ShieldAlert
        className={cn(
          "size-4 print:size-3",
          isCurrent ? "text-primary-foreground" : "text-amber-500"
        )}
      />
    );
  }
  if (action.includes("Submitted") || action.includes("updated")) {
    return <Pencil className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Need Details")) {
    return <MessageSquare className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Invalid")) {
    return <Ban className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Assigned")) {
    return <Inbox className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Resolved")) {
    return <CheckCircle2 className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("In Progress")) {
    return <Hourglass className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Backlog")) {
    return <Folder className={cn("size-4 print:size-3", colorClass)} />;
  }
  if (action.includes("Reopened")) {
    return <RotateCcw className={cn("size-4 print:size-3", colorClass)} />;
  }

  return <Milestone className={cn("size-4 print:size-3", colorClass)} />;
};

const statusColors: {
  [key in Complaint["status"]]:
    | "success"
    | "warning"
    | "destructive"
    | "default"
    | "secondary";
} = {
  Open: "default",
  Assigned: "default",
  "In Progress": "warning",
  Resolved: "success",
  "Need Details": "destructive",
  Invalid: "secondary",
  Backlog: "secondary",
};

const LinkComplaintDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentComplaint: Complaint;
  allComplaints: Complaint[];
  onLink: (targetComplaintId: string, reason: string) => void;
}> = ({ open, onOpenChange, currentComplaint, allComplaints, onLink }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("Duplicate");

  const filteredComplaints = React.useMemo(() => {
    if (!searchTerm) return [];
    return allComplaints
      .filter(
        (c) =>
          c.id !== currentComplaint.id &&
          !currentComplaint.linkedComplaintIds?.includes(c.id) &&
          (c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.title.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, 10);
  }, [searchTerm, allComplaints, currentComplaint]);

  const handleLink = () => {
    if (selectedId) {
      onLink(selectedId, reason);
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedId(null);
      setReason("Duplicate");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t("link_complaint")}</DialogTitle>
          <DialogDescription>{t("link_complaint_desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_by_id_title")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-48 border rounded-md">
            <div className="p-2 space-y-1">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "p-2 rounded-md cursor-pointer border",
                      selectedId === c.id
                        ? "bg-accent ring-2 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <p className="font-semibold">
                      {formatComplaintIdDisplay(c)}: {c.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.location} &bull; {c.department}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4">
                  {t("no_matching_complaints")}
                </p>
              )}
            </div>
          </ScrollArea>

          <div className="grid gap-2">
            <Label>{t("reason_for_linking")}</Label>
            <RadioGroup
              value={reason}
              onValueChange={setReason}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Duplicate" id="r-duplicate" />
                <Label htmlFor="r-duplicate">{t("duplicate")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Related" id="r-related" />
                <Label htmlFor="r-related">{t("related_issue")}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleLink} disabled={!selectedId}>
            {t("link_complaints")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ComplaintDetails({
  complaint,
  complaints,
  onUpdate,
  onUpdateComplaints,
  onViewMedia,
  onClose,
  onNavigate,
  onEditCategory,
  onPrint,
}: ComplaintDetailsProps) {
  const { t } = useLanguage();
  const { role } = useRole();
  const { features } = useAdvancedFeatures();
  const [aiSummary, setAiSummary] = React.useState<ComplaintSummary | null>(
    null
  );
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = React.useState(false);

  const allowedToUpdateRoles: UserRole[] = [
    "District Collector",
    "Collector Team",
    "Collector Team Advanced",
    "Department Team",
  ];
  const canUpdate = allowedToUpdateRoles.includes(role);

  // Reset state when complaint changes
  React.useEffect(() => {
    setAiSummary(null);
    setIsSummaryLoading(false);
  }, [complaint.id]);

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint),
      });
      if (!res.ok) throw new Error("summarize failed");
      const result = await res.json();
      setAiSummary(result as ComplaintSummary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error(
        "AI Summary Failed: Could not generate a summary for this complaint. The API key might be missing or invalid."
      );
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleLinkComplaint = (targetComplaintId: string, reason: string) => {
    const targetComplaint = complaints.find((c) => c.id === targetComplaintId);
    if (!targetComplaint) return;

    const now = new Date();
    const linkNote = `Linked with ${targetComplaintId} (Reason: ${reason})`;
    const targetLinkNote = `Linked with ${complaint.id} (Reason: ${reason})`;

    // Update current complaint
    const updatedCurrentComplaint: Complaint = {
      ...complaint,
      linkedComplaintIds: [
        ...(complaint.linkedComplaintIds || []),
        targetComplaintId,
      ],
      history: [
        {
          id: `hist-link-${now.getTime()}`,
          timestamp: now,
          action: `Complaint Linked`,
          user: role,
          role: role,
          notes: linkNote,
          visibility: "internal",
        },
        ...complaint.history,
      ],
      lastUpdated: now,
    };

    // Update target complaint
    const updatedTargetComplaint: Complaint = {
      ...targetComplaint,
      linkedComplaintIds: [
        ...(targetComplaint.linkedComplaintIds || []),
        complaint.id,
      ],
      history: [
        {
          id: `hist-link-${now.getTime()}-target`,
          timestamp: now,
          action: `Complaint Linked`,
          user: role,
          role: role,
          notes: targetLinkNote,
          visibility: "internal",
        },
        ...targetComplaint.history,
      ],
      lastUpdated: now,
    };
    onUpdateComplaints([updatedCurrentComplaint, updatedTargetComplaint]);

    toast.success(`${complaint.id} and ${targetComplaintId} are now linked.`);
  };

  const handleSplitComplaint = async (splits: any[]) => {
    try {
      const response = await fetch(`/api/complaints/${complaint.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ splits }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to split complaint");
      }

      const result = await response.json();
      toast.success(
        `Complaint split successfully into ${
          result.displayIds?.length || splits.length
        } complaints.`
      );

      // Refresh complaints list - this will be handled by parent component
      // For now, just close and let parent handle refresh
      setIsSplitDialogOpen(false);

      // Trigger a refresh by calling onUpdate
      if (onUpdate) {
        onUpdate(complaint);
      }
    } catch (error: any) {
      console.error("Error splitting complaint:", error);
      toast.error(error.message || "Failed to split complaint");
      throw error;
    }
  };

  const allHistory = React.useMemo(() => {
    if (!complaint) return [];
    const submissionEntry: ComplaintHistoryEntry = {
      id: `hist-submit-${complaint.id}`,
      timestamp: complaint.submittedDate,
      user: "Citizen",
      role: "Citizen",
      action: "Complaint Submitted",
      notes: complaint.description,
      visibility: "public",
    };

    const remarkEntries: ComplaintHistoryEntry[] = (
      complaint.remarks || []
    ).map((r) => ({
      id: `remark-${r.id}`,
      timestamp: r.createdAt as unknown as Date,
      user: r.user?.name || "",
      role: r.role as UserRole,
      action: "Remark added",
      notes: r.notes,
      visibility: r.visibility,
    }));

    // Merge complaint history, remarks as history entries, and submission entry
    return [...complaint.history, ...remarkEntries, submissionEntry].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [complaint]);

  const getActionInfo = (action: string) => {
    if (action.startsWith("Status changed to ")) {
      const status = action.replace("Status changed to ", "");
      const statusKey = status.toLowerCase().replace(/ /g, "_");
      return `${t("status_changed_to")} '${t(statusKey)}'`;
    }
    if (action === "Complaint Linked") {
      return t("complaint_linked");
    }
    if (action === "Complaint Unlinked") {
      return t("complaint_unlinked");
    }
    const actionKey = action.toLowerCase().replace(/ /g, "_");
    return t(actionKey) || action;
  };

  if (!complaint) return null;

  const statusText = t(complaint.status.toLowerCase().replace(/ /g, "_"));

  const getChameleonButton = () => {
    const commonProps = {
      className: "w-full",
      onClick: () => {
        onClose();
        setTimeout(() => {
          const row = document.querySelector(`[data-row-id="${complaint.id}"]`);
          row?.scrollIntoView({ behavior: "smooth", block: "center" });
          const trigger = row?.querySelector("[data-status-popover-trigger]");
          (trigger as HTMLElement)?.click();
        }, 150);
      },
    };

    if (
      stakeholderRoles.includes(role as any) ||
      role === "District Collector"
    ) {
      return (
        <Button {...commonProps}>
          <MessageSquare className="mr-2" />
          {t("add_remark")}
        </Button>
      );
    }

    switch (complaint.status) {
      case "Open":
        return (
          <Button {...commonProps}>
            <ChevronsRight className="mr-2" />
            {t("assign_complaint")}
          </Button>
        );
      case "In Progress":
      case "Assigned":
      case "Backlog":
        return (
          <Button {...commonProps}>
            <Pencil className="mr-2" />
            {t("update_status_desc")}
          </Button>
        );
      case "Need Details":
        return (
          <Button {...commonProps}>
            <Pencil className="mr-2" />
            {t("update_status_desc")}
          </Button>
        );
      case "Resolved":
      case "Invalid":
        return (
          <Button {...commonProps} variant="outline">
            <RotateCcw className="mr-2" />
            {t("reopen_complaint")}
          </Button>
        );
      default:
        return null;
    }
  };

  const isStakeholder = stakeholderRoles.includes(role as any);

  return (
    <div className="h-full flex flex-col" id="complaint-details-printable">
      <header className="flex items-start justify-between p-6 border-b sticky top-0 bg-background z-10">
        <div className="space-y-1 flex-1 group">
          <h2 className="text-xl font-bold tracking-tight">
            {complaint.title}
            {complaint.isSplit && (
              <Badge variant="secondary" className="ml-2 text-xs">
                <GitBranch className="mr-1 h-3 w-3" />
                Split
              </Badge>
            )}
            {complaint.isMerged && (
              <Badge variant="secondary" className="ml-2 text-xs">
                <GitMerge className="mr-1 h-3 w-3" />
                Merged
              </Badge>
            )}
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
              ID: {formatComplaintIdDisplay(complaint)}
            </span>
            <Badge
              variant={statusColors[complaint.status]}
              className="capitalize"
            >
              {statusText}
            </Badge>
            {complaint.priority === "High" && (
              <Badge variant="destructive" className="gap-1.5">
                {t(complaint.priority.toLowerCase())}
                <ShieldAlert className="size-3.5" />
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {features.enableAiSummary && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleGenerateSummary}
                    disabled={isSummaryLoading}
                  >
                    {isSummaryLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {aiSummary ? (
                          <RotateCcw className="mr-2 size-3.5" />
                        ) : (
                          <Sparkles className="mr-2 size-3.5" />
                        )}{" "}
                        {t(aiSummary ? "regenerate" : "ai_summary")}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate AI Summary</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* --- PRINT ONLY HEADER --- */}
      <div className="hidden print:block">
        <header className="print-header">
          <div className="print-header-branding">
            {/* <MahaGovLogo /> */}
            <div className="print-header-title">
              <h1>GMS by Better Gondia</h1>
              <p>Grievance Redressal System</p>
            </div>
          </div>
          <div className="print-header-meta">
            <strong>Complaint ID:</strong> {formatComplaintIdDisplay(complaint)}
          </div>
        </header>
        <div className="print-meta-bar">
          <div>
            <strong>Printed By:</strong> {role}
          </div>
          <div>
            <strong>Printed On:</strong> {format(new Date(), "PPpp")}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 print:overflow-visible">
        <div className="p-6 space-y-6 print:p-0 print:space-y-0">
          {/* --- PRINT ONLY LAYOUT --- */}
          <div className="hidden print:grid print:grid-cols-2 print:gap-6">
            <div className="print-section">
              <h2 className="print-section-title">Complaint Details</h2>
              <div className="print-detail-grid">
                <div>
                  <Label>Title</Label>
                  <p>{complaint.title}</p>
                </div>
                <div>
                  <Label>Submitted</Label>
                  <p>{format(complaint.submittedDate, "PPp")}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{statusText}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p>{complaint.priority || "Normal"}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p>{complaint.department || "N/A"}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p>{complaint.location}</p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="whitespace-pre-wrap">{complaint.description}</p>
                </div>
              </div>
            </div>
            <div className="print-section">
              <h2 className="print-section-title">Internal Workflow</h2>
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 h-full w-px bg-border -translate-x-1/2 ml-3" />
                {allHistory.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    isFirst={index === 0}
                    getActionInfo={getActionInfo}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- WEB VIEW --- */}
          <div className="print:hidden">
            {features.enableAiSummary && (aiSummary || isSummaryLoading) && (
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
                <CardHeader className="p-4 flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      {t("sentient_timeline")}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      An AI-powered summary of this complaint's lifecycle.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {isSummaryLoading && !aiSummary ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t("generating_summary")}</span>
                    </div>
                  ) : (
                    aiSummary && (
                      <div className="space-y-3 text-sm text-blue-900/80 dark:text-blue-200/80">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
                            <BrainCircuit className="size-4" /> {t("summary")}
                          </h4>
                          <p className="italic text-xs+">
                            "{aiSummary.summary}"
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200 dark:border-blue-800/50">
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                              {t("suggested_priority")}
                            </h4>
                            <Badge
                              variant={
                                aiSummary.suggestedPriority === "High"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {aiSummary.suggestedPriority}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                              {t("sentiment")}
                            </h4>
                            <p>{aiSummary.sentiment}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {t("complaint_history")}
              </h3>
              <div className="flex flex-col gap-4">
                {allHistory.map((entry, index) => (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    isFirst={index === 0}
                    getActionInfo={getActionInfo}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* --- PRINT ONLY FOOTER --- */}
      <div className="hidden print:block mt-8">
        <div className="print-notes-section">
          <h2 className="print-section-title">Field Notes & Manual Actions</h2>
          <div className="print-notes-lines">
            <div className="print-notes-line"></div>
            <div className="print-notes-line"></div>
            <div className="print-notes-line"></div>
            <div className="print-notes-line"></div>
          </div>
        </div>
        <div className="print-footer">
          <p>
            This is a computer-generated document from GMS by Better Gondia
            platform.
          </p>
        </div>
      </div>
      <div
        className="p-4 border-t flex items-center gap-2"
        data-testid="chameleon-button-container"
      >
        {getChameleonButton()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdate && (
              <>
                <DropdownMenuItem onClick={() => onEditCategory(complaint)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsLinkDialogOpen(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {t("link_complaint")}
                </DropdownMenuItem>
                {!complaint.isSplit && !complaint.isMerged && (
                  <DropdownMenuItem onSelect={() => setIsSplitDialogOpen(true)}>
                    <GitBranch className="mr-2 h-4 w-4" />
                    {t("split_complaint")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Complaint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LinkComplaintDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        currentComplaint={complaint}
        allComplaints={complaints}
        onLink={handleLinkComplaint}
      />

      {canUpdate && !complaint.isSplit && !complaint.isMerged && (
        <SplitComplaintDialog
          open={isSplitDialogOpen}
          onOpenChange={setIsSplitDialogOpen}
          complaint={complaint}
          onSplit={handleSplitComplaint}
        />
      )}
    </div>
  );
}
