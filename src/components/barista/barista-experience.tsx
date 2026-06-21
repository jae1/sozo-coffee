"use client";

import type { BoardData, BoardOrder, OrderStatus } from "@/types/coffee";
import Link from "next/link";
import { useEffect, useState } from "react";

function nextStatus(status: OrderStatus) {
  return status === "ordered" ? "in_progress" : status === "in_progress" ? "ready" : null;
}

const columns: {
  status: OrderStatus;
  title: string;
  color: string;
  empty: string;
}[] = [
  { status: "ordered", title: "주문 접수", color: "bg-[var(--orange)]", empty: "주문이 없습니다." },
  { status: "in_progress", title: "만드는 중", color: "bg-[var(--coffee)]", empty: "만들고 있는 음료가 없습니다." },
  { status: "ready", title: "주문 완료", color: "bg-[var(--green)]", empty: "완료된 주문이 없습니다." },
];

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
    const to = requestedStatus;
    if (!to) return;
    setUpdatingOrderId(order.id);
    const response = await fetch(`/api/barista/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: order.status, to }),
    });
    setMessage(response.ok ? "" : "주문 상태가 변경되었습니다. 다시 확인해 주세요.");
    await refresh();
    setUpdatingOrderId(null);
  }

  function canDrop(order: BoardOrder | undefined, status: OrderStatus) {
    return order ? nextStatus(order.status) === status : false;
  }

  function finishDragging() {
    setDraggedOrderId(null);
    setDropTarget(null);
  }

  async function dropOrder(status: OrderStatus) {
    const order = active.find((item) => item.id === draggedOrderId);
    finishDragging();
    if (canDrop(order, status)) await advance(order!, status);
  }

  const active = board?.orders ?? [];
  const draggedOrder = active.find((order) => order.id === draggedOrderId);
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
          <div className="grid gap-6 xl:grid-cols-3">
            {columns.map((column) => {
              const orders = active.filter((order) => order.status === column.status);
              const acceptsDraggedOrder = canDrop(draggedOrder, column.status);
              const isActiveTarget = acceptsDraggedOrder && dropTarget === column.status;
              return (
              <section key={column.status}>
                <div className="mb-3 flex items-center gap-2 px-1"><span className={`h-2.5 w-2.5 rounded-full ${column.color}`} /><h2 className="font-black">{column.title}</h2><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-black">{orders.length}</span></div>
                <div
                  aria-label={`${column.title} 영역`}
                  className={`grid min-h-48 content-start gap-3 rounded-[20px] border-2 p-3 transition-colors sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 ${
                    isActiveTarget
                      ? "border-[var(--green)] bg-[var(--green-soft)]"
                      : acceptsDraggedOrder
                        ? "border-dashed border-[#9ba99f] bg-[var(--surface-soft)]"
                        : "border-transparent bg-[var(--surface-soft)]"
                  }`}
                  onDragEnter={(event) => {
                    if (!acceptsDraggedOrder) return;
                    event.preventDefault();
                    setDropTarget(column.status);
                  }}
                  onDragOver={(event) => {
                    if (acceptsDraggedOrder) event.preventDefault();
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void dropOrder(column.status);
                  }}
                >
                  {orders.length === 0 ? <p className="col-span-full grid min-h-36 place-items-center text-sm text-[var(--muted)]">{isActiveTarget ? "여기에 놓아 완료 처리" : column.empty}</p> : null}
                  {orders.map((order) => (
                    <article
                      aria-label={`${order.customerName}의 ${order.drink} 주문`}
                      className={`rounded-[16px] border border-[var(--line)] bg-white p-5 shadow-sm ${
                        nextStatus(order.status) ? "cursor-grab active:cursor-grabbing" : ""
                      } ${draggedOrderId === order.id ? "opacity-50" : ""}`}
                      draggable={nextStatus(order.status) !== null && updatingOrderId !== order.id}
                      key={order.id}
                      onDragEnd={finishDragging}
                      onDragStart={(event) => {
                        setDraggedOrderId(order.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", order.id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3"><h3 className="text-2xl font-black tracking-tight">{order.customerName}</h3><span className="text-xs font-bold text-[var(--muted)]">{order.drink}</span></div>
                      <p className="mt-4 text-lg font-bold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                      {order.note ? <p className="mt-2 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">{order.note}</p> : null}
                      {nextStatus(order.status) ? (
                        <button className="primary-action mt-5 w-full p-3.5" disabled={updatingOrderId === order.id} onClick={() => advance(order)}>
                          {updatingOrderId === order.id ? "변경 중..." : order.status === "ordered" ? "만들기 시작" : "주문 완료"}
                        </button>
                      ) : (
                        <p className="mt-5 rounded-xl bg-[var(--green-soft)] p-3 text-center text-sm font-black text-[var(--green)]">완료됨</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )})}
          </div>
        )}
      </main>
    </div>
  );
}
