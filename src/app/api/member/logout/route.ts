import { clearMemberSession } from "@/lib/auth/member-session";

export async function POST() {
  await clearMemberSession();
  return new Response(null, { status: 204 });
}
