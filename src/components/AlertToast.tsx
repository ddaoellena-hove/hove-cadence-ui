/**
 * AlertToast component.
 *
 * A notification toast supporting information, success, warning, and error
 * types with an optional progress bar, close button, and action buttons.
 */
import React from "react";
import { SecondaryButton } from "./SecondaryButton";
import "./alert-toast.css";

/** Visual type of the toast, controls the accent color and status icon. */
export type AlertToastType = "information" | "success" | "warning" | "error";

/** An action button rendered inside the toast. */
export interface AlertToastAction {
  /** Button label text. */
  label: string;
  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Render the button as an outline ghost button. */
  outline?: boolean;
}

export interface AlertToastProps {
  /** Semantic type — drives the accent color and status icon. */
  type?: AlertToastType;

  /** Primary bold heading of the toast. Defaults to the type label. */
  title?: string;

  /** Secondary descriptive text below the title. */
  description?: string;

  /**
   * Progress value between 0 and 100.
   * When provided a progress bar is shown at the bottom of the card.
   * When omitted the progress bar is hidden.
   */
  progress?: number;

  /**
   * Up to two action buttons to render at the bottom of the body.
   * When provided the close button is shown automatically.
   */
  actions?: [AlertToastAction] | [AlertToastAction, AlertToastAction];

  /**
   * Whether to show the close (×) button.
   * Automatically `true` when `actions` are provided.
   */
  dismissible?: boolean;

  /** Callback fired when the close button is clicked. */
  onDismiss?: () => void;

  /** Optional extra class name applied to the root element. */
  className?: string;

  /** Inline style escape hatch. */
  style?: React.CSSProperties;
}

const STATE_ICON_SRC: Record<AlertToastType, string> = {
  information: "https://c.animaapp.com/moikuwj0tZN1W0/img/state-information--size-medium.svg",
  success: "https://c.animaapp.com/moikuwj0tZN1W0/img/state-success--size-medium.svg",
  warning: "https://c.animaapp.com/moikuwj0tZN1W0/img/state-warning--size-medium.svg",
  error: "https://c.animaapp.com/moikuwj0tZN1W0/img/state-indicator.svg",
};

const DEFAULT_TITLE: Record<AlertToastType, string> = {
  information: "Information",
  success: "Success",
  warning: "Warning",
  error: "Error",
};

/**
 * AlertToast renders a compact notification card with a coloured left-accent
 * strip, a status icon, a title + description, an optional progress bar, and
 * optional inline action buttons.
 */
export const AlertToast = ({
  type = "information",
  title,
  description = "Lorem ipsum dolor sit amet consectetur. Enim mauris pretium est est ut aliquam dolor egestas non.",
  progress,
  actions,
  dismissible = false,
  onDismiss,
  className,
  style,
}: AlertToastProps) => {
  const showDismiss = dismissible || Boolean(actions?.length);
  const resolvedTitle = title ?? DEFAULT_TITLE[type];
  const showProgress = typeof progress === "number";

  const rootClass = [
    "alert-toast",
    `alert-toast--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={{ ...style, flexWrap: "wrap" }} role="alert" aria-live="polite">
      {/* Left accent bar */}
      <div className="alert-toast__accent" aria-hidden="true" />

      {/* Status icon */}
      <div className="alert-toast__icon-col">
        <img
          className="alert-toast__state-icon"
          src={STATE_ICON_SRC[type]}
          alt={`${type} icon`}
        />
      </div>

      {/* Main body */}
      <div className="alert-toast__body">
        <div className="alert-toast__text">
          <p className="alert-toast__title">{resolvedTitle}</p>
          {description && (
            <p className="alert-toast__description">{description}</p>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="alert-toast__actions">
            {actions.map((action, idx) => (
              <SecondaryButton
                key={idx}
                label={action.label}
                outline={action.outline ?? idx === 0}
                onClick={action.onClick}
                state="enabled"
                withIcon="no"
                destructive={false}
              />
            ))}
          </div>
        )}

        {!showProgress && !actions && <div style={{ height: 12 }} />}
      </div>

      {/* Close button */}
      {showDismiss && (
        <div className="alert-toast__close-col">
          <button
            className="alert-toast__close-btn"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            type="button"
          >
            <img
              className="alert-toast__close-icon"
              src="https://c.animaapp.com/moikuwj0tZN1W0/img/x-close.svg"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Full-width progress bar — outside flex row, spans entire card width */}
      {showProgress && (
        <div className="alert-toast__progress-track" aria-hidden="true">
          <div
            className="alert-toast__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
