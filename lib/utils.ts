import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  formatDuration,
  intervalToDuration,
  isSaturday,
  isSunday,
  getHours,
  getMinutes,
  set,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { Role } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBusinessDuration(start: Date, end: Date): string {
  const startOfDay = 10;
  const endOfDay = 17; // 5 PM

  if (start > end) return "0 minutes";

  let totalBusinessMinutes = 0;
  let cursor = new Date(start);

  while (cursor < end) {
    if (!isSaturday(cursor) && !isSunday(cursor)) {
      const hour = getHours(cursor);
      if (hour >= startOfDay && hour < endOfDay) {
        totalBusinessMinutes++;
      }
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  if (totalBusinessMinutes <= 0) return "0 minutes";

  const duration = intervalToDuration({
    start: 0,
    end: totalBusinessMinutes * 60 * 1000,
  });

  const formatted = formatDuration(duration, {
    format: ["days", "hours", "minutes"],
    delimiter: ", ",
  });

  return `${formatted}`;
}

export function formatPreciseDuration(start: Date, end: Date): string {
  const totalMinutes = differenceInMinutes(end, start);
  const totalHours = differenceInHours(end, start);
  const totalDays = differenceInDays(end, start);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  if (totalHours < 24) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  const days = totalDays;
  const remainingHours = totalHours % 24;
  const remainingMinutesAfterHours = totalMinutes % 60;

  return `${days}d ${remainingHours}h ${remainingMinutesAfterHours}m`;
}

// API helpers
export interface ComplaintsResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ComplaintsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  statuses?: string; // comma-separated list of statuses
  department?: string;
  tehsil?: string;
  dateFrom?: string;
  dateTo?: string;
  pinned?: boolean;
  myRemarks?: boolean;
  mentions?: boolean;
  linked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function apiFetchComplaints(
  params?: ComplaintsQueryParams
): Promise<ComplaintsResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = `/api/complaints${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function apiPatchComplaint(
  id: string,
  payload: any
): Promise<any> {
  const res = await fetch(`/api/complaints/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update complaint");
  return res.json();
}

export async function apiFetchAnalytics(): Promise<any> {
  const res = await fetch("/api/analytics", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function generateComplaintIdFromDate(
  complaintId: number,
  createdAt: string | Date = new Date()
): string {
  // const date = new Date(createdAt); // Works with ISO string or Date object

  // const dd = String(date.getDate()).padStart(2, "0");
  // const mm = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  // const yy = String(date.getFullYear()).slice(-2);

  // const paddedId = String(complaintId).padStart(4, "0");

  // return `BG-${dd}${mm}${yy}-${paddedId}`;
  // New format: BG-{id} (e.g., BG-1234)
  return `BG-${complaintId}`;
}

export const isCollectorView = (role: Role) => {
  return (
    role === Role.DISTRICT_COLLECTOR ||
    role === Role.SUPERINTENDENT_OF_POLICE ||
    role === Role.MP_RAJYA_SABHA ||
    role === Role.MP_LOK_SABHA ||
    role === Role.MLA_GONDIA ||
    role === Role.MLA_TIRORA ||
    role === Role.MLA_ARJUNI_MORGAON ||
    role === Role.MLA_AMGAON_DEORI ||
    role === Role.MLC ||
    role === Role.ZP_CEO ||
    role === Role.IFS
  );
};

// List of all department roles (excluding DEPARTMENT_TEAM which is generic)
const departmentRoles: Role[] = [
  Role.PWD_1,
  Role.PWD_2,
  Role.RTO,
  Role.ZILLA_PARISHAD,
  Role.SP_OFFICE_GONDIA,
  Role.SUPPLY_DEPARTMENT,
  Role.HEALTH_DEPARTMENT,
  Role.MSEB_GONDIA,
  Role.TRAFFIC_POLICE,
  Role.NAGAR_PARISHAD_TIRORA,
  Role.NAGAR_PARISHAD_GONDIA,
  Role.NAGAR_PARISHAD_AMGAON,
  Role.NAGAR_PARISHAD_GOREGAON,
  Role.DEAN_MEDICAL_COLLEGE_GONDIA,
  Role.FOREST_OFFICE_GONDIA,
  Role.SAMAJ_KALYAN_OFFICE_GONDIA,
  Role.SLR_OFFICE_GONDIA,
];

/**
 * Checks if a role is a department role (including DEPARTMENT_TEAM)
 */
export const isDepartmentRole = (role: Role): boolean => {
  return role === Role.DEPARTMENT_TEAM || departmentRoles.includes(role);
};

/**
 * Gets the department enum value from a department role
 * Returns null if the role is not a department role or is DEPARTMENT_TEAM (generic)
 */
export const getDepartmentFromRole = (role: Role): string | null => {
  if (role === Role.DEPARTMENT_TEAM) {
    return null; // Generic department team has no specific department
  }
  if (departmentRoles.includes(role)) {
    // Department role names match department enum values
    return role;
  }
  return null;
};

export const isDepartmentView = (role: Role) => isDepartmentRole(role);

export const isCollectorTeamView = (role: Role) =>
  role === Role.COLLECTOR_TEAM || role === Role.COLLECTOR_TEAM_ADVANCED;

/**
 * Formats complaint ID for display, showing both actual ID and split/merge ID when applicable
 * For split complaints: "91 (50-1)" where 91 is actual ID and 50-1 is displayId
 * For merged complaints: "100 (50, 51, 52)" where 100 is actual ID and 50,51,52 are original IDs
 * For normal complaints: "BG-50" (just the regular ID)
 */
export function formatComplaintIdDisplay(complaint: {
  id: string;
  dbId?: number;
  displayId?: string;
  isSplit?: boolean;
  isMerged?: boolean;
  originalComplaintIds?: number[];
}): string {
  const { id, dbId, displayId, isSplit, isMerged, originalComplaintIds } =
    complaint;

  // Try to extract dbId from id if not provided (fallback for old data)
  let actualDbId = dbId;
  if (!actualDbId && id) {
    // Try to parse BG-{number} format
    const bgMatch = id.match(/^BG-(\d+)$/);
    if (bgMatch) {
      actualDbId = parseInt(bgMatch[1], 10);
    }
  }

  // For split complaints: show actual ID and displayId
  // Note: Child split complaints have displayId but isSplit=false, so check displayId instead
  if (displayId && actualDbId && displayId.includes("-")) {
    // displayId format is like "BG-50-1" or "50-1" for split complaints
    // Format the actual DB ID with BG- prefix
    return `BG-${actualDbId} (${displayId})`;
  }

  // For merged complaints: show actual ID and original complaint IDs
  // Check originalComplaintIds regardless of isMerged flag (primary complaint may not have isMerged=true)
  if (actualDbId && originalComplaintIds && originalComplaintIds.length > 0) {
    const originalIdsStr = originalComplaintIds
      .map((id) => `BG-${id}`)
      .join(", ");
    return `BG-${actualDbId} (${originalIdsStr})`;
  }

  // For normal complaints: just return the regular ID
  return id;
}

/**
 * Gets the complaint ID for copying (without displayId or original IDs in parentheses)
 * For split complaints: returns "BG-407" instead of "BG-407 (BG-398-2)"
 * For merged complaints: returns "BG-100" instead of "BG-100 (BG-50, BG-51, BG-52)"
 * For normal complaints: returns the regular ID
 */
export function getComplaintIdForCopy(complaint: {
  id: string;
  dbId?: number;
  displayId?: string;
  isSplit?: boolean;
  isMerged?: boolean;
  originalComplaintIds?: number[];
}): string {
  const { id, dbId } = complaint;

  // Try to extract dbId from id if not provided (fallback for old data)
  let actualDbId = dbId;
  if (!actualDbId && id) {
    // Try to parse BG-{number} format
    const bgMatch = id.match(/^BG-(\d+)$/);
    if (bgMatch) {
      actualDbId = parseInt(bgMatch[1], 10);
    }
  }

  // If we have the actual database ID, format it with BG- prefix
  if (actualDbId) {
    return `BG-${actualDbId}`;
  }

  // Fallback: return the regular ID
  return id;
}
