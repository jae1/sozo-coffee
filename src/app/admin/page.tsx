import { AdminExperience } from "@/components/admin/admin-experience";
import { getMemberSession, isAdmin } from "@/lib/auth/member-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getMemberSession();
  if (!session || !isAdmin(session)) {
    redirect("/account");
  }
  return <AdminExperience session={session} />;
}
