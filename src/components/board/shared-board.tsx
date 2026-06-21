import type { BoardOrder, OrderStatus } from "@/types/coffee";

const sections: { status: OrderStatus; label: string }[] = [
  { status: "ordered", label: "Just ordered" },
  { status: "in_progress", label: "In progress" },
  { status: "ready", label: "Ready" },
];

export function SharedBoard({ orders }: { orders: BoardOrder[] }) {
  return (
    <section aria-label="Coffee queue" className="grid gap-4 lg:grid-cols-3">
      {sections.map(({ status, label }) => {
        const items = orders.filter((order) => order.status === status);
        return (
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4" key={status}>
            <h2 className="mb-3 text-lg font-black">{label} <span className="text-black/40">{items.length}</span></h2>
            <div className="grid gap-3">
              {items.length === 0 ? <p className="py-6 text-center text-sm text-black/45">Nothing here yet</p> : null}
              {items.map((order) => (
                <article className="rounded-2xl bg-white p-4 shadow-sm" key={order.id}>
                  <div className="flex justify-between gap-3">
                    <strong>{order.customerName}</strong>
                    <span aria-label={status} className="text-xs font-bold uppercase text-[var(--coffee)]">● {label}</span>
                  </div>
                  <p className="mt-2 font-semibold">{order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}</p>
                  {order.note ? <p className="mt-1 text-sm text-black/60">“{order.note}”</p> : null}
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
