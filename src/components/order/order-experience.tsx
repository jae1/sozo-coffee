"use client";

import { SharedBoard } from "@/components/board/shared-board";
import { AppTabs } from "@/components/navigation/app-tabs";
import type { BoardData } from "@/types/coffee";
import type { MemberSession } from "@/lib/auth/member-session";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SiteHeader } from "@/components/layout/site-header";

type CartItem = {
  id: string;
  menuItemId: "americano" | "latte" | "mocha";
  drinkName: string;
  temperature: "hot" | "iced";
  note: string;
};

function subscribeToBrowser() {
  return () => {};
}

function getIOSSafariSnapshot() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = "standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true;
  return isIOS && !isStandalone;
}

export function OrderExperience({
  initial,
  initialTab,
  memberSession,
}: {
  initial: BoardData;
  initialTab?: "order" | "status";
  memberSession: MemberSession | null;
}) {
  const [board, setBoard] = useState(initial);
  const [identityType, setIdentityType] = useState<"member" | "guest">("member");
  const [memberId, setMemberId] = useState(memberSession?.memberId ?? initial.members[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [menuItemId, setMenuItemId] = useState<"americano" | "latte" | "mocha" | null>(null);
  const [temperature, setTemperature] = useState<"hot" | "iced">("hot");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"order" | "status">(initialTab ?? "order");
  const [pushSubscription, setPushSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartToast, setCartToast] = useState("");
  const cartToastTimer = useRef<number | null>(null);
  const isIOSSafari = useSyncExternalStore(subscribeToBrowser, getIOSSafariSnapshot, () => false);
  const selectedDrink = board.menu.find((item) => item.id === menuItemId);
  const cartItemLabel = `${cart.length} ${cart.length === 1 ? "item" : "items"}`;
  const cartSummary = cart.length === 0
    ? "Choose a drink."
    : cart.length === 1
      ? `${cart[0].temperature === "iced" ? "Iced" : "Hot"} ${cart[0].drinkName}`
      : `${cart.length} drinks ready to place.`;

  async function refresh() {
    const response = await fetch("/api/board", { cache: "no-store" });
    if (response.ok) setBoard(await response.json());
  }

  useEffect(() => {
    const timer = window.setInterval(refresh, 2000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);

  async function enableNotifications() {
    // iOS Safari does not support Web Push — must be installed as PWA
    if (isIOSSafari) {
      setNotificationMessage("Add this site to your Home Screen, then open the app.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setNotificationMessage("Notifications are not supported in this browser.");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setNotificationMessage("Notifications have not been configured yet.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotificationMessage("Notification permission is required.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(
          atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")),
          (character) => character.charCodeAt(0),
        ),
      });
      setPushSubscription(subscription.toJSON());
      setNotificationMessage("Pickup notifications are on.");
    } catch {
      setNotificationMessage("Notifications could not be enabled.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (cart.length === 0) {
      setMessage("Add a drink to your order first.");
      return;
    }
    setPending(true);
    setMessage("");
    const identity = memberSession
      ? { type: "member", memberId: memberSession.memberId }
      : identityType === "member"
        ? { type: "member", memberId }
        : { type: "guest", name: guestName };
    const responses = await Promise.all(cart.map((item) => fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        identity,
        menuItemId: item.menuItemId,
        temperature: item.temperature,
        note: item.note,
        pushSubscription,
      }),
    })));
    setPending(false);
    if (responses.some((response) => !response.ok)) {
      setMessage("Some drinks could not be ordered. Check your order status.");
      await refresh();
      setActiveTab("status");
      window.history.replaceState(null, "", "/order?tab=status");
      return;
    }
    setMessage(`Your order for ${cart.length} ${cart.length === 1 ? "drink" : "drinks"} has been placed.`);
    setCart([]);
    setNote("");
    await refresh();
    setActiveTab("status");
    window.history.replaceState(null, "", "/order?tab=status");
    setTimeout(() => setMessage(""), 3000);
  }

  function addToCart() {
    if (!selectedDrink || !menuItemId) return;
    setCart((items) => [...items, {
      id: crypto.randomUUID(),
      menuItemId,
      drinkName: selectedDrink.displayName,
      temperature,
      note: note.trim(),
    }]);
    setNote("");
    setCartToast(`${temperature === "iced" ? "Iced" : "Hot"} ${selectedDrink.displayName} added.`);
    if (cartToastTimer.current) window.clearTimeout(cartToastTimer.current);
    cartToastTimer.current = window.setTimeout(() => {
      setCartToast("");
      cartToastTimer.current = null;
    }, 5000);
  }

  if (!board.session) {
    return (
      <main className="app-shell grid place-items-center p-5">
        <section className="panel w-full max-w-lg p-8 text-center sm:p-12">
          <p className="text-sm font-bold text-[var(--muted)]">Sozo Coffee</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">We’re currently closed.</h1>
          <p className="mx-auto mt-4 max-w-sm leading-6 text-[var(--muted)]">You can order here when the café opens.</p>
          <Link className="secondary-action mt-7 inline-flex items-center justify-center px-6" href="/">Go home</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      {memberSession ? <AppTabs session={memberSession} /> : null}

      <main className="mx-auto max-w-[1440px] px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:pb-10">
        <div className="order-hero mb-6 overflow-hidden rounded-[28px]">
          <div className="relative z-10 max-w-xl px-6 py-8 sm:px-10 sm:py-11">
            <h1 className="order-hero__title">What are you<br />drinking today?</h1>
            <div className="order-hero__status">
              <span aria-hidden="true" />
              Open now
            </div>
          </div>
        </div>

        {activeTab === "order" ? (
          <form onSubmit={submit}>
            {/* Desktop: 2-col inside the form. Mobile: single col */}
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">

              {/* Left: input fields */}
              <div>
                {!memberSession ? (
                  <fieldset className="panel mb-6 p-5 sm:p-6">
                    <legend className="text-lg font-black">Name</legend>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button className="choice-card px-4 font-bold" data-selected={identityType === "member"} onClick={() => setIdentityType("member")} type="button">Member</button>
                      <button className="choice-card px-4 font-bold" data-selected={identityType === "guest"} onClick={() => setIdentityType("guest")} type="button">Guest</button>
                    </div>
                    {identityType === "member" ? (
                      <select aria-label="Select your name" className="field mt-3" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                        {board.members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
                      </select>
                    ) : (
                      <input aria-label="Guest name" className="field mt-3" maxLength={40} placeholder="Your name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                    )}
                  </fieldset>
                ) : null}

                <fieldset>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <legend className="section-title">Choose your drink</legend>
                    </div>
                  </div>
                  <div className="menu-grid grid gap-3 sm:grid-cols-3">
                    {board.menu.map((item) => {
                      const imgMap: Record<string, string> = {
                        americano: "/americano.png",
                        latte: "/latte.png",
                        mocha: "/mocha.png",
                      };
                      return (
                        <button
                          className="drink-card w-full"
                          data-selected={menuItemId === item.id}
                          key={item.id}
                          onClick={() => setMenuItemId(item.id)}
                          type="button"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={item.displayName} className="drink-card__img" src={imgMap[item.id] ?? "/americano.png"} />
                          <div className="flex-1 text-left">
                            <p className="text-lg font-bold leading-tight">{item.displayName}</p>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${menuItemId === item.id ? "border-[var(--sbx-green)] bg-[var(--sbx-green)]" : "border-[var(--line)]"}`}
                          >
                            {menuItemId === item.id && (
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {selectedDrink ? <div className="panel mt-6 p-5 sm:p-6">
                <fieldset>
                  <legend className="text-lg font-black">Choose a temperature</legend>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {(["hot", "iced"] as const).map((value) => (
                      <button
                        className="choice-card min-h-14 px-4 text-lg font-extrabold"
                        data-selected={temperature === value}
                        key={value}
                        onClick={() => setTemperature(value)}
                        type="button"
                      >
                        {value === "hot" ? "Hot" : "Iced"}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="mt-8 block text-lg font-black">
                  Special requests <span className="text-sm font-normal text-[var(--muted)]">(optional)</span>
                  <textarea className="field mt-3 resize-none" maxLength={120} placeholder="Less ice, extra shot, or anything else" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </label>
                <button className="primary-action mt-5 w-full px-5 py-4 font-black" onClick={addToCart} type="button">
                  Add to order
                </button>
                </div> : null}
              </div>

              {/* Right: live order summary + notification + submit */}
              <div className="mt-4 flex flex-col gap-4 lg:mt-0">
                {/* Order preview card */}
                <div className="panel cart-panel order-review-panel p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">Review Order</h2>
                    </div>
                    <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-sm font-black text-[var(--green)]">{cartItemLabel}</span>
                  </div>

                  <div className="mt-5 grid gap-2">
                    {cart.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#c9c7bf] p-7 text-center">
                        <p className="font-black">Your order is empty</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Choose a drink from the menu.</p>
                      </div>
                    ) : cart.map((item) => (
                      <div className="flex items-center gap-3 border-b border-[var(--line)] py-4 last:border-0" key={item.id}>
                        <div className="min-w-0 flex-1">
                          <p className="font-black">{item.temperature === "iced" ? "Iced" : "Hot"} {item.drinkName}</p>
                          {item.note ? <p className="truncate text-xs text-[var(--muted)]">{item.note}</p> : null}
                        </div>
                        <button
                          aria-label={`Remove ${item.drinkName}`}
                          className="min-h-9 px-2 text-sm font-bold text-[var(--muted)] underline"
                          onClick={() => setCart((items) => items.filter((candidate) => candidate.id !== item.id))}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button className="primary-action mt-5 hidden w-full p-4 text-base lg:flex lg:items-center lg:justify-center" disabled={pending || cart.length === 0} type="submit">
                    {pending ? "Placing order…" : "Place order"}
                  </button>
                  {message ? <p aria-live="polite" className="mt-3 rounded-xl bg-[var(--green-soft)] p-3 text-center text-sm font-extrabold text-[var(--green)]">{message}</p> : null}
                </div>

                {/* Notification */}
                <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black">Pickup notifications</p>
                      {isIOSSafari ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Tap Share → <strong>Add to Home Screen</strong> → open the app
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--muted)]">Get notified when your order is ready.</p>
                      )}
                    </div>
                    <button
                      className={`secondary-action shrink-0 px-4 text-sm ${isIOSSafari ? "opacity-50" : ""}`}
                      onClick={enableNotifications}
                      type="button"
                    >
                      {pushSubscription ? "On" : isIOSSafari ? "Install app" : "Notify me"}
                    </button>
                  </div>
                  {notificationMessage ? (
                    <p className={`mt-2 text-xs font-bold ${notificationMessage.includes("are on") ? "text-[var(--green)]" : "text-[var(--orange)]"}`}>
                      {notificationMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Mobile fixed bottom bar */}
            <div aria-hidden="true" className="h-40 lg:hidden" />
            <div className="mobile-order-bar">
              <div className="mx-auto flex max-w-lg items-center gap-3">
                <div className="min-w-0 flex-1 pl-1">
                  <p className="truncate text-sm font-black">Your order · {cartItemLabel}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{cartSummary}</p>
                </div>
                <button className="primary-action min-w-32 px-5" disabled={pending || cart.length === 0} type="submit">{pending ? "Placing…" : "Place order"}</button>
              </div>
            </div>
          </form>
        ) : (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="section-title">Order Status</h2>
              <p className="text-sm text-[var(--muted)]">{board.orders.length} total</p>
            </div>
            <SharedBoard orders={board.orders} />
          </section>
        )}
      </main>
      {cartToast ? (
        <div className="cart-toast" data-testid="cart-toast" role="status">
          <span>{cartToast}</span>
          <button
            aria-label="Dismiss"
            onClick={() => {
              if (cartToastTimer.current) window.clearTimeout(cartToastTimer.current);
              cartToastTimer.current = null;
              setCartToast("");
            }}
            type="button"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
