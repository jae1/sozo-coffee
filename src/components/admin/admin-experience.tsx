"use client";

import { SiteHeader } from "@/components/layout/site-header";
import type { MemberSession } from "@/lib/auth/member-session";
import { useEffect, useState } from "react";
import Link from "next/link";

type ManagedMember = {
  accountId: string;
  username: string;
  displayName: string;
  role: "customer" | "barista" | "admin";
};

export function AdminExperience({
  session,
}: {
  session: MemberSession;
}) {
  const [members, setMembers] = useState<ManagedMember[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/admin/members", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then(setMembers);
  }, []);

  async function updateRole(accountId: string, role: ManagedMember["role"]) {
    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, role }),
    });
    if (!response.ok) {
      setMessage("Could not update this role.");
      return;
    }
    setMessage("Role updated successfully.");
    setMembers((current) =>
      current.map((member) =>
        member.accountId === accountId ? { ...member, role } : member
      )
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader
        actions={
          <div className="flex gap-2">
            <Link className="secondary-action flex min-h-11 items-center px-5" href="/account">
              Back to Account
            </Link>
            <Link className="primary-action flex min-h-11 items-center px-5" href="/order">
              Order coffee
            </Link>
          </div>
        }
        section="Admin Dashboard"
      />
      <main className="page-container">
        <div className="page-heading">
          <p className="eyebrow">Admin management</p>
          <h1>Member Roles</h1>
          <p>Assign and manage access control for users.</p>
        </div>

        {message ? (
          <p aria-live="polite" className="mb-5 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold text-[var(--green)]">
            {message}
          </p>
        ) : null}

        <section className="panel p-6">
          <h2 className="text-xl font-black">All Members</h2>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {members.map((member) => (
              <div className="flex items-center justify-between gap-4 py-4" key={member.accountId}>
                <div className="min-w-0">
                  <p className="truncate font-black">{member.displayName}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{member.username}</p>
                </div>
                <select
                  className="field w-auto min-w-28"
                  disabled={member.accountId === session.accountId}
                  onChange={(event) =>
                    void updateRole(member.accountId, event.target.value as ManagedMember["role"])
                  }
                  value={member.role}
                >
                  <option value="customer">Customer</option>
                  <option value="barista">Barista</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
