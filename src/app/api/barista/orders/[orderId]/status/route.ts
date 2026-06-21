import { isBarista } from "@/lib/auth/barista-session";
import { apiError, validationError } from "@/lib/http/responses";
import { updateStatus } from "@/lib/orders/update-status";
import { statusTransitionSchema } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  if (!(await isBarista())) return apiError(401, "unauthorized", "Barista PIN required.");
  const parsed = statusTransitionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { orderId } = await context.params;
  try {
    const result = await updateStatus(orderId, parsed.data.from, parsed.data.to);
    if (result.kind === "invalid") return apiError(400, "invalid_transition", "That status change is not allowed.");
    if (result.kind === "conflict") return apiError(409, "status_conflict", "This order changed on another screen.");
    return NextResponse.json(result.order);
  } catch {
    return apiError(500, "status_failed", "Could not update this order.");
  }
}
