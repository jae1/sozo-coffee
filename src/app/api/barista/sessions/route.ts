import { isBarista } from "@/lib/auth/barista-session";
import { apiError } from "@/lib/http/responses";
import { openSession } from "@/lib/orders/manage-session";
import { NextResponse } from "next/server";

export async function POST() {
  if (!(await isBarista())) return apiError(401, "unauthorized", "Barista PIN required.");
  try {
    const result = await openSession();
    if (result.kind === "already_open") return apiError(409, "session_open", "A coffee session is already open.");
    return NextResponse.json(result.session, { status: 201 });
  } catch {
    return apiError(500, "session_failed", "Could not open the coffee session.");
  }
}
