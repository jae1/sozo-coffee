import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const COOKIE_NAME = "sozo_member";
export type MemberRole = "customer" | "barista" | "admin";

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
  role: MemberRole;
  email?: string;
  authUserId?: string;
};

async function timeoutToNull<T>(promise: PromiseLike<T>, timeoutMs = 2500): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout>;
  const timer = new Promise<null>((resolve) => {
    timeout = setTimeout(() => resolve(null), timeoutMs);
  });
  return Promise.race([Promise.resolve(promise).catch(() => null), timer]).finally(() => clearTimeout(timeout));
}

async function hasSupabaseAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export async function createMemberSession(session: MemberSession) {
  const token = await new SignJWT({ ...session, sessionType: "member" })
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
  if (!(await hasSupabaseAuthCookie())) return null;

  const supabase = await createServerSupabaseClient();
  const userResponse = await timeoutToNull(
    supabase.auth.getUser(),
    8000,
  );
  const user = userResponse?.data.user;
  if (!user) return null;

  const accountResponse = await timeoutToNull(
    createAdminClient()
      .from("member_accounts")
      .select("id,member_id,username,email,role,members(display_name)")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
    8000,
  );
  const account = accountResponse?.data;
  if (!account || !["customer", "barista", "admin"].includes(account.role)) return null;
  const member = Array.isArray(account.members) ? account.members[0] : account.members;
  return {
    accountId: account.id,
    memberId: account.member_id,
    username: account.username ?? user.email ?? "",
    displayName: member?.display_name ?? user.user_metadata.display_name ?? user.email?.split("@")[0] ?? "Customer",
    role: account.role as MemberRole,
    email: account.email ?? user.email,
    authUserId: user.id,
  };
}

export function canManageOrders(session: MemberSession | null) {
  return session?.role === "barista" || session?.role === "admin";
}

export function isAdmin(session: MemberSession | null) {
  return session?.role === "admin";
}

export function getRoleLandingPath(session: MemberSession) {
  if (session.role === "barista") return "/barista";
  if (session.role === "admin") return "/account";
  return "/order";
}

export async function clearMemberSession() {
  (await cookies()).delete(COOKIE_NAME);
}
