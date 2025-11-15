"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import type {
  Complaint,
  UserRole,
  SortDescriptor,
  ComplaintStatus,
  Department,
  RemarkVisibility,
} from "@/lib/types";
import ComplaintsTable from "@/components/complaints-table";
import ComplaintDetails from "@/components/complaint-details";
import {
  AlertCircle,
  FolderOpen,
  Inbox,
  Frown,
  CheckSquare,
  History,
  Search,
  Calendar as CalendarIcon,
  RotateCcw,
  Layout,
  Hourglass,
  Folder,
  ChevronsRight,
  Users,
  List,
  AreaChart,
  X,
  FilterX,
  AlertTriangle,
  Loader2,
  Sparkles,
  Pin,
  MessageSquare,
  Printer,
  Check,
  Star,
  Bot,
  Edit,
  AtSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Lock,
  Link2,
  Unlink2,
  CheckSquare as CheckSquareIcon,
  XSquare as XSquareIcon,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MapPin,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatchComplaint } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Image from "next/image";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format, subDays, startOfDay, isValid } from "date-fns";
import { Calendar } from "./ui/calendar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import {
  allStatuses,
  collectorStatuses,
  departmentStatuses,
  departments,
  userRoles,
  stakeholderRoles,
} from "@/lib/types";
import { MOCK_COMPLAINTS } from "@/lib/mock-data"; // For tehsils
import { Badge } from "@/components/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import PaginationControls from "@/components/pagination-controls";
import ComplaintsGridSkeleton from "@/components/complaints-grid-skeleton";
import KpiSkeleton from "@/components/kpi-skeleton";
import { useRole } from "@/hooks/use-role";
import { useAdvancedFeatures } from "@/hooks/use-advanced-features";
import { useComplaintsWithFilters } from "@/hooks/use-complaints-with-filters";
import { prepareComplaintsForExport } from "@/lib/export-to-excel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
// import toast from "react-hot-toast";
import { Toggle } from "./ui/toggle";
import { differenceInDays } from "date-fns";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Combobox } from "@/components/combobox";
import { Checkbox } from "./ui/checkbox";

const REMARK_CHAR_LIMIT = 280;

// Map UI role names to backend Role enum strings for notifications
const uiRoleToDbRole: Record<string, string> = {
  "District Collector": "DISTRICT_COLLECTOR",
  "Collector Team": "COLLECTOR_TEAM",
  "Collector Team Advanced": "COLLECTOR_TEAM_ADVANCED",
  "Department Team": "DEPARTMENT_TEAM",
  "Superintendent of Police": "SUPERINTENDENT_OF_POLICE",
  "MP Rajya Sabha": "MP_RAJYA_SABHA",
  "MP Lok Sabha": "MP_LOK_SABHA",
  "MLA Gondia": "MLA_GONDIA",
  "MLA Tirora": "MLA_TIRORA",
  "MLA Sadak Arjuni": "MLA_ARJUNI_MORGAON",
  "MLA Deori": "MLA_AMGAON_DEORI",
  MLC: "MLC",
  "Zila Parishad": "ZP_CEO",
};

function extractTaggedRolesFromRemark(text: string): string[] {
  if (!text) return [];
  // Match tags like @Department, @Department Team, @MP Lok Sabha, etc.
  const tags = Array.from(text.matchAll(/@([A-Za-z][A-Za-z ]{0,50})/g)).map(
    (m) => m[1].trim()
  );
  const uniqueUiRoles = Array.from(new Set(tags));
  const mapped = uniqueUiRoles
    .map((ui) => uiRoleToDbRole[ui])
    .filter((v): v is string => Boolean(v));
  return Array.from(new Set(mapped));
}

type TrendIndicatorProps = {
  trend: number;
  sentiment: "good" | "bad";
};

// const TrendIndicator: React.FC<TrendIndicatorProps> = ({
//   trend,
//   sentiment,
// }) => {
//   const isPositiveChange =
//     (sentiment === "good" && trend > 0) || (sentiment === "bad" && trend < 0);
//   const isNegativeChange =
//     (sentiment === "good" && trend < 0) || (sentiment === "bad" && trend > 0);

//   const Icon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
//   const colorClass = isPositiveChange
//     ? "text-green-500 dark:text-green-400"
//     : isNegativeChange
//     ? "text-red-500 dark:text-red-400"
//     : "text-slate-500 dark:text-slate-400";

//   const description =
//     trend !== 0
//       ? `${Math.abs(trend).toFixed(1)}% ${
//           trend > 0 ? "increase" : "decrease"
//         } from previous 7 days`
//       : "No change from previous 7 days";

//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <div className="flex items-center gap-1">
//             <Icon className={cn("h-5 w-5", colorClass)} />
//           </div>
//         </TooltipTrigger>
//         <TooltipContent>
//           <p>{description}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// };

type KpiCardProps = {
  title: string;
  value: number;
  description: string;
  onClick: () => void;
  isActive: boolean;
  colorClass: string;
  fillBgClass: string;
  trend: number;
  trendSentiment: "good" | "bad";
  proportionalPercent: number;
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  onClick,
  isActive,
  colorClass,
  fillBgClass,
  trend,
  trendSentiment,
  proportionalPercent,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
        isActive ? "border-primary/50 bg-muted" : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 -z-0 transition-all duration-500 opacity-20",
          fillBgClass
        )}
        style={{ height: `${proportionalPercent}%` }}
      />
      <div className="relative z-10">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {/* <TrendIndicator trend={trend} sentiment={trendSentiment} /> */}
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{value}</span>
            {proportionalPercent > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-semibold bg-black/5 dark:bg-white/5 text-muted-foreground/60"
              >
                {proportionalPercent.toFixed(1)}%
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs mt-1 min-h-[20px] text-muted-foreground/60">
            {description}
          </CardDescription>
        </CardContent>
      </div>
    </Card>
  );
};

type ColumnKey =
  | keyof Complaint
  | "date"
  | "actions"
  | "media"
  | "details"
  | "last_updated"
  | "attention"
  | "title";

const mandatoryColumns: {
  key: ColumnKey;
  label: string;
  sortable: boolean;
  className?: string;
}[] = [
  { key: "id", label: "complaint_id", sortable: true, className: "w-[120px]" },
  { key: "date", label: "date", sortable: true, className: "w-[130px]" },
  { key: "title", label: "title", sortable: true },
  { key: "location", label: "location", sortable: true },
  {
    key: "status",
    label: "status",
    sortable: true,
    className: "w-[150px] text-center",
  },
];

const tehsils = [
  "Gondia",
  "Goregaon",
  "Tirora",
  "Arjuni-Morgaon",
  "Deori",
  "Amgaon",
  "Salekasa",
  "Sadak-Arjuni",
];

interface SearchableSelectProps {
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  dialogTitle: string;
  isTranslated?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  dialogTitle,
  isTranslated = false,
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      (isTranslated ? t(option.toLowerCase().replace(/ /g, "_")) : option)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, t, isTranslated]);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setOpen(false);
  };

  const getDisplayValue = () => {
    if (value === "all") return placeholder;
    return isTranslated ? t(value.toLowerCase().replace(/ /g, "_")) : value;
  };

  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full md:w-auto justify-start text-left font-normal h-9 text-sm",
          value !== "all"
            ? "bg-blue-50 dark:bg-blue-950 text-foreground"
            : "text-muted-foreground"
        )}
        onClick={() => setOpen(true)}
      >
        {getDisplayValue()}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t("search")}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-72">
            <div className="flex flex-col gap-1 p-1">
              <Button
                variant={value === "all" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => handleSelect("all")}
              >
                {placeholder}
              </Button>
              {filteredOptions.map((option) => (
                <Button
                  key={option}
                  variant={value === option ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleSelect(option)}
                >
                  {isTranslated
                    ? t(option.toLowerCase().replace(/ /g, "_"))
                    : option}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FilterState {
  searchTerm: string;
  dateRange?: DateRange;
  statusFilter: ComplaintStatus | "all";
  departmentFilter: Department | "all";
  tehsilFilter: string | "all";
  pinnedFilter: boolean;
  myRemarksFilter: boolean;
  mentionsFilter: boolean;
  linkedFilter: boolean;
}

const initialFilterState: FilterState = {
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

type BulkAction = "remark" | "status" | "assign";

const getStatusOptionsForRole = (
  currentStatus: ComplaintStatus,
  userRole: UserRole
): (ComplaintStatus | "Reopen" | "Assign")[] => {
  // District Collector can change status to any value
  if (userRole === "District Collector") {
    return [
      "Open",
      "In Progress",
      "Resolved",
      "Backlog",
      "Need Details",
      "Invalid",
      "Assign",
      "Reopen",
    ];
  }
  if (userRole === "Collector Team" || userRole === "Collector Team Advanced") {
    if (currentStatus === "Open") return ["Assign", "Invalid", "Need Details"];
    if (currentStatus === "Need Details") return ["Open", "Assign"];
    if (["Resolved", "Invalid", "Backlog"].includes(currentStatus))
      return ["Reopen"];
  }
  if (userRole === "Department Team") {
    if (currentStatus === "Assigned") return ["In Progress", "Need Details"];
    if (currentStatus === "In Progress")
      return ["Resolved", "Backlog", "Need Details"];
    if (currentStatus === "Backlog") return ["In Progress", "Reopen"];
    if (["Resolved"].includes(currentStatus)) return ["Reopen"];
  }
  return [];
};

const EditDetailsDialog: React.FC<{
  complaint: Complaint | null;
  allComplaints: Complaint[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: any) => void;
}> = ({ complaint, allComplaints, open, onOpenChange, onUpdate }) => {
  const { t } = useLanguage();
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");

  useEffect(() => {
    if (open && complaint) {
      setNewTitle(complaint.title);
      setNewCategory(complaint.category);
      setNewSubcategory(complaint.subcategory);
    }
  }, [open, complaint]);

  const allCategories = useMemo(
    () => Array.from(new Set(allComplaints.map((c) => c.category))),
    [allComplaints]
  );

  const allSubcategories = useMemo(() => {
    const subcategoriesForSelectedCategory = allComplaints
      .filter((c) => c.category === newCategory)
      .map((c) => c.subcategory);
    return Array.from(new Set(subcategoriesForSelectedCategory));
  }, [allComplaints, newCategory]);

  const handleSave = () => {
    if (complaint) {
      let remarkParts: string[] = [];
      if (newTitle !== complaint.title) {
        remarkParts.push(
          `Title updated from "${complaint.title}" to "${newTitle}".`
        );
      }
      if (newCategory !== complaint.category) {
        remarkParts.push(
          `Category changed from "${complaint.category}" to "${newCategory}".`
        );
      }
      if (newSubcategory !== complaint.subcategory) {
        remarkParts.push(
          `Sub-category changed from "${complaint.subcategory}" to "${newSubcategory}".`
        );
      }

      if (remarkParts.length > 0) {
        onUpdate({
          complaint: complaint,
          newTitle: newTitle,
          newCategory: newCategory,
          newSubcategory: newSubcategory,
          remark: `Complaint details updated. ${remarkParts.join(" ")}`,
          remarkVisibility: "internal",
        });
      }
      onOpenChange(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Complaint Details</DialogTitle>
          <DialogDescription>
            Update details for complaint ID: {complaint.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title-edit">Title</Label>
            <Input
              id="title-edit"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-edit">Category</Label>
            <Combobox
              options={allCategories}
              value={newCategory}
              onChange={(value) => {
                setNewCategory(value);
                if (value !== newCategory) {
                  setNewSubcategory("");
                }
              }}
              placeholder="Select or create a category"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcategory-edit">Sub-Category</Label>
            <Combobox
              options={allSubcategories}
              value={newSubcategory}
              onChange={setNewSubcategory}
              placeholder="Select or create a sub-category"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function ComplaintsView({
  complaints: _complaints, // Renamed to indicate it's not used
  onUpdateComplaint: _onUpdateComplaint, // Renamed to indicate it's not used
  onUpdateComplaints: _onUpdateComplaints, // Renamed to indicate it's not used
  onFindStaleComplaints,
  isFindingStale,
  onCalculateAttentionScores,
  isCalculatingScores,
  deepLinkedComplaintId,
}: {
  complaints: Complaint[];
  onUpdateComplaint: (data: any) => void;
  onUpdateComplaints: (complaints: Complaint[]) => void;
  onFindStaleComplaints: () => Promise<string[]>;
  isFindingStale: boolean;
  onCalculateAttentionScores: () => void;
  isCalculatingScores: boolean;
  isFiltered?: boolean;
  deepLinkedComplaintId: string | null;
}) {
  const { t } = useLanguage();
  const {
    role,
    selectedComplaintId,
    setSelectedComplaintId,
    setDeepLinkedComplaintId,
  } = useRole();
  const { features } = useAdvancedFeatures();

  const [mediaToView, setMediaToView] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [staleFilterIds, setStaleFilterIds] = useState<string[]>([]);
  // Local state for date range selection to allow intermediate selection
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(
    undefined
  );

  // Local search state for controlled search behavior
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const [visibleOptionalColumns, setVisibleOptionalColumns] = useState<
    Set<ColumnKey>
  >(new Set(["location"] as ColumnKey[]));

  // Pinned complaints state
  const [pinnedComplaints, setPinnedComplaints] = useState<Set<string>>(
    new Set()
  );

  // Bulk actions state
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkRemark, setBulkRemark] = useState("");
  const [bulkNewStatus, setBulkNewStatus] = useState<
    ComplaintStatus | "Reopen" | "Assign" | ""
  >("");
  const [bulkAssignDept, setBulkAssignDept] = useState<Department | "">("");
  const [bulkIsHighPriority, setBulkIsHighPriority] = useState(false);
  const [bulkRemarkVisibility, setBulkRemarkVisibility] =
    useState<RemarkVisibility>("internal");

  // Edit dialogs state
  const [complaintToEdit, setComplaintToEdit] = useState<Complaint | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // updateFilter is now provided by the URL-driven hook

  // Handle deep linking from URL or notification click
  useEffect(() => {
    if (deepLinkedComplaintId) {
      updateFilter("searchTerm", deepLinkedComplaintId);
      setExpandedRowId(deepLinkedComplaintId);
      // Reset the context deep link ID after using it
      setDeepLinkedComplaintId(null);
    }
  }, [deepLinkedComplaintId, setDeepLinkedComplaintId]);

  // Load settings from localStorage (excluding filters and pagination which are now URL-driven)
  useEffect(() => {
    try {
      const storedColumns = localStorage.getItem(`column-visibility-${role}`);
      if (storedColumns) {
        setVisibleOptionalColumns(new Set(JSON.parse(storedColumns)));
      }

      const savedPinned = localStorage.getItem(`pinned-complaints-${role}`);
      if (savedPinned) {
        setPinnedComplaints(new Set(JSON.parse(savedPinned)));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, [role]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `column-visibility-${role}`,
        JSON.stringify(Array.from(visibleOptionalColumns))
      );
    } catch (error) {
      console.error("Failed to save column visibility to localStorage", error);
    }
  }, [visibleOptionalColumns, role]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `pinned-complaints-${role}`,
        JSON.stringify(Array.from(pinnedComplaints))
      );
    } catch (e) {
      console.error("Failed to save pinned complaints to localStorage", e);
    }
  }, [pinnedComplaints, role]);

  const togglePin = (complaintId: string) => {
    const newPinned = new Set(pinnedComplaints);
    if (newPinned.has(complaintId)) {
      newPinned.delete(complaintId);
    } else {
      newPinned.add(complaintId);
    }
    setPinnedComplaints(newPinned);
  };

  // URL-driven state is now managed by the hook

  // This will be moved after the hook declaration

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName.toUpperCase() !== "INPUT" &&
        document.activeElement?.tagName.toUpperCase() !== "TEXTAREA"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResetFilters = () => {
    resetFilters();
    setStaleFilterIds([]);
    setLocalSearchTerm("");
    setIsDatePopoverOpen(false);
    setLocalDateRange(undefined);
  };

  const handleRelativeDateChange = (value: string) => {
    const now = new Date();
    const today = startOfDay(now);
    let range: DateRange | undefined;

    if (value === "today") {
      range = { from: today, to: now };
    } else if (value === "last7") {
      range = { from: subDays(today, 6), to: now };
    } else if (value === "last30") {
      range = { from: subDays(today, 29), to: now };
    } else {
      range = undefined;
    }

    setLocalDateRange(range);
    updateFilter("dateRange", range);
    setIsDatePopoverOpen(false);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      // Clear if range is cleared
      setLocalDateRange(undefined);
      updateFilter("dateRange", undefined);
      return;
    }

    // If we already have a complete range (both from and to), clicking a new date should start a new selection
    if (localDateRange?.from && localDateRange?.to && range.from && !range.to) {
      // User clicked a new date after having a complete range - start new selection
      const newDate = range.from;
      const existingFrom = localDateRange.from;
      const existingTo = localDateRange.to;

      // Compare new date with existing range to determine if it should be start or end
      if (newDate < existingFrom) {
        // New date is before existing range, make it the new start date
        // Keep the existing end date as the new end
        const normalizedRange = {
          from: newDate,
          to: existingTo,
        };
        setLocalDateRange(normalizedRange);
        updateFilter("dateRange", normalizedRange);
        setIsDatePopoverOpen(false);
      } else if (newDate > existingTo) {
        // New date is after existing range, make it the new end date
        // Keep the existing start date as the new start
        const normalizedRange = {
          from: existingFrom,
          to: newDate,
        };
        setLocalDateRange(normalizedRange);
        updateFilter("dateRange", normalizedRange);
        setIsDatePopoverOpen(false);
      } else if (newDate >= existingFrom && newDate <= existingTo) {
        // New date is within existing range, start a new selection from this date
        setLocalDateRange({ from: newDate, to: undefined });
      }
    } else if (
      range.from &&
      !range.to &&
      localDateRange?.from &&
      !localDateRange?.to
    ) {
      // User is selecting second date during initial selection
      // Compare with the existing from date to determine if it should be start or end
      const newDate = range.from;
      const existingFrom = localDateRange.from;

      if (newDate < existingFrom) {
        // New date is before existing from, swap them
        const normalizedRange = {
          from: newDate,
          to: existingFrom,
        };
        setLocalDateRange(normalizedRange);
        updateFilter("dateRange", normalizedRange);
        setIsDatePopoverOpen(false);
      } else if (newDate > existingFrom) {
        // New date is after existing from, make it the end date
        const normalizedRange = {
          from: existingFrom,
          to: newDate,
        };
        setLocalDateRange(normalizedRange);
        updateFilter("dateRange", normalizedRange);
        setIsDatePopoverOpen(false);
      } else {
        // Same date clicked, reset to just this date
        setLocalDateRange({ from: newDate, to: undefined });
      }
    } else if (range.from && range.to) {
      // Both dates selected - ensure they're in correct order
      const fromDate = range.from;
      const toDate = range.to;

      if (fromDate > toDate) {
        // Swap if they're in wrong order
        const normalizedRange = {
          from: toDate,
          to: fromDate,
        };
        setLocalDateRange(normalizedRange);
        updateFilter("dateRange", normalizedRange);
        setIsDatePopoverOpen(false);
      } else {
        // Already in correct order
        setLocalDateRange(range);
        updateFilter("dateRange", range);
        setIsDatePopoverOpen(false);
      }
    } else if (range.from && !range.to) {
      // Just from date selected (first click of new selection)
      setLocalDateRange(range);
    }
  };

  // Search functions for controlled search behavior
  const handleSearch = () => {
    updateFilter("searchTerm", localSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    updateFilter("searchTerm", "");
  };

  const handleSearchInputChange = (value: string) => {
    setLocalSearchTerm(value);
    // If user clears the input, immediately trigger search to remove filter
    if (value === "") {
      updateFilter("searchTerm", "");
    }
  };

  const getStatusOptions = () => {
    if (role === "District Collector" || stakeholderRoles.includes(role as any))
      return allStatuses;
    switch (role) {
      case "Collector Team":
      case "Collector Team Advanced":
        return collectorStatuses;
      case "Department Team":
        return departmentStatuses;
      default:
        return [];
    }
  };

  // const isComplaintVisibleInRole = (
  //   complaint: Complaint,
  //   currentRole: UserRole
  // ) => {
  //   if (
  //     currentRole === "District Collector" ||
  //     stakeholderRoles.includes(currentRole as any)
  //   )
  //     return true;
  //   if (currentRole === "Collector Team") {
  //     if (complaint.status === "Need Details") return true;
  //     return collectorStatuses.includes(complaint.status as any);
  //   }
  //   if (currentRole === "Department Team") {
  //     if (complaint.status === "Need Details") return false;
  //     return departmentStatuses.includes(complaint.status as any);
  //   }
  //   return false;
  // };

  // Use the new hook for data fetching with URL-driven state

  const {
    data: paginatedComplaints,
    allData: filteredComplaints,
    isLoading: isDataLoading,
    // isFetching,
    pagination: serverPagination,
    filters: urlFilters,
    sortDescriptor: urlSortDescriptor,
    paginationState: urlPagination,
    updateFilter,
    updateSort,
    updatePagination,
    resetFilters,
    resetAll,
  } = useComplaintsWithFilters({
    role,
    pinnedComplaints,
    staleFilterIds,
  });

  const queryClient = useQueryClient();

  // Update mutation for individual complaints
  const loadingToastRef = useRef<string | null>(null);
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiPatchComplaint(id, payload),
    onMutate: () => {
      // Show loading toast while the API call is in-flight
      loadingToastRef.current = toast.loading(t("saving_changes"));
    },
    onSuccess: () => {
      // Resolve loading toast into success
      if (loadingToastRef.current) toast.dismiss(loadingToastRef.current);
      toast.success(t("complaint_updated"));
    },
    onError: () => {
      // Resolve loading toast into error
      if (loadingToastRef.current) toast.dismiss(loadingToastRef.current);
      toast.error(t("failed_to_save_update"));
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });

  // Handle individual complaint updates
  const handleUpdateComplaint = (updateData: any) => {
    const {
      complaint,
      newStatus,
      newTitle,
      isReopening,
      assignDept,
      isHighPriority,
      newCategory,
      newSubcategory,
      remark,
      remarkVisibility,
    } = updateData;

    let updatedStatus: ComplaintStatus = complaint.status;
    let action: string = "Remark added";

    if (newTitle && newTitle !== complaint.title) {
      action = "Title updated";
    } else if (newCategory || newSubcategory) {
      action = "Complaint details updated";
    } else if (isReopening) {
      action = "Complaint Reopened";
      updatedStatus = complaint.status === "Invalid" ? "Open" : "Assigned";
    } else if (newStatus) {
      if (newStatus === "Assign" && assignDept) {
        updatedStatus = "Assigned";
        action = "Complaint Assigned";
      } else {
        updatedStatus = newStatus as ComplaintStatus;
        action = `Status changed to ${newStatus}`;
      }
    } else if (remark) {
      // Handle remark addition
    }

    const updatedComplaint: Complaint = {
      ...complaint,
      status: updatedStatus,
      title: newTitle || complaint.title,
      category: newCategory || complaint.category,
      subcategory: newSubcategory || complaint.subcategory,
      department:
        newStatus === "Assign" && assignDept
          ? assignDept
          : complaint.department,
      priority:
        newStatus === "Assign" && isHighPriority ? "High" : complaint.priority,
    };

    // Persist to backend
    const payload: any = {
      status: updatedComplaint.status,
      department: updatedComplaint.department,
      priority: updatedComplaint.priority,
      title: updatedComplaint.title,
      category: updatedComplaint.category,
      subcategory: updatedComplaint.subcategory,
      location: updatedComplaint.location,
      linkedComplaintIds: updatedComplaint.linkedComplaintIds,
    };
    if (remark && remark.trim()) {
      payload.remark = remark;
      if (remarkVisibility) {
        payload.remarkVisibility = remarkVisibility;
      }
      const tagged = extractTaggedRolesFromRemark(remark);
      if (tagged.length > 0) {
        payload.taggedRoles = tagged;
      }
    }
    updateMutation.mutate({ id: updatedComplaint.id, payload });
  };

  // Handle bulk complaint updates
  const handleUpdateComplaints = (updatedComplaints: Complaint[]) => {
    // For bulk updates, we'll invalidate the query to refetch data
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
  };

  // Show loading toast when fetching more data
  // useEffect(() => {
  //   if (/* isFetching */ true && !isDataLoading) {
  //     toast.loading("Loading more complaints...");
  //   }
  // }, [/* isFetching */ true, isDataLoading]);

  // For KPI calculations, we need all complaints data
  const kpiComplaints = useMemo(() => {
    // This will be calculated from the server data
    return filteredComplaints;
  }, [filteredComplaints]);

  const searchParams = useSearchParams();

  // Track if we've initialized sort to prevent overriding user changes
  const sortInitializedRef = useRef(false);

  // Initialize sort based on features only once on mount
  useEffect(() => {
    // Only initialize if we haven't done so yet and no explicit sort params exist in URL
    if (!sortInitializedRef.current) {
      // Check URL directly to see if sort params already exist
      const urlHasSortBy = searchParams.get("sortBy");

      // Only set default if no sort params exist in URL
      if (!urlHasSortBy) {
        updateSort({ column: "date", direction: "descending" });
      }
      sortInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally empty deps

  // Sync local search term with URL filter when it changes externally
  useEffect(() => {
    setLocalSearchTerm(urlFilters.searchTerm);
  }, [urlFilters.searchTerm]);

  // Sync local date range with URL filter when it changes externally
  useEffect(() => {
    setLocalDateRange(urlFilters.dateRange);
  }, [urlFilters.dateRange]);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [urlFilters, urlSortDescriptor, staleFilterIds]);

  const kpiStats = useMemo(() => {
    const data = kpiComplaints;
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last14Days = subDays(now, 14);

    const statusesToTrack = [
      "Open",
      "Need Details",
      "Invalid",
      "Assigned",
      "In Progress",
      "Backlog",
      "Resolved",
    ];

    const stats: Record<string, { value: number; trend: number }> = {};

    statusesToTrack.forEach((status) => {
      const getRelevantDate = (c: Complaint) => {
        if (status === "Open") return new Date(c.submittedDate);

        const relevantHistory = c.history.filter((h) =>
          h.action.includes(status)
        );
        if (relevantHistory.length > 0) {
          return new Date(
            relevantHistory.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )[0].timestamp
          );
        }
        return new Date(c.lastUpdated);
      };

      const currentWeekCount = data.filter((c: Complaint) => {
        const relevantDate = getRelevantDate(c);
        return c.status === status && relevantDate >= last7Days;
      }).length;

      const previousWeekCount = data.filter((c: Complaint) => {
        const relevantDate = getRelevantDate(c);
        return (
          c.status === status &&
          relevantDate >= last14Days &&
          relevantDate < last7Days
        );
      }).length;

      let trend = 0;
      if (previousWeekCount > 0) {
        trend =
          ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
      } else if (currentWeekCount > 0) {
        trend = 100;
      }

      stats[status] = {
        value: data.filter((c: Complaint) => c.status === status).length,
        trend: trend,
      };
    });

    const totalCurrentWeek = data.filter(
      (c: Complaint) => new Date(c.submittedDate) >= last7Days
    ).length;
    const totalPreviousWeek = data.filter(
      (c: Complaint) =>
        new Date(c.submittedDate) >= last14Days &&
        new Date(c.submittedDate) < last7Days
    ).length;
    let totalTrend = 0;
    if (totalPreviousWeek > 0) {
      totalTrend =
        ((totalCurrentWeek - totalPreviousWeek) / totalPreviousWeek) * 100;
    } else if (totalCurrentWeek > 0) {
      totalTrend = 100;
    }

    stats["total"] = {
      value: data.length,
      trend: totalTrend,
    };

    return { stats };
  }, [kpiComplaints]);

  const handleStatusFilter = (status: ComplaintStatus | "all") => {
    updateFilter(
      "statusFilter",
      urlFilters.statusFilter === status ? "all" : status
    );
  };

  const getKpiGridClass = (role: UserRole): string => {
    if (
      role === "District Collector" ||
      stakeholderRoles.includes(role as any)
    ) {
      return "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8";
    }
    if (role === "Department Team") {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    }
    if (role === "Collector Team" || role === "Collector Team Advanced") {
      return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";
    }
    return `grid-cols-2 sm:grid-cols-4 lg:grid-cols-8`;
  };

  const handleStaleButtonClick = async () => {
    const staleIds = await onFindStaleComplaints();
    setStaleFilterIds(staleIds);
    resetFilters();
  };

  const bulkActionContext = useMemo(() => {
    if (selectedRows.size === 0) {
      return { commonStatus: null, possibleActions: [] };
    }
    const selectedComplaints = paginatedComplaints.filter((c) =>
      selectedRows.has(c.id)
    );
    const firstStatus = selectedComplaints[0].status;
    const allSameStatus = selectedComplaints.every(
      (c) => c.status === firstStatus
    );

    if (allSameStatus) {
      return {
        commonStatus: firstStatus,
        possibleActions: getStatusOptionsForRole(firstStatus, role),
      };
    }
    // District Collector can change status even when statuses are mixed
    if (role === "District Collector") {
      return {
        commonStatus: "mixed",
        possibleActions: [
          "Open",
          "In Progress",
          "Resolved",
          "Backlog",
          "Need Details",
          "Invalid",
          "Assign",
          "Reopen",
        ],
      };
    }
    return { commonStatus: "mixed", possibleActions: [] };
  }, [selectedRows, paginatedComplaints, role]);

  const handleOpenBulkActionModal = () => {
    setBulkAction(null);
    setBulkRemark("");
    setBulkNewStatus("");
    setBulkAssignDept("");
    setBulkIsHighPriority(false);
    setBulkRemarkVisibility("internal");
    setIsBulkActionModalOpen(true);
  };

  const handleExecuteBulkAction = async () => {
    const updates: Complaint[] = [];
    const now = new Date();

    if (!bulkAction) {
      toast.error("Please select an action");
      return;
    }

    if (bulkAction === "status" && !bulkNewStatus) {
      toast.error("Please select a new status");
      return;
    }
    if (bulkNewStatus === "Assign" && !bulkAssignDept) {
      toast.error("Please select a department");
      return;
    }
    if (
      !bulkRemark &&
      (bulkAction === "remark" ||
        (bulkNewStatus &&
          ["Invalid", "Need Details", "Backlog", "Reopen"].includes(
            bulkNewStatus
          )))
    ) {
      toast.error("A remark is required for this action");
      return;
    }

    paginatedComplaints.forEach((c) => {
      if (selectedRows.has(c.id)) {
        let actionString = "Bulk remark added";
        let newStatus = c.status;
        let newDepartment = c.department;
        let newPriority = c.priority;

        if (bulkAction === "status" && bulkNewStatus) {
          if (bulkNewStatus === "Assign") {
            actionString = `Bulk Assigned`;
            newStatus = "Assigned";
            newDepartment = bulkAssignDept || c.department;
            newPriority = bulkIsHighPriority ? "High" : c.priority;
          } else if (bulkNewStatus === "Reopen") {
            actionString = `Bulk Reopened`;
            newStatus = c.status === "Invalid" ? "Open" : "Assigned";
          } else {
            actionString = `Bulk status change to ${bulkNewStatus}`;
            newStatus = bulkNewStatus as ComplaintStatus;
          }
        }

        const historyEntry = {
          id: `hist-bulk-${now.getTime()}-${Math.random()}`,
          timestamp: now,
          user: role,
          role: role as UserRole,
          action: actionString,
          notes: bulkRemark,
          department: bulkNewStatus === "Assign" ? newDepartment : undefined,
          priority: bulkNewStatus === "Assign" ? newPriority : undefined,
          visibility: bulkRemarkVisibility,
        };

        updates.push({
          ...c,
          status: newStatus,
          department: newDepartment,
          priority: newPriority,
          history: [historyEntry, ...c.history],
          lastUpdated: historyEntry.timestamp,
        });
      }
    });

    // Show a loading toast for bulk action processing
    const bulkToastId = toast.loading("Applying bulk changes...");
    handleUpdateComplaints(updates);
    await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    toast.dismiss(bulkToastId);
    toast.success(`${selectedRows.size} complaints have been updated.`);

    setIsBulkActionModalOpen(false);
    setSelectedRows(new Set());
  };

  const renderKpis = () => {
    const kpiColorMap: Record<string, string> = {
      all: "bg-slate-500",
      Open: "bg-blue-500",
      Assigned: "bg-cyan-500",
      "In Progress": "bg-yellow-500",
      Resolved: "bg-green-500",
      "Need Details": "bg-red-500",
      Invalid: "bg-gray-500",
      Backlog: "bg-orange-500",
    };

    const allKpis = {
      all: {
        title: t("total"),
        icon: Inbox,
        desc: "kpi.collector.total_all",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-slate-800 dark:text-slate-200",
        fillBgClass: "bg-slate-500",
      },
      Open: {
        title: t("open"),
        icon: Folder,
        desc: "kpi.collector.open",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-blue-800 dark:text-blue-200",
        fillBgClass: "bg-blue-500",
      },
      Assigned: {
        title: t("assigned"),
        icon: ChevronsRight,
        desc: "kpi.collector.assigned",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-cyan-800 dark:text-cyan-200",
        fillBgClass: "bg-cyan-500",
      },
      "In Progress": {
        title: t("in_progress"),
        icon: History,
        desc: "kpi.department.in_progress",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-yellow-800 dark:text-yellow-200",
        fillBgClass: "bg-yellow-500",
      },
      Resolved: {
        title: t("resolved"),
        icon: CheckSquare,
        desc: "kpi.collector.resolved",
        trendSentiment: "good" as "good" | "bad",
        colorClass: "text-green-800 dark:text-green-200",
        fillBgClass: "bg-green-500",
      },
      "Need Details": {
        title: t("need_details"),
        icon: Hourglass,
        desc: "kpi.collector.need_details",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-red-800 dark:text-red-200",
        fillBgClass: "bg-red-500",
      },
      Invalid: {
        title: t("invalid"),
        icon: Frown,
        desc: "kpi.collector.invalid",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-gray-800 dark:text-gray-200",
        fillBgClass: "bg-gray-500",
      },
      Backlog: {
        title: t("backlog"),
        icon: FolderOpen,
        desc: "kpi.department.backlog",
        trendSentiment: "bad" as "good" | "bad",
        colorClass: "text-orange-800 dark:text-orange-200",
        fillBgClass: "bg-orange-500",
      },
    };

    let orderedStatuses: (keyof typeof allKpis)[];
    if (
      role === "District Collector" ||
      stakeholderRoles.includes(role as any)
    ) {
      orderedStatuses = [
        "all",
        "Open",
        "Assigned",
        "In Progress",
        "Resolved",
        "Need Details",
        "Invalid",
        "Backlog",
      ];
    } else if (role === "Department Team") {
      orderedStatuses = [
        "all",
        "Assigned",
        "In Progress",
        "Resolved",
        "Backlog",
      ];
    } else {
      // Collector Team
      orderedStatuses = ["all", "Open", "Need Details", "Invalid"];
    }

    return (
      <div className={cn("grid gap-4", getKpiGridClass(role))}>
        {orderedStatuses.map((statusKey) => {
          const kpi = allKpis[statusKey];
          if (!kpi) return null;

          const kpiData =
            kpiStats.stats[statusKey === "all" ? "total" : statusKey];
          if (!kpiData) return null;

          const totalForCalculation = kpiStats.stats["total"]?.value || 0;
          const proportionalPercent =
            totalForCalculation > 0
              ? (kpiData.value / totalForCalculation) * 100
              : 0;

          let description: string;
          if (role === "Collector Team" || role === "Collector Team Advanced") {
            description =
              statusKey === "all" ? t("kpi.team.total") : t(kpi.desc);
          } else if (role === "Department Team") {
            description =
              statusKey === "all" ? t("kpi.department.total") : t(kpi.desc);
          } else {
            // District Collector and Stakeholders
            description = t(kpi.desc);
          }

          return (
            <KpiCard
              key={statusKey}
              title={kpi.title}
              value={kpiData.value}
              description={description}
              onClick={() =>
                handleStatusFilter(statusKey as ComplaintStatus | "all")
              }
              isActive={
                urlFilters.statusFilter === statusKey &&
                staleFilterIds.length === 0
              }
              colorClass={kpi.colorClass}
              fillBgClass={kpi.fillBgClass}
              trend={kpiData.trend}
              trendSentiment={kpi.trendSentiment}
              proportionalPercent={proportionalPercent}
            />
          );
        })}
      </div>
    );
  };

  const handleOpenEditDialog = (complaint: Complaint) => {
    setComplaintToEdit(complaint);
    setIsEditDialogOpen(true);
  };

  const complaintToShow = useMemo(() => {
    if (selectedComplaintId) {
      return (
        paginatedComplaints.find((c) => c.id === selectedComplaintId) || null
      );
    }
    return null;
  }, [selectedComplaintId, paginatedComplaints]);

  const closeComplaintDetails = () => {
    setSelectedComplaintId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const optionalColumns: {
    key: ColumnKey;
    label: string;
    sortable: boolean;
    className?: string;
  }[] = useMemo(() => {
    let baseOptional: {
      key: ColumnKey;
      label: string;
      sortable: boolean;
      className?: string;
    }[] = [
      {
        key: "department",
        label: "department",
        sortable: true,
        className: "w-[150px]",
      },
      {
        key: "category",
        label: "category",
        sortable: true,
        className: "w-[150px]",
      },
      { key: "location", label: "location", sortable: true },
      {
        key: "last_updated",
        label: "last_updated",
        sortable: true,
        className: "w-[130px]",
      },
    ];

    if (features.enableAIAttentionScore) {
      baseOptional.unshift({
        key: "attention",
        label: "attention",
        sortable: true,
        className: "w-[80px]",
      });
    }

    return baseOptional;
  }, [features.enableAIAttentionScore, features.enableAdvancedColumns]);

  const allOptionalColumnsSelected = useMemo(() => {
    return optionalColumns.every((col) => visibleOptionalColumns.has(col.key));
  }, [optionalColumns, visibleOptionalColumns]);

  const toggleAllOptionalColumns = () => {
    if (allOptionalColumnsSelected) {
      setVisibleOptionalColumns(new Set());
    } else {
      setVisibleOptionalColumns(new Set(optionalColumns.map((col) => col.key)));
    }
  };

  const handleToggleColumn = (key: ColumnKey) => {
    setVisibleOptionalColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const sortColumnOptions: {
    value: SortDescriptor["column"];
    label: string;
  }[] = [
    { value: "date", label: t("submitted") + " " + t("date") },
    { value: "id", label: t("complaint_id") },
    { value: "status", label: t("status") },
  ];

  const currentSortLabel =
    sortColumnOptions.find((opt) => opt.value === urlSortDescriptor.column)
      ?.label || "Sort";

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedComplaints.map((c: Complaint) => c.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const toggleSortDirection = () => {
    // Read current direction directly from URL to avoid stale state
    const currentSortOrder = searchParams.get("sortOrder");
    const currentDirection =
      currentSortOrder === "asc" || currentSortOrder === "ascending"
        ? "ascending"
        : "descending";

    const newDirection =
      currentDirection === "ascending" ? "descending" : "ascending";
    const currentSortBy =
      searchParams.get("sortBy") || urlSortDescriptor.column;

    updateSort({
      column: currentSortBy as SortDescriptor["column"],
      direction: newDirection,
    });
  };

  const handleExportToExcel = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(t("downloading_excel"));

      // Dynamically import xlsx
      const XLSX = await import("xlsx");

      // Prepare data for export - use only the data visible in the grid
      const exportData = prepareComplaintsForExport(
        paginatedComplaints,
        visibleOptionalColumns
      );

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Complaints");

      // Set column widths for better readability
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 20),
      }));
      ws["!cols"] = colWidths;

      // Generate filename with current date
      const filename = `complaints_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Write and download the file
      XLSX.writeFile(wb, filename);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(t("excel_export_successful"));
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error(t("excel_export_failed"));
    }
  };

  return (
    <div className="flex h-full">
      <div
        className={cn(
          "transition-all duration-300 w-full",
          complaintToShow ? "hidden xl:block xl:w-2/3" : "w-full"
        )}
      >
        <div className="space-y-4">
          <>
            <div className="grid">
              {isDataLoading ? (
                <KpiSkeleton
                  count={
                    role === "District Collector" ||
                    stakeholderRoles.includes(role as any)
                      ? 8
                      : role === "Department Team"
                      ? 5
                      : 4
                  }
                />
              ) : (
                renderKpis()
              )}
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center gap-2 p-2 rounded-lg bg-muted border"
              )}
            >
              <div className="relative flex-1 min-w-[400px] md:grow-0">
                <Search
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                    urlFilters.searchTerm
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search_complaints_shortcut")}
                  className={cn(
                    "pl-10 pr-20 w-full h-9 text-sm transition-colors",
                    urlFilters.searchTerm && "ring-1 ring-primary/20"
                  )}
                  value={localSearchTerm}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {localSearchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-muted"
                      onClick={handleClearSearch}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {localSearchTerm &&
                    localSearchTerm !== urlFilters.searchTerm && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                    )}
                </div>
              </div>

              <div className={cn("contents md:flex md:items-center md:gap-2")}>
                <SearchableSelect
                  options={getStatusOptions()}
                  value={urlFilters.statusFilter}
                  onValueChange={(value) =>
                    updateFilter(
                      "statusFilter",
                      value as ComplaintStatus | "all"
                    )
                  }
                  placeholder={t("all_statuses")}
                  dialogTitle={t("filter_by_status")}
                  isTranslated
                />

                {(role === "District Collector" ||
                  role === "Department Team" ||
                  stakeholderRoles.includes(role as any)) && (
                  <SearchableSelect
                    options={departments}
                    value={urlFilters.departmentFilter}
                    onValueChange={(value) =>
                      updateFilter(
                        "departmentFilter",
                        value as Department | "all"
                      )
                    }
                    placeholder={t("all_departments")}
                    dialogTitle={t("filter_by_department")}
                  />
                )}

                <SearchableSelect
                  options={tehsils}
                  value={urlFilters.tehsilFilter}
                  onValueChange={(value) =>
                    updateFilter("tehsilFilter", value as string | "all")
                  }
                  placeholder="All Tehsils"
                  dialogTitle="Filter by Tehsil"
                />

                <div className="flex items-center gap-1">
                  <Popover
                    open={isDatePopoverOpen}
                    onOpenChange={setIsDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full md:w-[260px] justify-start text-left font-normal h-9 text-sm",
                          !urlFilters.dateRange
                            ? "text-muted-foreground"
                            : "text-foreground bg-blue-50 dark:bg-blue-950"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {urlFilters.dateRange?.from ? (
                          urlFilters.dateRange.to ? (
                            <>
                              {format(urlFilters.dateRange.from, "LLL dd, y")} -{" "}
                              {format(urlFilters.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(urlFilters.dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>{t("pick_a_date_range")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex p-0" align="end">
                      <div className="flex flex-col gap-2 border-r p-3">
                        <Button
                          variant="ghost"
                          className="justify-start h-8"
                          onClick={() => handleRelativeDateChange("all")}
                        >
                          {t("all_time")}
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start h-8"
                          onClick={() => handleRelativeDateChange("today")}
                        >
                          {t("today")}
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start h-8"
                          onClick={() => handleRelativeDateChange("last7")}
                        >
                          {t("last_7_days")}
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start h-8"
                          onClick={() => handleRelativeDateChange("last30")}
                        >
                          {t("last_30_days")}
                        </Button>
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={
                          localDateRange?.from || urlFilters.dateRange?.from
                        }
                        selected={localDateRange ?? urlFilters.dateRange}
                        onSelect={handleDateSelect}
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
                  {urlFilters.dateRange?.from && urlFilters.dateRange?.to && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalDateRange(undefined);
                        updateFilter("dateRange", undefined);
                        setIsDatePopoverOpen(false);
                      }}
                      aria-label="Clear date filter"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {features.enableAdvancedFilters && (
                <div className="flex items-center gap-2 border-l pl-2 ml-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          variant="outline"
                          size="sm"
                          pressed={urlFilters.pinnedFilter}
                          onPressedChange={(pressed) =>
                            updateFilter("pinnedFilter", pressed)
                          }
                          aria-label="Filter pinned complaints"
                        >
                          <Pin className="h-4 w-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show pinned only</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          variant="outline"
                          size="sm"
                          pressed={urlFilters.myRemarksFilter}
                          onPressedChange={(pressed) =>
                            updateFilter("myRemarksFilter", pressed)
                          }
                          aria-label="Filter by my remarks"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show complaints I remarked on</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          variant="outline"
                          size="sm"
                          pressed={urlFilters.mentionsFilter}
                          onPressedChange={(pressed) =>
                            updateFilter("mentionsFilter", pressed)
                          }
                          aria-label="Filter by mentions"
                        >
                          <AtSign className="h-4 w-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show complaints I'm tagged in</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          variant="outline"
                          size="sm"
                          pressed={urlFilters.linkedFilter}
                          onPressedChange={(pressed) =>
                            updateFilter("linkedFilter", pressed)
                          }
                          aria-label="Filter linked complaints"
                        >
                          <Link2 className="h-4 w-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show linked complaints only</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        // size="icon"
                        // className="h-9 w-9"
                        onClick={handleResetFilters}
                      >
                        {t("reset_filters")}
                        <RotateCcw className="h-4 w-4" />
                        <span className="sr-only">{t("reset_filters")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("reset_filters")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Layout className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("toggle_columns")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={allOptionalColumnsSelected}
                      onCheckedChange={toggleAllOptionalColumns}
                    >
                      {allOptionalColumnsSelected
                        ? "Deselect All"
                        : "Select All"}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {optionalColumns.map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.key}
                          className="capitalize"
                          checked={visibleOptionalColumns.has(column.key)}
                          onCheckedChange={() => handleToggleColumn(column.key)}
                        >
                          {t(column.label)}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={handleExportToExcel}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("export")}
                  </Button>

                  {/* {features.enableStaleFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={handleStaleButtonClick}
                      disabled={isFindingStale}
                    >
                      {isFindingStale ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      )}
                      {t("find_stale")}
                    </Button>
                  )} */}

                  {/* {features.enableAIAttentionScore && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={onCalculateAttentionScores}
                      disabled={isCalculatingScores}
                    >
                      {isCalculatingScores ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Scores
                    </Button>
                  )} */}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* {staleFilterIds.length > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/30 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-semibold">
                        Showing {filteredComplaints.length} Stale Complaint(s)
                      </p>
                      <p className="text-xs">
                        These complaints have not been updated in over 3 days.
                      </p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 hover:text-yellow-800 dark:hover:text-yellow-200"
                          onClick={handleResetFilters}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear Filter</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear Filter</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )} */}

              {/* Pagination at top - merged with sort controls */}
              <PaginationControls
                currentPage={urlPagination.currentPage}
                setCurrentPage={(page) =>
                  updatePagination({ currentPage: page })
                }
                totalItems={
                  // Always use filteredComplaints.length because it represents
                  // the actual visible items after all filters (server + client-side)
                  filteredComplaints.length
                }
                itemsPerPage={urlPagination.rowsPerPage}
                setRowsPerPage={(limit) =>
                  updatePagination({ rowsPerPage: limit, currentPage: 1 })
                }
                totalPages={
                  // Calculate total pages based on actual filtered items
                  filteredComplaints.length > 0
                    ? Math.ceil(
                        filteredComplaints.length / urlPagination.rowsPerPage
                      )
                    : 0
                }
                hasNextPage={
                  // Calculate based on filtered results
                  urlPagination.currentPage <
                  Math.ceil(
                    filteredComplaints.length / urlPagination.rowsPerPage
                  )
                }
                hasPrevPage={urlPagination.currentPage > 1}
                currentPageItems={paginatedComplaints.length}
                sortOptions={sortColumnOptions}
                currentSortColumn={urlSortDescriptor.column}
                currentSortDirection={urlSortDescriptor.direction}
                onSortChange={(column) => {
                  updateSort({
                    column: column as SortDescriptor["column"],
                    direction: urlSortDescriptor.direction,
                  });
                }}
                onSortDirectionToggle={toggleSortDirection}
              />

              {/* {selectedRows.size > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 sticky top-20 z-20">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedRows.size === filteredComplaints.length ||
                        (paginatedComplaints.length > 0 &&
                          selectedRows.size === paginatedComplaints.length)
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                      aria-label="Select all on page"
                    />
                    <div className="font-semibold">
                      {selectedRows.size} complaint(s) selected.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRows(new Set())}
                    >
                      Clear Selection
                    </Button>
                    <Button size="sm" onClick={handleOpenBulkActionModal}>
                      <Bot className="mr-2 size-4" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>
              )} */}

              {isDataLoading ? (
                // ||  isFetching
                <ComplaintsGridSkeleton count={urlPagination.rowsPerPage} />
              ) : (
                <ComplaintsTable
                  complaints={paginatedComplaints}
                  allComplaints={paginatedComplaints}
                  sortDescriptor={urlSortDescriptor as SortDescriptor}
                  onSortChange={updateSort}
                  onUpdateComplaint={handleUpdateComplaint}
                  onUpdateComplaints={handleUpdateComplaints}
                  onViewMedia={setMediaToView}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  pinnedComplaints={pinnedComplaints}
                  onTogglePin={togglePin}
                  onEditCategory={handleOpenEditDialog}
                  expandedRowId={expandedRowId}
                  setExpandedRowId={setExpandedRowId}
                  onNavigate={setSelectedComplaintId}
                  visibleOptionalColumns={visibleOptionalColumns}
                />
              )}
            </div>
          </>
        </div>
      </div>

      {complaintToShow && (
        <div className="w-full xl:w-1/3 h-[calc(100vh-8rem)] sticky top-[calc(4rem+1rem)]">
          <Card className="h-full w-full flex flex-col rounded-xl shadow-lg">
            <ComplaintDetails
              complaint={complaintToShow}
              complaints={paginatedComplaints}
              onUpdate={handleUpdateComplaint}
              onUpdateComplaints={handleUpdateComplaints}
              onViewMedia={setMediaToView}
              onClose={closeComplaintDetails}
              onNavigate={setSelectedComplaintId}
              onEditCategory={handleOpenEditDialog}
              onPrint={handlePrint}
            />
          </Card>
        </div>
      )}

      <Dialog
        open={!!mediaToView}
        onOpenChange={(open) => !open && setMediaToView(null)}
      >
        <DialogContent className="max-w-3xl">
          <div className="mt-4 rounded-md overflow-hidden flex justify-center">
            {mediaToView && (
              <Image
                src={mediaToView}
                alt="Complaint Media"
                width={800}
                height={600}
                className="object-contain max-h-[70vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBulkActionModalOpen}
        onOpenChange={setIsBulkActionModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Perform an action on all {selectedRows.size} selected complaints.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Action to Perform</Label>
              <Select
                value={bulkAction || ""}
                onValueChange={(v) => setBulkAction(v as BulkAction)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remark">Add Remark</SelectItem>
                  {bulkActionContext.possibleActions.length > 0 && (
                    <SelectItem value="status">Change Status</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {bulkAction === "status" && (
              <div className="grid gap-4 p-4 border rounded-md bg-muted/50">
                <div className="grid gap-2">
                  <Label>New Status</Label>
                  <Select
                    value={bulkNewStatus}
                    onValueChange={(v) => setBulkNewStatus(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a new status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bulkActionContext.possibleActions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(status.toLowerCase().replace(/ /g, "_"))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {bulkNewStatus === "Assign" && (
                  <>
                    <div className="grid gap-2">
                      <Label>Department</Label>
                      <Select
                        value={bulkAssignDept}
                        onValueChange={(v) =>
                          setBulkAssignDept(v as Department)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department..." />
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
                        id="bulk-high-priority"
                        checked={bulkIsHighPriority}
                        onCheckedChange={setBulkIsHighPriority}
                      />
                      <Label htmlFor="bulk-high-priority">
                        Mark as High Priority
                      </Label>
                    </div>
                  </>
                )}
              </div>
            )}

            {bulkAction && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>
                      Remark
                      {((bulkAction === "status" &&
                        bulkNewStatus &&
                        [
                          "Invalid",
                          "Need Details",
                          "Backlog",
                          "Reopen",
                        ].includes(bulkNewStatus)) ||
                        bulkAction === "remark") && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    <div
                      className={cn(
                        "text-xs",
                        bulkRemark.length > REMARK_CHAR_LIMIT
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {bulkRemark.length} / {REMARK_CHAR_LIMIT}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Type your remark here..."
                    value={bulkRemark}
                    onChange={(e) => setBulkRemark(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={REMARK_CHAR_LIMIT + 50}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Remark Visibility
                  </Label>
                  <RadioGroup
                    value={bulkRemarkVisibility}
                    onValueChange={(v) =>
                      setBulkRemarkVisibility(v as RemarkVisibility)
                    }
                    className="flex"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="bulk-vis-internal" />
                      <Label
                        htmlFor="bulk-vis-internal"
                        className="flex items-center gap-2 font-normal"
                      >
                        <Lock className="size-3" /> Internal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="bulk-vis-public" />
                      <Label
                        htmlFor="bulk-vis-public"
                        className="flex items-center gap-2 font-normal"
                      >
                        <Globe className="size-3" /> Public
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExecuteBulkAction} disabled={!bulkAction}>
              <Check className="mr-2" />
              Apply to {selectedRows.size} Complaints
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDetailsDialog
        complaint={complaintToEdit}
        allComplaints={paginatedComplaints}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={handleUpdateComplaint}
      />
    </div>
  );
}
