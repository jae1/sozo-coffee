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
    if (!response.ok) return setMessage("비밀번호가 맞지 않습니다.");
    setAuthenticated(true);
    setMessage("");
    await refresh();
  }

  async function open() {
    const response = await fetch("/api/barista/sessions", { method: "POST" });
    setMessage(response.ok ? "카페를 열었습니다." : "카페를 열지 못했습니다.");
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
      if (window.confirm(`진행 중인 주문이 ${count}건 있습니다. 그래도 카페를 닫을까요?`)) return close(true);
      return;
    }
    setMessage(response.ok ? "카페를 닫았습니다." : payload?.error?.message ?? "카페를 닫지 못했습니다.");
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
    setMessage(response.ok ? "" : "주문 상태가 변경되었습니다. 다시 확인해 주세요.");
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
            <h1 className="mt-14 text-4xl font-black tracking-[-0.045em]">바리스타</h1>
          </div>
          <form className="grid gap-3 p-7" onSubmit={login}>
            <label className="text-sm font-extrabold" htmlFor="barista-pin">4자리 비밀번호</label>
            <input id="barista-pin" aria-label="Barista PIN" autoComplete="one-time-code" className="field text-center text-2xl font-black tracking-[0.45em]" inputMode="numeric" maxLength={4} pattern="\d{4}" placeholder="••••" required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
            <button className="primary-action mt-2 p-4">입장</button>
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
            <div><p className="font-black leading-tight">Sozo Coffee</p><p className="text-xs text-[var(--muted)]">바리스타</p></div>
          </Link>
          {board?.session ? (
            <button className="secondary-action min-h-10 px-4 text-sm text-red-700" onClick={() => close()}>카페 닫기</button>
          ) : (
            <button className="primary-action min-h-10 px-5 text-sm" onClick={open}>카페 열기</button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">Barista station</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">주문표</h1></div>
        </div>

        {message ? <p aria-live="polite" className="mb-5 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold text-[var(--green)]">{message}</p> : null}

        {!board?.session ? (
          <section className="panel grid min-h-80 place-items-center p-8 text-center">
            <div><h2 className="text-3xl font-black tracking-tight">지금은 카페가 닫혀 있습니다.</h2><button className="primary-action mt-6 px-7" onClick={open}>카페 열기</button></div>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {[
              { title: "주문 접수", orders: waiting, color: "bg-[var(--orange)]" },
              { title: "만드는 중", orders: making, color: "bg-[var(--coffee)]" },
            ].map((column) => (
              <section key={column.title}>
                <div className="mb-3 flex items-center gap-2 px-1"><span className={`h-2.5 w-2.5 rounded-full ${column.color}`} /><h2 className="font-black">{column.title}</h2><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-black">{column.orders.length}</span></div>
                <div className="grid min-h-48 content-start gap-3 rounded-[20px] bg-[var(--surface-soft)] p-3 sm:grid-cols-2">
                  {column.orders.length === 0 ? <p className="col-span-full grid min-h-36 place-items-center text-sm text-[var(--muted)]">주문이 없습니다.</p> : null}
                  {column.orders.map((order) => (
                    <article className="rounded-[16px] border border-[var(--line)] bg-white p-5 shadow-sm" key={order.id}>
                      <div className="flex items-start justify-between gap-3"><h3 className="text-2xl font-black tracking-tight">{order.customerName}</h3><span className="text-xs font-bold text-[var(--muted)]">{order.drink}</span></div>
                      <p className="mt-4 text-lg font-bold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                      {order.note ? <p className="mt-2 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">{order.note}</p> : null}
                      <button className="primary-action mt-5 w-full p-3.5" onClick={() => advance(order)}>{order.status === "ordered" ? "만들기 시작" : "준비 완료"}</button>
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
