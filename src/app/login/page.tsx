import { LoginPageExperience } from "@/components/account/login-page-experience";
import { getMemberSession, getRoleLandingPath } from "@/lib/auth/member-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getMemberSession();
  if (session) redirect(getRoleLandingPath(session));
  return <LoginPageExperience />;
}
