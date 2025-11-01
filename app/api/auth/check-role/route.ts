import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ExtendedSession } from "@/lib/auth";
import prisma from "@/prisma/db";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(
      authOptions
    )) as ExtendedSession | null;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the current role from database
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        role: true,
        hasNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      role: user.role,
      hasNotifications: user.hasNotifications,
    });
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json(
      { error: "Failed to check role" },
      { status: 500 }
    );
  }
}
