import { NextResponse } from "next/server";
import { calculateAttentionScore } from "@/ai/flows/calculate-attention-score-flow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await calculateAttentionScore(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to calculate attention score" },
      { status: 500 }
    );
  }
}
