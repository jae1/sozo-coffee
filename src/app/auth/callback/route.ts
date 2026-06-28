import { getMemberSession, getRoleLandingPath } from "@/lib/auth/member-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  if (code) {
    await (await createServerSupabaseClient()).auth.exchangeCodeForSession(code);
  }
  const session = await getMemberSession();
  const path = next ?? (session ? getRoleLandingPath(session) : "/order");
  return NextResponse.redirect(new URL(path, url.origin));
}
