import type { ReactNode } from "react";
import "./breadcrumbs.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Unique identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** When provided, renders the item as an anchor. */
  href?: string;
  /** Click handler (used when href is not set). */
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /** Ordered list of breadcrumb items. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Custom separator node. Defaults to a chevron icon. */
  separator?: ReactNode;
  /** Class CSS additionnelle. */
  className?: string;
  /** Called when a breadcrumb is clicked, with its id. */
  onNavigate?: (id: string) => void;
}

// ── Default separator ──────────────────────────────────────────────────────────

const DefaultSeparator = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="breadcrumbs__separator-icon"
  >
    <path
      d="M5 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────

export const Breadcrumbs = ({
  items,
  separator,
  className,
  onNavigate,
}: BreadcrumbsProps) => {
  const sep = separator ?? <DefaultSeparator />;

  const rootClass = ["breadcrumbs", className].filter(Boolean).join(" ");

  return (
    <nav aria-label="Fil d'Ariane" className={rootClass}>
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          const handleClick = () => {
            if (isLast) return;
            item.onClick?.();
            onNavigate?.(item.id);
          };

          const content = (
            <>
              {item.icon && (
                <span className="breadcrumbs__item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="breadcrumbs__item-label">{item.label}</span>
            </>
          );

          return (
            <li key={item.id} className="breadcrumbs__item">
              {isLast ? (
                <span
                  className="breadcrumbs__link breadcrumbs__link--current"
                  aria-current="page"
                >
                  {content}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="breadcrumbs__link"
                  onClick={(e) => {
                    if (!item.href || item.href === "#") e.preventDefault();
                    handleClick();
                  }}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  className="breadcrumbs__link breadcrumbs__link--button"
                  onClick={handleClick}
                >
                  {content}
                </button>
              )}

              {!isLast && (
                <span className="breadcrumbs__separator" aria-hidden="true">
                  {sep}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
