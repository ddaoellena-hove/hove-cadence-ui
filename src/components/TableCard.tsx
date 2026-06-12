import React, { useState } from "react";
import { Checkbox } from "./Checkbox";
import { Icons, type IconsProps } from "./Icons";
import { Tooltip } from "./Tooltip";
import "./table-card.css";

// ── TableCardAction ────────────────────────────────────────────────────────

export interface TableCardActionProps {
  /** Icon name (Icons component). */
  icon: IconsProps["icon"];
  /** Tooltip label shown on hover (white, below the button). */
  label: string;
  /** Click handler. */
  onClick?: () => void;
  /** Destructive styling (red). */
  destructive?: boolean;
}

/**
 * Small icon button for the TableCard actions slot.
 * Shows a white tooltip below on hover.
 */
export const TableCardAction = ({
  icon,
  label,
  onClick,
  destructive = false,
}: TableCardActionProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="table-card-action">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={[
          "table-card-action__btn",
          destructive ? "table-card-action__btn--destructive" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <Icons icon={icon} className="table-card-action__icon" iconMap="" />
      </button>
      {tooltipVisible && (
        <div className="table-card-action__tooltip">
          <Tooltip label={label} theme="light" arrow="top" />
        </div>
      )}
    </div>
  );
};

// ── TableCardColumn ────────────────────────────────────────────────────────

export interface TableCardColumn {
  /** Unique key for the column. */
  key: string;
  /** Column content. */
  content: React.ReactNode;
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
  iconElement?: React.ReactNode;
  /** Icon to the left of the title (Icons component name). */
  icon?: IconsProps["icon"];
  /** Checkbox state for multi-select. */
  checkboxState?: "unchecked" | "checked" | "indeterminate";
  /** Called when the checkbox is toggled. */
  onCheckboxChange?: (checked: boolean) => void;
  /**
   * Actions slot — rendered on the right side of the header.
   * Use <TableCardAction /> for consistent styling with built-in tooltip.
   */
  actions?: React.ReactNode;
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
  checkboxState = "unchecked",
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
    <div className={rootClass}>
      {/* ── Header (optional) ── */}
      {hasHeader && (
        <div className="table-card__header">
          <div className="table-card__header-left">
            <div className="table-card__checkbox">
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
              />
            </div>
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

            const style: React.CSSProperties = col.width
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
