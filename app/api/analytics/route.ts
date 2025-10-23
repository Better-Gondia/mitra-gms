import { NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function GET() {
  // Basic counts to support dashboard without client crunching
  const [
    total,
    open,
    assigned,
    inProgress,
    resolved,
    backlog,
    needDetails,
    invalid,
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.complaint.count({ where: { status: "ASSIGNED" } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({ where: { status: "BACKLOG" } }),
    prisma.complaint.count({ where: { status: "NEED_DETAILS" } }),
    prisma.complaint.count({ where: { status: "INVALID" } }),
  ]);

  return NextResponse.json({
    total,
    open,
    assigned,
    inProgress,
    resolved,
    backlog,
    needDetails,
    invalid,
  });
}
