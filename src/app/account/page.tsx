import { AccountExperience } from "@/components/account/account-experience";
import { getMemberSession } from "@/lib/auth/member-session";
import { getOrderHistory } from "@/lib/orders/get-order-history";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getMemberSession();
  if (!session?.authUserId) redirect("/");
  const history = await getOrderHistory(session.authUserId);
  return <AccountExperience history={history} session={session} />;
}
