import { NextResponse } from "next/server";
import { findStaleComplaints } from "@/ai/flows/find-stale-complaints-flow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await findStaleComplaints(body?.complaints || []);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to find stale complaints" },
      { status: 500 }
    );
  }
}
