"use client";

import type { BoardData, BoardOrder, OrderStatus } from "@/types/coffee";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

function nextStatus(status: OrderStatus) {
  return status === "ordered" ? "in_progress" : status === "in_progress" ? "ready" : null;
}

export function BaristaExperience({ initial, authenticated }: { initial: BoardData | null; authenticated: boolean }) {
  const [isAuthenticated, setAuthenticated] = useState(authenticated);
  const [board, setBoard] = useState(initial);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const response = await fetch("/api/board", { cache: "no-store" });
    if (response.ok) setBoard(await response.json());
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  async function login(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/barista/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!response.ok) return setMessage("That PIN did not work.");
    setAuthenticated(true);
    setMessage("");
    await refresh();
  }

  async function open() {
    const response = await fetch("/api/barista/sessions", { method: "POST" });
    setMessage(response.ok ? "Coffee session opened." : "Could not open a session.");
    await refresh();
  }

  async function close(confirmActiveOrders = false) {
    const response = await fetch("/api/barista/sessions/current", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", confirmActiveOrders }),
    });
    const payload = await response.json().catch(() => null);
    if (response.status === 409 && payload?.error?.activeOrderCount) {
      const count = payload.error.activeOrderCount;
      if (window.confirm(`${count} active order${count === 1 ? "" : "s"} remain. Close anyway?`)) return close(true);
      return;
    }
    setMessage(response.ok ? "Coffee session closed." : payload?.error?.message ?? "Could not close.");
    await refresh();
  }

  async function advance(order: BoardOrder) {
    const to = nextStatus(order.status);
    if (!to) return;
    const response = await fetch(`/api/barista/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: order.status, to }),
    });
    setMessage(response.ok ? "" : "That order changed elsewhere. Refreshing.");
    await refresh();
  }

  if (!isAuthenticated) {
    return (
      <main className="app-shell grid place-items-center p-5">
        <section className="panel w-full max-w-md overflow-hidden">
          <div className="bg-[var(--ink)] p-7 text-white">
            <Link className="flex items-center gap-3" href="/">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white font-black text-[var(--ink)]">S</span>
              <span className="font-black">Sozo Coffee</span>
            </Link>
            <h1 className="mt-14 text-4xl font-black tracking-[-0.045em]">Barista station</h1>
            <p className="mt-3 text-white/60">Unlock the queue and start brewing.</p>
          </div>
          <form className="grid gap-3 p-7" onSubmit={login}>
            <label className="text-sm font-extrabold" htmlFor="barista-pin">4-digit PIN</label>
            <input id="barista-pin" aria-label="Barista PIN" autoComplete="one-time-code" className="field text-center text-2xl font-black tracking-[0.45em]" inputMode="numeric" maxLength={4} pattern="\d{4}" placeholder="••••" required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
            <button className="primary-action mt-2 p-4">Unlock station</button>
            {message ? <p aria-live="polite" className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">{message}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  const active = board?.orders ?? [];
  const waiting = active.filter((order) => order.status === "ordered");
  const making = active.filter((order) => order.status === "in_progress");
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="brand-mark">S</span>
            <div><p className="font-black leading-tight">Sozo Coffee</p><p className="text-xs text-[var(--muted)]">Barista station</p></div>
          </Link>
          {board?.session ? (
            <button className="secondary-action min-h-10 px-4 text-sm text-red-700" onClick={() => close()}>Close session</button>
          ) : (
            <button className="primary-action min-h-10 px-5 text-sm" onClick={open}>Open session</button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">Live operations</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Coffee queue</h1></div>
          <div className="flex gap-2">
            <div className="rounded-xl bg-white px-4 py-3 text-center"><strong className="block text-2xl">{waiting.length}</strong><span className="text-xs text-[var(--muted)]">Waiting</span></div>
            <div className="rounded-xl bg-white px-4 py-3 text-center"><strong className="block text-2xl">{making.length}</strong><span className="text-xs text-[var(--muted)]">Making</span></div>
          </div>
        </div>

        {message ? <p aria-live="polite" className="mb-5 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold text-[var(--green)]">{message}</p> : null}

        {!board?.session ? (
          <section className="panel grid min-h-80 place-items-center p-8 text-center">
            <div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface-soft)] text-3xl">☕</span><h2 className="mt-6 text-3xl font-black tracking-tight">Ready when you are.</h2><p className="mt-2 text-[var(--muted)]">Open a session to start taking orders.</p><button className="primary-action mt-6 px-7" onClick={open}>Open coffee session</button></div>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {[
              { title: "Just ordered", orders: waiting, color: "bg-[var(--orange)]" },
              { title: "In progress", orders: making, color: "bg-[var(--coffee)]" },
            ].map((column) => (
              <section key={column.title}>
                <div className="mb-3 flex items-center gap-2 px-1"><span className={`h-2.5 w-2.5 rounded-full ${column.color}`} /><h2 className="font-black">{column.title}</h2><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-black">{column.orders.length}</span></div>
                <div className="grid min-h-48 content-start gap-3 rounded-[20px] bg-[var(--surface-soft)] p-3 sm:grid-cols-2">
                  {column.orders.length === 0 ? <p className="col-span-full grid min-h-44 place-items-center text-sm text-[var(--muted)]">No drinks here right now.</p> : null}
                  {column.orders.map((order) => (
                    <article className="rounded-[16px] border border-[var(--line)] bg-white p-5 shadow-sm" key={order.id}>
                      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{order.temperature}</p><h3 className="mt-1 text-2xl font-black tracking-tight">{order.customerName}</h3></div><span className="rounded-lg bg-[var(--canvas)] px-2 py-1 text-xs font-bold">{order.drink}</span></div>
                      <p className="mt-4 text-lg font-bold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                      {order.note ? <p className="mt-2 rounded-xl bg-[var(--canvas)] p-3 text-sm text-[var(--muted)]">{order.note}</p> : null}
                      <button className="primary-action mt-5 w-full p-3.5" onClick={() => advance(order)}>{order.status === "ordered" ? "Start making" : "Mark ready"}</button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
