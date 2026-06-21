import { BaristaExperience } from "@/components/barista/barista-experience";
import { isBarista } from "@/lib/auth/barista-session";
import { getBoard } from "@/lib/orders/get-board";

export const dynamic = "force-dynamic";

export default async function BaristaPage() {
  const authenticated = await isBarista();
  return <BaristaExperience authenticated={authenticated} initial={authenticated ? await getBoard() : null} />;
}
