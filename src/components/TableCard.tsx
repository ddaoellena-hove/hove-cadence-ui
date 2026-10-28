import type { CSSProperties, ReactNode } from "react";
import { Checkbox } from "./Checkbox";
import { Icons, type IconsProps } from "./Icons";
import "./table-card.css";

// ── TableCardColumn ────────────────────────────────────────────────────────

export interface TableCardColumn {
  /** Unique key for the column. */
  key: string;
  /** Column content. */
  content: ReactNode;
  /** Fixed width in px. Mutually exclusive with flex. */
  width?: number;
  /**
   * flex-grow value — use 1 to fill remaining space.
   * Mutually exclusive with width.
   */
  flex?: number;
}

// ── TableCard ──────────────────────────────────────────────────────────────

export interface TableCardProps {
  /** Title displayed in the header. When absent (along with icon and actions), the header is not rendered. */
  title?: string;
  /**
   * Custom icon element (SVG, img, etc.) — takes precedence over `icon`.
   * Render at 16×16 for best alignment with the title.
   */
  iconElement?: ReactNode;
  /** Icon to the left of the title (Icons component name). */
  icon?: IconsProps["icon"];
  /** Checkbox state for multi-select. */
  selectable?: boolean;
  checkboxState?: "unchecked" | "checked" | "indeterminate";
  /** Nom accessible de la case. Défaut : « Sélectionner {title} », sinon « Sélectionner la ligne ». */
  checkboxLabel?: string;
  /** Called when the checkbox is toggled. */
  onCheckboxChange?: (checked: boolean) => void;
  /**
   * Actions slot — rendered on the right side of the header.
   * Utiliser des GhostButton icône seule : size="sm", icon + aria-label (infobulle intégrée), tone="danger" pour supprimer.
   */
  actions?: ReactNode;
  /** Body columns. */
  columns?: TableCardColumn[];
  /** Visual state of the card. */
  state?: "default" | "selected" | "disabled";
  /** Optional extra class name. */
  className?: string;
}

export const TableCard = ({
  title,
  iconElement,
  icon,
  selectable = true,
  checkboxState = "unchecked",
  checkboxLabel,
  onCheckboxChange,
  actions,
  columns = [],
  state = "default",
  className,
}: TableCardProps) => {
  const rootClass = [
    "table-card",
    state !== "default" ? `table-card--${state}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasHeader = title || iconElement || icon || actions;

  return (
    // Carte désactivée : signalée aux technologies d'assistance (et exemptée
    // du contraste minimal, comme tout composant inactif).
    <div className={rootClass} aria-disabled={state === "disabled" || undefined}>
      {/* ── Header (optional) ── */}
      {hasHeader && (
        <div className="table-card__header">
          <div className="table-card__header-left">
            {selectable && <div className="table-card__checkbox">
              <Checkbox
                state={
                  state === "disabled"
                    ? "disabled"
                    : checkboxState === "checked"
                      ? "checked"
                      : checkboxState === "indeterminate"
                        ? "indeterminate"
                        : "unchecked"
                }
                onChange={onCheckboxChange}
                aria-label={checkboxLabel ?? (title ? `Sélectionner ${title}` : "Sélectionner la ligne")}
              />
            </div>}
            {(iconElement || icon) && (
              <span className="table-card__icon">
                {iconElement ?? <Icons icon={icon!} className="" iconMap="" />}
              </span>
            )}
            {title && <span className="table-card__title">{title}</span>}
          </div>

          {actions && (
            <div className="table-card__header-actions">{actions}</div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {columns.length > 0 && (
        <div className="table-card__body">
          {columns.map((col) => {
            const colClass = [
              "table-card__column",
              col.flex ? "table-card__column--flex" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const style: CSSProperties = col.width
              ? { width: col.width, minWidth: col.width }
              : col.flex
                ? { flexGrow: col.flex }
                : {};

            return (
              <div key={col.key} className={colClass} style={style}>
                {col.content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
