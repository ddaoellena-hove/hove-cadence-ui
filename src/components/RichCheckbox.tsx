import "./rich-checkbox.css";

export interface RichCheckboxProps {
  /** Label text displayed inside the card. */
  label?: string;
  /** Optional description text displayed below the label. */
  description?: string;
  /** Visual state of the rich checkbox. */
  state?: "unchecked" | "hover" | "checked" | "disabled";
  /** Size variant of the card. */
  size?: "medium" | "large";
  /** Optional extra class name for the root element. */
  className?: string;
  /** Callback fired on click with the next checked value (only when not disabled). */
  onChange?: (nextChecked: boolean) => void;
}

/**
 * RichCheckbox — a pill-shaped card with an icon, label, and a checkbox indicator.
 * Multi-select counterpart of RichRadioButton; mirrors the Checkbox indicator.
 */
export const RichCheckbox = ({
  label = "Choice",
  description,
  state = "unchecked",
  size = "medium",
  className,
  onChange,
}: RichCheckboxProps) => {
  const rootClass = [
    "rich-checkbox",
    size === "large" ? "rich-checkbox--large" : null,
    description ? "rich-checkbox--with-description" : null,
    state,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (state === "disabled") return;
    onChange?.(!(state === "checked"));
  };

  return (
    <div
      className={rootClass}
      role="checkbox"
      aria-checked={state === "checked"}
      aria-disabled={state === "disabled"}
      tabIndex={state === "disabled" ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") handleClick();
      }}
    >
      {/* Person icon */}
      <svg
        className="rich-checkbox-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8ZM8 9.5C5.49375 9.5 2 10.755 2 13.25V14H14V13.25C14 10.755 10.5062 9.5 8 9.5Z"
          fill="currentColor"
        />
      </svg>

      {/* Label + optional description */}
      <span className="rich-checkbox-content">
        <span className="rich-checkbox-label">{label}</span>
        {description && (
          <span className="rich-checkbox-description">{description}</span>
        )}
      </span>

      {/* Checkbox indicator */}
      <div className="rich-checkbox-box" aria-hidden="true">
        {state === "checked" && <div className="rich-checkbox-tick" />}
      </div>
    </div>
  );
};
