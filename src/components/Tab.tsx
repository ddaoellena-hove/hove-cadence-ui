import "./tab.css";

export interface TabProps {
  /** Tab label text. */
  label: string;
  /** Visual state of the tab. */
  variant?: "default" | "active";
  /** Click handler. */
  onClick?: () => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Optional extra class name. */
  className?: string;
}

export const Tab = ({
  label,
  variant = "default",
  onClick,
  disabled = false,
  className,
}: TabProps) => {
  const rootClass = [
    "tab",
    `tab--${variant}`,
    disabled ? "tab--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
      aria-selected={variant === "active"}
      role="tab"
    >
      <span className="tab__label">{label}</span>
      {variant === "active" && <span className="tab__underline" aria-hidden="true" />}
    </button>
  );
};
