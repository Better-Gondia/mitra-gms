import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";
import { notifyRemark } from "@/lib/server/notifications";
import { parseUiIdToDbId } from "@/lib/server/mappers";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as ExtendedSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = parseInt(session.user.id);
    const complaintId = parseUiIdToDbId(body.complaintId);
    const complaintRef = body.complaintRef || body.complaintId;

    if (!complaintId || !Number.isFinite(complaintId)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 }
      );
    }

    // Get user's role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has permission to create remarks
    const allowedRoles = [
      "COLLECTOR_TEAM",
      "DEPARTMENT_TEAM",
      "DISTRICT_COLLECTOR",
    ];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the complaint to get its current status
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Create the remark
    const remark = await prisma.remark.create({
      data: {
        complaintId,
        userId,
        role: user.role,
        visibility: body.visibility === "public" ? "PUBLIC" : "INTERNAL",
        notes: body.notes,
      },
      include: {
        user: true,
      },
    });

    // Create notification
    await notifyRemark({
      currentStatus: complaint.status,
      complaintId,
      complaintRef,
      createdBy: userId,
      visibility: remark.visibility,
      taggedRoles: body.taggedRoles,
    });

    return NextResponse.json(
      {
        id: remark.id,
        complaintId,
        userId,
        visibility: remark.visibility,
        notes: remark.notes,
        createdAt: remark.createdAt,
        user: {
          name: remark.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating remark:", error);
    return NextResponse.json(
      { error: "Failed to create remark" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as ExtendedSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const complaintId = searchParams.get("complaintId");

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID required" },
        { status: 400 }
      );
    }

    const id = parseUiIdToDbId(complaintId);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 }
      );
    }

    // Get user's role for filtering visibility
    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isInternal = [
      "COLLECTOR_TEAM",
      "DEPARTMENT_TEAM",
      "DISTRICT_COLLECTOR",
    ].includes(user?.role || "");

    const remarks = await prisma.remark.findMany({
      where: {
        complaintId: id,
        // Internal users can see all remarks, others only see public remarks
        ...(isInternal ? {} : { visibility: "PUBLIC" }),
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(remarks);
  } catch (error) {
    console.error("Error fetching remarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch remarks" },
      { status: 500 }
    );
  }
}
