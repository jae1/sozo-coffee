import { apiError, validationError } from "@/lib/http/responses";
import { createOrder } from "@/lib/orders/create-order";
import { createOrderSchema } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth/member-session";

export async function POST(request: Request) {
  const session = await getMemberSession();
  if (!session?.authUserId) return apiError(401, "authentication_required", "Please sign in to order.");
  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await createOrder(parsed.data, {
      authUserId: session.authUserId,
      memberId: session.memberId,
      displayName: session.displayName,
    });
    if (result.kind === "closed") return apiError(409, "ordering_closed", "Coffee ordering is closed.");
    if (result.kind === "duplicate") return apiError(409, "duplicate_request", "This order was already submitted.");
    if (result.kind === "invalid_identity") return apiError(400, "invalid_identity", "Please choose a valid name.");
    if (result.kind === "invalid_menu") return apiError(400, "invalid_menu", "That drink is not available.");
    return NextResponse.json(result.order, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return apiError(500, "order_failed", "We could not place the order. Please try again.");
  }
}
