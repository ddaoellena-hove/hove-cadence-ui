import "./checkbox.css";

export interface CheckboxProps {
  /** Visual / functional state of the checkbox. */
  state?: "unchecked" | "hover" | "checked" | "indeterminate" | "disabled" | "disabled-checked";
  /** Optional extra class name for the root element. */
  className?: string;
  /** Optional extra class name for the inner indicator element. */
  innerClassName?: string;
  /** Callback fired when the user clicks the checkbox (only when not disabled). */
  onChange?: (nextChecked: boolean) => void;
  /** Nom accessible (ex. « Sélectionner la ligne »). Recommandé quand aucun texte n'accompagne la case. */
  "aria-label"?: string;
}

/**
 * Checkbox component with six visual states: unchecked, hover, checked,
 * indeterminate, disabled, and disabled-checked.
 * Inspired by the Figma design reference.
 */
export const Checkbox = ({
  state = "unchecked",
  className,
  innerClassName,
  onChange,
  "aria-label": ariaLabel,
}: CheckboxProps) => {
  const isChecked = state === "checked" || state === "disabled-checked";
  const isIndeterminate = state === "indeterminate";
  const isDisabled = state === "disabled" || state === "disabled-checked";
  const hasInner = state === "hover" || isChecked || isIndeterminate;

  const rootClass = ["checkbox", state, className].filter(Boolean).join(" ");
  const innerClass = ["checkbox-inner", innerClassName].filter(Boolean).join(" ");

  const handleClick = () => {
    if (isDisabled) return;
    onChange?.(!(state === "checked"));
  };

  return (
    <div
      className={rootClass}
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isChecked}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {hasInner && <div className={innerClass} />}
    </div>
  );
};
