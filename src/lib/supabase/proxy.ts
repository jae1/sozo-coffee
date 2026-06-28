import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function refreshWithoutBlocking(promise: PromiseLike<unknown>) {
  let timeout: ReturnType<typeof setTimeout>;
  const timer = new Promise<void>((resolve) => {
    timeout = setTimeout(resolve, 2500);
  });
  await Promise.race([Promise.resolve(promise).catch(() => null), timer]).finally(() => clearTimeout(timeout));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await refreshWithoutBlocking(supabase.auth.getClaims());
  return response;
}
