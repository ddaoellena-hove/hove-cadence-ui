import { useId, type KeyboardEvent, type ReactNode } from "react";
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
  /** Nom accessible (sans label visible associé). */
  "aria-label"?: string;
  /** Libellé cliquable à côté du bouton. La ligne entière devient le bouton radio. */
  label?: string;
  /** Précision sous le libellé. */
  description?: string;
  /** Complément décoratif après le libellé (badge de ligne). Non interactif. */
  aside?: ReactNode;
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
  "aria-label": ariaLabel,
  label,
  description,
  aside,
}: RadioButtonProps) => {
  const uid = useId();
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

  // Un seul rôle radio : avec libellé, il porte sur la ligne, et le bouton
  // dessiné reste décoratif (annonce unique, clic sur le texte).
  const control = {
    role: "radio",
    "aria-checked": state === "selected",
    "aria-disabled": state === "disabled",
    tabIndex: state === "disabled" ? -1 : 0,
    onClick: handleClick,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    },
  };

  if (label) {
    return (
      <div
        {...control}
        className={`radio-row${state === "disabled" ? " radio-row--disabled" : ""}`}
        aria-labelledby={`${uid}-label`}
        aria-describedby={description ? `${uid}-description` : undefined}
      >
        <div className={rootClass} aria-hidden="true">
          {hasInner && <div className={innerClass} />}
        </div>
        <span className="radio-row__text">
          <span id={`${uid}-label`} className="radio-row__label">{label}</span>
          {description && <span id={`${uid}-description`} className="radio-row__description">{description}</span>}
        </span>
        {aside && <span className="radio-row__aside" aria-hidden="true">{aside}</span>}
      </div>
    );
  }

  return (
    <div {...control} className={rootClass} aria-label={ariaLabel}>
      {hasInner && <div className={innerClass} />}
    </div>
  );
};
