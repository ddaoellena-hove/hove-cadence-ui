import "./rich-radio-button.css";

export interface RichRadioButtonProps {
  /** Label text displayed inside the button. */
  label?: string;
  /** Optional description text displayed below the label. */
  description?: string;
  /** Visual state of the rich radio button. */
  state?: "default" | "hover" | "selected" | "disabled";
  /** Size variant of the button. */
  size?: "medium" | "large";
  /** Optional extra class name for the root element. */
  className?: string;
  /** Callback fired when the user clicks the button (only when not disabled). */
  onChange?: () => void;
}

/**
 * RichRadioButton — a pill-shaped card with an icon, label, and a radio indicator.
 * Mirrors the four visual states of the RadioButton component.
 */
export const RichRadioButton = ({
  label = "Choice",
  description,
  state = "default",
  size = "medium",
  className,
  onChange,
}: RichRadioButtonProps) => {
  const rootClass = [
    "rich-radio-button",
    size === "large" ? "rich-radio-button--large" : null,
    state,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (state === "disabled") return;
    onChange?.();
  };

  return (
    <div
      className={rootClass}
      role="radio"
      aria-checked={state === "selected"}
      aria-disabled={state === "disabled"}
      tabIndex={state === "disabled" ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") handleClick();
      }}
    >
      {/* Person icon */}
      <svg
        className="rich-radio-button-icon"
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
      <span className="rich-radio-button-content">
        <span className="rich-radio-button-label">{label}</span>
        {description && (
          <span className="rich-radio-button-description">{description}</span>
        )}
      </span>

      {/* Radio indicator */}
      <div className="rich-radio-button-radio" aria-hidden="true">
        {state === "selected" && <div className="rich-radio-button-dot" />}
      </div>
    </div>
  );
};
