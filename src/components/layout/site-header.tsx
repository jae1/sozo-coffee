import Link from "next/link";

export function SiteHeader({
  section,
  actions,
}: {
  section?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="flex items-center gap-3" href="/">
          <span className="brand-mark">S</span>
          <div>
            <p className="font-black leading-tight">Sozo Coffee</p>
            {section ? <p className="text-xs text-[var(--muted)]">{section}</p> : null}
          </div>
        </Link>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
