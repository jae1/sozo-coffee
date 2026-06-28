"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { FormEvent, useState } from "react";

type Mode = "signin" | "signup";

export function LoginPageExperience() {
  const [mode, setMode] = useState<Mode>("signin");
  const [resetOpen, setResetOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function goToRoleLanding() {
    const response = await fetch("/api/auth/landing", { cache: "no-store" });
    const data = response.ok ? await response.json() : { path: "/order" };
    window.location.href = typeof data.path === "string" ? data.path : "/order";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createBrowserSupabaseClient();

    if (resetOpen) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      setPending(false);
      setMessage(error ? error.message : "Check your email for a password reset link.");
      return;
    }

    if (mode === "signup") {
      const displayName = String(form.get("displayName") ?? "").trim();
      const passwordConfirm = String(form.get("passwordConfirm") ?? "");
      if (password !== passwordConfirm) {
        setPending(false);
        setMessage("Passwords do not match.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setPending(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (!data.session) {
        setMessage("Check your email to confirm your account.");
        return;
      }
      await goToRoleLanding();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      setMessage("Email or password is incorrect.");
      return;
    }
    await goToRoleLanding();
  }

  return (
    <main className="login-page login-page--simple">
      <section className="login-page__form">
        <div className="w-full max-w-md">
          <span className="brand-mark">S</span>
          <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-[var(--sbx-green)]">Sozo Coffee</p>
          <h1 className="auth-title">
            {resetOpen ? "Reset your password" : mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>

          {!resetOpen ? (
            <div className="auth-segmented">
              {([
                ["signin", "Sign in"],
                ["signup", "Sign up"],
              ] as const).map(([value, label]) => (
                <button
                  className={mode === value ? "is-active" : ""}
                  key={value}
                  onClick={() => { setMode(value); setMessage(""); }}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <form className="mt-7 grid gap-4" onSubmit={submit}>
            {!resetOpen && mode === "signup" ? (
              <>
                <label className="sr-only" htmlFor="auth-name">Name</label>
                <input autoComplete="name" className="field auth-field" id="auth-name" maxLength={40} name="displayName" placeholder="Name" required />
              </>
            ) : null}

            <label className="sr-only" htmlFor="auth-email">Email</label>
            <input autoCapitalize="none" autoComplete="email" className="field auth-field" id="auth-email" name="email" placeholder="Email" required type="email" />

            {!resetOpen ? (
              <>
                <label className="sr-only" htmlFor="auth-password">Password</label>
                <input autoComplete={mode === "signup" ? "new-password" : "current-password"} className="field auth-field" id="auth-password" minLength={8} name="password" placeholder="Password" required type="password" />
              </>
            ) : null}

            {!resetOpen && mode === "signup" ? (
              <>
                <label className="sr-only" htmlFor="auth-password-confirm">Confirm password</label>
                <input autoComplete="new-password" className="field auth-field" id="auth-password-confirm" minLength={8} name="passwordConfirm" placeholder="Confirm password" required type="password" />
              </>
            ) : null}

            {!resetOpen && mode === "signin" ? (
              <button className="justify-self-end text-sm font-bold text-[var(--sbx-green)]" onClick={() => { setResetOpen(true); setMessage(""); }} type="button">
                Forgot password?
              </button>
            ) : null}

            <button className="primary-action mt-2 min-h-14 px-5 text-base" disabled={pending}>
              {pending ? "Please wait…" : resetOpen ? "Send reset link" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            {message ? <p aria-live="polite" className="rounded-xl bg-[var(--surface-soft)] p-3 text-center text-sm font-bold">{message}</p> : null}
          </form>

          {resetOpen ? (
            <button className="mt-5 w-full text-sm font-bold text-[var(--muted)]" onClick={() => { setResetOpen(false); setMessage(""); }} type="button">
              Back to sign in
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
