import { OrderExperience } from "@/components/order/order-experience";
import { getBoard } from "@/lib/orders/get-board";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  return <OrderExperience initial={await getBoard()} />;
}
