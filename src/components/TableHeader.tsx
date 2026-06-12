import React from "react";
import "./table-header.css";

// ── Sort icon ──────────────────────────────────────────────────────────────

const SortIcon = ({ direction }: { direction: "asc" | "desc" | "none" }) => (
  <svg
    className="table-header__sort-icon"
    width="10"
    height="14"
    viewBox="0 0 10 14"
    fill="none"
    aria-hidden="true"
  >
    {/* Arrow up */}
    <path
      d="M5 1L1.5 5.5H8.5L5 1Z"
      fill={direction === "asc" ? "#002830" : "#c5cfd3"}
    />
    {/* Arrow down */}
    <path
      d="M5 13L8.5 8.5H1.5L5 13Z"
      fill={direction === "desc" ? "#002830" : "#c5cfd3"}
    />
  </svg>
);

// ── Column definition ──────────────────────────────────────────────────────

export interface TableHeaderColumn {
  key: string;
  /** Label text — will be rendered in uppercase via CSS. */
  label: string;
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
    <div className={rootClass} role="row">
      {columns.map((col) => {
        const style: React.CSSProperties = col.width
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
            <span className="table-header__label">{col.label}</span>
            {col.sortable && (
              <SortIcon direction={col.sortDirection ?? "none"} />
            )}
          </div>
        );
      })}
    </div>
  );
};
