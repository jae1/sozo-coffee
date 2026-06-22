import { AccountExperience } from "@/components/account/account-experience";
import { getMemberSession } from "@/lib/auth/member-session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  return <AccountExperience session={await getMemberSession()} />;
}
