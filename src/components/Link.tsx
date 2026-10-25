// Alias « React… » : un type importé sous le nom d’un type DOM global est mal
// renommé par le regroupement des déclarations (build:types).
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import "./link.css";

export interface LinkProps {
  /** Link text content */
  children: ReactNode;
  /** Optional icon element rendered before the text */
  icon?: ReactNode;
  /** URL destination */
  href?: string;
  /**
   * Variante : "primary" (lien, --cadence-color-link), "destructive"
   * (--cadence-color-danger-text), "inverse" (sur fond sombre).
   */
  variant?: "primary" | "destructive" | "inverse";
  /** Size of the link text */
  size?: "sm" | "md" | "lg";
  /** Whether the link is disabled */
  disabled?: boolean;
  /** Open in new tab */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** Optional click handler (renders as button if no href) */
  onClick?: (e: ReactMouseEvent) => void;
  /** Additional class name */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
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
  const classes = [
    "link",
    `link--${variant}`,
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
