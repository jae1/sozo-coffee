"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { AppTabs } from "@/components/navigation/app-tabs";
import type { MemberSession } from "@/lib/auth/member-session";
import { useEffect, useState } from "react";

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
      <SiteHeader />
      <AppTabs session={session} />
      <main className="page-container admin-page">
        <div className="page-heading">
          <p className="eyebrow">Admin management</p>
          <h1>Member Roles</h1>
          <p>Assign and manage access control for users.</p>
        </div>
        {message ? (
          <p
            aria-live="polite"
            className="mb-5 rounded-xl bg-[var(--sbx-green-light)] p-3 text-sm font-bold text-[var(--sbx-green)]"
          >
            {message}
          </p>
        ) : null}

        <section className="panel admin-card">
          <div className="admin-card__header">
            <div>
              <p className="eyebrow">Access</p>
              <h2>All Members</h2>
            </div>
            <span>{members.length} total</span>
          </div>
          <div className="admin-member-list">
            {members.map((member) => (
              <div className="admin-member-row" key={member.accountId}>
                <div className="admin-member-row__identity">
                  <span>{member.displayName.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <p>{member.displayName}</p>
                    <small>{member.accountId === session.accountId ? "You · cannot change your own role" : member.username}</small>
                  </div>
                </div>
                {member.accountId === session.accountId ? (
                  <div className="admin-role-locked" aria-label="Your current role">
                    <span>{member.role}</span>
                  </div>
                ) : (
                  <div className="admin-role-group" role="group" aria-label={`Role for ${member.displayName}`}>
                    {(["customer", "barista", "admin"] as const).map((role) => (
                      <button
                        aria-pressed={member.role === role}
                        className={member.role === role ? "is-active" : ""}
                        key={role}
                        onClick={() => void updateRole(member.accountId, role)}
                        type="button"
                      >
                        {role === "customer" ? "Customer" : role === "barista" ? "Barista" : "Admin"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
