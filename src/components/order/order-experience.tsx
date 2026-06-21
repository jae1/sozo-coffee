"use client";

import { SharedBoard } from "@/components/board/shared-board";
import type { BoardData } from "@/types/coffee";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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
  const [activeTab, setActiveTab] = useState<"order" | "status">("order");
  const [pushSubscription, setPushSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const selectedDrink = board.menu.find((item) => item.id === menuItemId);
  const selectedName = identityType === "member"
    ? board.members.find((member) => member.id === memberId)?.displayName
    : guestName.trim();

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

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = typeof navigator !== "undefined" && "standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true;
  const isIOSSafari = isIOS && !isStandalone;

  async function enableNotifications() {
    // iOS Safari does not support Web Push — must be installed as PWA
    if (isIOSSafari) {
      setNotificationMessage("홈 화면에 추가 후 앱으로 열어주세요.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setNotificationMessage("이 브라우저에서는 알림을 사용할 수 없습니다.");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setNotificationMessage("알림 설정이 아직 완료되지 않았습니다.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotificationMessage("알림 권한이 필요합니다.");
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
      setNotificationMessage("준비 완료 알림을 받습니다.");
    } catch {
      setNotificationMessage("알림을 설정하지 못했습니다.");
    }
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
        pushSubscription,
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) return setMessage(payload?.error?.message ?? "주문하지 못했습니다. 다시 시도해 주세요.");
    setMessage("주문이 접수되었습니다.");
    setNote("");
    await refresh();
    setActiveTab("status");
  }

  if (!board.session) {
    return (
      <main className="app-shell grid place-items-center p-5">
        <section className="panel w-full max-w-lg p-8 text-center sm:p-12">
          <p className="text-sm font-bold text-[var(--muted)]">Sozo Coffee</p>
          <h1 className="mt-3 text-3xl font-black">지금은 주문을 받지 않습니다.</h1>
          <p className="mx-auto mt-4 max-w-sm leading-6 text-[var(--muted)]">바리스타가 카페를 열면 이 화면에서 주문할 수 있습니다.</p>
          <Link className="secondary-action mt-7 inline-flex items-center justify-center px-6" href="/">처음으로</Link>
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
              <p className="text-xs text-[var(--muted)]">커피 주문</p>
            </div>
          </Link>
          <span className="flex items-center gap-2 rounded-full bg-[var(--green-soft)] px-3 py-2 text-xs font-extrabold text-[var(--green)]">
            <span className="h-2 w-2 rounded-full bg-[var(--green)]" /> 주문 가능
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:pb-8">
        <div className="mb-7">
          <h1 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">커피 주문</h1>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[var(--surface-soft)] p-1.5">
          <button
            className={`rounded-xl px-4 py-3 font-black ${activeTab === "order" ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}
            onClick={() => setActiveTab("order")}
            type="button"
          >
            주문하기
          </button>
          <button
            className={`rounded-xl px-4 py-3 font-black ${activeTab === "status" ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}
            onClick={() => {
              setActiveTab("status");
              void refresh();
            }}
            type="button"
          >
            주문 현황
            {board.orders.length > 0 ? <span className="ml-2 rounded-full bg-[var(--ink)] px-2 py-0.5 text-xs text-white">{board.orders.length}</span> : null}
          </button>
        </div>

        {activeTab === "order" ? (
          <form className="panel mx-auto max-w-xl p-5 sm:p-6" onSubmit={submit}>
            <fieldset>
              <legend className="text-lg font-black">1. 이름</legend>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="choice-card px-4 font-bold" data-selected={identityType === "member"} onClick={() => setIdentityType("member")} type="button">멤버</button>
                <button className="choice-card px-4 font-bold" data-selected={identityType === "guest"} onClick={() => setIdentityType("guest")} type="button">게스트</button>
              </div>
              {identityType === "member" ? (
                <select aria-label="이름 선택" className="field mt-3" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {board.members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
                </select>
              ) : (
                <input aria-label="게스트 이름" className="field mt-3" maxLength={40} placeholder="이름" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              )}
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-lg font-black">2. 음료</legend>
              <div className="mt-4 grid gap-2.5">
                {board.menu.map((item) => (
                  <button className="choice-card flex min-h-16 items-center justify-between px-5 text-left font-extrabold" data-selected={menuItemId === item.id} key={item.id} onClick={() => setMenuItemId(item.id)} type="button">
                    <span>{item.displayName}</span>
                    <span aria-hidden="true" className={`h-5 w-5 rounded-full border-2 ${menuItemId === item.id ? "border-white bg-white" : "border-[var(--line)]"}`} />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-lg font-black">3. 온도</legend>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {(["hot", "iced"] as const).map((value) => (
                  <button className="choice-card px-4 font-extrabold" data-selected={temperature === value} key={value} onClick={() => setTemperature(value)} type="button">
                    {value === "hot" ? "Hot" : "Iced"}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-7 block text-lg font-black">
              요청사항 <span className="text-sm font-normal text-[var(--muted)]">(선택)</span>
              <textarea className="field mt-3 resize-none" maxLength={120} placeholder="얼음 적게 등" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div className="mt-6 rounded-2xl border border-[var(--line)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black">준비 완료 알림</p>
                  {isIOSSafari ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Safari 하단 공유 버튼 →&nbsp;<strong>홈 화면에 추가</strong> → 앱으로 열기
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      커피가 준비되면 알림을 받습니다.
                    </p>
                  )}
                </div>
                <button
                  className={`secondary-action min-w-24 px-4 text-sm ${isIOSSafari ? "opacity-50" : ""}`}
                  onClick={enableNotifications}
                  type="button"
                >
                  {pushSubscription ? "설정됨" : isIOSSafari ? "앱으로 열기" : "알림 받기"}
                </button>
              </div>
              {notificationMessage ? (
                <p className={`mt-2 text-xs font-bold ${notificationMessage.includes("받습니다") ? "text-[var(--green)]" : "text-[var(--orange)]"}`}>
                  {notificationMessage}
                </p>
              ) : null}
            </div>

            <div className="mt-7 rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold text-[var(--muted)]">주문 내용</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="font-black">{temperature === "iced" ? "Iced" : "Hot"} {selectedDrink?.displayName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{selectedName || "이름을 입력해 주세요"}</p>
                </div>
                {note ? <span className="max-w-32 truncate text-xs text-[var(--muted)]">{note}</span> : null}
              </div>
            </div>

            <button className="primary-action mt-4 hidden w-full p-4 lg:block" disabled={pending} type="submit">{pending ? "주문 중…" : "주문하기"}</button>
            {message ? <p aria-live="polite" className="mt-3 rounded-xl bg-[var(--green-soft)] p-3 text-center text-sm font-extrabold text-[var(--green)]">{message}</p> : null}

            <div aria-hidden="true" className="h-32 lg:hidden" />

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-white p-3 shadow-[0_-8px_30px_rgb(20_20_18/8%)] lg:hidden">
              <div className="mx-auto flex max-w-lg items-center gap-3">
                <div className="min-w-0 flex-1 pl-1">
                  <p className="truncate text-sm font-black">{temperature === "iced" ? "Iced" : "Hot"} {selectedDrink?.displayName}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{selectedName || "이름을 선택해 주세요"}</p>
                </div>
                <button className="primary-action min-w-32 px-5" disabled={pending} type="submit">{pending ? "주문 중…" : "주문하기"}</button>
              </div>
            </div>
          </form>
        ) : (
          <section className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">주문 현황</h2>
              </div>
              <p className="text-sm text-[var(--muted)]">총 {board.orders.length}잔</p>
            </div>
            <SharedBoard orders={board.orders} />
          </section>
        )}
      </main>
    </div>
  );
}
