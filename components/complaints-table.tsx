"use client";

import React, { useState, useMemo, useRef, Fragment } from "react";
import type {
  Complaint,
  ComplaintHistoryEntry,
  SortDescriptor,
  UserRole,
  Department,
  Priority,
  ComplaintStatus,
  Eta,
  RemarkVisibility,
} from "@/lib/types";
import {
  allStatuses,
  departments,
  userRoles,
  stakeholderRoles,
  complaintWorkflow,
} from "@/lib/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "@/components/badge";
import {
  format,
  formatDistanceToNowStrict,
  isSaturday,
  isSunday,
  getHours,
  differenceInDays,
  differenceInMinutes,
  differenceInMilliseconds,
} from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Eye,
  Copy,
  Building,
  Calendar as CalendarIcon,
  AlertTriangle,
  Camera,
  ShieldAlert,
  Inbox,
  Sparkles,
  Link2,
  PinOff,
  Pin,
  Lock,
  Globe,
  Edit,
  Printer,
  History,
  Pencil,
  CheckSquare,
  MoreVertical,
  Search,
  Check,
  Hourglass,
  Folder as FolderIcon,
  FolderOpen,
  Ban,
  FilePlus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Unlink2,
  Copy as CopyIcon,
  Link as LinkIcon,
  Edit2,
  MapPin,
  Share2,
  Hand,
  GitBranch,
  GitMerge,
  User,
  Phone,
} from "lucide-react";
import { SplitComplaintDialog } from "@/components/split-complaint-dialog";
import { Button } from "./ui/button";
import { cn, formatPreciseDuration } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import toast from "react-hot-toast";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Image from "next/image";
import RelativeTime from "@/components/relative-time";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import MediaAttachments from "./media-attachments";
import { MergeComplaintsDialog } from "@/components/merge-complaints-dialog";

const REMARK_CHAR_LIMIT = 280;

// Utility function to highlight @tags in remark text
function highlightTagsInRemark(text: string): React.ReactNode[] {
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

const HorizontalTimeline: React.FC<{ complaint: Complaint }> = ({
  complaint,
}) => {
  const { t } = useLanguage();

  const getStatusInfo = (
    status: ComplaintStatus
  ): {
    date: Date | null;
    user: string | null;
    role: UserRole | null;
    notes: string | undefined;
  } => {
    if (status === "Open") {
      const submissionEntry = complaint.history.find(
        (h) => h.action === "Complaint Submitted"
      ) || {
        timestamp: complaint.submittedDate,
        user: "Citizen",
        role: "Citizen" as UserRole,
        notes: complaint.description,
      };
      return {
        date: new Date(submissionEntry.timestamp),
        user: submissionEntry.user,
        role: submissionEntry.role || ("Citizen" as UserRole),
        notes: submissionEntry.notes,
      };
    }
    const historyEntry = [...complaint.history]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .find((h) => h.action.includes(status));

    return {
      date: historyEntry?.timestamp ? new Date(historyEntry.timestamp) : null,
      user: historyEntry?.user || null,
      role: (historyEntry?.role as UserRole) || null,
      notes: historyEntry?.notes,
    };
  };

  const dynamicWorkflow = useMemo(() => {
    let workflow: ComplaintStatus[] = [...complaintWorkflow];
    const offPathStatuses: ComplaintStatus[] = [
      "Need Details",
      "Backlog",
      "Invalid",
    ];

    const occurredOffPath = new Set<ComplaintStatus>();

    const allHistory = [
      ...complaint.history,
      {
        action: `Status changed to ${complaint.status}`,
        timestamp: complaint.lastUpdated,
        user: "",
        role: "Citizen" as UserRole,
      },
    ].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (offPathStatuses.includes(complaint.status)) {
      occurredOffPath.add(complaint.status);
    }
    allHistory.forEach((h) => {
      offPathStatuses.forEach((s) => {
        if (h.action.includes(s)) {
          occurredOffPath.add(s);
        }
      });
    });

    occurredOffPath.forEach((status) => {
      const info = getStatusInfo(status);
      if (info.date) {
        let inserted = false;
        for (let i = 0; i < workflow.length - 1; i++) {
          const step1Date = getStatusInfo(workflow[i]).date;
          const step2Date = getStatusInfo(workflow[i + 1])?.date;
          if (
            step1Date &&
            step2Date &&
            info.date > step1Date &&
            info.date < step2Date
          ) {
            workflow.splice(i + 1, 0, status);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          const assignedIndex = workflow.indexOf("Assigned");
          const assignedDate = getStatusInfo("Assigned").date;
          if (
            assignedIndex !== -1 &&
            assignedDate &&
            info.date > assignedDate
          ) {
            const inProgressIndex = workflow.indexOf("In Progress");
            if (inProgressIndex !== -1) {
              workflow.splice(inProgressIndex, 0, status);
            } else {
              workflow.splice(assignedIndex + 1, 0, status);
            }
          } else {
            const openIndex = workflow.indexOf("Open");
            if (openIndex !== -1) {
              workflow.splice(openIndex + 1, 0, status);
            }
          }
        }
      }
    });

    return Array.from(new Set(workflow));
  }, [complaint]);

  let lastCompletedMainWorkflowIndex = -1;
  for (let i = complaintWorkflow.length - 1; i >= 0; i--) {
    if (getStatusInfo(complaintWorkflow[i]).date) {
      lastCompletedMainWorkflowIndex = i;
      break;
    }
  }

  if (["Resolved", "Invalid"].includes(complaint.status)) {
    const currentIndexInMain = complaintWorkflow.indexOf(
      complaint.status as any
    );
    if (currentIndexInMain > lastCompletedMainWorkflowIndex) {
      lastCompletedMainWorkflowIndex = currentIndexInMain;
    }
    if (
      complaint.status === "Resolved" &&
      lastCompletedMainWorkflowIndex < complaintWorkflow.indexOf("In Progress")
    ) {
      lastCompletedMainWorkflowIndex = complaintWorkflow.indexOf("In Progress");
    }
  }

  const isOffPathStatus = (status: ComplaintStatus) =>
    !complaintWorkflow.includes(status);

  const relevantHistoryEntries = useMemo(
    () =>
      complaint.history
        .filter(
          (entry) =>
            ((entry.role === "District Collector" ||
              stakeholderRoles.includes(entry.role as any)) &&
              entry.action === "Remark added") ||
            entry.action === "Complaint Linked"
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
    [complaint.history]
  );

  return (
    <div className="w-full flex justify-center py-6">
      <div className="flex items-center justify-center relative w-full">
        {dynamicWorkflow.map((step, index) => {
          const stepInfo = getStatusInfo(step);
          const prevStep = index > 0 ? dynamicWorkflow[index - 1] : null;
          const prevStepInfo = prevStep ? getStatusInfo(prevStep) : null;

          const isMainPath = complaintWorkflow.includes(step);

          const mainPathIndex = complaintWorkflow.indexOf(step as any);
          const isCompleted =
            stepInfo.date !== null &&
            (isMainPath
              ? mainPathIndex <= lastCompletedMainWorkflowIndex
              : true);

          const isCurrent = step === complaint.status;

          let durationText = "";
          let durationForFlex = 0;

          if (index > 0 && prevStepInfo?.date && stepInfo.date) {
            durationForFlex = differenceInMilliseconds(
              stepInfo.date,
              prevStepInfo.date
            );
            durationText = formatPreciseDuration(
              prevStepInfo.date,
              stepInfo.date
            );
          }

          // Compute events in segment directly (no hooks inside loops)
          const eventsInSegment = (() => {
            if (!prevStepInfo?.date) return [];
            const segmentEndDate = stepInfo.date || new Date();
            return relevantHistoryEntries.filter((entry) => {
              const entryDate = new Date(entry.timestamp);
              return (
                entryDate > prevStepInfo.date! && entryDate <= segmentEndDate
              );
            });
          })();

          const isConnectorSolid = index > 0 && isCompleted;

          const connector =
            index > 0 ? (
              <div
                className={cn(
                  "relative h-0.5",
                  isConnectorSolid
                    ? "bg-primary"
                    : "border-t-2 border-dotted border-border"
                )}
                style={{ flexGrow: durationForFlex > 0 ? durationForFlex : 1 }}
              >
                {eventsInSegment.map((entry) => {
                  const segmentStartDate =
                    prevStepInfo && prevStepInfo.date
                      ? prevStepInfo.date
                      : new Date();
                  const segmentEndDate = stepInfo.date || new Date(); // Use now for pending segments
                  const totalDuration = differenceInMilliseconds(
                    segmentEndDate,
                    segmentStartDate
                  );
                  const eventOffset = differenceInMilliseconds(
                    new Date(entry.timestamp),
                    segmentStartDate
                  );
                  const positionPercent =
                    totalDuration > 0
                      ? (eventOffset / totalDuration) * 100
                      : 50;

                  if (positionPercent < 0 || positionPercent > 100) return null;

                  const isLinkEvent = entry.action === "Complaint Linked";
                  const iconBg = isLinkEvent ? "bg-blue-500" : "bg-amber-500";
                  const TooltipIcon = isLinkEvent ? Link2 : ShieldAlert;

                  return (
                    <TooltipProvider key={entry.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute -translate-x-1/2 -translate-y-1/2 top-1/2 w-3 h-3 rounded-full border-2 border-background z-10",
                              iconBg
                            )}
                            style={{ left: `${positionPercent}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex items-center gap-2 font-bold">
                            <TooltipIcon className="size-4" />
                            <span>
                              {isLinkEvent
                                ? "Complaint Linked"
                                : `${entry.user} (${entry.role})`}
                            </span>
                          </div>
                          <p className="text-sm">
                            {format(new Date(entry.timestamp), "PPpp")}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                              {highlightTagsInRemark(entry.notes)}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {durationText && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap bg-muted/30 px-1 rounded">
                    {durationText}
                  </span>
                )}
              </div>
            ) : null;

          let nodeBgColor = "bg-muted";
          let nodeBorderColor = "border-border";
          let nodeTextColor = "text-muted-foreground";
          let nodeIconColor = "text-muted-foreground";
          let shouldPulse = false;

          const isBlocked = isCurrent && isOffPathStatus(step);

          if (isCompleted) {
            if (isBlocked) {
              nodeBgColor = "bg-destructive/10";
              nodeBorderColor = "border-destructive/50";
              nodeTextColor = "text-destructive";
              nodeIconColor = "text-destructive";
            } else {
              nodeBgColor = "bg-primary/10";
              nodeBorderColor = "border-transparent";
              nodeTextColor = "text-primary";
              nodeIconColor = "text-primary";
            }
          }

          if (isCurrent) {
            nodeTextColor = "text-foreground font-semibold";
            if (isBlocked) {
              nodeBgColor = "bg-destructive";
              nodeBorderColor = "border-destructive";
              nodeIconColor = "text-white";
              if (!["Resolved", "Invalid"].includes(complaint.status)) {
                shouldPulse = true;
              }
            } else {
              nodeBgColor = "bg-primary";
              nodeBorderColor = "border-primary";
              nodeIconColor = "text-white";
              if (!["Resolved", "Invalid"].includes(complaint.status)) {
                shouldPulse = true;
              }
            }
          }

          const iconMap: Record<string, React.ElementType> = {
            Open: FilePlus,
            Assigned: Inbox,
            "In Progress": History,
            Resolved: CheckSquare,
            "Need Details": Hourglass,
            Backlog: FolderOpen,
            Invalid: Ban,
          };

          const IconComponent = iconMap[step] || History;

          const node = (
            <div className="relative flex flex-col items-center text-center w-28 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("flex flex-col items-center")}>
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10",
                          nodeBgColor,
                          nodeBorderColor,
                          shouldPulse && "ring-4 ring-primary/20 animate-pulse",
                          isBlocked && shouldPulse && "ring-destructive/20"
                        )}
                      >
                        <IconComponent
                          className={cn("size-4", nodeIconColor)}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-bold">
                      {t(step.toLowerCase().replace(/ /g, "_"))}
                    </p>
                    {stepInfo.date ? (
                      <>
                        <p className="text-sm">
                          {format(new Date(stepInfo.date), "PPpp")}
                        </p>
                        {((stepInfo.user && stepInfo.user !== "System") ||
                          stepInfo.role) && (
                          <p className="text-sm">
                            By{" "}
                            {stepInfo.user && stepInfo.user !== "System"
                              ? `${stepInfo.user} (${
                                  stepInfo.role
                                    ? t(
                                        stepInfo.role
                                          .toLowerCase()
                                          .replace(/ /g, "_")
                                      )
                                    : ""
                                })`
                              : stepInfo.role
                              ? t(
                                  stepInfo.role.toLowerCase().replace(/ /g, "_")
                                )
                              : ""}
                          </p>
                        )}
                        {stepInfo.notes && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                            {stepInfo.notes}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>Pending</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className={cn("text-xs mt-2 truncate w-full", nodeTextColor)}>
                {t(step.toLowerCase().replace(/ /g, "_"))}
              </p>
              {stepInfo.date ? (
                <p className="text-xs text-muted-foreground">
                  <RelativeTime date={stepInfo.date!} />
                </p>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">
                  Pending
                </p>
              )}
            </div>
          );

          return (
            <Fragment key={step}>
              {connector}
              {node}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

const RemarkCard: React.FC<{
  entry: ComplaintHistoryEntry;
  allComplaints: Complaint[];
  onNavigate: (complaintId: string) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
}> = ({ entry, allComplaints, onNavigate, onUpdateComplaints }) => {
  const { t } = useLanguage();
  const { role } = useRole();
  // const { toast } = useToast();
  const isStakeholderRemark =
    entry.role === "District Collector" ||
    stakeholderRoles.includes(entry.role as any);
  const isInternalRemark = entry.visibility === "internal";

  const isLinkAction = entry.action === "Complaint Linked";
  // Match BG-{id} format or legacy formats
  const linkedComplaintIdMatch = entry.notes?.match(/(BG-\d+(?:-\d+)?)/i);
  const linkedComplaintId = linkedComplaintIdMatch
    ? linkedComplaintIdMatch[0]
    : null;
  const linkedComplaint = linkedComplaintId
    ? allComplaints.find((c) => c.id === linkedComplaintId)
    : null;
  const userInitials =
    entry.user
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2) || "S";

  const handleUnlinkComplaint = (targetComplaintId: string) => {
    const currentComplaint = allComplaints.find((c) =>
      c.history.some((h) => h.id === entry.id)
    )!;
    const targetComplaint = allComplaints.find(
      (c) => c.id === targetComplaintId
    );
    if (!currentComplaint || !targetComplaint) return;

    const now = new Date();

    const updatedCurrentComplaint: Complaint = {
      ...currentComplaint,
      linkedComplaintIds: currentComplaint.linkedComplaintIds?.filter(
        (id) => id !== targetComplaintId
      ),
      history: [
        {
          id: `hist-unlink-${now.getTime()}`,
          timestamp: now,
          action: `Complaint Unlinked`,
          user: role,
          role: role,
          notes: `Unlinked from complaint ${targetComplaintId}.`,
          visibility: "internal",
        },
        ...currentComplaint.history,
      ],
      lastUpdated: now,
    };

    const updatedTargetComplaint: Complaint = {
      ...targetComplaint,
      linkedComplaintIds: targetComplaint.linkedComplaintIds?.filter(
        (id) => id !== currentComplaint.id
      ),
      history: [
        {
          id: `hist-unlink-${now.getTime()}-target`,
          timestamp: now,
          action: `Complaint Unlinked`,
          user: role,
          role: role,
          notes: `Unlinked from complaint ${currentComplaint.id}.`,
          visibility: "internal",
        },
        ...targetComplaint.history,
      ],
      lastUpdated: now,
    };
    onUpdateComplaints([updatedCurrentComplaint, updatedTargetComplaint]);
    toast.success(
      `${currentComplaint.id} and ${targetComplaintId} have been unlinked.`
    );
  };

  if (isLinkAction && linkedComplaint) {
    const linkedStatusText = t(
      linkedComplaint.status.toLowerCase().replace(/ /g, "_")
    );
    const reasonMatch = entry.notes?.match(/\(Reason: (.*?)\)/);
    const reason = reasonMatch ? reasonMatch[1] : "Linked";

    const handleCopyId = () => {
      navigator.clipboard.writeText(linkedComplaint.id).then(() => {
        toast.success(
          `${t("complaint_id")} ${linkedComplaint.id} ${t("has_been_copied")}`
        );
      });
    };

    return (
      <Card className="transition-all flex flex-col flex-shrink-0 h-32">
        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {linkedComplaint.id}
              </span>
              <Badge
                variant={statusColors[linkedComplaint.status]}
                className="capitalize text-xs"
              >
                {linkedStatusText}
              </Badge>
            </div>
            <Badge variant="secondary" className="text-xs">
              {reason}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>By {entry.user}</span>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <RelativeTime date={entry.timestamp} />
          </div>

          <p
            className="text-sm font-medium text-foreground line-clamp-2 mt-1 cursor-pointer hover:underline"
            title={linkedComplaint.title}
            onClick={handleCopyId}
          >
            {linkedComplaint.title}
          </p>

          <div className="mt-auto flex items-center justify-end -mb-1 -mr-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleUnlinkComplaint(linkedComplaint.id)}
                  >
                    <Unlink2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("unlink_complaint")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all flex flex-col flex-shrink-0 min-h-32 max-h-64",
        isStakeholderRemark && "border-amber-500/50"
      )}
    >
      <CardContent className="p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 text-xs">
              <AvatarImage
                src={`https://picsum.photos/seed/${entry.user}/40/40`}
                alt={entry.user}
              />
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
              <p className="font-semibold text-sm leading-tight">
                {entry.user} ({entry.role})
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                <RelativeTime date={entry.timestamp} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isInternalRemark && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="size-3.5 text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Internal Remark</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isStakeholderRemark && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldAlert className="size-3.5 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stakeholder Remark</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="pr-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {highlightTagsInRemark(entry.notes || "")}
            </p>
          </div>
        </ScrollArea>

        {entry.attachment && (
          <div className="mt-auto pt-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={entry.attachment}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Camera className="mr-2" />
                View Attachment
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExpandedRowContent: React.FC<{
  complaint: Complaint;
  allComplaints: Complaint[];
  onEditCategory: (complaint: Complaint) => void;
  pinnedComplaints: Set<string>;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onNavigate: (complaintId: string) => void;
  onViewMedia?: (url: string) => void;
}> = ({
  complaint,
  allComplaints,
  onEditCategory,
  pinnedComplaints,
  onUpdateComplaints,
  onNavigate,
  onViewMedia,
}) => {
  const { t } = useLanguage();
  const { role } = useRole();
  const canUpdate = [
    "District Collector",
    "Collector Team",
    "Collector Team Advanced",
    "Department Team",
  ].includes(role);

  const remarksHistory = useMemo(() => {
    const linkEntries = [...complaint.history]
      .filter((h) => h.action === "Complaint Linked")
      .map((h) => h);

    const remarkEntries = (complaint.remarks || []).map((r) => ({
      id: `remark-${r.id}`,
      timestamp: r.createdAt as unknown as Date,
      user: r.user?.name || "",
      role: r.role as UserRole,
      action: "Remark added",
      notes: r.notes,
      visibility: r.visibility,
    }));

    return [...linkEntries, ...remarkEntries].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [complaint]);

  const isCollectorTeamAdvanced =
    role === "Collector Team Advanced" || role === "District Collector";

  return (
    <div className="flex flex-col bg-muted/30">
      {/* User Information Card - Only for Collector Team */}
      {isCollectorTeamAdvanced &&
        complaint.user &&
        (complaint.user.name || complaint.user.mobile) && (
          <>
            <div className="p-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Citizen Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complaint.user.name && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Name
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                          {complaint.user.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {complaint.user.mobile && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Mobile
                        </p>
                        <a
                          href={`tel:${complaint.user.mobile}`}
                          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-0.5 block truncate"
                        >
                          {complaint.user.mobile}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Separator />
          </>
        )}

      <div className="p-6">
        <p className="text-sm text-muted-foreground">{complaint.description}</p>
      </div>

      {complaint.media && complaint.media.length > 0 && (
        <>
          <Separator />
          <div className="p-6">
            <MediaAttachments
              attachments={complaint.media}
              onViewMedia={onViewMedia}
            />
          </div>
        </>
      )}

      <Separator />

      <div className="py-6 px-6 flex justify-center">
        <HorizontalTimeline complaint={complaint} />
      </div>

      {remarksHistory.length > 0 && (
        <>
          <Separator />
          <div className="p-6">
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {remarksHistory.map((entry) => (
                  <CarouselItem
                    key={entry.id}
                    className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"
                  >
                    <RemarkCard
                      entry={entry}
                      allComplaints={allComplaints}
                      onNavigate={onNavigate}
                      onUpdateComplaints={onUpdateComplaints}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </Carousel>
          </div>
        </>
      )}
    </div>
  );
};

type ComplaintsTableProps = {
  complaints: Complaint[];
  allComplaints: Complaint[];
  sortDescriptor: SortDescriptor;
  onSortChange: (descriptor: SortDescriptor) => void;
  onUpdateComplaint: (data: any) => void;
  onViewMedia: (url: string) => void;
  selectedRows: Set<string>;
  setSelectedRows: (rows: Set<string>) => void;
  pinnedComplaints: Set<string>;
  onTogglePin: (id: string) => void;
  onEditCategory: (complaint: Complaint) => void;
  expandedRowId: string | null;
  setExpandedRowId: (id: string | null) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onNavigate: (complaintId: string) => void;
  visibleOptionalColumns: Set<string>;
};

const statusColors: {
  [key in ComplaintStatus]:
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

const TagSuggestions: React.FC<{ onSelect: (tag: string) => void }> = ({
  onSelect,
}) => {
  return (
    <Card className="shadow-md">
      <Command>
        <CommandList>
          <CommandGroup heading="Tag a Role">
            {userRoles.map((role) => (
              <CommandItem key={role} onSelect={() => onSelect(role)}>
                @{role}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Card>
  );
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
                      {c.id}: {c.title}
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

export default function ComplaintsTable({
  complaints,
  allComplaints,
  sortDescriptor,
  onSortChange,
  onUpdateComplaint,
  onViewMedia,
  selectedRows,
  setSelectedRows,
  pinnedComplaints,
  onTogglePin,
  onEditCategory,
  expandedRowId,
  setExpandedRowId,
  onUpdateComplaints,
  onNavigate,
  visibleOptionalColumns,
}: ComplaintsTableProps) {
  const { t } = useLanguage();
  const { role } = useRole();
  // const { toast } = useToast();

  const [activePopover, setActivePopover] = useState<string | null>(null);

  const [assignDept, setAssignDept] = useState<Department | "">("");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [newStatus, setNewStatus] = useState<
    ComplaintStatus | "Reopen" | "Assign" | ""
  >("");
  const [remark, setRemark] = useState("");
  const [eta, setEta] = useState<Date>();
  const [etaWarning, setEtaWarning] = useState<string | null>(null);
  const [isEtaPopoverOpen, setIsEtaPopoverOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isReopening, setIsReopening] = useState(false);
  const [remarkVisibility, setRemarkVisibility] =
    useState<RemarkVisibility>("internal");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [complaintToSplit, setComplaintToSplit] =
    React.useState<Complaint | null>(null);
  const remarkTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [popoverError, setPopoverError] = useState<string | null>(null);
  const [complaintToLink, setComplaintToLink] =
    React.useState<Complaint | null>(null);

  const allowedToUpdateRoles: UserRole[] = [
    "District Collector",
    "Collector Team",
    "Collector Team Advanced",
    "Department Team",
  ];
  const canUpdate = allowedToUpdateRoles.includes(role);

  const isStakeholder = useMemo(
    () => stakeholderRoles.includes(role as any),
    [role]
  );

  const handlePopoverOpenChange = (complaintId: string, isOpen: boolean) => {
    setActivePopover(isOpen ? complaintId : null);
    if (isOpen) {
      const complaint = complaints.find((c) => c.id === complaintId);
      setAssignDept("");
      setIsHighPriority(complaint?.priority === "High");
      setNewStatus("");
      setRemark("");
      setEta(undefined);
      setEtaWarning(null);
      setAttachment(null);
      setIsReopening(false);
      setRemarkVisibility("internal");
      setShowTagSuggestions(false);
      setPopoverError(null);
    }
  };

  const handleQuickUpdate = (complaint: Complaint) => {
    const isAssignAction = newStatus === "Assign";

    if (!newStatus && !remark && !isReopening) {
      setPopoverError(t("please_select_status_or_add_remark"));
      return;
    }

    if (isAssignAction) {
      if (!assignDept) {
        setPopoverError(t("please_select_department"));
        return;
      }
    }

    const mandatoryRemarkStatuses: (ComplaintStatus | "Reopen" | "Assign")[] = [
      "Invalid",
      "Need Details",
      "Backlog",
    ];

    if (isReopening && !remark) {
      setPopoverError(`${t("please_add_remark_for_status")}: ${t("reopen")}`);
      return;
    }

    if (
      newStatus &&
      mandatoryRemarkStatuses.includes(newStatus as any) &&
      !remark
    ) {
      const nextKey = newStatus.toLowerCase().replace(/ /g, "_");
      setPopoverError(`${t("please_add_remark_for_status")}: ${t(nextKey)}`);
      return;
    }

    onUpdateComplaint({
      complaint,
      newStatus: isReopening ? "Reopen" : newStatus,
      remark,
      assignDept: isAssignAction ? assignDept : undefined,
      isHighPriority: isAssignAction ? isHighPriority : undefined,
      eta,
      attachment,
      isReopening,
      remarkVisibility,
    });

    handlePopoverOpenChange(complaint.id, false);
  };

  const getStatusOptions = (
    currentStatus: ComplaintStatus,
    userRole: UserRole
  ): (ComplaintStatus | "Assign")[] => {
    if (
      userRole === "Collector Team" ||
      userRole === "Collector Team Advanced"
    ) {
      if (currentStatus === "Open")
        return ["Assign", "Invalid", "Need Details"];
      if (currentStatus === "Need Details") return ["Open", "Assign"];
    }
    if (userRole === "Department Team") {
      if (currentStatus === "Assigned") return ["In Progress", "Need Details"];
      if (currentStatus === "In Progress")
        return ["Resolved", "Backlog", "Need Details"];
      if (currentStatus === "Backlog") return ["In Progress"];
    }
    return [];
  };

  const isActionable = (status: ComplaintStatus, role: UserRole) => {
    if (role === "District Collector") return true;
    if (stakeholderRoles.includes(role as any)) {
      return (
        !["Resolved", "Invalid"].includes(status) ||
        ["Resolved", "Invalid", "Backlog"].includes(status)
      );
    }
    if (getStatusOptions(status, role).length > 0) return true;
    if (!["Resolved", "Invalid"].includes(status)) return true;
    if (
      ["Resolved", "Invalid", "Backlog"].includes(status) &&
      (role === "Collector Team" ||
        role === "Collector Team Advanced" ||
        role === "Department Team")
    )
      return true;

    return false;
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      toast.success(`${t("complaint_id")} ${id} ${t("has_been_copied")}`);
    });
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/?search=${id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success(`Link to complaint ${id} has been copied.`);
    });
  };

  const handleShareOnWhatsApp = (complaint: Complaint) => {
    const link = `${window.location.origin}/?search=${complaint.id}`;
    const statusText = t(complaint.status.toLowerCase().replace(/ /g, "_"));
    const message = `${t("complaint_id")}: ${complaint.id}\n${t(
      "status"
    )}: ${statusText}\n${complaint.description.substring(0, 100)}${
      complaint.description.length > 100 ? "..." : ""
    }\n\n${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePrintComplaint = (complaint: Complaint) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const statusText = t(complaint.status.toLowerCase().replace(/ /g, "_"));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${complaint.id} - Complaint Details</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .complaint-id {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .metadata {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .section {
              margin: 30px 0;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .description {
              background: #f9f9f9;
              padding: 15px;
              border-left: 4px solid #007bff;
              white-space: pre-wrap;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              background: #007bff;
              color: white;
              border-radius: 5px;
              font-weight: bold;
              margin: 10px 0;
            }
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="complaint-id">${complaint.id}</div>
            <div>Submitted: ${format(complaint.submittedDate, "PPpp")}</div>
            <div>Last Updated: ${format(complaint.lastUpdated, "PPpp")}</div>
          </div>

          <div class="section">
            <div class="section-title">Status</div>
            <div class="status-badge">${statusText}</div>
          </div>

          <div class="metadata">
            <div>
              <strong>Department:</strong> ${complaint.department || "N/A"}<br>
              <strong>Category:</strong> ${complaint.category} / ${
      complaint.subcategory
    }<br>
              <strong>Priority:</strong> ${complaint.priority || "Normal"}
            </div>
            <div>
              <strong>Location:</strong> ${complaint.location || "N/A"}<br>
              <strong>Co-signs:</strong> ${complaint.coSignCount || 0}<br>
              <strong>Type:</strong> ${complaint.type || "Complaint"}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Description</div>
            <div class="description">${complaint.description}</div>
          </div>

          ${
            complaint.media && complaint.media.length > 0
              ? `
          <div class="section">
            <div class="section-title">Media Attachments (${
              complaint.media.length
            })</div>
            <div>${complaint.media
              .map((m, i) => `${i + 1}. ${m.filename}`)
              .join("<br>")}</div>
          </div>
          `
              : ""
          }

          ${
            complaint.linkedComplaintIds &&
            complaint.linkedComplaintIds.length > 0
              ? `
          <div class="section">
            <div class="section-title">Linked Complaints</div>
            <div>${complaint.linkedComplaintIds.join(", ")}</div>
          </div>
          `
              : ""
          }

          <div class="footer">
            Printed on ${format(new Date(), "PPpp")} | ${
      window.location.hostname
    }
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const checkEtaBusinessHours = (date: Date | undefined) => {
    if (!date) {
      setEtaWarning(null);
      return;
    }
    const day = date.getDay();
    const hour = date.getHours();
    if (isSaturday(date) || isSunday(date)) {
      setEtaWarning(t("eta_warning_weekend"));
    } else if (hour < 10 || hour >= 17) {
      setEtaWarning(t("eta_warning_hours"));
    } else {
      setEtaWarning(null);
    }
  };

  const handleEtaDateSelect = (date: Date | undefined) => {
    const newEta = date || eta;
    if (newEta) {
      const currentEta = eta || new Date();
      if (currentEta.getDate() !== newEta.getDate()) {
        newEta.setHours(17, 0, 0, 0);
      }
      setEta(newEta);
      checkEtaBusinessHours(newEta);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (eta && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(eta);
      newDate.setHours(hours, minutes);
      setEta(newDate);
      checkEtaBusinessHours(newDate);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRemark(value);
    if (popoverError) setPopoverError(null);
    if (value.length > REMARK_CHAR_LIMIT) {
    }

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  const handleTagSelect = (selectedTag: string) => {
    const textarea = remarkTextareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = remark.substring(0, cursorPosition);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      const newText =
        remark.substring(0, atMatch.index || 0) +
        `@${selectedTag} ` +
        remark.substring(cursorPosition);
      setRemark(newText);
      setShowTagSuggestions(false);

      setTimeout(() => {
        textarea.focus();
        const newCursorPosition = (atMatch.index || 0) + selectedTag.length + 2;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  const getRemarkPlaceholder = (
    currentStatus: ComplaintStatus,
    nextStatus: string | null,
    visibility: RemarkVisibility
  ) => {
    if (visibility === "public") return t("add_a_public_remark");
    if (nextStatus === "Invalid") return t("explain_why_invalid");
    if (currentStatus === "Need Details") return t("add_details_gathered");
    if (nextStatus === "Need Details") return t("specify_details_required");
    return t("add_a_remark");
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "text-red-600 dark:text-red-500";
    if (score > 60) return "text-orange-500 dark:text-orange-400";
    if (score > 40) return "text-amber-500 dark:text-amber-400";
    return "text-muted-foreground";
  };

  const handleSelectRow = (complaintId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(complaintId)) {
      newSelection.delete(complaintId);
    } else {
      newSelection.add(complaintId);
    }
    setSelectedRows(newSelection);
  };

  const toggleRowExpansion = (complaintId: string) => {
    setExpandedRowId(expandedRowId === complaintId ? null : complaintId);
  };

  const handleLinkComplaint = (targetComplaintId: string, reason: string) => {
    const complaint = complaintToLink;
    const targetComplaint = allComplaints.find(
      (c) => c.id === targetComplaintId
    );
    if (!complaint || !targetComplaint) return;

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

  const handleMergeComplaints = async (
    complaintIds: string[],
    primaryComplaintId: string,
    mergeReason: string
  ) => {
    try {
      const response = await fetch("/api/complaints/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintIds,
          primaryComplaintId,
          mergeReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to merge complaints");
      }

      const result = await response.json();
      toast.success(
        `Successfully merged ${complaintIds.length} complaints into ${primaryComplaintId}.`
      );

      setIsMergeDialogOpen(false);
      setSelectedRows(new Set());

      // Refresh complaints - this will be handled by parent component
      // Parent will handle refetch via query invalidation
    } catch (error: any) {
      console.error("Error merging complaints:", error);
      toast.error(error.message || "Failed to merge complaints");
      throw error;
    }
  };

  const handleSplitComplaint = async (splits: any[]) => {
    if (!complaintToSplit) return;

    try {
      const response = await fetch(
        `/api/complaints/${complaintToSplit.id}/split`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ splits }),
        }
      );

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

      setIsSplitDialogOpen(false);
      setComplaintToSplit(null);

      // Refresh complaints - this will be handled by parent component
    } catch (error: any) {
      console.error("Error splitting complaint:", error);
      toast.error(error.message || "Failed to split complaint");
      throw error;
    }
  };

  const selectedComplaints = allComplaints.filter((c) =>
    selectedRows.has(c.id)
  );
  const canMerge = selectedRows.size >= 2;
  const canMergeUpdate = [
    "District Collector",
    "Collector Team",
    "Collector Team Advanced",
    "Department Team",
  ].includes(role);

  return (
    <div className="space-y-4">
      {canMerge && canMergeUpdate && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedRows.size} complaint{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <Button
            onClick={() => setIsMergeDialogOpen(true)}
            size="sm"
            variant="default"
          >
            <GitMerge className="mr-2 h-4 w-4" />
            {t("merge_selected")}
          </Button>
        </div>
      )}
      {complaints.length > 0 ? (
        complaints.map((complaint) => {
          const isExpanded = expandedRowId === complaint.id;
          const statusText = t(
            complaint.status.toLowerCase().replace(/ /g, "_")
          );
          const isStale =
            !["Resolved", "Invalid"].includes(complaint.status) &&
            differenceInDays(new Date(), new Date(complaint.lastUpdated)) > 3;

          return (
            <Collapsible
              key={complaint.id}
              open={isExpanded}
              onOpenChange={() => toggleRowExpansion(complaint.id)}
              data-row-id={complaint.id}
            >
              <Card
                className={cn(
                  "overflow-hidden transition-all group hover:bg-muted/30",
                  isExpanded && "ring-2 ring-primary bg-muted/30"
                )}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex items-center gap-2">
                      {/* <Checkbox
                        className="opacity-0 group-hover:opacity-100 transition-opacity data-[state=checked]:opacity-100"
                        checked={selectedRows.has(complaint.id)}
                        onCheckedChange={() => handleSelectRow(complaint.id)}
                        aria-label="Select complaint"
                      /> */}
                    </div>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleRowExpansion(complaint.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {/* {complaint.attentionScore && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center gap-1 font-bold",
                                    getScoreColor(complaint.attentionScore)
                                  )}
                                >
                                  <span>🔥</span>
                                  <span>{complaint.attentionScore}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Attention Score</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )} */}
                        <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {complaint.id}
                        </span>
                        {complaint.isSplit && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            <GitBranch className="mr-1 h-3 w-3" />
                            Split
                          </Badge>
                        )}
                        {complaint.isMerged && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            <GitMerge className="mr-1 h-3 w-3" />
                            Merged
                          </Badge>
                        )}
                        {complaint.type && (
                          <>
                            <span className="text-gray-300 dark:text-gray-700">
                              •
                            </span>
                            {/* <Badge
                              variant="outline"
                              className="text-xs font-medium"
                            > */}
                            <span className="font-mono text-xs text-muted-foreground">
                              {complaint.type}
                            </span>
                            {/* </Badge> */}
                          </>
                        )}
                        <span className="text-gray-300 dark:text-gray-700">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(complaint.submittedDate), "PPp")}
                        </span>
                        {complaint.linkedComplaintIds &&
                          complaint.linkedComplaintIds.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Link2 className="size-3.5 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Linked with:{" "}
                                    {complaint.linkedComplaintIds.join(", ")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                      </div>
                      <h3 className="font-medium text-base leading-tight group-hover:text-primary">
                        {!isExpanded && complaint.description.length > 400
                          ? `${complaint.description.substring(0, 350)}...`
                          : complaint.description}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Popover
                        open={activePopover === complaint.id}
                        onOpenChange={(isOpen) =>
                          handlePopoverOpenChange(complaint.id, isOpen)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            disabled={!isActionable(complaint.status, role)}
                            data-status-popover-trigger
                          >
                            <Badge
                              variant={statusColors[complaint.status]}
                              className={cn(
                                "capitalize flex justify-center items-center gap-1.5 whitespace-nowrap min-w-[120px]",
                                isActionable(complaint.status, role) &&
                                  "cursor-pointer hover:ring-2 hover:ring-primary/50"
                              )}
                            >
                              <span>{statusText}</span>
                              {complaint.priority === "High" && (
                                <ShieldAlert className="size-3.5 shrink-0" />
                              )}
                            </Badge>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-96 p-0"
                          align="end"
                          side="bottom"
                          onOpenAutoFocus={(e) => e.preventDefault()}
                          avoidCollisions={false}
                        >
                          <div className="p-4">
                            <h4 className="font-medium text-lg mb-4">
                              {t("update_status_desc")}
                            </h4>

                            {popoverError && (
                              <Alert variant="destructive" className="mb-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  {popoverError}
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-4">
                              {!isStakeholder &&
                                getStatusOptions(complaint.status, role)
                                  .length > 0 && (
                                  <div className="space-y-2">
                                    <Label>{t("new_status")}</Label>
                                    <RadioGroup
                                      value={newStatus}
                                      onValueChange={(value) => {
                                        setNewStatus(value as any);
                                        if (popoverError) setPopoverError(null);
                                      }}
                                      className="flex flex-wrap gap-2"
                                    >
                                      {getStatusOptions(
                                        complaint.status,
                                        role
                                      ).map((s) => (
                                        <div
                                          key={s}
                                          className="flex items-center"
                                        >
                                          <RadioGroupItem
                                            value={s}
                                            id={`status-${complaint.id}-${s}`}
                                          />
                                          <Label
                                            htmlFor={`status-${complaint.id}-${s}`}
                                            className="ml-2 font-normal cursor-pointer"
                                          >
                                            {t(
                                              s.toLowerCase().replace(/ /g, "_")
                                            )}
                                          </Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </div>
                                )}

                              {newStatus === "Assign" && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                  <div className="space-y-2">
                                    <Label>{t("assign_to_department")}</Label>
                                    <Select
                                      value={assignDept}
                                      onValueChange={(v) => {
                                        setAssignDept(v as Department);
                                        if (popoverError) setPopoverError(null);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={t("select_a_department")}
                                        />
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
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="high-priority-switch"
                                      checked={isHighPriority}
                                      onCheckedChange={setIsHighPriority}
                                    />
                                    <Label htmlFor="high-priority-switch">
                                      {t("mark_as_high_priority")}
                                    </Label>
                                  </div>
                                </div>
                              )}

                              <div className="relative space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label htmlFor="remark-textarea">
                                    {t("remark")}
                                  </Label>
                                  <span
                                    className={cn(
                                      "text-xs",
                                      remark.length > REMARK_CHAR_LIMIT
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {remark.length} / {REMARK_CHAR_LIMIT}
                                  </span>
                                </div>
                                <Textarea
                                  ref={remarkTextareaRef}
                                  id="remark-textarea"
                                  placeholder={getRemarkPlaceholder(
                                    complaint.status,
                                    newStatus,
                                    remarkVisibility
                                  )}
                                  value={remark}
                                  onChange={handleRemarkChange}
                                  className={cn(
                                    remarkVisibility === "public" &&
                                      "border-amber-500/50 focus-visible:ring-amber-500 placeholder:text-amber-600/70 dark:placeholder:text-amber-400/50"
                                  )}
                                />
                                {showTagSuggestions && (
                                  <div className="absolute top-full left-0 z-20 w-full">
                                    <TagSuggestions
                                      onSelect={handleTagSelect}
                                    />
                                  </div>
                                )}
                              </div>

                              <RadioGroup
                                value={remarkVisibility}
                                onValueChange={(v) =>
                                  setRemarkVisibility(v as RemarkVisibility)
                                }
                                className="flex"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="internal"
                                    id="vis-internal"
                                  />
                                  <Label
                                    htmlFor="vis-internal"
                                    className="flex items-center gap-2 font-normal"
                                  >
                                    <Lock className="size-3" /> Internal
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="public"
                                    id="vis-public"
                                  />
                                  <Label
                                    htmlFor="vis-public"
                                    className="flex items-center gap-2 font-normal"
                                  >
                                    <Globe className="size-3" /> Public
                                  </Label>
                                </div>
                              </RadioGroup>

                              <div className="flex items-center gap-2">
                                {newStatus === "In Progress" && (
                                  <Popover
                                    open={isEtaPopoverOpen}
                                    onOpenChange={setIsEtaPopoverOpen}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {eta ? (
                                          format(eta, "PP p")
                                        ) : (
                                          <span>{t("set_eta")}</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={eta}
                                        onSelect={handleEtaDateSelect}
                                        disabled={(date) =>
                                          date <
                                          new Date(
                                            new Date().setDate(
                                              new Date().getDate() - 1
                                            )
                                          )
                                        }
                                        initialFocus
                                      />
                                      <div className="p-3 border-t">
                                        <div className="space-y-2">
                                          <Label>{t("time")}</Label>
                                          <Input
                                            type="time"
                                            value={
                                              eta
                                                ? format(eta, "HH:mm")
                                                : "17:00"
                                            }
                                            onChange={handleTimeChange}
                                          />
                                          {etaWarning && (
                                            <p className="text-xs text-amber-600">
                                              {etaWarning}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                                {(newStatus === "Resolved" ||
                                  (isReopening &&
                                    complaint.status === "Resolved")) && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="relative overflow-hidden w-full"
                                  >
                                    <div>
                                      <Camera className="mr-2" />
                                      <span>
                                        {attachment
                                          ? attachment.name
                                          : t("attach_media")}
                                      </span>
                                      <input
                                        type="file"
                                        className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer"
                                        onChange={handleMediaChange}
                                      />
                                    </div>
                                  </Button>
                                )}
                              </div>

                              {["Resolved", "Invalid", "Backlog"].includes(
                                complaint.status
                              ) &&
                                canUpdate && (
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="reopen-switch"
                                      checked={isReopening}
                                      onCheckedChange={setIsReopening}
                                    />
                                    <Label htmlFor="reopen-switch">
                                      {t("reopen_complaint")}
                                    </Label>
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="bg-muted p-4 border-t">
                            <Button
                              className="w-full"
                              onClick={() => handleQuickUpdate(complaint)}
                            >
                              {t("update_complaint")}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onTogglePin(complaint.id)}
                            >
                              <Pin
                                className={cn(
                                  "h-4 w-4",
                                  pinnedComplaints.has(complaint.id)
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground"
                                )}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {pinnedComplaints.has(complaint.id)
                                ? t("unpin")
                                : t("pin")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => onEditCategory(complaint)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>{t("edit_details")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setComplaintToLink(complaint)}
                          >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            <span>{t("link_complaint")}</span>
                          </DropdownMenuItem>
                          {canUpdate &&
                            !complaint.isSplit &&
                            !complaint.isMerged && (
                              <DropdownMenuItem
                                onSelect={() => {
                                  setComplaintToSplit(complaint);
                                  setIsSplitDialogOpen(true);
                                }}
                              >
                                <GitBranch className="mr-2 h-4 w-4" />
                                <span>Split Complaint</span>
                              </DropdownMenuItem>
                            )}
                          {canMergeUpdate && (
                            <DropdownMenuItem
                              onSelect={() => {
                                // Open merge dialog with this complaint pre-selected
                                const newSelection = new Set(selectedRows);
                                newSelection.add(complaint.id);
                                // setSelectedRows(newSelection);
                                setIsMergeDialogOpen(true);
                              }}
                            >
                              <GitMerge className="mr-2 h-4 w-4" />
                              <span>{t("merge_complaints")}</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <CopyIcon className="mr-2 h-4 w-4" />
                              <span>{t("copy")}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onSelect={() => handleCopyId(complaint.id)}
                              >
                                <span>{t("copy_complaint_id")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => handleCopyLink(complaint.id)}
                              >
                                <span>{t("copy_link")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            onSelect={() => handleShareOnWhatsApp(complaint)}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>{t("share_on_whatsapp")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handlePrintComplaint(complaint)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            <span>{t("print_complaint")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                        onClick={() => toggleRowExpansion(complaint.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pl-11">
                    {complaint.coSignCount && complaint.coSignCount > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Hand className="size-3.5" />
                              <span>{complaint.coSignCount}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {complaint.coSignCount} co-sign
                              {complaint.coSignCount > 1 ? "s" : ""}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {visibleOptionalColumns.has("department") && (
                      <div className="flex items-center gap-1.5">
                        <Building className="size-3.5" />
                        <span>{complaint.department || "N/A"}</span>
                      </div>
                    )}
                    {visibleOptionalColumns.has("category") && (
                      <div className="flex items-center gap-1.5">
                        <FolderIcon className="size-3.5" />
                        <span>
                          {complaint.category} / {complaint.subcategory}
                        </span>
                      </div>
                    )}
                    {visibleOptionalColumns.has("location") && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span>{complaint.location || "N/A"}</span>
                      </div>
                    )}
                    {complaint.taluka && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span>
                          {t("tehsil")}: {complaint.taluka}
                        </span>
                      </div>
                    )}
                    {visibleOptionalColumns.has("last_updated") && (
                      <div className="flex items-center gap-1.5">
                        {isStale && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <History className="size-3.5" />
                        <RelativeTime date={complaint.lastUpdated} />
                      </div>
                    )}
                  </div>
                </div>
                <CollapsibleContent>
                  <ExpandedRowContent
                    complaint={complaint}
                    allComplaints={allComplaints}
                    onEditCategory={onEditCategory}
                    pinnedComplaints={pinnedComplaints}
                    onUpdateComplaints={onUpdateComplaints}
                    onNavigate={onNavigate}
                    onViewMedia={onViewMedia}
                  />
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground mt-1">
              There are no complaints matching your current filters.
            </p>
          </div>
        </div>
      )}
      {complaintToLink && (
        <LinkComplaintDialog
          open={!!complaintToLink}
          onOpenChange={(open) => !open && setComplaintToLink(null)}
          currentComplaint={complaintToLink}
          allComplaints={allComplaints}
          onLink={handleLinkComplaint}
        />
      )}

      {canMergeUpdate && (
        <MergeComplaintsDialog
          open={isMergeDialogOpen}
          onOpenChange={setIsMergeDialogOpen}
          complaints={allComplaints}
          selectedComplaintIds={Array.from(selectedRows)}
          onMerge={handleMergeComplaints}
        />
      )}

      {canUpdate && complaintToSplit && (
        <SplitComplaintDialog
          open={isSplitDialogOpen}
          onOpenChange={(open) => {
            setIsSplitDialogOpen(open);
            if (!open) setComplaintToSplit(null);
          }}
          complaint={complaintToSplit}
          onSplit={handleSplitComplaint}
        />
      )}
    </div>
  );
}
