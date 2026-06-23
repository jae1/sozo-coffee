"use client";

import type { MemberSession } from "@/lib/auth/member-session";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function HomeExperience({ session }: { session: MemberSession | null }) {
  const [loginOpen, setLoginOpen] = useState(!session);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/member/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setMessage(payload?.error?.message ?? "Unable to sign in.");
      return;
    }
    window.location.href = "/order";
  }

  return (
    <main className="home-site">
      <header className="home-nav">
        <Link className="flex items-center gap-3" href="/">
          <span className="brand-mark">S</span>
          <span className="text-lg font-black">Sozo Coffee</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link className="home-account-link" href="/account">{session.displayName}</Link>
          ) : (
            <button className="home-account-link" onClick={() => setLoginOpen(true)} type="button">Sign in</button>
          )}
          <Link className="primary-action flex min-h-11 items-center px-5" href="/order">Order now</Link>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow text-white/65">Freshly made for pickup</p>
          <h1>Good coffee.<br />Made for you.</h1>
          <p className="home-hero__copy">Choose your drink, customize it, and we’ll let you know when it’s ready.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="home-light-action" href="/order">Start an order <span aria-hidden="true">→</span></Link>
            {session?.role === "barista" || session?.role === "admin" ? (
              <Link className="home-ghost-action" href="/barista">Barista station</Link>
            ) : null}
          </div>
        </div>
        <div className="home-hero__art" aria-hidden="true">
          <div className="home-cup">
            <span>S</span>
          </div>
          <div className="home-bean home-bean--one" />
          <div className="home-bean home-bean--two" />
        </div>
      </section>

      <section className="home-menu-preview">
        <div>
          <p className="eyebrow">Today’s menu</p>
          <h2>Pick your favorite.</h2>
        </div>
        <div className="home-drinks">
          {[
            ["Americano", "/americano.png"],
            ["Latte", "/latte.png"],
            ["Mocha", "/mocha.png"],
          ].map(([name, image]) => (
            <Link className="home-drink" href="/order" key={name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={image} />
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {loginOpen ? (
        <div className="login-overlay" role="presentation">
          <section aria-labelledby="login-title" aria-modal="true" className="login-dialog" role="dialog">
            <button aria-label="Close sign in" className="login-close" onClick={() => setLoginOpen(false)} type="button">×</button>
            <div className="mb-7">
              <span className="brand-mark">S</span>
              <p className="mt-6 text-sm font-bold text-[var(--sbx-green)]">WELCOME BACK</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]" id="login-title">Sign in to Sozo</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Order ahead and get notified when your coffee is ready.</p>
            </div>
            <form className="grid gap-4" onSubmit={login}>
              <label className="text-sm font-bold">
                Username
                <input autoCapitalize="none" autoComplete="username" autoFocus className="field mt-2" name="username" required />
              </label>
              <label className="text-sm font-bold">
                PIN
                <input autoComplete="current-password" className="field mt-2" inputMode="numeric" maxLength={6} name="pin" pattern="\d{6}" required type="password" />
              </label>
              <button className="primary-action mt-2 min-h-13 px-5 text-base" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </button>
              {message ? <p aria-live="polite" className="text-center text-sm font-bold text-red-700">{message}</p> : null}
            </form>
            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-5 text-sm">
              <Link className="font-bold text-[var(--sbx-green)]" href="/account">Create account</Link>
              <Link className="font-bold text-[var(--muted)]" href="/account">Forgot PIN?</Link>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
