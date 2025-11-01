import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { mapDbComplaintToUi, Mapper } from "@/lib/server/mappers";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Filtering parameters
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const statuses = searchParams.get("statuses") || "";
    const department = searchParams.get("department") || "";
    const tehsil = searchParams.get("tehsil") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const pinned = searchParams.get("pinned") === "true";
    const myRemarks = searchParams.get("myRemarks") === "true";
    const mentions = searchParams.get("mentions") === "true";
    const linked = searchParams.get("linked") === "true";

    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      const searchConditions: any[] = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];

      // Check if search term is a number for ID search
      const searchAsNumber = parseInt(search);
      if (!isNaN(searchAsNumber)) {
        searchConditions.push({ id: searchAsNumber });
      }

      // Check if search term is a complaint ID in format BG-{id} (e.g., BG-1234)
      const bgIdMatch = search.match(/^BG-(\d+)$/i);
      if (bgIdMatch) {
        const numericId = parseInt(bgIdMatch[1]);
        if (!isNaN(numericId)) {
          searchConditions.push({ id: numericId });
        }
      }

      // Check for legacy format BG-XXXXXX-NNNN (backward compatibility)
      const legacyMatch = search.match(/^BG-\d{6}-(\d+)$/i);
      if (legacyMatch) {
        const numericId = parseInt(legacyMatch[1]);
        if (!isNaN(numericId)) {
          searchConditions.push({ id: numericId });
        }
      }

      where.OR = searchConditions;
    }

    // Status filter
    if (statuses) {
      const list = statuses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Mapper.statusToDB[s as keyof typeof Mapper.statusToDB])
        .filter(Boolean);
      if (list.length > 0) {
        where.status = { in: list };
      }
    } else if (status && status !== "all") {
      // Map UI status to DB status using the mapper
      const dbStatus =
        Mapper.statusToDB[status as keyof typeof Mapper.statusToDB];
      if (dbStatus) {
        where.status = dbStatus;
      }
    }

    // Department filter
    if (department && department !== "all") {
      const dbDept = Mapper.deptToDB(department as any);
      if (dbDept) {
        where.department = dbDept;
      }
    }

    // Tehsil filter
    if (tehsil && tehsil !== "all") {
      where.location = { contains: tehsil, mode: "insensitive" };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Note: Advanced filters (pinned, myRemarks, mentions, linked) are handled client-side
    // as they require complex logic that's easier to implement in the frontend

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === "attention") {
      // For now, fallback to updatedAt since attention score isn't in DB yet
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === "date") {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === "last_updated") {
      orderBy.updatedAt = sortOrder;
    } else if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else if (sortBy === "status") {
      orderBy.status = sortOrder;
    } else if (sortBy === "id") {
      orderBy.id = sortOrder;
    } else if (sortBy === "category") {
      orderBy.category = sortOrder;
    } else if (sortBy === "subcategory") {
      orderBy.subcategory = sortOrder;
    } else if (sortBy === "department") {
      orderBy.department = sortOrder;
    } else if (sortBy === "location") {
      orderBy.location = sortOrder;
    } else {
      // Default to id descending
      orderBy.id = "desc";
    }

    // Get total count for pagination
    // Note: Using findMany with select instead of count() because count() doesn't support contains operations
    const totalCountResult = await prisma.complaint.findMany({
      where: { department: where.department, phase: "COMPLETED" },
      select: { id: true },
    });
    const totalCount = totalCountResult.length;

    // Fetch complaints with pagination
    const complaints = await prisma.complaint.findMany({
      where: { ...where, phase: "COMPLETED" },
      orderBy,
      skip: offset,
      take: limit,
      include: {
        user: false,
        history: {
          orderBy: { createdAt: "desc" },
        },
        remarks: {
          orderBy: { createdAt: "desc" },
          include: {
            user: true,
          },
        },
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: complaints.map(mapDbComplaintToUi),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

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

    const created = await prisma.complaint.create({
      data: {
        user: { connect: { id: userId } },
        title: body.title ?? null,
        description: body.description ?? null,
        department: Mapper.deptToDB(body.department) ?? null,
        category: body.category ?? null,
        subcategory: body.subcategory ?? null,
        location: body.location ?? null,
        media: Array.isArray(body.media) ? body.media : [],
        phase: "INIT",
      },
    });
    return NextResponse.json(mapDbComplaintToUi(created), { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
