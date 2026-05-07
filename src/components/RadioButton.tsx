import "./radio-button.css";

export interface RadioButtonProps {
  /** Visual state of the radio button. */
  state?: "default" | "hover" | "selected" | "disabled";
  /** Optional extra class name for the root element. */
  className?: string;
  /** Optional extra class name for the inner element. */
  innerClassName?: string;
  /** Callback fired when the user clicks the radio button (only when not disabled). */
  onChange?: () => void;
}

/**
 * RadioButton component with four visual states: default, hover, selected, and disabled.
 * Directly inspired by the Figma design reference.
 */
export const RadioButton = ({
  state = "default",
  className,
  innerClassName,
  onChange,
}: RadioButtonProps) => {
  const hasInner = ["hover", "selected", "disabled"].includes(state);

  const rootClass = ["radio-button", state, className]
    .filter(Boolean)
    .join(" ");

  const innerClass = ["radio-button-inner", innerClassName]
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
      {hasInner && <div className={innerClass} />}
    </div>
  );
};
