import { NextResponse } from "next/server";
import { apiError, validationError } from "@/lib/http/responses";
import { signUpMember } from "@/lib/auth/member-accounts";
import { memberSignupSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = memberSignupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await signUpMember(parsed.data);
    if (result.kind === "invalid_invite") return apiError(403, "invalid_invite", "초대 코드가 맞지 않습니다.");
    if (result.kind === "username_taken") return apiError(409, "username_taken", "이미 사용 중인 유저네임입니다.");
    return NextResponse.json({ recoveryCode: result.recoveryCode }, { status: 201 });
  } catch {
    return apiError(500, "signup_failed", "계정을 만들지 못했습니다.");
  }
}
