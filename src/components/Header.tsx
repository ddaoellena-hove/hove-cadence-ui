import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./Breadcrumbs";
import "./header.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  /** Main page title — rendered in Uxum Grotesque. */
  title: string;
  /** Optional breadcrumb trail displayed above the title. */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional subtitle / description below the title. */
  subtitle?: string;
  /** Optional slot for action buttons (top-right). */
  actions?: ReactNode;
  /** Extra class name. */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const Header = ({
  title,
  breadcrumbs,
  subtitle,
  actions,
  className,
}: HeaderProps) => {
  const rootClass = ["header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="header__breadcrumbs">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <div className="header__row">
        <div className="header__title-block">
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="header__actions">{actions}</div>}
      </div>
    </header>
  );
};
