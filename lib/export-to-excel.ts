import type { Complaint } from "@/lib/types";

/**
 * Converts complaints data to Excel format
 * This function formats the complaint data for Excel export
 *
 * @param complaints - Array of complaints to export
 * @param visibleColumns - Set of visible column keys to include
 * @returns Array of objects suitable for Excel export
 */
export function prepareComplaintsForExport(
  complaints: Complaint[],
  visibleColumns?: Set<string>
): Record<string, any>[] {
  return complaints.map((complaint) => {
    const row: Record<string, any> = {};

    // Always include these basic fields
    row["Complaint ID"] = complaint.id;
    row["Type"] = complaint.type || "Complaint";
    row["Status"] = complaint.status;
    row["Title"] = complaint.description; // Using description as title
    row["Submitted Date"] = complaint.submittedDate
      ? new Date(complaint.submittedDate).toLocaleString()
      : "";
    row["Last Updated"] = complaint.lastUpdated
      ? new Date(complaint.lastUpdated).toLocaleString()
      : "";

    // Include department if visible
    if (!visibleColumns || visibleColumns.has("department")) {
      row["Department"] = complaint.department || "N/A";
    }

    // Include priority
    row["Priority"] = complaint.priority || "Normal";

    // Include category if visible
    if (!visibleColumns || visibleColumns.has("category")) {
      row["Category"] = complaint.category || "";
      row["Sub-Category"] = complaint.subcategory || "";
    }

    // Include location if visible
    if (!visibleColumns || visibleColumns.has("location")) {
      row["Location"] = complaint.location || "N/A";
    }

    // Include attention score if available
    if (complaint.attentionScore) {
      row["Attention Score"] = complaint.attentionScore;
    }

    // Include co-sign count if available
    if (complaint.coSignCount) {
      row["Co-Sign Count"] = complaint.coSignCount;
    }

    // Include linked complaints
    if (
      complaint.linkedComplaintIds &&
      complaint.linkedComplaintIds.length > 0
    ) {
      row["Linked Complaints"] = complaint.linkedComplaintIds.join(", ");
    }

    // Include media count
    if (complaint.media && complaint.media.length > 0) {
      row["Media Attachments"] = complaint.media.length;
    }

    return row;
  });
}

/**
 * Export data to Excel format
 * Note: This implementation uses the SheetJS library (xlsx)
 * The actual export logic will be handled by the component using this data
 */
export type ExportFormat = "xlsx";

export interface ExportOptions {
  format?: ExportFormat;
  filename?: string;
}
