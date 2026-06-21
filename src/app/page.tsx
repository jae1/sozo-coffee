import Link from "next/link";

function ArrowIcon() {
  return <span aria-hidden="true" className="text-xl">→</span>;
}

export default function HomePage() {
  return (
    <main className="app-shell flex items-center justify-center p-4 sm:p-8">
      <section className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col bg-[var(--ink)] p-7 text-white sm:p-12">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white font-black text-[var(--ink)]">S</span>
              <span className="text-lg font-extrabold">Sozo Coffee</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-[var(--canvas)] p-6 sm:p-12">
            <Link className="group panel flex min-h-36 items-center justify-between p-6 transition-transform hover:-translate-y-0.5" href="/order">
              <div>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--green-soft)] text-xl">☕</span>
                <h2 className="text-2xl font-black tracking-tight">커피 주문</h2>
              </div>
              <ArrowIcon />
            </Link>
            <Link className="group panel flex min-h-36 items-center justify-between p-6 transition-transform hover:-translate-y-0.5" href="/barista">
              <div>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-[var(--orange-soft)] text-xl">◫</span>
                <h2 className="text-2xl font-black tracking-tight">바리스타</h2>
              </div>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
