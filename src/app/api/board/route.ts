import { apiError } from "@/lib/http/responses";
import { getBoard } from "@/lib/orders/get-board";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(await getBoard(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return apiError(500, "board_unavailable", "The coffee board is temporarily unavailable.");
  }
}
