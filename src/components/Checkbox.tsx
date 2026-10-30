import { useId, type KeyboardEvent, type ReactNode } from "react";
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
  /** Libellé cliquable à côté de la case. La ligne entière devient la case à cocher. */
  label?: string;
  /** Précision sous le libellé. */
  description?: string;
  /** Complément décoratif après le libellé (badge de ligne). Non interactif. */
  aside?: ReactNode;
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
  label,
  description,
  aside,
}: CheckboxProps) => {
  const uid = useId();
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

  // Un seul rôle checkbox : avec libellé, il porte sur la ligne, et la case
  // dessinée reste décorative (annonce unique, clic sur le texte).
  const control = {
    role: "checkbox",
    "aria-checked": isIndeterminate ? ("mixed" as const) : isChecked,
    "aria-disabled": isDisabled,
    tabIndex: isDisabled ? -1 : 0,
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
        className={`checkbox-row${isDisabled ? " checkbox-row--disabled" : ""}`}
        aria-labelledby={`${uid}-label`}
        aria-describedby={description ? `${uid}-description` : undefined}
      >
        <div className={rootClass} aria-hidden="true">
          {hasInner && <div className={innerClass} />}
        </div>
        <span className="checkbox-row__text">
          <span id={`${uid}-label`} className="checkbox-row__label">{label}</span>
          {description && <span id={`${uid}-description`} className="checkbox-row__description">{description}</span>}
        </span>
        {aside && <span className="checkbox-row__aside" aria-hidden="true">{aside}</span>}
      </div>
    );
  }

  return (
    <div {...control} className={rootClass} aria-label={ariaLabel}>
      {hasInner && <div className={innerClass} />}
    </div>
  );
};
