import { requireAdminRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError, validationError } from "@/lib/http/responses";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleUpdateSchema = z.object({
  accountId: z.string().uuid(),
  role: z.enum(["customer", "barista", "admin"]),
});

export async function GET() {
  const authorization = await requireAdminRole();
  if ("response" in authorization) return authorization.response;

  const { data, error } = await createAdminClient()
    .from("member_accounts")
    .select("id,username,role,members(display_name)")
    .order("created_at");
  if (error) return apiError(500, "members_failed", "Could not load members.");

  return NextResponse.json(data.map((account) => {
    const member = Array.isArray(account.members) ? account.members[0] : account.members;
    return {
      accountId: account.id,
      username: account.username,
      displayName: member?.display_name ?? account.username,
      role: account.role,
    };
  }));
}

export async function PATCH(request: Request) {
  const authorization = await requireAdminRole();
  if ("response" in authorization) return authorization.response;

  const parsed = roleUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (parsed.data.accountId === authorization.session.accountId && parsed.data.role !== "admin") {
    return apiError(400, "self_demote", "You cannot remove your own admin access.");
  }

  const { error } = await createAdminClient()
    .from("member_accounts")
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.accountId);
  if (error) return apiError(500, "role_update_failed", "Could not update this role.");
  return new Response(null, { status: 204 });
}
