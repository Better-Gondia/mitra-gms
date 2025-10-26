export type UserRole =
  | "Collector Team"
  | "Department Team"
  | "District Collector"
  | "Citizen"
  | "Superintendent of Police"
  | "MP Rajya Sabha"
  | "MP Lok Sabha"
  | "MLA Gondia"
  | "MLA Tirora"
  | "MLA Sadak Arjuni"
  | "MLA Deori"
  | "MLC";

export const userRoles = [
  "District Collector",
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
] as const;

export const stakeholderRoles = [
  "Superintendent of Police",
  "MP Rajya Sabha",
  "MP Lok Sabha",
  "MLA Gondia",
  "MLA Tirora",
  "MLA Sadak Arjuni",
  "MLA Deori",
  "MLC",
] as const;

export const departments = [
  "Public Works",
  "Water Supply",
  "Sanitation",
  "Health",
  "Urban Planning",
  "Police",
] as const;
export type Department = (typeof departments)[number];

// Statuses visible in each role's primary queue
export const collectorStatuses = ["Open", "Need Details", "Invalid"] as const;
export const departmentStatuses = [
  "Assigned",
  "In Progress",
  "Backlog",
  "Resolved",
] as const;

// All possible statuses a complaint can have
export const allStatuses = [
  "Open",
  "Assigned",
  "In Progress",
  "Resolved",
  "Backlog",
  "Need Details",
  "Invalid",
] as const;

export const priorities = ["High", "Normal"] as const;
export type Priority = (typeof priorities)[number];

// The standard lifecycle path for a complaint
export const complaintWorkflow: ComplaintStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Resolved",
];

export type CollectorStatus = (typeof collectorStatuses)[number];
export type DepartmentStatus = (typeof departmentStatuses)[number];

export type ComplaintStatus =
  | "Open"
  | "Need Details"
  | "Invalid"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Backlog";

export type Eta = Date;
export type RemarkVisibility = "public" | "internal";

export type ComplaintHistoryEntry = {
  id: string;
  timestamp: Date;
  user: string;
  role: UserRole;
  action: string;
  notes?: string;
  department?: Department;
  priority?: Priority;
  eta?: Eta;
  attachment?: string;
  visibility?: RemarkVisibility;
  taggedUsers?: UserRole[];
};

export type MediaAttachment = {
  url: string;
  type: "image" | "video" | "document" | "other";
  filename: string;
  extension: string;
};

export type ComplaintType = "COMPLAINT" | "SUGGESTION";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority?: Priority;
  department?: Department;
  submittedDate: Date;
  lastUpdated: Date;
  history: ComplaintHistoryEntry[];
  category: string;
  subcategory: string;
  location: string;
  media?: MediaAttachment[];
  linkedComplaintIds?: string[];
  attentionScore?: number;
  type?: ComplaintType;
};

export type SortDescriptor = {
  column: keyof Complaint | "date" | "details" | "last_updated" | "attention";
  direction: "ascending" | "descending";
};
