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
        <Link className="site-brand" href="/">
          <span className="brand-mark">S</span>
          <div className="site-brand__text">
            <p>Sozo Coffee</p>
            {section ? <span>{section}</span> : null}
          </div>
        </Link>
        {actions ? <div className="site-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
