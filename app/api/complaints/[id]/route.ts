import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import {
  Mapper,
  mapDbComplaintToUi,
  parseUiIdToDbId,
} from "@/lib/server/mappers";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";
import { notifyStatusChange, notifyRemark } from "@/lib/server/notifications";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = parseUiIdToDbId(paramId);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      user: true,
      history: {
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
      remarks: {
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
        },
      },
    },
  });
  if (!complaint)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapDbComplaintToUi(complaint));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as ExtendedSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;
    const id = parseUiIdToDbId(paramId);
    if (!Number.isFinite(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const userId = parseInt(session.user.id);
    const body = await req.json();

    // Get the current complaint
    const currentComplaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!currentComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Translate UI fields to DB fields where needed
    const data: any = {};
    let newStatus: string | undefined;
    let hasStatusChange = false;

    if (body.status) {
      const uiStatuses = [
        "Open",
        "Assigned",
        "In Progress",
        "Resolved",
        "Backlog",
        "Need Details",
        "Invalid",
      ] as const;
      const statusKey = uiStatuses.find((s) => s === body.status);
      if (statusKey) {
        newStatus = Mapper.statusToDB[statusKey];
        data.status = newStatus;
        hasStatusChange = currentComplaint.status !== newStatus;
      }
    }
    if (body.department !== undefined)
      data.department = Mapper.deptToDB(body.department);
    if (body.priority !== undefined)
      data.priority = Mapper.priorityToDB(body.priority);
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.category !== undefined) data.category = body.category;
    if (body.subcategory !== undefined) data.subcategory = body.subcategory;
    if (body.location !== undefined) data.location = body.location;
    if (body.linkedComplaintIds !== undefined)
      data.linkedComplaintIds = body.linkedComplaintIds;

    // Update the complaint
    await prisma.complaint.update({ where: { id }, data });

    // Create history entry for status change
    if (hasStatusChange && newStatus) {
      await prisma.complaintHistory.create({
        data: {
          complaintId: id,
          userId,
          role: user.role as any,
          action: `Status changed to ${body.status}`,
          oldStatus: currentComplaint.status as any,
          newStatus: newStatus as any,
          notes: body.remark,
        },
      });

      // Create notifications for status changes
      const complaintRef = `GN-${id}`;
      await notifyStatusChange({
        oldStatus: currentComplaint.status,
        newStatus,
        complaintId: id,
        complaintRef,
        createdBy: userId,
      });
    }

    // Handle remarks separately if provided
    if (body.remark && body.remark.trim()) {
      await prisma.remark.create({
        data: {
          complaintId: id,
          userId,
          role: user.role,
          visibility:
            body.remarkVisibility === "public" ? "PUBLIC" : "INTERNAL",
          notes: body.remark,
        },
      });

      // Create notifications for remarks
      const complaintRef = `GN-${id}`;
      const allowedRoles = [
        "DISTRICT_COLLECTOR",
        "COLLECTOR_TEAM",
        "DEPARTMENT_TEAM",
      ];

      if (allowedRoles.includes(user.role)) {
        await notifyRemark({
          currentStatus: (newStatus ?? currentComplaint.status) as string,
          complaintId: id,
          complaintRef,
          createdBy: userId,
          visibility:
            body.remarkVisibility === "public" ? "PUBLIC" : "INTERNAL",
          taggedRoles: body.taggedRoles,
        });
      }
    }

    // Return fresh complaint with relations
    const refreshed = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: true,
        history: { orderBy: { createdAt: "desc" }, include: { user: true } },
        remarks: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });
    return NextResponse.json(mapDbComplaintToUi(refreshed));
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
