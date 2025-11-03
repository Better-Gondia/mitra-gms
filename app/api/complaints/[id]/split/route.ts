import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";
import { Mapper, parseUiIdToDbId } from "@/lib/server/mappers";

// Helper function to generate formatted complaint ID (similar to mapper)
function generateFormattedId(
  complaintId: number,
  createdAt: Date,
  displayId?: string | null
): string {
  if (displayId) return displayId;
  // New format: BG-{id} (e.g., BG-1234)
  return `BG-${complaintId}`;
}

export async function POST(
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
    const { splits } = body;

    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: "At least one split is required" },
        { status: 400 }
      );
    }

    // Get the original complaint
    const originalComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!originalComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Check if already split
    if (originalComplaint.isSplit) {
      return NextResponse.json(
        { error: "Complaint has already been split" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate base ID for splits
    // For splits, we use format: originalFormattedId-1, originalFormattedId-2, etc.
    // Get the formatted ID of the original complaint
    const originalFormattedId =
      originalComplaint.displayId ||
      generateFormattedId(id, originalComplaint.createdAt);
    const createdComplaintIds: number[] = [];

    // Create each split complaint
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      const splitIndex = i + 1;
      const displayId = `${originalFormattedId}-${splitIndex}`;

      // Create new complaint with split data
      const newComplaint = await prisma.complaint.create({
        data: {
          userId: originalComplaint.userId,
          title: originalComplaint.title,
          description: split.description || originalComplaint.description || "",
          status: split.status
            ? Mapper.statusToDB[split.status as keyof typeof Mapper.statusToDB]
            : originalComplaint.status,
          priority: split.priority
            ? Mapper.priorityToDB(split.priority)
            : originalComplaint.priority,
          department: split.department
            ? Mapper.deptToDB(split.department)
            : originalComplaint.department,
          category: split.category || originalComplaint.category || "",
          subcategory: split.subcategory || originalComplaint.subcategory || "",
          taluka: split.taluka || originalComplaint.taluka || "",
          location: split.location || originalComplaint.location || "",
          latitude: originalComplaint.latitude,
          longitude: originalComplaint.longitude,
          language: originalComplaint.language,
          type: originalComplaint.type,
          phase: originalComplaint.phase,
          media: split.media
            ? JSON.parse(JSON.stringify(split.media))
            : originalComplaint.media,
          isMediaApproved: originalComplaint.isMediaApproved,
          isPublic: originalComplaint.isPublic,
          displayId,
          parentComplaintId: id,
          splitIndex,
          isSplit: false, // New splits are not marked as split themselves
        },
      });

      createdComplaintIds.push(newComplaint.id);

      // Create history entry for the split
      await prisma.complaintHistory.create({
        data: {
          complaintId: newComplaint.id,
          userId,
          role: user.role as any,
          action: "Complaint Created from Split",
          notes: `Split from complaint ${originalFormattedId}. ${
            split.description || ""
          }`,
        },
      });
    }

    // Update original complaint to mark as split
    await prisma.complaint.update({
      where: { id },
      data: {
        isSplit: true,
        splitIndex: 0, // Original complaint is index 0
      },
    });

    // Create history entry on original complaint
    const splitIdsStr = createdComplaintIds
      .map((cid, idx) => {
        // Use the displayId pattern we created
        return `${originalFormattedId}-${idx + 1}`;
      })
      .join(", ");

    await prisma.complaintHistory.create({
      data: {
        complaintId: id,
        userId,
        role: user.role as any,
        action: "Complaint Split",
        notes: `Complaint split into: ${splitIdsStr}`,
      },
    });

    return NextResponse.json({
      success: true,
      createdComplaintIds,
      displayIds: createdComplaintIds.map(
        (cid, idx) => `${originalFormattedId}-${idx + 1}`
      ),
    });
  } catch (error) {
    console.error("Error splitting complaint:", error);
    return NextResponse.json(
      { error: "Failed to split complaint" },
      { status: 500 }
    );
  }
}
