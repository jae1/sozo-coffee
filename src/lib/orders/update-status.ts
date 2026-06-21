import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/coffee";

const forward: Record<OrderStatus, OrderStatus | null> = {
  ordered: "in_progress",
  in_progress: "ready",
  ready: null,
};

export async function updateStatus(id: string, from: OrderStatus, to: OrderStatus) {
  if (forward[from] !== to) return { kind: "invalid" as const };
  const db = createAdminClient();
  const patch: Record<string, string> = { status: to, updated_at: new Date().toISOString() };
  if (to === "in_progress") patch.started_at = new Date().toISOString();
  if (to === "ready") patch.ready_at = new Date().toISOString();
  const { data, error } = await db
    .from("orders")
    .update(patch)
    .eq("id", id)
    .eq("status", from)
    .select("id,status,updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { kind: "conflict" as const };
  return { kind: "updated" as const, order: data };
}
