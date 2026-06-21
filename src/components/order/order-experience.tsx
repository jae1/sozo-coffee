"use client";

import { SharedBoard } from "@/components/board/shared-board";
import type { BoardData } from "@/types/coffee";
import Link from "next/link";
import { FormEvent, useState } from "react";

const drinkIcons: Record<string, string> = {
  americano: "◉",
  latte: "◒",
  mocha: "◆",
};

export function OrderExperience({ initial }: { initial: BoardData }) {
  const [board, setBoard] = useState(initial);
  const [identityType, setIdentityType] = useState<"member" | "guest">("member");
  const [memberId, setMemberId] = useState(initial.members[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [menuItemId, setMenuItemId] = useState<"americano" | "latte" | "mocha">("americano");
  const [temperature, setTemperature] = useState<"hot" | "iced">("hot");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function refresh() {
    const response = await fetch("/api/board", { cache: "no-store" });
    if (response.ok) setBoard(await response.json());
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        identity: identityType === "member" ? { type: "member", memberId } : { type: "guest", name: guestName },
        menuItemId,
        temperature,
        note,
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) return setMessage(payload?.error?.message ?? "Could not place your order.");
    setMessage("Order received. You’re on the board!");
    setNote("");
    await refresh();
  }

  if (!board.session) {
    return (
      <main className="app-shell grid place-items-center p-5">
        <section className="panel w-full max-w-lg p-8 text-center sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface-soft)] text-3xl">☕</span>
          <p className="eyebrow mt-7">Sozo Coffee</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">We’re not brewing yet.</h1>
          <p className="mx-auto mt-4 max-w-sm leading-6 text-[var(--muted)]">The menu will open as soon as the barista starts today’s coffee session.</p>
          <Link className="secondary-action mt-7 inline-flex items-center justify-center px-6" href="/">Back home</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="brand-mark">S</span>
            <div>
              <p className="font-black leading-tight">Sozo Coffee</p>
              <p className="text-xs text-[var(--muted)]">Order & pickup</p>
            </div>
          </Link>
          <span className="flex items-center gap-2 rounded-full bg-[var(--green-soft)] px-3 py-2 text-xs font-extrabold text-[var(--green)]">
            <span className="h-2 w-2 rounded-full bg-[var(--green)]" /> Ordering open
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-7">
          <p className="eyebrow">Today’s coffee</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Build your drink</h1>
          <p className="mt-2 text-[var(--muted)]">A few taps and you’re in the queue.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form className="panel p-5 sm:p-6 lg:sticky lg:top-24" onSubmit={submit}>
            <fieldset>
              <legend className="text-lg font-black">1. Who’s ordering?</legend>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="choice-card px-4 font-bold" data-selected={identityType === "member"} onClick={() => setIdentityType("member")} type="button">Member</button>
                <button className="choice-card px-4 font-bold" data-selected={identityType === "guest"} onClick={() => setIdentityType("guest")} type="button">Guest</button>
              </div>
              {identityType === "member" ? (
                <select aria-label="Choose your name" className="field mt-3" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {board.members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
                </select>
              ) : (
                <input aria-label="Guest first name" className="field mt-3" maxLength={40} placeholder="Your first name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              )}
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-lg font-black">2. Pick a drink</legend>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {board.menu.map((item) => (
                  <button className="choice-card flex min-h-24 flex-col items-center justify-center gap-2 p-2 text-sm font-extrabold" data-selected={menuItemId === item.id} key={item.id} onClick={() => setMenuItemId(item.id)} type="button">
                    <span className="text-2xl" aria-hidden="true">{drinkIcons[item.id] ?? "●"}</span>
                    {item.displayName}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-lg font-black">3. Hot or iced?</legend>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {(["hot", "iced"] as const).map((value) => (
                  <button className="choice-card flex items-center justify-center gap-2 px-4 font-extrabold" data-selected={temperature === value} key={value} onClick={() => setTemperature(value)} type="button">
                    <span aria-hidden="true">{value === "hot" ? "♨" : "❄"}</span>
                    {value === "hot" ? "Hot" : "Iced"}
                  </button>
                ))}
              </div>
            </fieldset>

            {menuItemId !== "americano" ? <p className="mt-4 rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted)]">Made with regular dairy milk.</p> : null}

            <label className="mt-7 block text-lg font-black">
              Add a note <span className="text-sm font-normal text-[var(--muted)]">(optional)</span>
              <textarea className="field mt-3 resize-none" maxLength={120} placeholder="Less ice, extra hot…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <button className="primary-action mt-6 w-full p-4" disabled={pending} type="submit">{pending ? "Sending order…" : "Place order"}</button>
            {message ? <p aria-live="polite" className="mt-3 rounded-xl bg-[var(--green-soft)] p-3 text-center text-sm font-extrabold text-[var(--green)]">{message}</p> : null}
          </form>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Live board</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Coffee queue</h2>
              </div>
              <p className="text-sm text-[var(--muted)]">{board.orders.length} active</p>
            </div>
            <SharedBoard orders={board.orders} />
          </section>
        </div>
      </main>
    </div>
  );
}
