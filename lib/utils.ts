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

export const isDepartmentView = (role: Role) => role === Role.DEPARTMENT_TEAM;

export const isCollectorTeamView = (role: Role) =>
  role === Role.COLLECTOR_TEAM || role === Role.COLLECTOR_TEAM_ADVANCED;
