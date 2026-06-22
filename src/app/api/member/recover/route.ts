import { NextResponse } from "next/server";
import { apiError, validationError } from "@/lib/http/responses";
import { resetPinWithRecovery } from "@/lib/auth/member-accounts";
import { memberRecoverySchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = memberRecoverySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await resetPinWithRecovery(
      parsed.data.username,
      parsed.data.recoveryCode,
      parsed.data.newPin,
    );
    if (result.kind === "invalid") return apiError(401, "invalid_recovery", "유저네임 또는 복구 코드가 맞지 않습니다.");
    return NextResponse.json({ recoveryCode: result.recoveryCode });
  } catch {
    return apiError(500, "recovery_failed", "PIN을 재설정하지 못했습니다.");
  }
}
