import { BaristaExperience } from "@/components/barista/barista-experience";
import { getBoard } from "@/lib/orders/get-board";

export const dynamic = "force-dynamic";

export default async function BaristaPage() {
  return <BaristaExperience initial={await getBoard()} />;
}
