import { apiError, validationError } from "@/lib/http/responses";
import { updateStatus } from "@/lib/orders/update-status";
import { statusTransitionSchema } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";
import { sendReadyNotification } from "@/lib/push/send-ready-notification";
import { requireBaristaRole } from "@/lib/auth/require-role";

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const authorization = await requireBaristaRole();
  if ("response" in authorization) return authorization.response;
  const parsed = statusTransitionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { orderId } = await context.params;
  try {
    const result = await updateStatus(orderId, parsed.data.from, parsed.data.to);
    if (result.kind === "invalid") return apiError(400, "invalid_transition", "That status change is not allowed.");
    if (result.kind === "conflict") return apiError(409, "status_conflict", "This order changed on another screen.");
    if (parsed.data.to === "ready") {
      await sendReadyNotification(result.order.customer_name, result.order.push_subscription);
    }
    return NextResponse.json(result.order);
  } catch {
    return apiError(500, "status_failed", "Could not update this order.");
  }
}
