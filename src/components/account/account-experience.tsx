"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { AppTabs } from "@/components/navigation/app-tabs";
import type { MemberSession } from "@/lib/auth/member-session";
import type { FrequentOrder, OrderHistoryItem } from "@/lib/orders/get-order-history";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useState } from "react";

const INITIAL_HISTORY_COUNT = 5;
const HISTORY_INCREMENT = 5;

export function AccountExperience({
  session,
  history,
}: {
  session: MemberSession;
  history: { orders: OrderHistoryItem[]; frequent: FrequentOrder[] };
}) {
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(INITIAL_HISTORY_COUNT);
  const visibleOrders = history.orders.slice(0, visibleHistoryCount);
  const hiddenOrderCount = Math.max(history.orders.length - visibleOrders.length, 0);

  async function logout() {
    await createBrowserSupabaseClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <AppTabs session={session} />
      <main className="page-container account-dashboard">
        <div className="page-heading">
          <p className="eyebrow">Account</p>
          <h1>Your coffee history.</h1>
          <p>{session.email}</p>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="section-title">Frequently ordered</h2>
          </div>
          {history.frequent.length ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {history.frequent.map((item) => (
                <div className="panel compact-card" key={`${item.temperature}-${item.drink}`}>
                  <p className="text-lg font-black">{item.temperature === "iced" ? "Iced" : "Hot"} {item.drink}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">Ordered {item.count} {item.count === 1 ? "time" : "times"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel empty-card">Favorites appear after a few orders.</div>
          )}
        </section>

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="section-title">Order history</h2>
            <span className="text-sm font-bold text-[var(--muted)]">{history.orders.length} total</span>
          </div>
          <div className="history-list">
            {history.orders.length === 0 ? <p className="empty-card">No orders yet.</p> : null}
            {visibleOrders.map((order) => (
              <article className="history-row" key={order.id}>
                <div>
                  <p className="font-black">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                  {order.note ? <p className="mt-1 text-xs text-[var(--muted)]">{order.note}</p> : null}
                </div>
                <time dateTime={order.orderedAt}>
                  {new Date(order.orderedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </time>
              </article>
            ))}
          </div>
          {hiddenOrderCount > 0 ? (
            <button
              className="history-show-more"
              onClick={() =>
                setVisibleHistoryCount((current) =>
                  Math.min(current + HISTORY_INCREMENT, history.orders.length)
                )
              }
              type="button"
            >
              Show more
              <span>{hiddenOrderCount} more</span>
            </button>
          ) : null}
        </section>

        <section className="account-footer" aria-label="Signed-in account">
          <div>
            <p>{session.email}</p>
            <span>{session.role}</span>
          </div>
          <button onClick={logout} type="button">Sign out</button>
        </section>
      </main>
    </div>
  );
}
