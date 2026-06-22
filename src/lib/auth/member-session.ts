import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "sozo_member";

function sessionSecret() {
  const value = process.env.MEMBER_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("MEMBER_SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export type MemberSession = {
  accountId: string;
  memberId: string;
  username: string;
  displayName: string;
};

export async function createMemberSession(session: MemberSession) {
  const token = await new SignJWT({ ...session, role: "member" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(sessionSecret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (payload.role !== "member") return null;
    return {
      accountId: String(payload.accountId),
      memberId: String(payload.memberId),
      username: String(payload.username),
      displayName: String(payload.displayName),
    };
  } catch {
    return null;
  }
}

export async function clearMemberSession() {
  (await cookies()).delete(COOKIE_NAME);
}
