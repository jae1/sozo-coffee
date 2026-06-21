import { createAdminClient } from "@/lib/supabase/admin";

export async function openSession() {
  const db = createAdminClient();
  const { data: current } = await db.from("coffee_sessions").select("id").eq("status", "open").maybeSingle();
  if (current) return { kind: "already_open" as const };
  const { data, error } = await db.from("coffee_sessions").insert({ status: "open" }).select("id,status").single();
  if (error) throw error;
  return { kind: "opened" as const, session: data };
}

export async function closeSession(confirmActiveOrders: boolean) {
  const db = createAdminClient();
  const { data: current } = await db.from("coffee_sessions").select("id").eq("status", "open").maybeSingle();
  if (!current) return { kind: "not_open" as const };
  const { count } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("session_id", current.id)
    .in("status", ["ordered", "in_progress"]);
  if ((count ?? 0) > 0 && !confirmActiveOrders) return { kind: "needs_confirmation" as const, count: count ?? 0 };
  const { error } = await db
    .from("coffee_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", current.id)
    .eq("status", "open");
  if (error) throw error;
  return { kind: "closed" as const };
}
