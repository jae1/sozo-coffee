"use client";

import type { MemberSession } from "@/lib/auth/member-session";
import { FormEvent, useState } from "react";
import Link from "next/link";

type Mode = "login" | "signup" | "recover";

export function AccountExperience({ session }: { session: MemberSession | null }) {
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/member/${mode === "recover" ? "recover" : mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage(payload?.error?.message ?? "처리하지 못했습니다.");
      return;
    }
    if (payload?.recoveryCode) {
      setRecoveryCode(payload.recoveryCode);
      return;
    }
    window.location.href = "/order";
  }

  async function logout() {
    await fetch("/api/member/logout", { method: "POST" });
    window.location.reload();
  }

  if (session) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-5 py-12">
        <Link className="text-sm font-bold text-[var(--sbx-green)]" href="/">Sozo Coffee</Link>
        <section className="panel mt-8 p-6">
          <p className="text-sm text-[var(--muted)]">로그인 중</p>
          <h1 className="mt-2 text-3xl font-black">{session.displayName}</h1>
          <p className="mt-1 text-[var(--muted)]">@{session.username}</p>
          <div className="mt-8 grid gap-3">
            <Link className="primary-action flex items-center justify-center px-5" href="/order">커피 주문</Link>
            <button className="secondary-action px-5" onClick={logout}>로그아웃</button>
          </div>
        </section>
      </main>
    );
  }

  if (recoveryCode) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-5 py-12">
        <section className="panel p-6">
          <h1 className="text-3xl font-black">복구 코드를 저장하세요</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">PIN을 잊었을 때 필요합니다. 이 화면을 닫으면 다시 볼 수 없습니다.</p>
          <code className="mt-7 block rounded-xl bg-[var(--surface-soft)] p-5 text-center text-2xl font-black tracking-widest">{recoveryCode}</code>
          <button className="primary-action mt-6 w-full px-5" onClick={() => { window.location.href = "/order"; }}>저장했습니다</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 py-10">
      <Link className="font-black text-[var(--sbx-green-dark)]" href="/">Sozo Coffee</Link>
      <h1 className="mt-8 text-4xl font-black">
        {mode === "login" ? "로그인" : mode === "signup" ? "가입" : "PIN 재설정"}
      </h1>

      <div className="mt-6 grid grid-cols-3 rounded-full bg-[var(--surface-soft)] p-1">
        {([
          ["login", "로그인"],
          ["signup", "가입"],
          ["recover", "PIN 찾기"],
        ] as const).map(([value, label]) => (
          <button
            className={`rounded-full px-3 py-2 text-sm font-bold ${mode === value ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}
            key={value}
            onClick={() => { setMode(value); setMessage(""); }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <form className="panel mt-5 grid gap-4 p-6" onSubmit={submit}>
        {mode === "signup" ? (
          <>
            <label className="font-bold">표시 이름<input className="field mt-2" maxLength={40} name="displayName" required /></label>
            <label className="font-bold">초대 코드<input className="field mt-2" name="inviteCode" required /></label>
          </>
        ) : null}

        <label className="font-bold">
          유저네임
          <input autoCapitalize="none" className="field mt-2" maxLength={20} minLength={3} name="username" pattern="[a-z0-9_]+" required />
          {mode === "signup" ? <span className="mt-1 block text-xs font-normal text-[var(--muted)]">영문 소문자, 숫자, 밑줄 3~20자</span> : null}
        </label>

        {mode === "recover" ? (
          <label className="font-bold">복구 코드<input autoCapitalize="characters" className="field mt-2" name="recoveryCode" required /></label>
        ) : null}

        <label className="font-bold">
          {mode === "recover" ? "새 PIN" : "6자리 PIN"}
          <input className="field mt-2" inputMode="numeric" maxLength={6} name={mode === "recover" ? "newPin" : "pin"} pattern="\d{6}" required type="password" />
        </label>

        {mode !== "login" ? (
          <label className="font-bold">
            PIN 확인
            <input className="field mt-2" inputMode="numeric" maxLength={6} name={mode === "recover" ? "newPinConfirm" : "pinConfirm"} pattern="\d{6}" required type="password" />
          </label>
        ) : null}

        <button className="primary-action mt-2 px-5" disabled={pending}>
          {pending ? "처리 중…" : mode === "login" ? "로그인" : mode === "signup" ? "계정 만들기" : "PIN 재설정"}
        </button>
        {message ? <p className="text-center text-sm font-bold text-red-700">{message}</p> : null}
      </form>
    </main>
  );
}
