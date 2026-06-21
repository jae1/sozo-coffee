"use client";

import { SharedBoard } from "@/components/board/shared-board";
import type { BoardData } from "@/types/coffee";
import { FormEvent, useState } from "react";

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
    setMessage("Order placed — you’re on the board!");
    setNote("");
    await refresh();
  }

  if (!board.session) {
    return <main className="mx-auto min-h-screen max-w-xl p-6"><h1 className="text-4xl font-black">Coffee is closed</h1><p className="mt-3 text-black/60">The barista will open ordering when the machine is warm.</p></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 sm:p-6">
      <header className="mb-6"><p className="font-bold text-[var(--coffee)]">Sozo Coffee</p><h1 className="text-4xl font-black">What can we make you?</h1></header>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form className="rounded-3xl bg-[var(--paper)] p-5 shadow-sm" onSubmit={submit}>
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-black">Who is ordering?</legend>
            <div className="flex gap-2">
              <button className={`flex-1 rounded-xl p-3 ${identityType === "member" ? "bg-[var(--espresso)] text-white" : "border"}`} onClick={() => setIdentityType("member")} type="button">Member</button>
              <button className={`flex-1 rounded-xl p-3 ${identityType === "guest" ? "bg-[var(--espresso)] text-white" : "border"}`} onClick={() => setIdentityType("guest")} type="button">Guest</button>
            </div>
            {identityType === "member" ? (
              <select className="rounded-xl border p-3" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                {board.members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
              </select>
            ) : <input className="rounded-xl border p-3" maxLength={40} placeholder="Your first name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />}
          </fieldset>
          <fieldset className="mt-5 grid grid-cols-3 gap-2">
            <legend className="mb-2 font-black">Drink</legend>
            {board.menu.map((item) => <button className={`rounded-xl p-3 text-sm font-bold ${menuItemId === item.id ? "bg-[var(--coffee)] text-white" : "border"}`} key={item.id} onClick={() => setMenuItemId(item.id)} type="button">{item.displayName}</button>)}
          </fieldset>
          <fieldset className="mt-5 grid grid-cols-2 gap-2">
            <legend className="mb-2 font-black">Hot or iced?</legend>
            {(["hot", "iced"] as const).map((value) => <button className={`rounded-xl p-3 font-bold ${temperature === value ? "bg-[var(--sage)] text-white" : "border"}`} key={value} onClick={() => setTemperature(value)} type="button">{value === "hot" ? "Hot" : "Iced"}</button>)}
          </fieldset>
          {menuItemId !== "americano" ? <p className="mt-3 text-sm text-black/55">Made with regular dairy milk.</p> : null}
          <label className="mt-5 block font-black">Note <span className="font-normal text-black/40">(optional)</span><textarea className="mt-2 w-full rounded-xl border p-3" maxLength={120} rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <button className="mt-5 w-full rounded-2xl bg-[var(--espresso)] p-4 font-black text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Placing…" : "Place order"}</button>
          {message ? <p aria-live="polite" className="mt-3 text-center text-sm font-bold">{message}</p> : null}
        </form>
        <SharedBoard orders={board.orders} />
      </div>
    </main>
  );
}
