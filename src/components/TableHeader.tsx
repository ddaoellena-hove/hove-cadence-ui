import type { CSSProperties } from "react";
import "./table-header.css";
import { SortIcon } from "./SortIcon";

// ── Column definition ──────────────────────────────────────────────────────

export interface TableHeaderColumn {
  key: string;
  /** Label text — will be rendered in uppercase via CSS. */
  label: string;
  /** Nom lu quand `label` est vide (colonne de sélection…). Défaut « Sélection ». */
  ariaLabel?: string;
  /** Whether this column can be sorted. Default false. */
  sortable?: boolean;
  /** Current sort direction. Default "none". */
  sortDirection?: "asc" | "desc" | "none";
  /** Called when the column header is clicked (only when sortable). */
  onSort?: () => void;
  /** Fixed width in px. Mutually exclusive with flex. */
  width?: number;
  /** flex-grow value. Mutually exclusive with width. */
  flex?: number;
}

// ── TableHeader ────────────────────────────────────────────────────────────

export interface TableHeaderProps {
  columns: TableHeaderColumn[];
  /** Optional class name. */
  className?: string;
}

export const TableHeader = ({ columns, className }: TableHeaderProps) => {
  const rootClass = ["table-header", className].filter(Boolean).join(" ");

  return (
    // role="table" > role="row" : une rangée d'en-têtes de colonnes exige ces
    // parents ARIA. La rangée est en display: contents (mise en page inchangée).
    <div className={rootClass} role="table" aria-label="En-têtes de colonnes">
      <div className="table-header__row" role="row">
      {columns.map((col) => {
        const style: CSSProperties = col.width
          ? { width: col.width, minWidth: col.width, flexShrink: 0 }
          : col.flex
            ? { flexGrow: col.flex, flexShrink: 1, minWidth: 0 }
            : { flexShrink: 0 };

        const cellClass = [
          "table-header__cell",
          col.sortable ? "table-header__cell--sortable" : "",
          col.sortDirection === "asc" || col.sortDirection === "desc"
            ? "table-header__cell--active"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={col.key}
            className={cellClass}
            style={style}
            role="columnheader"
            aria-sort={
              col.sortable
                ? col.sortDirection === "asc"
                  ? "ascending"
                  : col.sortDirection === "desc"
                    ? "descending"
                    : "none"
                : undefined
            }
            onClick={col.sortable ? col.onSort : undefined}
          >
            {col.label ? (
              <span className="table-header__label">{col.label}</span>
            ) : (
              <span className="table-header__sr">{col.ariaLabel ?? "Sélection"}</span>
            )}
            {col.sortable && (
              <SortIcon direction={col.sortDirection ?? "none"} className="table-header__sort-icon" />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
};
