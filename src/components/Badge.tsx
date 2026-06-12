import React from "react";
import "./badge.css";

export interface BadgeProps {
  /** Text content of the badge. */
  label: string;
  /**
   * Shows a drag handle on the left.
   * Wire up `onDragStart` / `onDragEnd` to handle reordering.
   */
  draggable?: boolean;
  /** Shows an × button on the right. */
  dismissible?: boolean;
  /** Switches the label font to Spline Sans Mono (for codes, IDs, technical values). */
  mono?: boolean;
  /** Called when the × button is clicked. */
  onDismiss?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Optional extra class name. */
  className?: string;
}

export const Badge = ({
  label,
  draggable = false,
  dismissible = false,
  mono = false,
  onDismiss,
  onDragStart,
  onDragEnd,
  className,
}: BadgeProps) => {
  const rootClass = [
    "badge",
    draggable ? "badge--draggable" : "",
    mono ? "badge--mono" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle — 6 dots */}
      {draggable && (
        <span className="badge__drag-handle" aria-hidden="true">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <circle cx="2" cy="2"  r="1.25" fill="currentColor" />
            <circle cx="6" cy="2"  r="1.25" fill="currentColor" />
            <circle cx="2" cy="6"  r="1.25" fill="currentColor" />
            <circle cx="6" cy="6"  r="1.25" fill="currentColor" />
            <circle cx="2" cy="10" r="1.25" fill="currentColor" />
            <circle cx="6" cy="10" r="1.25" fill="currentColor" />
          </svg>
        </span>
      )}

      <span className="badge__label">{label}</span>

      {/* Dismiss button — × */}
      {dismissible && (
        <button
          type="button"
          className="badge__dismiss"
          aria-label={`Supprimer ${label}`}
          onClick={onDismiss}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
