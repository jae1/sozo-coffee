import { clearBaristaSession } from "@/lib/auth/barista-session";

export async function POST() {
  await clearBaristaSession();
  return new Response(null, { status: 204 });
}
