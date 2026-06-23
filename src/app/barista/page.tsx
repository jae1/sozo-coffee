import { BaristaExperience } from "@/components/barista/barista-experience";
import { getBoard } from "@/lib/orders/get-board";
import { canManageOrders, getMemberSession } from "@/lib/auth/member-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BaristaPage() {
  const session = await getMemberSession();
  if (!canManageOrders(session)) redirect("/account");
  return <BaristaExperience initial={await getBoard()} />;
}
