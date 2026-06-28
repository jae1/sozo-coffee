"use client";

import type { MemberSession } from "@/lib/auth/member-session";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type TabItem = {
  href: string;
  label: string;
  match: (pathname: string, tab: string | null) => boolean;
};

export function AppTabs({ session }: { session: MemberSession }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeOrderTab = searchParams.get("tab");
  const canUseBoard = session.role === "barista" || session.role === "admin";
  const canUseAdmin = session.role === "admin";
  const tabs: TabItem[] = [
    {
      href: "/order",
      label: "Order",
      match: (currentPath, tab) => currentPath === "/order" && tab !== "status",
    },
    {
      href: "/order?tab=status",
      label: "Status",
      match: (currentPath, tab) => currentPath === "/order" && tab === "status",
    },
    ...(canUseBoard
      ? [{
          href: "/barista",
          label: "Board",
          match: (currentPath: string) => currentPath === "/barista",
        }]
      : []),
    ...(canUseAdmin
      ? [{
          href: "/admin",
          label: "Admin",
          match: (currentPath: string) => currentPath === "/admin",
        }]
      : []),
    {
      href: "/account",
      label: "Account",
      match: (currentPath) => currentPath === "/account",
    },
  ];

  return (
    <nav aria-label="Primary" className="app-tabs">
      {tabs.map((item) => {
        const active = item.match(pathname, activeOrderTab);
        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} href={item.href} key={item.href}>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
