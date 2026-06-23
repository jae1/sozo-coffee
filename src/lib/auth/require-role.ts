import { canManageOrders, getMemberSession, isAdmin } from "@/lib/auth/member-session";
import { apiError } from "@/lib/http/responses";

export async function requireBaristaRole() {
  const session = await getMemberSession();
  if (!session || !canManageOrders(session)) {
    return { response: apiError(403, "forbidden", "Barista access is required.") };
  }
  return { session };
}

export async function requireAdminRole() {
  const session = await getMemberSession();
  if (!session || !isAdmin(session)) {
    return { response: apiError(403, "forbidden", "Admin access is required.") };
  }
  return { session };
}
