import prisma from "@/prisma/db";
import { Role, NotificationType } from "@prisma/client";

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

    // Update hasNotifications flag for all users with the target role
    await prisma.user.updateMany({
      where: { role: params.forRole },
      data: { hasNotifications: true },
    });
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
}) {
  const { oldStatus, newStatus, complaintId, complaintRef, createdBy } = params;

  // Open to Assigned → notify DEPARTMENT_TEAM
  if (oldStatus === "OPEN" && newStatus === "ASSIGNED") {
    await createNotification({
      forRole: "DEPARTMENT_TEAM",
      type: "ASSIGNMENT",
      title: "New complaint assigned",
      // Include raw numeric id in the message so the client can search by it directly
      message: `Complaint ${complaintId} has been assigned to your department. (${complaintRef})`,
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
 * Creates notification for a remark based on the current complaint status
 */
export async function notifyRemark(params: {
  currentStatus: string;
  complaintId: number;
  complaintRef: string;
  createdBy: number;
  visibility: "PUBLIC" | "INTERNAL";
  taggedRoles?: Role[];
}) {
  const {
    currentStatus,
    complaintId,
    complaintRef,
    createdBy,
    visibility,
    taggedRoles,
  } = params;

  // Notify based on current status
  const targetRole = getNotificationRoleForStatus(currentStatus);
  if (targetRole) {
    await createNotification({
      forRole: targetRole,
      type: "REMARK",
      title: "New remark on complaint",
      message: `A ${visibility.toLowerCase()} remark has been added to complaint ${complaintRef}.`,
      createdBy,
    });
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
