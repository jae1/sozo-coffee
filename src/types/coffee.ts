export type OrderStatus = "ordered" | "in_progress" | "ready";
export type Temperature = "hot" | "iced";

export interface MemberChoice {
  id: string;
  displayName: string;
}

export interface MenuChoice {
  id: "americano" | "latte" | "mocha";
  displayName: string;
  usesDairyMilk: boolean;
}

export interface BoardOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  drink: string;
  temperature: Temperature;
  milk: "dairy" | null;
  note: string | null;
  status: OrderStatus;
  orderedAt: string;
  readyAt: string | null;
}

export interface BoardData {
  session: { id: string; status: "open" } | null;
  members: MemberChoice[];
  menu: MenuChoice[];
  orders: BoardOrder[];
}
