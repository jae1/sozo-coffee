import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateOrderInput } from "@/lib/validation/schemas";

export async function createOrder(input: CreateOrderInput) {
  const db = createAdminClient();
  const { data: existing } = await db.from("orders").select("id").eq("request_id", input.requestId).maybeSingle();
  if (existing) return { kind: "duplicate" as const };

  const { data: session } = await db.from("coffee_sessions").select("id").eq("status", "open").maybeSingle();
  if (!session) return { kind: "closed" as const };

  let memberId: string | null = null;
  let customerName: string;
  if (input.identity.type === "member") {
    const { data: member } = await db
      .from("members")
      .select("id,display_name,disambiguator")
      .eq("id", input.identity.memberId)
      .eq("is_active", true)
      .maybeSingle();
    if (!member) return { kind: "invalid_identity" as const };
    memberId = member.id;
    customerName = [member.display_name, member.disambiguator].filter(Boolean).join(" · ");
  } else {
    customerName = input.identity.name;
  }

  const { data: menu } = await db
    .from("menu_items")
    .select("id,uses_dairy_milk")
    .eq("id", input.menuItemId)
    .eq("is_active", true)
    .maybeSingle();
  if (!menu) return { kind: "invalid_menu" as const };

  const { data, error } = await db
    .from("orders")
    .insert({
      request_id: input.requestId,
      session_id: session.id,
      member_id: memberId,
      customer_name: customerName,
      is_guest: input.identity.type === "guest",
      menu_item_id: menu.id,
      temperature: input.temperature,
      milk: menu.uses_dairy_milk ? "dairy" : null,
      note: input.note || null,
      push_subscription: input.pushSubscription ?? null,
    })
    .select("id,status")
    .single();
  if (error) throw error;
  return { kind: "created" as const, order: data };
}
