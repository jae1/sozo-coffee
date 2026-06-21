import Link from "next/link";

function ArrowIcon() {
  return <span aria-hidden="true" className="text-xl">→</span>;
}

export default function HomePage() {
  return (
    <main className="app-shell flex items-center justify-center p-4 sm:p-8">
      <section className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between bg-[var(--ink)] p-7 text-white sm:p-12">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white font-black text-[var(--ink)]">S</span>
              <span className="text-lg font-extrabold">Sozo Coffee</span>
            </div>
            <div className="py-16 lg:py-8">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-white/55">Home church coffee</p>
              <h1 className="max-w-xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-7xl">
                Coffee made for people we love.
              </h1>
              <p className="mt-7 max-w-md text-lg leading-7 text-white/65">
                Place your drink, watch the queue, and let the barista keep the espresso flowing.
              </p>
            </div>
            <p className="text-sm text-white/40">Simple orders. Happier Sundays.</p>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-[var(--canvas)] p-6 sm:p-12">
            <p className="eyebrow mb-2">Choose your station</p>
            <Link className="group panel flex min-h-36 items-center justify-between p-6 transition-transform hover:-translate-y-0.5" href="/order">
              <div>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--green-soft)] text-xl">☕</span>
                <h2 className="text-2xl font-black tracking-tight">Order coffee</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Choose your drink and join the queue.</p>
              </div>
              <ArrowIcon />
            </Link>
            <Link className="group panel flex min-h-36 items-center justify-between p-6 transition-transform hover:-translate-y-0.5" href="/barista">
              <div>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--orange-soft)] text-xl">◫</span>
                <h2 className="text-2xl font-black tracking-tight">Barista station</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Open a session and work the queue.</p>
              </div>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
