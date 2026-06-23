"use client";

import { SiteHeader } from "@/components/layout/site-header";
import type { MemberSession } from "@/lib/auth/member-session";
import type { FrequentOrder, OrderHistoryItem } from "@/lib/orders/get-order-history";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";

export function AccountExperience({
  session,
  history,
}: {
  session: MemberSession;
  history: { orders: OrderHistoryItem[]; frequent: FrequentOrder[] };
}) {
  async function logout() {
    await createBrowserSupabaseClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="app-shell">
      <SiteHeader
        actions={
          <div className="flex gap-2">
            {session.role === "admin" ? (
              <Link className="secondary-action flex min-h-11 items-center px-5" href="/admin">
                Admin Panel
              </Link>
            ) : null}
            <Link className="primary-action flex min-h-11 items-center px-5" href="/order">
              Order coffee
            </Link>
          </div>
        }
        section="Account"
      />
      <main className="page-container account-dashboard">
        <div className="page-heading">
          <p className="eyebrow">Your account</p>
          <h1>Hi, {session.displayName}.</h1>
          <p>{session.email}</p>
        </div>

        <section className="account-summary panel">
          <div>
            <p className="text-sm text-[var(--muted)]">Account</p>
            <p className="mt-1 font-black">{session.displayName}</p>
            <p className="text-sm text-[var(--muted)]">{session.email}</p>
          </div>
          <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-black uppercase text-[var(--green)]">{session.role}</span>
          <button className="secondary-action px-5" onClick={logout}>Sign out</button>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="eyebrow">Your favorites</p>
            <h2 className="mt-1 text-2xl font-black">Frequently ordered</h2>
          </div>
          {history.frequent.length ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {history.frequent.map((item) => (
                <div className="panel p-5" key={`${item.temperature}-${item.drink}`}>
                  <p className="text-lg font-black">{item.temperature === "iced" ? "Iced" : "Hot"} {item.drink}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">Ordered {item.count} {item.count === 1 ? "time" : "times"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel p-7 text-center text-[var(--muted)]">Your favorites will appear after you place a few orders.</div>
          )}
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between">
            <div><p className="eyebrow">Past orders</p><h2 className="mt-1 text-2xl font-black">Order history</h2></div>
            <span className="text-sm font-bold text-[var(--muted)]">{history.orders.length} total</span>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-white shadow-[var(--shadow-card)]">
            {history.orders.length === 0 ? <p className="grid min-h-36 place-items-center text-[var(--muted)]">No orders yet.</p> : null}
            {history.orders.map((order) => (
              <article className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5 last:border-0" key={order.id}>
                <div>
                  <p className="font-black">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{new Date(order.orderedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  {order.note ? <p className="mt-1 text-xs text-[var(--muted)]">{order.note}</p> : null}
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold capitalize">{order.status.replace("_", " ")}</span>
              </article>
            ))}
          </div>
        </section>

        {session.role === "admin" ? (
          <section className="panel mt-9 p-6">
            <h2 className="text-xl font-black">Admin Panel</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Manage member roles and permissions in a dedicated interface.</p>
            <Link className="primary-action mt-4 inline-flex min-h-11 items-center px-5" href="/admin">
              Go to Member Management
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}

