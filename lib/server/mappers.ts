import type {
  Complaint as UIComplaint,
  ComplaintHistoryEntry,
  UserRole,
} from "@/lib/types";
import type {
  Complaint,
  Priority as DBPriority,
  Department as DBDepartment,
  ComplaintStatus as DBStatus,
  ComplaintType as DBComplaintType,
  Role as DBRole,
} from "@prisma/client";

// Map DB enums to UI strings
const statusMapToUI: Record<DBStatus, UIComplaint["status"]> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  BACKLOG: "Backlog",
  NEED_DETAILS: "Need Details",
  INVALID: "Invalid",
};

const statusMapToDB: Record<UIComplaint["status"], DBStatus> = Object.entries(
  statusMapToUI
).reduce((acc, [db, ui]) => {
  acc[ui as UIComplaint["status"]] = db as DBStatus;
  return acc;
}, {} as Record<UIComplaint["status"], DBStatus>);

const deptMapToUI = (
  dept: DBDepartment | null
): UIComplaint["department"] | undefined => {
  if (!dept) return undefined;
  switch (dept) {
    // case "PUBLIC_WORKS":
    //   return "Public Works";
    // case "WATER_SUPPLY":
    //   return "Water Supply";
    // case "SANITATION":
    //   return "Sanitation";
    // case "HEALTH":
    //   return "Health";
    // case "URBAN_PLANNING":
    //   return "Urban Planning";
    // case "POLICE":
    //   return "Police";
    case "PWD_1":
      return "PWD 1";
    case "PWD_2":
      return "PWD 2";
    case "RTO":
      return "RTO";
    case "ZILLA_PARISHAD":
      return "Zilla Parishad";
    case "SP_OFFICE_GONDIA":
      return "SP Office Gondia";
    case "SUPPLY_DEPARTMENT":
      return "Supply Department";
    case "HEALTH_DEPARTMENT":
      return "Health Department";
    case "MSEB_GONDIA":
      return "MSEB Gondia";
    case "TRAFFIC_POLICE":
      return "Traffic Police";
    case "NAGAR_PARISHAD_TIRORA":
      return "Nagar Parishad Tirora";
    case "NAGAR_PARISHAD_GONDIA":
      return "Nagar Parishad Gondia";
    case "NAGAR_PARISHAD_AMGAON":
      return "Nagar Parishad Amgaon";
    case "NAGAR_PARISHAD_GOREGAON":
      return "Nagar Parishad Goregaon";
    case "DEAN_MEDICAL_COLLEGE_GONDIA":
      return "Dean Medical College Gondia";
    case "FOREST_OFFICE_GONDIA":
      return "Forest Office Gondia";
    case "SAMAJ_KALYAN_OFFICE_GONDIA":
      return "Samaj Kalyan Office Gondia";
    case "SLR_OFFICE_GONDIA":
      return "SLR Office Gondia";
    default:
      return undefined;
  }
};

const deptMapToDB = (
  dept: UIComplaint["department"] | undefined
): DBDepartment | null => {
  switch (dept) {
    // case "Public Works":
    //   return "PUBLIC_WORKS";
    // case "Water Supply":
    //   return "WATER_SUPPLY";
    // case "Sanitation":
    //   return "SANITATION";
    // case "Health":
    //   return "HEALTH";
    // case "Urban Planning":
    //   return "URBAN_PLANNING";
    // case "Police":
    //   return "POLICE";
    case "PWD 1":
      return "PWD_1";
    case "PWD 2":
      return "PWD_2";
    case "RTO":
      return "RTO";
    case "Zilla Parishad":
      return "ZILLA_PARISHAD";
    case "SP Office Gondia":
      return "SP_OFFICE_GONDIA";
    case "Supply Department":
      return "SUPPLY_DEPARTMENT";
    case "Health Department":
      return "HEALTH_DEPARTMENT";
    case "MSEB Gondia":
      return "MSEB_GONDIA";
    case "Traffic Police":
      return "TRAFFIC_POLICE";
    case "Nagar Parishad Tirora":
      return "NAGAR_PARISHAD_TIRORA";
    case "Nagar Parishad Gondia":
      return "NAGAR_PARISHAD_GONDIA";
    case "Nagar Parishad Amgaon":
      return "NAGAR_PARISHAD_AMGAON";
    case "Nagar Parishad Goregaon":
      return "NAGAR_PARISHAD_GOREGAON";
    case "Dean Medical College Gondia":
      return "DEAN_MEDICAL_COLLEGE_GONDIA";
    case "Forest Office Gondia":
      return "FOREST_OFFICE_GONDIA";
    case "Samaj Kalyan Office Gondia":
      return "SAMAJ_KALYAN_OFFICE_GONDIA";
    case "SLR Office Gondia":
      return "SLR_OFFICE_GONDIA";
    default:
      return null;
  }
};

const priorityToUI = (
  p: DBPriority | null
): UIComplaint["priority"] | undefined => (p === "HIGH" ? "High" : undefined);
const priorityToDB = (p: UIComplaint["priority"] | undefined): DBPriority =>
  p === "High" ? "HIGH" : "NORMAL";

const roleMapToUI: Record<DBRole, UserRole> = {
  USER: "Citizen",
  ADMIN: "Citizen",
  SUPERADMIN: "Citizen",
  COLLECTOR_TEAM: "Collector Team",
  COLLECTOR_TEAM_ADVANCED: "Collector Team Advanced",
  DEPARTMENT_TEAM: "Department Team",
  DISTRICT_COLLECTOR: "District Collector",
  SUPERINTENDENT_OF_POLICE: "Superintendent of Police",
  MP_RAJYA_SABHA: "MP Rajya Sabha",
  MP_LOK_SABHA: "MP Lok Sabha",
  MLA_GONDIA: "MLA Gondia",
  MLA_TIRORA: "MLA Tirora",
  MLA_ARJUNI_MORGAON: "MLA Sadak Arjuni",
  MLA_AMGAON_DEORI: "MLA Deori",
  MLC: "MLC",
  IFS: "Citizen",
  ZP_CEO: "Zila Parishad",
  // All department roles map to "Department Team"
  PWD_1: "Department Team",
  PWD_2: "Department Team",
  RTO: "Department Team",
  ZILLA_PARISHAD: "Department Team",
  SP_OFFICE_GONDIA: "Department Team",
  SUPPLY_DEPARTMENT: "Department Team",
  HEALTH_DEPARTMENT: "Department Team",
  MSEB_GONDIA: "Department Team",
  TRAFFIC_POLICE: "Department Team",
  NAGAR_PARISHAD_TIRORA: "Department Team",
  NAGAR_PARISHAD_GONDIA: "Department Team",
  NAGAR_PARISHAD_AMGAON: "Department Team",
  NAGAR_PARISHAD_GOREGAON: "Department Team",
  DEAN_MEDICAL_COLLEGE_GONDIA: "Department Team",
  FOREST_OFFICE_GONDIA: "Department Team",
  SAMAJ_KALYAN_OFFICE_GONDIA: "Department Team",
  SLR_OFFICE_GONDIA: "Department Team",
};

function generateComplaintIdFromDate(
  complaintId: number,
  createdAt: string | Date = new Date(),
  displayId?: string | null
): string {
  // If displayId exists (for split complaints), use it
  if (displayId) {
    return displayId;
  }
  // const date = new Date(createdAt); // Works with ISO string or Date object

  // const dd = String(date.getDate()).padStart(2, "0");
  // const mm = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  // const yy = String(date.getFullYear()).slice(-2);

  // const paddedId = String(complaintId).padStart(4, "0");

  // return `BG-${dd}${mm}${yy}-${paddedId}`;
  // New format: BG-{id} (e.g., BG-1234)
  return `BG-${complaintId}`;
}

export function mapDbComplaintToUi(db: any): UIComplaint {
  const ui: UIComplaint = {
    id: generateComplaintIdFromDate(db.id, db.createdAt, db.displayId),
    dbId: db.id, // Store actual database ID for display purposes
    title: db.title ?? "",
    description: db.description ?? "",
    status: statusMapToUI[db.status as DBStatus],
    priority: priorityToUI(db.priority) as any,
    department: deptMapToUI(db.department) as any,
    taluka: db.taluka ?? undefined,
    submittedDate: db.createdAt,
    lastUpdated: db.updatedAt,
    user: db.user
      ? {
          name: db.user.name ?? undefined,
          mobile: db.user.mobile ?? undefined,
        }
      : undefined,
    history: Array.isArray(db.history)
      ? (db.history as any[])
          .map((h) => ({
            id: String(h.id),
            timestamp: h.createdAt,
            user: h.user?.name ?? "System",
            role: roleMapToUI[h.role as DBRole] ?? "Citizen",
            action: h.action,
            notes: h.notes ?? undefined,
            eta: h.eta ?? undefined,
            attachment: h.attachment ?? undefined,
          }))
          .sort(
            (a: ComplaintHistoryEntry, b: ComplaintHistoryEntry) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
      : ([] as ComplaintHistoryEntry[]),
    category: db.category ?? "",
    subcategory: db.subcategory ?? "",
    location: db.location ?? "",
    type: db.type as UIComplaint["type"] | undefined,
    media:
      Array.isArray(db.media) && db.media.length > 0
        ? db.media
            .map((mediaItem: any) => {
              // Handle both old format (string URLs) and new format (JSON objects)
              if (typeof mediaItem === "string") {
                const urlStr = String(mediaItem);
                const filename = urlStr.split("/").pop() || "media";
                const extension = filename.split(".").pop() || "jpg";
                return {
                  url: urlStr,
                  type: "image" as const,
                  filename,
                  extension,
                };
              } else if (typeof mediaItem === "object" && mediaItem !== null) {
                // New format: JSON object with url, type, filename, extension
                return {
                  url: mediaItem.url || "",
                  type: (mediaItem.type || "image") as
                    | "image"
                    | "video"
                    | "document"
                    | "other",
                  filename: mediaItem.filename || "media",
                  extension: mediaItem.extension || "jpg",
                };
              }
              return null;
            })
            .filter(
              (
                item: {
                  url: string;
                  type: "image" | "video" | "document" | "other";
                  filename: string;
                  extension: string;
                } | null
              ): item is {
                url: string;
                type: "image" | "video" | "document" | "other";
                filename: string;
                extension: string;
              } => item !== null
            )
        : undefined,
    linkedComplaintIds:
      db.linkedComplaintIds?.map((id: string) => {
        // If already in BG- format, use as is
        if (id.startsWith("BG-")) {
          return id;
        }
        // If it's a numeric ID, convert to BG-{id} format
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          return `BG-${numericId}`;
        }
        // Try to parse legacy format
        const parts = id.split("-");
        if (parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          const numericPart = parseInt(lastPart);
          if (!isNaN(numericPart)) {
            return `BG-${numericPart}`;
          }
        }
        return id; // Fallback: return as-is
      }) ?? [],
    coSignCount: db.coSignCount ?? 0,
    remarks: Array.isArray(db.remarks)
      ? db.remarks.map((remark: any) => ({
          id: remark.id,
          userId: remark.userId,
          role: roleMapToUI[remark.role as DBRole] ?? "Citizen",
          visibility: remark.visibility.toLowerCase() as "public" | "internal",
          notes: remark.notes,
          createdAt: remark.createdAt,
          user: {
            name: remark.user?.name ?? "",
          },
        }))
      : undefined,
    // Split and merge fields
    displayId: db.displayId ?? undefined,
    parentComplaintId: db.parentComplaintId ?? undefined,
    splitIndex: db.splitIndex ?? undefined,
    mergedIntoComplaintId: db.mergedIntoComplaintId ?? undefined,
    originalComplaintIds: db.originalComplaintIds ?? undefined,
    isSplit: db.isSplit ?? false,
    isMerged: db.isMerged ?? false,
  };
  return ui;
}

export function parseUiIdToDbId(uiIdOrNumeric: string | number): number {
  if (typeof uiIdOrNumeric === "number") return uiIdOrNumeric;

  // Handle new BG-{id} format (e.g., BG-1234)
  const newFormatMatch = uiIdOrNumeric.match(/^BG-(\d+)$/i);
  if (newFormatMatch) return parseInt(newFormatMatch[1], 10);

  // Handle split IDs (BG-{id}-N format for split complaints)
  // Note: This returns the parent ID. For actual database ID lookup, use parseUiIdToDbIdAsync
  const splitMatch = uiIdOrNumeric.match(/^BG-(\d+)-(\d+)$/i);
  if (splitMatch) return parseInt(splitMatch[1], 10);

  // Handle legacy BG-DDMMYY-#### format (backward compatibility)
  const legacyMatch = uiIdOrNumeric.match(/^BG-\d{6}-(\d+)$/i);
  if (legacyMatch) return parseInt(legacyMatch[1], 10);

  // Handle old GC-#### format
  const oldM = uiIdOrNumeric.match(/^(?:GC-)?(\d+)$/i);
  return oldM ? parseInt(oldM[1], 10) : NaN;
}

/**
 * Async version that looks up the actual database ID for split complaints by displayId
 */
export async function parseUiIdToDbIdAsync(
  uiIdOrNumeric: string | number
): Promise<number> {
  if (typeof uiIdOrNumeric === "number") return uiIdOrNumeric;

  // Handle new BG-{id} format (e.g., BG-1234)
  const newFormatMatch = uiIdOrNumeric.match(/^BG-(\d+)$/i);
  if (newFormatMatch) return parseInt(newFormatMatch[1], 10);

  // Handle split IDs (BG-{id}-N format for split complaints)
  // Look up by displayId to get the actual database ID
  const splitMatch = uiIdOrNumeric.match(/^BG-(\d+)-(\d+)$/i);
  if (splitMatch) {
    const prisma = (await import("@/prisma/db")).default;
    const complaint = await prisma.complaint.findFirst({
      where: { displayId: uiIdOrNumeric },
      select: { id: true },
    });
    if (complaint) return complaint.id;
    // Fallback to parent ID if not found
    return parseInt(splitMatch[1], 10);
  }

  // Handle legacy BG-DDMMYY-#### format (backward compatibility)
  const legacyMatch = uiIdOrNumeric.match(/^BG-\d{6}-(\d+)$/i);
  if (legacyMatch) return parseInt(legacyMatch[1], 10);

  // Handle old GC-#### format
  const oldM = uiIdOrNumeric.match(/^(?:GC-)?(\d+)$/i);
  return oldM ? parseInt(oldM[1], 10) : NaN;
}

export const Mapper = {
  statusToDB: statusMapToDB,
  deptToDB: deptMapToDB,
  priorityToDB,
};
