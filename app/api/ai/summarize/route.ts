import { NextResponse } from "next/server";
import { summarizeComplaint } from "@/ai/flows/summarize-complaint-flow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await summarizeComplaint(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to summarize complaint" },
      { status: 500 }
    );
  }
}
