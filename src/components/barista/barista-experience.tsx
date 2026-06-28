"use client";

import type { BoardData, BoardOrder, OrderStatus } from "@/types/coffee";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { AppTabs } from "@/components/navigation/app-tabs";
import type { MemberSession } from "@/lib/auth/member-session";

function nextStatus(status: OrderStatus) {
  return status === "ordered" ? "in_progress" : status === "in_progress" ? "ready" : null;
}

export function BaristaExperience({ initial, session }: { initial: BoardData; session: MemberSession }) {
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
    setMessage(response.ok ? "The café is open." : "The café could not be opened.");
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
      if (window.confirm(`${count} active orders remain. Close the café anyway?`)) return close(true);
      return;
    }
    setMessage(response.ok ? "The café is closed." : payload?.error?.message ?? "The café could not be closed.");
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
    setMessage(response.ok ? "" : "This order changed on another screen. Please try again.");
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
      <SiteHeader />
      <AppTabs session={session} />

      <main className="page-container barista-page">
        <div className="barista-hero">
          <div className="page-heading">
            <p className="eyebrow">Barista station</p>
            <h1>Order board</h1>
            <p>Manage orders in the order they arrive.</p>
          </div>
          <div className="page-toolbar">
            {board.session ? (
              <button className="secondary-action" onClick={() => close()}>Close café</button>
            ) : (
              <button className="primary-action" onClick={open}>Open café</button>
            )}
          </div>
        </div>
        {message ? <p aria-live="polite" className="mb-5 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold text-[var(--green)]">{message}</p> : null}

        {!board.session ? (
          <section className="panel grid min-h-80 place-items-center p-8 text-center">
            <div><h2 className="empty-state-title">The café is closed.</h2><button className="primary-action mt-6 px-7" onClick={open}>Open café</button></div>
          </section>
        ) : (
          <div className="barista-workspace">
            <section className="barista-stats" aria-label="Cafe status">
              <div>
                <span>Status</span>
                <strong>Open</strong>
              </div>
              <div>
                <span>Active queue</span>
                <strong>{queue.length}</strong>
              </div>
              <div>
                <span>Ready</span>
                <strong>{completed.length}</strong>
              </div>
            </section>

            {queue.length > 0 ? (
              <div className="barista-drop-targets grid grid-cols-2 gap-3">
              {[
                { status: "in_progress" as const, label: "In progress" },
                { status: "ready" as const, label: "Ready" },
              ].map((target) => {
                const accepts = canDrop(target.status);
                const active = accepts && dropTarget === target.status;
                return (
                  <div
                    className={`barista-drop-target grid min-h-28 place-items-center border-2 font-black transition-colors sm:min-h-32 ${
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
            ) : null}

            <section>
              <div className="barista-section-header">
                <h2>Order queue</h2>
                <span>{queue.length}</span>
              </div>
              <div className="barista-list">
                {queue.length === 0 ? <p className="barista-empty">No orders are waiting.</p> : null}
                {queue.map((order) => (
                  <article
                    className={`barista-order-card grid gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_160px] sm:items-center ${draggedOrderId === order.id ? "opacity-50" : ""}`}
                    draggable={updatingOrderId !== order.id}
                    key={order.id}
                    onDragEnd={finishDragging}
                    onDragStart={(event) => {
                      setDraggedOrderId(order.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", order.id);
                    }}
                  >
                    <div className="order-number">#{order.orderNumber}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="barista-customer-name">{order.customerName}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.status === "ordered" ? "bg-[var(--orange-soft)] text-[var(--orange)]" : "bg-[var(--surface-soft)] text-[var(--coffee)]"}`}>
                          {order.status === "ordered" ? "Received" : "In progress"}
                        </span>
                      </div>
                      <p className="mt-2 font-bold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                      {order.note ? <p className="mt-2 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">{order.note}</p> : null}
                    </div>
                    <button className="primary-action w-full p-3.5" disabled={updatingOrderId === order.id} onClick={() => advance(order)}>
                      {updatingOrderId === order.id ? "Updating..." : order.status === "ordered" ? "Start making" : "Mark ready"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="barista-section-header">
                <h2>Completed</h2>
                <span>{completed.length}</span>
              </div>
              <div className="barista-list">
                {completed.length === 0 ? <p className="barista-empty">No completed orders yet.</p> : null}
                {completed.map((order) => (
                  <article className="grid gap-3 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_120px] sm:items-center" key={order.id}>
                    <div className="order-number order-number--small">#{order.orderNumber}</div>
                    <div><h3 className="font-black">{order.customerName}</h3><p className="mt-1 text-sm text-[var(--muted)]">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p></div>
                    <span className="text-sm font-bold text-[var(--green)] sm:text-right">Ready</span>
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
