import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import {
  Mapper,
  mapDbComplaintToUi,
  parseUiIdToDbId,
} from "@/lib/server/mappers";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = parseUiIdToDbId(paramId);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const complaint = await prisma.complaint.findUnique({ where: { id } });
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
    const body = await req.json();

    // Translate UI fields to DB fields where needed
    const data: any = {};
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
        data.status = Mapper.statusToDB[statusKey];
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

    const updated = await prisma.complaint.update({ where: { id }, data });
    // TODO: Add history rows when ComplaintHistory is extended to support UI fields
    return NextResponse.json(mapDbComplaintToUi(updated));
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
