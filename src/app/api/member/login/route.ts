import { apiError, validationError } from "@/lib/http/responses";
import { loginMember } from "@/lib/auth/member-accounts";
import { memberLoginSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = memberLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await loginMember(parsed.data.username, parsed.data.pin);
    if (result.kind === "locked") return apiError(429, "account_locked", "로그인 시도가 많아 10분간 잠겼습니다.");
    if (result.kind === "invalid") return apiError(401, "invalid_login", "유저네임 또는 PIN이 맞지 않습니다.");
    return new Response(null, { status: 204 });
  } catch {
    return apiError(500, "login_failed", "로그인하지 못했습니다.");
  }
}
