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
    // Include all department roles (they are treated the same as DEPARTMENT_TEAM)
    const allowedRoles = [
      "COLLECTOR_TEAM",
      "COLLECTOR_TEAM_ADVANCED",
      "DEPARTMENT_TEAM",
      "DISTRICT_COLLECTOR",
      // All department roles
      "PWD_1",
      "PWD_2",
      "RTO",
      "ZILLA_PARISHAD",
      "SP_OFFICE_GONDIA",
      "SUPPLY_DEPARTMENT",
      "HEALTH_DEPARTMENT",
      "MSEB_GONDIA",
      "TRAFFIC_POLICE",
      "NAGAR_PARISHAD_TIRORA",
      "NAGAR_PARISHAD_GONDIA",
      "NAGAR_PARISHAD_AMGAON",
      "NAGAR_PARISHAD_GOREGAON",
      "DEAN_MEDICAL_COLLEGE_GONDIA",
      "FOREST_OFFICE_GONDIA",
      "SAMAJ_KALYAN_OFFICE_GONDIA",
      "SLR_OFFICE_GONDIA",
    ];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the complaint to get its current status and department
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

    // Extract tagged roles from notes if not provided in body (backend fallback)
    let taggedRoles = body.taggedRoles;
    if ((!taggedRoles || taggedRoles.length === 0) && body.notes) {
      const { extractTaggedRolesFromText } = await import(
        "@/lib/server/notifications"
      );
      taggedRoles = extractTaggedRolesFromText(body.notes) as any;
    }

    // Create notification
    await notifyRemark({
      currentStatus: complaint.status,
      complaintId,
      complaintRef,
      createdBy: userId,
      visibility: remark.visibility,
      taggedRoles: taggedRoles,
      remarkCreatorRole: user.role,
      complaintDepartment: complaint.department,
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
    // Include all department roles (they are treated the same as DEPARTMENT_TEAM)
    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isInternal = [
      "COLLECTOR_TEAM",
      "COLLECTOR_TEAM_ADVANCED",
      "DEPARTMENT_TEAM",
      "DISTRICT_COLLECTOR",
      // All department roles
      "PWD_1",
      "PWD_2",
      "RTO",
      "ZILLA_PARISHAD",
      "SP_OFFICE_GONDIA",
      "SUPPLY_DEPARTMENT",
      "HEALTH_DEPARTMENT",
      "MSEB_GONDIA",
      "TRAFFIC_POLICE",
      "NAGAR_PARISHAD_TIRORA",
      "NAGAR_PARISHAD_GONDIA",
      "NAGAR_PARISHAD_AMGAON",
      "NAGAR_PARISHAD_GOREGAON",
      "DEAN_MEDICAL_COLLEGE_GONDIA",
      "FOREST_OFFICE_GONDIA",
      "SAMAJ_KALYAN_OFFICE_GONDIA",
      "SLR_OFFICE_GONDIA",
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
