"use client";

import type { BoardData, BoardOrder, OrderStatus } from "@/types/coffee";
import Link from "next/link";
import { useEffect, useState } from "react";

function nextStatus(status: OrderStatus) {
  return status === "ordered" ? "in_progress" : status === "in_progress" ? "ready" : null;
}

export function BaristaExperience({ initial }: { initial: BoardData }) {
  const [board, setBoard] = useState(initial);
  const [message, setMessage] = useState("");
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<OrderStatus | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  async function refresh() {
    const response = await fetch("/api/board", { cache: "no-store" });
    if (response.ok) setBoard(await response.json());
  }

  useEffect(() => {
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, []);

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

  async function advance(order: BoardOrder, requestedStatus = nextStatus(order.status)) {
    if (!requestedStatus) return;
    setUpdatingOrderId(order.id);
    const response = await fetch(`/api/barista/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: order.status, to: requestedStatus }),
    });
    setMessage(response.ok ? "" : "주문 상태가 변경되었습니다. 다시 확인해 주세요.");
    await refresh();
    setUpdatingOrderId(null);
  }

  const allOrders = board.orders;
  const queue = allOrders
    .filter((order) => order.status !== "ready")
    .sort((a, b) => a.orderNumber - b.orderNumber);
  const completed = allOrders
    .filter((order) => order.status === "ready")
    .sort((a, b) => a.orderNumber - b.orderNumber);
  const draggedOrder = allOrders.find((order) => order.id === draggedOrderId);

  function canDrop(status: OrderStatus) {
    return draggedOrder ? nextStatus(draggedOrder.status) === status : false;
  }

  function finishDragging() {
    setDraggedOrderId(null);
    setDropTarget(null);
  }

  async function dropOrder(status: OrderStatus) {
    const order = allOrders.find((item) => item.id === draggedOrderId);
    finishDragging();
    if (order && nextStatus(order.status) === status) await advance(order, status);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="brand-mark">S</span>
            <div><p className="font-black leading-tight">Sozo Coffee</p><p className="text-xs text-[var(--muted)]">바리스타</p></div>
          </Link>
          {board.session ? (
            <button className="secondary-action min-h-10 px-4 text-sm text-red-700" onClick={() => close()}>카페 닫기</button>
          ) : (
            <button className="primary-action min-h-10 px-5 text-sm" onClick={open}>카페 열기</button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7"><p className="eyebrow">Barista station</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">주문표</h1></div>
        {message ? <p aria-live="polite" className="mb-5 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold text-[var(--green)]">{message}</p> : null}

        {!board.session ? (
          <section className="panel grid min-h-80 place-items-center p-8 text-center">
            <div><h2 className="text-3xl font-black tracking-tight">지금은 카페가 닫혀 있습니다.</h2><button className="primary-action mt-6 px-7" onClick={open}>카페 열기</button></div>
          </section>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8">
            <div className="grid grid-cols-2 gap-3">
              {[
                { status: "in_progress" as const, label: "만드는 중" },
                { status: "ready" as const, label: "준비 완료" },
              ].map((target) => {
                const accepts = canDrop(target.status);
                const active = accepts && dropTarget === target.status;
                return (
                  <div
                    className={`grid min-h-28 place-items-center rounded-2xl border-2 text-xl font-black transition-colors sm:min-h-32 sm:text-2xl ${
                      active
                        ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green)]"
                        : accepts
                          ? "border-dashed border-[#9ba99f] bg-white"
                          : "border-transparent bg-[var(--surface-soft)] text-[var(--muted)]"
                    }`}
                    key={target.status}
                    onDragEnter={(event) => {
                      if (!accepts) return;
                      event.preventDefault();
                      setDropTarget(target.status);
                    }}
                    onDragOver={(event) => {
                      if (accepts) event.preventDefault();
                    }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      void dropOrder(target.status);
                    }}
                  >
                    {target.label}
                  </div>
                );
              })}
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-black">접수 순서</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{queue.length}잔</span>
              </div>
              <div className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-white">
                {queue.length === 0 ? <p className="grid min-h-32 place-items-center text-sm text-[var(--muted)]">대기 중인 주문이 없습니다.</p> : null}
                {queue.map((order) => (
                  <article
                    className={`grid gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_160px] sm:items-center ${draggedOrderId === order.id ? "opacity-50" : ""}`}
                    draggable={updatingOrderId !== order.id}
                    key={order.id}
                    onDragEnd={finishDragging}
                    onDragStart={(event) => {
                      setDraggedOrderId(order.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", order.id);
                    }}
                  >
                    <div className="text-3xl font-black text-[var(--muted)]">#{order.orderNumber}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight">{order.customerName}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.status === "ordered" ? "bg-[var(--orange-soft)] text-[var(--orange)]" : "bg-[var(--surface-soft)] text-[var(--coffee)]"}`}>
                          {order.status === "ordered" ? "주문 접수" : "만드는 중"}
                        </span>
                      </div>
                      <p className="mt-2 font-bold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                      {order.note ? <p className="mt-2 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">{order.note}</p> : null}
                    </div>
                    <button className="primary-action w-full p-3.5" disabled={updatingOrderId === order.id} onClick={() => advance(order)}>
                      {updatingOrderId === order.id ? "변경 중..." : order.status === "ordered" ? "만들기 시작" : "준비 완료"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-black">완료된 주문</h2>
                <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-black text-[var(--green)]">{completed.length}잔</span>
              </div>
              <div className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-white">
                {completed.length === 0 ? <p className="grid min-h-28 place-items-center text-sm text-[var(--muted)]">완료된 주문이 없습니다.</p> : null}
                {completed.map((order) => (
                  <article className="grid gap-3 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_120px] sm:items-center" key={order.id}>
                    <div className="text-2xl font-black text-[var(--muted)]">#{order.orderNumber}</div>
                    <div><h3 className="font-black">{order.customerName}</h3><p className="mt-1 text-sm text-[var(--muted)]">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p></div>
                    <span className="text-sm font-bold text-[var(--green)] sm:text-right">준비 완료</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
