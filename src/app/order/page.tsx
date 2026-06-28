import { OrderExperience } from "@/components/order/order-experience";
import { getBoard } from "@/lib/orders/get-board";
import { getMemberSession } from "@/lib/auth/member-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const [initial, memberSession] = await Promise.all([getBoard(), getMemberSession()]);
  if (!memberSession) redirect("/");
  const params = await searchParams;
  const initialTab = params?.tab === "status" ? "status" : "order";
  return <OrderExperience initial={initial} initialTab={initialTab} key={initialTab} memberSession={memberSession} />;
}
