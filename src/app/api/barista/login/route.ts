import { apiError, validationError } from "@/lib/http/responses";
import { createBaristaSession, verifyPin } from "@/lib/auth/barista-session";
import { pinSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = pinSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (!(await verifyPin(parsed.data.pin))) return apiError(401, "invalid_pin", "That PIN is not correct.");
    await createBaristaSession();
    return new Response(null, { status: 204 });
  } catch {
    return apiError(500, "login_failed", "Barista access is temporarily unavailable.");
  }
}
