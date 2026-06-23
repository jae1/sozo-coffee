import { apiError, validationError } from "@/lib/http/responses";
import { closeSession } from "@/lib/orders/manage-session";
import { closeSessionSchema } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";
import { requireBaristaRole } from "@/lib/auth/require-role";

export async function PATCH(request: Request) {
  const authorization = await requireBaristaRole();
  if ("response" in authorization) return authorization.response;
  const parsed = closeSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await closeSession(parsed.data.confirmActiveOrders);
    if (result.kind === "not_open") return apiError(409, "no_session", "No coffee session is open.");
    if (result.kind === "needs_confirmation") {
      return apiError(409, "active_orders", "Active orders remain.", { activeOrderCount: result.count });
    }
    return NextResponse.json({ closed: true });
  } catch {
    return apiError(500, "session_failed", "Could not close the coffee session.");
  }
}
