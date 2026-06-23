import { OrderExperience } from "@/components/order/order-experience";
import { getBoard } from "@/lib/orders/get-board";
import { getMemberSession } from "@/lib/auth/member-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const [initial, memberSession] = await Promise.all([getBoard(), getMemberSession()]);
  if (!memberSession) redirect("/");
  return <OrderExperience initial={initial} memberSession={memberSession} />;
}
