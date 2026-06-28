import { apiError, validationError } from "@/lib/http/responses";
import { loginMember } from "@/lib/auth/member-accounts";
import { memberLoginSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = memberLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await loginMember(parsed.data.username, parsed.data.pin);
    if (result.kind === "locked") return apiError(429, "account_locked", "Too many login attempts. Try again in 10 minutes.");
    if (result.kind === "invalid") return apiError(401, "invalid_login", "Username or PIN is incorrect.");
    return new Response(null, { status: 204 });
  } catch {
    return apiError(500, "login_failed", "Could not sign in.");
  }
}
