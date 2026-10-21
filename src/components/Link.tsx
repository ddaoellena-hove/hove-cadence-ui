import React from "react";
import { warnOnce } from "./button-compat";
import "./link.css";

export interface LinkProps {
  /** Link text content */
  children: React.ReactNode;
  /** Optional icon element rendered before the text */
  icon?: React.ReactNode;
  /** URL destination */
  href?: string;
  /**
   * Variante : "primary" (lien, --cadence-color-link), "destructive"
   * (--cadence-color-danger-text), "inverse" (sur fond sombre).
   * `"secondary"` est déprécié : identique à "primary".
   */
  variant?: "primary" | "secondary" | "destructive" | "inverse";
  /** Size of the link text */
  size?: "sm" | "md" | "lg";
  /** Whether the link is disabled */
  disabled?: boolean;
  /** Open in new tab */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** Optional click handler (renders as button if no href) */
  onClick?: (e: React.MouseEvent) => void;
  /** Additional class name */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Hide the default arrow icon (useful when used as a plain text button) */
  hideArrow?: boolean;
}

export const Link = ({
  children,
  icon,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  target,
  onClick,
  className = "",
  style,
  hideArrow = false,
}: LinkProps) => {
  // "secondary" n'a jamais différé de "primary" : alias déprécié
  if (variant === "secondary") {
    warnOnce("Link", "secondary", '`variant="secondary"` est déprécié : utilisez `"primary"` (rendu identique).');
  }
  const resolvedVariant = variant === "secondary" ? "primary" : variant;

  const classes = [
    "link",
    `link--${resolvedVariant}`,
    !href ? "link--action" : "",
    `link--${size}`,
    disabled ? "link--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rel = target === "_blank" ? "noopener noreferrer" : undefined;

  const arrow = (
    <svg
      className="link__arrow"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 14L14 6M14 6H7M14 6V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!href) {
    return (
      <button
        type="button"
        className={classes}
        style={style}
        disabled={disabled}
        onClick={onClick}
      >
        {icon && <span className="link__icon">{icon}</span>}
        {children}
        {!icon && !hideArrow && arrow}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      style={style}
      target={target}
      rel={rel}
      onClick={onClick}
      aria-disabled={disabled || undefined}
    >
      {icon && <span className="link__icon">{icon}</span>}
      {children}
      {!icon && !hideArrow && arrow}
    </a>
  );
};
