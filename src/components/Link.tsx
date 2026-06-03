import type { MouseEventHandler, ReactNode } from "react";
import "./link.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LinkProps {
  /** Content of the link. */
  children: ReactNode;
  /** Destination URL. If omitted, renders as a styled `<button>`. */
  href?: string;
  /** Opens the link in a new tab and shows an external icon. */
  external?: boolean;
  /** Visual style variant. */
  variant?: "default" | "subtle" | "danger";
  /** Disables the link. */
  disabled?: boolean;
  /** Extra class name. */
  className?: string;
  /** Click handler. */
  onClick?: MouseEventHandler;
  /** Accessible label override. */
  "aria-label"?: string;
  /** Relationship attribute (for anchors). */
  rel?: string;
  /** Target attribute (for anchors). */
  target?: string;
}

// ── External icon ──────────────────────────────────────────────────────────────

const ExternalIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    aria-hidden="true"
    className="link__external-icon"
  >
    <path
      d="M2 9L9 2M9 2H4.5M9 2V6.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────

export const Link = ({
  children,
  href,
  external = false,
  variant = "default",
  disabled = false,
  className,
  onClick,
  rel,
  target,
  "aria-label": ariaLabel,
}: LinkProps) => {
  const classes = [
    "link",
    `link--${variant}`,
    disabled ? "link--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  if (!href || disabled) {
    return (
      <button
        type="button"
        className={classes}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled}
      >
        {children}
        {external && !disabled && <ExternalIcon />}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      rel={externalProps.rel ?? rel}
      target={externalProps.target ?? target}
    >
      {children}
      {external && <ExternalIcon />}
    </a>
  );
};
