"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { FormEvent, useState } from "react";

export function ResetPasswordExperience() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const { error } = await createBrowserSupabaseClient().auth.updateUser({ password });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    window.location.href = "/order";
  }

  return (
    <main className="login-page login-page--simple">
      <section className="login-page__form">
        <div className="w-full max-w-md">
          <span className="brand-mark">S</span>
          <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-[var(--sbx-green)]">Sozo Coffee</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Choose a new password</h1>
          <form className="mt-8 grid gap-5" onSubmit={submit}>
            <label className="font-bold">New password<input autoComplete="new-password" className="field mt-2" minLength={8} name="password" required type="password" /></label>
            <button className="primary-action min-h-14 px-5" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>
            {message ? <p className="text-center text-sm font-bold text-red-700">{message}</p> : null}
          </form>
        </div>
      </section>
    </main>
  );
}
