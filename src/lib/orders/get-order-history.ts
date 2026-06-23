import { createAdminClient } from "@/lib/supabase/admin";

export type OrderHistoryItem = {
  id: string;
  drink: string;
  temperature: "hot" | "iced";
  note: string | null;
  status: "ordered" | "in_progress" | "ready";
  orderedAt: string;
};

export type FrequentOrder = {
  drink: string;
  temperature: "hot" | "iced";
  count: number;
};

export async function getOrderHistory(authUserId: string) {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("id,temperature,note,status,ordered_at,menu_items(display_name)")
    .eq("auth_user_id", authUserId)
    .order("ordered_at", { ascending: false });
  if (error) throw error;

  const orders: OrderHistoryItem[] = data.map((order) => {
    const menu = Array.isArray(order.menu_items) ? order.menu_items[0] : order.menu_items;
    return {
      id: order.id,
      drink: menu?.display_name ?? "Coffee",
      temperature: order.temperature,
      note: order.note,
      status: order.status,
      orderedAt: order.ordered_at,
    };
  });

  const counts = new Map<string, FrequentOrder>();
  for (const order of orders) {
    const key = `${order.temperature}:${order.drink}`;
    const current = counts.get(key);
    counts.set(key, {
      drink: order.drink,
      temperature: order.temperature,
      count: (current?.count ?? 0) + 1,
    });
  }

  return {
    orders,
    frequent: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 3),
  };
}
