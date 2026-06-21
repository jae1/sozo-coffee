import type { BoardData, BoardOrder, MenuChoice } from "@/types/coffee";
import { createAdminClient } from "@/lib/supabase/admin";

type OrderRow = {
  id: string;
  customer_name: string;
  temperature: "hot" | "iced";
  milk: "dairy" | null;
  note: string | null;
  status: "ordered" | "in_progress" | "ready";
  ordered_at: string;
  ready_at: string | null;
  menu_items: { display_name: string } | { display_name: string }[] | null;
};

export function isVisibleReady(readyAt: string | null, now = Date.now()) {
  return Boolean(readyAt && new Date(readyAt).getTime() > now - 5 * 60_000);
}

export async function getBoard(): Promise<BoardData> {
  const db = createAdminClient();
  const [{ data: session }, { data: members }, { data: menu }] = await Promise.all([
    db.from("coffee_sessions").select("id,status").eq("status", "open").maybeSingle(),
    db.from("members").select("id,display_name,disambiguator").eq("is_active", true).order("sort_order"),
    db.from("menu_items").select("id,display_name,uses_dairy_milk").eq("is_active", true).order("sort_order"),
  ]);

  let orders: BoardOrder[] = [];
  if (session) {
    const { data, error } = await db
      .from("orders")
      .select("id,customer_name,temperature,milk,note,status,ordered_at,ready_at,menu_items(display_name)")
      .eq("session_id", session.id)
      .order("ordered_at");
    if (error) throw error;
    orders = ((data ?? []) as OrderRow[])
      .filter((order) => order.status !== "ready" || isVisibleReady(order.ready_at))
      .map((order) => {
        const item = Array.isArray(order.menu_items) ? order.menu_items[0] : order.menu_items;
        return {
          id: order.id,
          customerName: order.customer_name,
          drink: item?.display_name ?? "Coffee",
          temperature: order.temperature,
          milk: order.milk,
          note: order.note,
          status: order.status,
          orderedAt: order.ordered_at,
          readyAt: order.ready_at,
        };
      });
  }

  return {
    session: session ? { id: session.id, status: "open" } : null,
    members: (members ?? []).map((member) => ({
      id: member.id,
      displayName: [member.display_name, member.disambiguator].filter(Boolean).join(" · "),
    })),
    menu: (menu ?? []).map((item) => ({
      id: item.id,
      displayName: item.display_name,
      usesDairyMilk: item.uses_dairy_milk,
    })) as MenuChoice[],
    orders,
  };
}
