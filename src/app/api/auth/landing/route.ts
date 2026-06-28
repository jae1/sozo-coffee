import { getMemberSession, getRoleLandingPath } from "@/lib/auth/member-session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getMemberSession();
  return NextResponse.json({ path: session ? getRoleLandingPath(session) : "/order" });
}
