import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-5 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--coffee)]">
        Home church coffee
      </p>
      <h1 className="text-5xl font-black tracking-tight">Sozo Coffee</h1>
      <p className="text-lg text-black/65">Pick your side of the counter.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link className="rounded-2xl bg-[var(--espresso)] px-5 py-4 font-bold text-white" href="/order">
          Order coffee
        </Link>
        <Link className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-4 font-bold" href="/barista">
          Barista queue
        </Link>
      </div>
    </main>
  );
}
