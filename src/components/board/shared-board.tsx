import type { BoardOrder, OrderStatus } from "@/types/coffee";

const sections: { status: OrderStatus; label: string; color: string; empty: string }[] = [
  { status: "ordered", label: "주문 접수", color: "bg-[var(--orange)]", empty: "주문이 없습니다." },
  { status: "in_progress", label: "만드는 중", color: "bg-[var(--coffee)]", empty: "만들고 있는 음료가 없습니다." },
  { status: "ready", label: "준비 완료", color: "bg-[var(--green)]", empty: "준비된 음료가 없습니다." },
];

export function SharedBoard({ orders }: { orders: BoardOrder[] }) {
  return (
    <section aria-label="주문 현황" className="grid gap-4 xl:grid-cols-3">
      {sections.map(({ status, label, color, empty }) => {
        const items = orders.filter((order) => order.status === status);
        return (
          <div className="min-w-0" key={status}>
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
                <h2 className="text-sm font-extrabold">{label}</h2>
              </div>
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[var(--surface-soft)] px-2 text-xs font-black">
                {items.length}
              </span>
            </div>
            <div className="grid min-h-40 content-start gap-2.5 rounded-[18px] bg-[var(--surface-soft)] p-2.5">
              {items.length === 0 ? (
                <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-[#cbc8bf] px-5 text-center text-sm text-[var(--muted)]">
                  {empty}
                </div>
              ) : null}
              {items.map((order) => (
                <article className="rounded-[14px] border border-[var(--line)] bg-white p-4 shadow-sm" key={order.id}>
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-base">{order.customerName}</strong>
                    <span aria-label={status} className="whitespace-nowrap rounded-full bg-[var(--canvas)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
                      {label}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-black tracking-tight">
                    {order.temperature === "iced" ? "Iced" : "Hot"} {order.drink}
                  </p>
                  {order.note ? <p className="mt-2 border-l-2 border-[var(--latte)] pl-2 text-sm text-[var(--muted)]">{order.note}</p> : null}
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
