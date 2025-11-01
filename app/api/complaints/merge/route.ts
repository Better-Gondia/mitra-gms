import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";
import { parseUiIdToDbId } from "@/lib/server/mappers";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as ExtendedSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { complaintIds, primaryComplaintId, mergeReason } = body;

    if (!Array.isArray(complaintIds) || complaintIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 complaints are required for merging" },
        { status: 400 }
      );
    }

    if (!primaryComplaintId) {
      return NextResponse.json(
        { error: "Primary complaint ID is required" },
        { status: 400 }
      );
    }

    // Parse all IDs to database IDs
    const dbComplaintIds = complaintIds.map(parseUiIdToDbId);
    const primaryDbId = parseUiIdToDbId(primaryComplaintId);

    if (
      !dbComplaintIds.every(Number.isFinite) ||
      !Number.isFinite(primaryDbId)
    ) {
      return NextResponse.json(
        { error: "Invalid complaint IDs" },
        {
          status: 400,
        }
      );
    }

    // Verify primary complaint is in the list
    if (!dbComplaintIds.includes(primaryDbId)) {
      return NextResponse.json(
        {
          error: "Primary complaint must be in the list of complaints to merge",
        },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all complaints to merge
    const complaintsToMerge = await prisma.complaint.findMany({
      where: {
        id: { in: dbComplaintIds },
      },
      include: {
        history: {
          orderBy: { createdAt: "asc" },
          include: { user: true },
        },
        remarks: {
          orderBy: { createdAt: "asc" },
          include: { user: true },
        },
      },
    });

    if (complaintsToMerge.length !== dbComplaintIds.length) {
      return NextResponse.json(
        { error: "Some complaints not found" },
        { status: 404 }
      );
    }

    // Get primary complaint
    const primaryComplaint = complaintsToMerge.find(
      (c) => c.id === primaryDbId
    );
    if (!primaryComplaint) {
      return NextResponse.json(
        { error: "Primary complaint not found" },
        { status: 404 }
      );
    }

    // Check if any complaint is already merged
    const alreadyMerged = complaintsToMerge.some((c) => c.isMerged);
    if (alreadyMerged) {
      return NextResponse.json(
        { error: "One or more complaints have already been merged" },
        { status: 400 }
      );
    }

    // Collect all data to merge
    const allHistory = complaintsToMerge.flatMap((c) =>
      c.history.map((h) => ({
        ...h,
        originalComplaintId: c.id,
      }))
    );

    const allRemarks = complaintsToMerge.flatMap((c) =>
      c.remarks.map((r) => ({
        ...r,
        originalComplaintId: c.id,
      }))
    );

    // Combine descriptions
    const descriptions = complaintsToMerge
      .map((c) => c.description)
      .filter(Boolean);
    const combinedDescription =
      descriptions.length > 0
        ? descriptions.join("\n\n---\n\n")
        : primaryComplaint.description;

    // Combine media (avoid duplicates)
    const allMedia = new Map<string, any>();
    complaintsToMerge.forEach((c) => {
      if (Array.isArray(c.media)) {
        c.media.forEach((m: any) => {
          const url = typeof m === "string" ? m : m.url;
          if (url && !allMedia.has(url)) {
            allMedia.set(
              url,
              typeof m === "string"
                ? { url: m, type: "image", filename: "", extension: "" }
                : m
            );
          }
        });
      }
    });

    // Get original complaint IDs (excluding primary)
    const originalIds = dbComplaintIds.filter((id) => id !== primaryDbId);

    // Update primary complaint with merged data
    await prisma.complaint.update({
      where: { id: primaryDbId },
      data: {
        description: combinedDescription,
        media: Array.from(allMedia.values()),
        originalComplaintIds: originalIds,
        // Don't mark primary as merged - it's the result
      },
    });

    // Create history entries for all merged complaints' histories
    // Sort by original timestamp to preserve order
    const sortedHistory = allHistory.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    for (const hist of sortedHistory) {
      // Skip if this history is from the primary complaint itself
      if (hist.complaintId === primaryDbId) continue;

      await prisma.complaintHistory.create({
        data: {
          complaintId: primaryDbId,
          userId: hist.userId,
          role: hist.role,
          action: hist.action,
          notes: hist.notes
            ? `${hist.notes} (Merged from complaint ${hist.originalComplaintId})`
            : `(Merged from complaint ${hist.originalComplaintId})`,
          attachment: hist.attachment,
          eta: hist.eta,
          oldStatus: hist.oldStatus,
          newStatus: hist.newStatus,
          createdAt: hist.createdAt, // Preserve original timestamp
        },
      });
    }

    // Create remarks for all merged complaints
    const sortedRemarks = allRemarks.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    for (const remark of sortedRemarks) {
      // Skip if this remark is from the primary complaint itself
      if (remark.complaintId === primaryDbId) continue;

      await prisma.remark.create({
        data: {
          complaintId: primaryDbId,
          userId: remark.userId,
          role: remark.role,
          visibility: remark.visibility,
          notes: `${remark.notes} (Merged from complaint ${remark.originalComplaintId})`,
          createdAt: remark.createdAt, // Preserve original timestamp
        },
      });
    }

    // Update merged complaints to point to primary
    for (const complaint of complaintsToMerge) {
      if (complaint.id === primaryDbId) continue;

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          mergedIntoComplaintId: primaryDbId,
          isMerged: true,
        },
      });

      // Create history entry on merged complaint
      await prisma.complaintHistory.create({
        data: {
          complaintId: complaint.id,
          userId,
          role: user.role as any,
          action: "Complaint Merged",
          notes: `Merged into complaint ${primaryDbId}. Reason: ${
            mergeReason || "Related issues"
          }`,
        },
      });
    }

    // Create history entry on primary complaint
    const mergedIdsStr = originalIds.join(", ");
    await prisma.complaintHistory.create({
      data: {
        complaintId: primaryDbId,
        userId,
        role: user.role as any,
        action: "Complaints Merged",
        notes: `Merged with complaints: ${mergedIdsStr}. Reason: ${
          mergeReason || "Related issues"
        }`,
      },
    });

    // Update linkedComplaintIds for all merged complaints
    // Collect all linked IDs from merged complaints
    const allLinkedIds = new Set<string>();
    complaintsToMerge.forEach((c) => {
      if (Array.isArray(c.linkedComplaintIds)) {
        c.linkedComplaintIds.forEach((lid) => allLinkedIds.add(lid));
      }
    });

    // Remove references to merged complaints from linked IDs
    const linkedIdsArray = Array.from(allLinkedIds).filter(
      (lid) => !dbComplaintIds.some((dbId) => lid.includes(dbId.toString()))
    );

    // Update primary complaint's linked IDs
    if (linkedIdsArray.length > 0) {
      await prisma.complaint.update({
        where: { id: primaryDbId },
        data: {
          linkedComplaintIds: linkedIdsArray,
        },
      });
    }

    // Update all complaints that were linked to merged complaints to link to primary instead
    const complaintsLinkedToMerged = await prisma.complaint.findMany({
      where: {
        linkedComplaintIds: {
          hasSome: dbComplaintIds.map((id) => id.toString()),
        },
      },
    });

    for (const linkedComplaint of complaintsLinkedToMerged) {
      if (linkedComplaint.id === primaryDbId) continue;

      const updatedLinkedIds = (linkedComplaint.linkedComplaintIds || [])
        .map((lid) => {
          // If this linked ID references a merged complaint, replace with primary
          const isMergedId = dbComplaintIds.some((dbId) =>
            lid.includes(dbId.toString())
          );
          if (isMergedId) {
            return primaryComplaintId.toString();
          }
          return lid;
        })
        .filter((lid, idx, arr) => arr.indexOf(lid) === idx); // Remove duplicates

      await prisma.complaint.update({
        where: { id: linkedComplaint.id },
        data: {
          linkedComplaintIds: updatedLinkedIds,
        },
      });
    }

    return NextResponse.json({
      success: true,
      primaryComplaintId: primaryDbId,
      mergedComplaintIds: originalIds,
    });
  } catch (error) {
    console.error("Error merging complaints:", error);
    return NextResponse.json(
      { error: "Failed to merge complaints" },
      { status: 500 }
    );
  }
}
