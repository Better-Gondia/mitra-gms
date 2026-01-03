import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";
import prisma from "@/prisma/db";
import type {
  Complaint as UIComplaint,
  ComplaintHistoryEntry,
  UserRole,
} from "@/lib/types";
import type {
  Role as DBRole,
  ComplaintStatus as DBStatus,
  Priority as DBPriority,
  Department as DBDepartment,
  User,
} from "@prisma/client";
import { nanoid } from "nanoid";
import { error } from "console";

// Map UI role to DB role
const uiRoleToDBRole = (uiRole: UserRole): DBRole => {
  const roleMap: Record<UserRole, DBRole> = {
    Citizen: "USER",
    Admin: "ADMIN",
    SuperAdmin: "SUPERADMIN",
    "Collector Team": "COLLECTOR_TEAM",
    "Collector Team Advanced": "COLLECTOR_TEAM_ADVANCED",
    "Department Team": "DEPARTMENT_TEAM",
    "District Collector": "DISTRICT_COLLECTOR",
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
  return roleMap[uiRole] || "USER";
};

// Map UI status to DB status
const uiStatusToDBStatus = (uiStatus: UIComplaint["status"]): DBStatus => {
  const statusMap: Record<UIComplaint["status"], DBStatus> = {
    Open: "OPEN",
    Assigned: "ASSIGNED",
    "In Progress": "IN_PROGRESS",
    Resolved: "RESOLVED",
    Backlog: "BACKLOG",
    "Need Details": "NEED_DETAILS",
    Invalid: "INVALID",
  };
  return statusMap[uiStatus];
};

// Map UI priority to DB priority
const uiPriorityToDBPriority = (
  uiPriority: UIComplaint["priority"]
): DBPriority => {
  return uiPriority === "High" ? "HIGH" : "NORMAL";
};

// Map UI department to DB department
const uiDeptToDBDept = (
  uiDept: UIComplaint["department"] | undefined
): DBDepartment | null => {
  if (!uiDept) return null;
  const deptMap: Record<string, DBDepartment> = {
    "PWD 1": "PWD_1",
    "PWD 2": "PWD_2",
    RTO: "RTO",
    "Zilla Parishad": "ZILLA_PARISHAD",
    "SP Office Gondia": "SP_OFFICE_GONDIA",
    "Supply Department": "SUPPLY_DEPARTMENT",
    "Health Department": "HEALTH_DEPARTMENT",
    "MSEB Gondia": "MSEB_GONDIA",
    "Traffic Police": "TRAFFIC_POLICE",
    "Nagar Parishad Tirora": "NAGAR_PARISHAD_TIRORA",
    "Nagar Parishad Gondia": "NAGAR_PARISHAD_GONDIA",
    "Nagar Parishad Amgaon": "NAGAR_PARISHAD_AMGAON",
    "Nagar Parishad Goregaon": "NAGAR_PARISHAD_GOREGAON",
    "Dean Medical College Gondia": "DEAN_MEDICAL_COLLEGE_GONDIA",
    "Forest Office Gondia": "FOREST_OFFICE_GONDIA",
    "Samaj Kalyan Office Gondia": "SAMAJ_KALYAN_OFFICE_GONDIA",
    "SLR Office Gondia": "SLR_OFFICE_GONDIA",
    "RDC Gondia": "RDC_GONDIA",
    "Deputy Collector General Gondia": "DEPUTY_COLLECTOR_GENERAL_GONDIA",
    "PO Office Deori": "PO_OFFICE_DEORI",
    "ST Depo Office Gondia": "ST_DEPO_OFFICE_GONDIA",
    "Nagar Panchayat Salekasa": "NAGAR_PANCHAYAT_SALEKASA",
    "Nagar Panchayat Deori": "NAGAR_PANCHAYAT_DEORI",
    "Nagar Panchayat Arjuni Mor": "NAGAR_PANCHAYAT_ARJUNI_MOR",
    "Nagar Panchayat Sadak Arjuni": "NAGAR_PANCHAYAT_SADAK_ARJUNI",
  };
  return deptMap[uiDept] || null;
};

// Generate unique slug
const generateSlug = (): string => {
  return `bgm-${nanoid(12)}`;
};

// Generate unique mobile number
const generateMobile = (): string => {
  return `9${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`;
};

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ error: "Route not active" }, { status: 404 });

    /*
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { clearExisting = false, complaintCount } = body;

    console.log("=== Starting Database Seeding ===");

    // Log initial entry counts
    const initialUserCount = await prisma.user.count();
    const initialComplaintCount = await prisma.complaint.count();
    const initialHistoryCount = await prisma.complaintHistory.count();

    console.log("Initial database state:");
    console.log(`  - Users: ${initialUserCount}`);
    console.log(`  - Complaints: ${initialComplaintCount}`);
    console.log(`  - Complaint History: ${initialHistoryCount}`);

    // Clear existing data if requested
    if (clearExisting) {
      console.log("\nClearing existing data...");
      const deletedHistory = await prisma.complaintHistory.deleteMany();
      console.log(`  ✓ Deleted ${deletedHistory.count} history entries`);

      const deletedComplaints = await prisma.complaint.deleteMany();
      console.log(`  ✓ Deleted ${deletedComplaints.count} complaints`);

      const deletedUsers = await prisma.user.deleteMany();
      console.log(`  ✓ Deleted ${deletedUsers.count} users`);
      console.log("Existing data cleared.\n");
    }

    // Create staff users for different roles
    console.log("Creating staff users...");
    const staffRoles: UserRole[] = [
      "Collector Team",
      "Collector Team Advanced",
      "District Collector",
      "Department Team",
    ];

    const staffUsers: User[] = [];
    for (const role of staffRoles) {
      const dbRole = uiRoleToDBRole(role);
      let slug = generateSlug();
      let mobile = generateMobile();

      // Ensure unique slug and mobile
      while (
        (await prisma.user.findUnique({ where: { slug } })) ||
        (await prisma.user.findUnique({ where: { mobile } }))
      ) {
        slug = generateSlug();
        mobile = generateMobile();
      }

      const user = await prisma.user.create({
        data: {
          name: `${role} User`,
          slug,
          mobile,
          email: `${role.toLowerCase().replace(/\s+/g, "-")}@example.com`,
          role: dbRole,
          age: 30,
          gender: "Other",
          address: "Gondia, Maharashtra",
          authType: "DETAILS",
        },
      });

      staffUsers.push(user);
      console.log(
        `  ✓ Created user: ${user.name} (${user.role}) - ID: ${user.id}`
      );
    }

    console.log(`\nCreated ${staffUsers.length} staff users.`);

    // Get or create a default citizen user
    let citizenUser = await prisma.user.findFirst({
      where: { role: "USER" },
    });

    if (!citizenUser) {
      let slug = generateSlug();
      let mobile = generateMobile();

      while (
        (await prisma.user.findUnique({ where: { slug } })) ||
        (await prisma.user.findUnique({ where: { mobile } }))
      ) {
        slug = generateSlug();
        mobile = generateMobile();
      }

      citizenUser = await prisma.user.create({
        data: {
          name: "Test Citizen",
          slug,
          mobile,
          email: "citizen@example.com",
          role: "USER",
          age: 25,
          gender: "Other",
          address: "Gondia, Maharashtra",
          authType: "DETAILS",
        },
      });
      console.log(
        `  ✓ Created citizen user: ${citizenUser.name} - ID: ${citizenUser.id}`
      );
    } else {
      console.log(
        `  ✓ Using existing citizen user: ${citizenUser.name} - ID: ${citizenUser.id}`
      );
    }

    // Create role-based users for history entries
    const roleUserMap = new Map<DBRole, typeof citizenUser>();
    roleUserMap.set("USER", citizenUser);

    // Map staff users to their roles
    staffUsers.forEach((user) => {
      roleUserMap.set(user.role, user);
    });

    // Get complaints to seed
    const complaintsToSeed = complaintCount
      ? MOCK_COMPLAINTS.slice(0, complaintCount)
      : MOCK_COMPLAINTS;

    console.log(`\nSeeding ${complaintsToSeed.length} complaints...`);

    let totalHistoryEntries = 0;

    // Seed complaints
    for (let i = 0; i < complaintsToSeed.length; i++) {
      const mockComplaint = complaintsToSeed[i];
      // Create or get user for this complaint
      let complaintUser = citizenUser;

      // Create complaint
      const complaint = await prisma.complaint.create({
        data: {
          userId: complaintUser.id,
          title: mockComplaint.title || "",
          description: mockComplaint.description || "",
          status: uiStatusToDBStatus(mockComplaint.status),
          priority: uiPriorityToDBPriority(mockComplaint.priority),
          department: uiDeptToDBDept(mockComplaint.department),
          category: mockComplaint.category || null,
          subcategory: mockComplaint.subcategory || null,
          taluka: mockComplaint.taluka || null,
          location: mockComplaint.location || null,
          media: mockComplaint.media || [],
          phase: "COMPLETED",
          createdAt: mockComplaint.submittedDate,
          updatedAt: mockComplaint.lastUpdated,
        },
      });

      console.log(
        `  ✓ [${i + 1}/${complaintsToSeed.length}] Created complaint: ${
          complaint.id
        } - "${mockComplaint.title?.substring(0, 50)}..."`
      );

      // Create complaint history entries
      if (mockComplaint.history && mockComplaint.history.length > 0) {
        // Sort history by timestamp to process in chronological order
        const sortedHistory = [...mockComplaint.history].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        let previousStatus: DBStatus | null = null;

        const historyEntries = sortedHistory.map(
          (historyEntry: ComplaintHistoryEntry, index: number) => {
            const historyUserRole = uiRoleToDBRole(historyEntry.role);
            let historyUser = roleUserMap.get(historyUserRole);

            // If user doesn't exist for this role, create a default one
            if (!historyUser) {
              // For department roles, use DEPARTMENT_TEAM user
              if (
                historyUserRole.startsWith("PWD_") ||
                historyUserRole.startsWith("RTO") ||
                historyUserRole.startsWith("ZILLA") ||
                historyUserRole.startsWith("SP_") ||
                historyUserRole.startsWith("SUPPLY") ||
                historyUserRole.startsWith("HEALTH") ||
                historyUserRole.startsWith("MSEB") ||
                historyUserRole.startsWith("TRAFFIC") ||
                historyUserRole.startsWith("NAGAR") ||
                historyUserRole.startsWith("DEAN") ||
                historyUserRole.startsWith("FOREST") ||
                historyUserRole.startsWith("SAMAJ") ||
                historyUserRole.startsWith("SLR") ||
                historyUserRole.startsWith("RDC") ||
                historyUserRole.startsWith("DEPUTY") ||
                historyUserRole.startsWith("PO_") ||
                historyUserRole.startsWith("ST_")
              ) {
                historyUser = staffUsers.find(
                  (u) => u.role === "DEPARTMENT_TEAM"
                );
              } else {
                historyUser = citizenUser;
              }
            }

            // Determine status changes from action text
            let oldStatus: DBStatus | null = previousStatus;
            let newStatus: DBStatus | null = null;

            if (historyEntry.action.includes("Status changed")) {
              // Extract status from action text
              const statusMatch = historyEntry.action.match(
                /Status changed to (\w+)/
              );
              if (statusMatch) {
                const statusText = statusMatch[1];
                const statusMap: Record<string, DBStatus> = {
                  Open: "OPEN",
                  Assigned: "ASSIGNED",
                  "In Progress": "IN_PROGRESS",
                  Resolved: "RESOLVED",
                  Backlog: "BACKLOG",
                  "Need Details": "NEED_DETAILS",
                  Invalid: "INVALID",
                };
                newStatus =
                  statusMap[statusText] ||
                  uiStatusToDBStatus(mockComplaint.status);
              } else {
                newStatus = uiStatusToDBStatus(mockComplaint.status);
              }
            } else if (historyEntry.action.includes("Assigned")) {
              newStatus = "ASSIGNED";
              oldStatus = oldStatus || "OPEN";
            } else {
              // For other actions, use current complaint status
              newStatus = uiStatusToDBStatus(mockComplaint.status);
            }

            // Update previous status for next iteration
            if (newStatus) {
              previousStatus = newStatus;
            }

            return {
              complaintId: complaint.id,
              userId: historyUser!.id,
              role: historyUserRole,
              action: historyEntry.action,
              notes: historyEntry.notes || null,
              attachment: historyEntry.attachment || null,
              eta: historyEntry.eta || null,
              oldStatus,
              newStatus,
              createdAt: historyEntry.timestamp,
            };
          }
        );

        const createdHistory = await prisma.complaintHistory.createMany({
          data: historyEntries,
        });

        totalHistoryEntries += createdHistory.count;
        console.log(
          `    → Created ${createdHistory.count} history entries for complaint ${complaint.id}`
        );
      }
    }

    // Log final counts
    const finalUserCount = await prisma.user.count();
    const finalComplaintCount = await prisma.complaint.count();
    const finalHistoryCount = await prisma.complaintHistory.count();

    console.log("\n=== Database Seeding Completed ===");
    console.log("Final database state:");
    console.log(
      `  - Users: ${finalUserCount} (${
        finalUserCount - initialUserCount > 0
          ? `+${finalUserCount - initialUserCount}`
          : finalUserCount - initialUserCount
      } new)`
    );
    console.log(
      `  - Complaints: ${finalComplaintCount} (${
        finalComplaintCount - initialComplaintCount > 0
          ? `+${finalComplaintCount - initialComplaintCount}`
          : finalComplaintCount - initialComplaintCount
      } new)`
    );
    console.log(
      `  - Complaint History: ${finalHistoryCount} (${
        finalHistoryCount - initialHistoryCount > 0
          ? `+${finalHistoryCount - initialHistoryCount}`
          : finalHistoryCount - initialHistoryCount
      } new)`
    );
    console.log("\nSummary:");
    console.log(`  - Created ${staffUsers.length} staff users`);
    console.log(`  - Created ${complaintsToSeed.length} complaints`);
    console.log(`  - Created ${totalHistoryEntries} history entries`);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        usersCreated: finalUserCount - initialUserCount,
        complaintsCreated: finalComplaintCount - initialComplaintCount,
        historyCreated: finalHistoryCount - initialHistoryCount,
      },
    });
    */
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
