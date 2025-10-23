import type {
  Complaint as UIComplaint,
  ComplaintHistoryEntry,
} from "@/lib/types";
import type {
  Complaint,
  Priority as DBPriority,
  Department as DBDepartment,
  ComplaintStatus as DBStatus,
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
    case "PUBLIC_WORKS":
      return "Public Works";
    case "WATER_SUPPLY":
      return "Water Supply";
    case "SANITATION":
      return "Sanitation";
    case "HEALTH":
      return "Health";
    case "URBAN_PLANNING":
      return "Urban Planning";
    case "POLICE":
      return "Police";
  }
};

const deptMapToDB = (
  dept: UIComplaint["department"] | undefined
): DBDepartment | null => {
  switch (dept) {
    case "Public Works":
      return "PUBLIC_WORKS";
    case "Water Supply":
      return "WATER_SUPPLY";
    case "Sanitation":
      return "SANITATION";
    case "Health":
      return "HEALTH";
    case "Urban Planning":
      return "URBAN_PLANNING";
    case "Police":
      return "POLICE";
    default:
      return null;
  }
};

const priorityToUI = (
  p: DBPriority | null
): UIComplaint["priority"] | undefined => (p === "HIGH" ? "High" : undefined);
const priorityToDB = (p: UIComplaint["priority"] | undefined): DBPriority =>
  p === "High" ? "HIGH" : "NORMAL";

export function mapDbComplaintToUi(db: Complaint): UIComplaint {
  const ui: UIComplaint = {
    id: `GC-${db.id}`,
    title: db.title ?? "",
    description: db.description ?? "",
    status: statusMapToUI[db.status],
    priority: priorityToUI(db.priority) as any,
    department: deptMapToUI(db.department) as any,
    submittedDate: db.createdAt,
    lastUpdated: db.updatedAt,
    history: [] as ComplaintHistoryEntry[], // TODO: Populate from ComplaintHistory when schema supports visibility/tagging
    category: db.category ?? "",
    subcategory: db.subcategory ?? "",
    location: db.location ?? "",
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
            .filter((item): item is NonNullable<typeof item> => item !== null)
        : undefined,
    linkedComplaintIds:
      db.linkedComplaintIds?.map((id) =>
        id.startsWith("GC-") ? id : `GC-${id}`
      ) ?? [],
  };
  return ui;
}

export function parseUiIdToDbId(uiIdOrNumeric: string | number): number {
  if (typeof uiIdOrNumeric === "number") return uiIdOrNumeric;
  const m = uiIdOrNumeric.match(/^(?:GC-)?(\d+)$/i);
  return m ? parseInt(m[1], 10) : NaN;
}

export const Mapper = {
  statusToDB: statusMapToDB,
  deptToDB: deptMapToDB,
  priorityToDB,
};
