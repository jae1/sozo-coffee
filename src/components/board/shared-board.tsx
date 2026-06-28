import type { BoardOrder, OrderStatus } from "@/types/coffee";

const sections: { status: OrderStatus; label: string; color: string; empty: string }[] = [
  { status: "ordered", label: "Received", color: "bg-[var(--orange)]", empty: "No orders yet." },
  { status: "in_progress", label: "In progress", color: "bg-[var(--coffee)]", empty: "No drinks are being made." },
  { status: "ready", label: "Ready", color: "bg-[var(--green)]", empty: "No drinks are ready." },
];

export function SharedBoard({ orders }: { orders: BoardOrder[] }) {
  return (
    <section aria-label="Order status" className="status-board">
      {sections.map(({ status, label, color, empty }) => {
        const items = orders.filter((order) => order.status === status);
        return (
          <div className="status-column" key={status}>
            <div className="status-column__header">
              <div>
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
                <h2>{label}</h2>
              </div>
              <span>
                {items.length}
              </span>
            </div>
            <div className="status-list">
              {items.length === 0 ? (
                <div className="status-empty">
                  {empty}
                </div>
              ) : null}
              {items.map((order) => (
                <article className="status-card" key={order.id}>
                  <div className="status-card__top">
                    <strong>#{order.orderNumber} {order.customerName}</strong>
                    <span aria-label={status}>
                      {label}
                    </span>
                  </div>
                  <p className="status-card__drink">
                    {order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}
                  </p>
                  {order.note ? <p className="status-card__note">{order.note}</p> : null}
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
