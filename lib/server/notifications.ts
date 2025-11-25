import prisma from "@/prisma/db";
import { Role, NotificationType, Department } from "@prisma/client";

/**
 * Creates a notification for a specific role
 */
export async function createNotification(params: {
  forRole: Role;
  type: NotificationType;
  title: string;
  message?: string;
  createdBy?: number;
}) {
  try {
    await prisma.notification.create({
      data: {
        forRole: params.forRole,
        type: params.type,
        title: params.title,
        message: params.message,
        createdBy: params.createdBy,
      },
    });

    // If notification is for COLLECTOR_TEAM, also create one for COLLECTOR_TEAM_ADVANCED
    if (params.forRole === "COLLECTOR_TEAM") {
      await prisma.notification.create({
        data: {
          forRole: "COLLECTOR_TEAM_ADVANCED",
          type: params.type,
          title: params.title,
          message: params.message,
          createdBy: params.createdBy,
        },
      });
    }

    // Update hasNotifications flag for all users with the target role
    await prisma.user.updateMany({
      where: { role: params.forRole },
      data: { hasNotifications: true },
    });

    // Also update hasNotifications for COLLECTOR_TEAM_ADVANCED if notifying COLLECTOR_TEAM
    if (params.forRole === "COLLECTOR_TEAM") {
      await prisma.user.updateMany({
        where: { role: "COLLECTOR_TEAM_ADVANCED" },
        data: { hasNotifications: true },
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

/**
 * Gets the appropriate notification target role based on complaint status
 */
export function getNotificationRoleForStatus(status: string): Role | null {
  const statusMap: Record<string, Role> = {
    OPEN: "COLLECTOR_TEAM",
    INVALID: "COLLECTOR_TEAM",
    NEED_DETAILS: "COLLECTOR_TEAM",
    ASSIGNED: "DEPARTMENT_TEAM",
    IN_PROGRESS: "DEPARTMENT_TEAM",
    RESOLVED: "DEPARTMENT_TEAM",
    BACKLOG: "DEPARTMENT_TEAM",
  };

  return statusMap[status] || null;
}

/**
 * Creates notification for status change
 */
export async function notifyStatusChange(params: {
  oldStatus: string;
  newStatus: string;
  complaintId: number;
  complaintRef: string;
  createdBy: number;
  complaintDepartment?: Department | null;
}) {
  const {
    oldStatus,
    newStatus,
    complaintId,
    complaintRef,
    createdBy,
    complaintDepartment,
  } = params;

  // Open to Assigned → notify the specific department role (or DEPARTMENT_TEAM if generic)
  if (oldStatus === "OPEN" && newStatus === "ASSIGNED") {
    const targetRole = getDepartmentRoleFromDepartment(
      complaintDepartment ?? null
    );
    const deptName = getDepartmentName(complaintDepartment ?? null);
    await createNotification({
      forRole: targetRole,
      type: "ASSIGNMENT",
      title: "New complaint assigned",
      // Include raw numeric id in the message so the client can search by it directly
      message: `Complaint ${complaintId} has been assigned to your department${
        deptName ? ` (${deptName})` : ""
      }. (${complaintRef})`,
      createdBy,
    });
  }

  // Assigned to Need Details → notify COLLECTOR_TEAM
  if (oldStatus === "ASSIGNED" && newStatus === "NEED_DETAILS") {
    await createNotification({
      forRole: "COLLECTOR_TEAM",
      type: "STATUS_CHANGE",
      title: "Complaint needs more details",
      message: `Complaint ${complaintRef} needs more information from the citizen.`,
      createdBy,
    });
  }
}

/**
 * Maps department enum to readable name
 */
function getDepartmentName(department: Department | null): string {
  if (!department) return "";
  const deptMap: Record<Department, string> = {
    PUBLIC_WORKS: "Public Works",
    WATER_SUPPLY: "Water Supply",
    SANITATION: "Sanitation",
    HEALTH: "Health",
    URBAN_PLANNING: "Urban Planning",
    POLICE: "Police",
    PWD_1: "PWD 1",
    PWD_2: "PWD 2",
    RTO: "RTO",
    ZILLA_PARISHAD: "Zilla Parishad",
    SP_OFFICE_GONDIA: "SP Office Gondia",
    SUPPLY_DEPARTMENT: "Supply Department",
    HEALTH_DEPARTMENT: "Health Department",
    MSEB_GONDIA: "MSEB Gondia",
    TRAFFIC_POLICE: "Traffic Police",
    NAGAR_PARISHAD_TIRORA: "Nagar Parishad Tirora",
    NAGAR_PARISHAD_GONDIA: "Nagar Parishad Gondia",
    NAGAR_PARISHAD_AMGAON: "Nagar Parishad Amgaon",
    NAGAR_PARISHAD_GOREGAON: "Nagar Parishad Goregaon",
    DEAN_MEDICAL_COLLEGE_GONDIA: "Dean Medical College Gondia",
    FOREST_OFFICE_GONDIA: "Forest Office Gondia",
    SAMAJ_KALYAN_OFFICE_GONDIA: "Samaj Kalyan Office Gondia",
    SLR_OFFICE_GONDIA: "SLR Office Gondia",
    RDC_GONDIA: "RDC Gondia",
    DEPUTY_COLLECTOR_GENERAL_GONDIA: "Deputy Collector General Gondia",
    PO_OFFICE_DEORI: "PO Office Deori",
    ST_DEPO_OFFICE_GONDIA: "ST Depo Office Gondia",
  };
  return deptMap[department] || "";
}

/**
 * Maps department enum to the corresponding department role
 * Returns the specific department role if it exists, otherwise returns DEPARTMENT_TEAM
 */
function getDepartmentRoleFromDepartment(department: Department | null): Role {
  if (!department) return "DEPARTMENT_TEAM";

  // Map department to role (department enum values match role enum values for department roles)
  const deptToRoleMap: Record<Department, Role> = {
    PUBLIC_WORKS: "DEPARTMENT_TEAM",
    WATER_SUPPLY: "DEPARTMENT_TEAM",
    SANITATION: "DEPARTMENT_TEAM",
    HEALTH: "DEPARTMENT_TEAM",
    URBAN_PLANNING: "DEPARTMENT_TEAM",
    POLICE: "DEPARTMENT_TEAM",
    PWD_1: "PWD_1",
    PWD_2: "PWD_2",
    RTO: "RTO",
    ZILLA_PARISHAD: "ZILLA_PARISHAD",
    SP_OFFICE_GONDIA: "SP_OFFICE_GONDIA",
    SUPPLY_DEPARTMENT: "SUPPLY_DEPARTMENT",
    HEALTH_DEPARTMENT: "HEALTH_DEPARTMENT",
    MSEB_GONDIA: "MSEB_GONDIA",
    TRAFFIC_POLICE: "TRAFFIC_POLICE",
    NAGAR_PARISHAD_TIRORA: "NAGAR_PARISHAD_TIRORA",
    NAGAR_PARISHAD_GONDIA: "NAGAR_PARISHAD_GONDIA",
    NAGAR_PARISHAD_AMGAON: "NAGAR_PARISHAD_AMGAON",
    NAGAR_PARISHAD_GOREGAON: "NAGAR_PARISHAD_GOREGAON",
    DEAN_MEDICAL_COLLEGE_GONDIA: "DEAN_MEDICAL_COLLEGE_GONDIA",
    FOREST_OFFICE_GONDIA: "FOREST_OFFICE_GONDIA",
    SAMAJ_KALYAN_OFFICE_GONDIA: "SAMAJ_KALYAN_OFFICE_GONDIA",
    SLR_OFFICE_GONDIA: "SLR_OFFICE_GONDIA",
    RDC_GONDIA: "RDC_GONDIA",
    DEPUTY_COLLECTOR_GENERAL_GONDIA: "DEPUTY_COLLECTOR_GENERAL_GONDIA",
    PO_OFFICE_DEORI: "PO_OFFICE_DEORI",
    ST_DEPO_OFFICE_GONDIA: "ST_DEPO_OFFICE_GONDIA",
  };

  return deptToRoleMap[department] || "DEPARTMENT_TEAM";
}

/**
 * Creates notification for a remark based on the current complaint status
 */
export async function notifyRemark(params: {
  currentStatus: string;
  complaintId: number;
  complaintRef: string;
  createdBy: number;
  visibility: "PUBLIC" | "INTERNAL";
  taggedRoles?: Role[];
  remarkCreatorRole?: Role;
  complaintDepartment?: Department | null;
}) {
  const {
    currentStatus,
    complaintId,
    complaintRef,
    createdBy,
    visibility,
    taggedRoles,
    remarkCreatorRole,
    complaintDepartment,
  } = params;

  // Check if remark creator is a collector or similar stakeholder
  const collectorRoles: Role[] = [
    "COLLECTOR_TEAM",
    "COLLECTOR_TEAM_ADVANCED",
    "DISTRICT_COLLECTOR",
    "SUPERINTENDENT_OF_POLICE",
    "MP_RAJYA_SABHA",
    "MP_LOK_SABHA",
    "MLA_GONDIA",
    "MLA_TIRORA",
    "MLA_ARJUNI_MORGAON",
    "MLA_AMGAON_DEORI",
    "MLC",
    "ZP_CEO",
    "IFS",
  ];
  const isCollectorStakeholder =
    remarkCreatorRole && collectorRoles.includes(remarkCreatorRole);

  // If a collector/stakeholder leaves a remark and complaint has a department, notify the specific department role
  if (isCollectorStakeholder && complaintDepartment) {
    const deptName = getDepartmentName(complaintDepartment);
    const targetDeptRole = getDepartmentRoleFromDepartment(complaintDepartment);
    await createNotification({
      forRole: targetDeptRole,
      type: "REMARK",
      title: "New remark on complaint",
      message: `A ${visibility.toLowerCase()} remark has been added to complaint ${complaintRef}${
        deptName ? ` (${deptName} department)` : ""
      }.`,
      createdBy,
    });
  }

  // Notify based on current status (existing logic)
  const targetRole = getNotificationRoleForStatus(currentStatus);
  if (targetRole) {
    // If target role is DEPARTMENT_TEAM and we have a specific department, use the specific department role
    let finalTargetRole = targetRole;
    if (targetRole === "DEPARTMENT_TEAM" && complaintDepartment) {
      finalTargetRole = getDepartmentRoleFromDepartment(complaintDepartment);
    }

    // Only create status-based notification if we haven't already notified the department above
    // to avoid duplicate notifications
    const alreadyNotified =
      isCollectorStakeholder &&
      complaintDepartment &&
      finalTargetRole === getDepartmentRoleFromDepartment(complaintDepartment);
    if (!alreadyNotified) {
      await createNotification({
        forRole: finalTargetRole,
        type: "REMARK",
        title: "New remark on complaint",
        message: `A ${visibility.toLowerCase()} remark has been added to complaint ${complaintRef}.`,
        createdBy,
      });
    }
  }

  // Notify tagged roles
  if (taggedRoles && taggedRoles.length > 0) {
    for (const role of taggedRoles) {
      await createNotification({
        forRole: role,
        type: "TAG",
        title: "You were mentioned",
        message: `You were mentioned in a remark on complaint ${complaintRef}.`,
        createdBy,
      });
    }
  }
}

/**
 * Maps role enum to readable UI name
 */
// function getRoleName(role: Role): string {
//   const roleMap: Record<Role, string> = {
//     USER: "User",
//     ADMIN: "Admin",
//     SUPERADMIN: "Super Admin",
//     COLLECTOR_TEAM: "Collector Team",
//     DEPARTMENT_TEAM: "Department Team",
//     DISTRICT_COLLECTOR: "District Collector",
//     SUPERINTENDENT_OF_POLICE: "Superintendent of Police",
//     MP_RAJYA_SABHA: "MP Rajya Sabha",
//     MP_LOK_SABHA: "MP Lok Sabha",
//     MLA_GONDIA: "MLA Gondia",
//     MLA_TIRORA: "MLA Tirora",
//     MLA_ARJUNI_MORGAON: "MLA Sadak Arjuni",
//     MLA_AMGAON_DEORI: "MLA Deori",
//     MLC: "MLC",
//     ZP_CEO: "Zila Parishad",
//     IFS: "IFS",
//   };
//   return roleMap[role] || role;
// }

/**
 * Extracts tagged roles from remark text (backend fallback)
 * Matches patterns like @District Collector, @Department Team, etc.
 */
export function extractTaggedRolesFromText(text: string): Role[] {
  if (!text) return [];

  // Map UI role names to backend Role enum
  const uiRoleToDbRole: Record<string, Role> = {
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

  // Match tags like @District Collector, @Department Team, etc.
  // More flexible pattern to handle variations
  const tags = Array.from(text.matchAll(/@([A-Za-z][A-Za-z\s]{0,50})/g)).map(
    (m) => m[1].trim()
  );

  const uniqueUiRoles = Array.from(new Set(tags));
  const mapped = uniqueUiRoles
    .map((ui) => {
      // Try exact match first
      if (uiRoleToDbRole[ui]) {
        return uiRoleToDbRole[ui];
      }
      // Try partial match (e.g., "District Collector Sir" -> "District Collector")
      for (const [key, value] of Object.entries(uiRoleToDbRole)) {
        if (ui.includes(key) || key.includes(ui)) {
          return value;
        }
      }
      return null;
    })
    .filter((v): v is Role => v !== null);

  return Array.from(new Set(mapped));
}
