"use client";

import type { BoardData, BoardOrder, OrderStatus } from "@/types/coffee";
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
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
        <h1 className="text-4xl font-black">Barista access</h1>
        <p className="mt-2 text-black/55">Enter the shared four-digit PIN.</p>
        <form className="mt-6 grid gap-3" onSubmit={login}>
          <input aria-label="Barista PIN" autoComplete="one-time-code" className="rounded-2xl border bg-white p-4 text-center text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={4} pattern="\d{4}" required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          <button className="rounded-2xl bg-[var(--espresso)] p-4 font-black text-white">Unlock queue</button>
          {message ? <p aria-live="polite" className="text-center text-sm font-bold text-red-700">{message}</p> : null}
        </form>
      </main>
    );
  }

  const active = board?.orders ?? [];
  return (
    <main className="mx-auto min-h-screen max-w-5xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-bold text-[var(--coffee)]">Barista station</p><h1 className="text-4xl font-black">Coffee queue</h1></div>
        {board?.session ? <button className="rounded-xl border border-red-300 bg-white px-4 font-bold text-red-800" onClick={() => close()}>Close session</button> : <button className="rounded-xl bg-[var(--espresso)] px-5 font-bold text-white" onClick={open}>Open coffee session</button>}
      </header>
      {message ? <p aria-live="polite" className="mb-4 rounded-xl bg-white p-3 text-sm font-bold">{message}</p> : null}
      {!board?.session ? <div className="rounded-3xl bg-[var(--paper)] p-8 text-center"><h2 className="text-2xl font-black">Ordering is closed</h2><p className="mt-2 text-black/55">Open a session when you’re ready to make coffee.</p></div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {active.filter((order) => order.status !== "ready").map((order) => (
            <article className="rounded-3xl bg-[var(--paper)] p-5 shadow-sm" key={order.id}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-2xl font-black">{order.customerName}</h2><p className="mt-1 text-lg">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>{order.note ? <p className="mt-2 text-black/55">“{order.note}”</p> : null}</div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold">{order.status === "ordered" ? "Just ordered" : "In progress"}</span></div>
              <button className="mt-5 w-full rounded-2xl bg-[var(--coffee)] p-4 font-black text-white" onClick={() => advance(order)}>{order.status === "ordered" ? "Start making" : "Mark ready"}</button>
            </article>
          ))}
          {active.filter((order) => order.status !== "ready").length === 0 ? <p className="col-span-full py-16 text-center text-black/45">No drinks waiting. Tiny café zen.</p> : null}
        </div>
      )}
    </main>
  );
}
