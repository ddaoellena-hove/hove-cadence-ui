import "./toggle.css";

export interface ToggleProps {
  /** Visual / functional state of the toggle. */
  state?: "default" | "hover" | "active" | "disabled";
  /** Optional extra class name for the root element. */
  className?: string;
  /** Optional extra class name for the thumb (knob) element. */
  thumbClassName?: string;
  /** Callback fired when the user clicks the toggle (only when not disabled). */
  onChange?: (nextActive: boolean) => void;
}

/**
 * Toggle (switch) component with four visual states: default, hover, active, and disabled.
 * Inspired by the Figma design reference.
 */
export const Toggle = ({
  state = "default",
  className,
  thumbClassName,
  onChange,
}: ToggleProps) => {
  const rootClass = ["toggle", state, className].filter(Boolean).join(" ");
  const thumbClass = ["toggle-thumb", thumbClassName].filter(Boolean).join(" ");

  const handleClick = () => {
    if (state === "disabled") return;
    onChange?.(state !== "active");
  };

  return (
    <div
      className={rootClass}
      role="switch"
      aria-checked={state === "active"}
      aria-disabled={state === "disabled"}
      tabIndex={state === "disabled" ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") handleClick();
      }}
    >
      <div className={thumbClass} />
    </div>
  );
};
