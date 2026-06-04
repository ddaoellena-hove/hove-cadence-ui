import { useState } from "react";
import "./counter-input.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CounterInputProps {
  /** Valeur courante (mode contrôlé). */
  value?: number;
  /** Valeur initiale (mode non contrôlé). */
  defaultValue?: number;
  /** Valeur minimale autorisée. */
  min?: number;
  /** Valeur maximale autorisée. */
  max?: number;
  /** Pas d'incrément / décrément. */
  step?: number;
  /** Unité affichée à droite de la valeur (ex : "s", "m", "km"). */
  unit?: string;
  /** Désactive le composant. */
  disabled?: boolean;
  /** Appelé à chaque changement avec la nouvelle valeur. */
  onChange?: (value: number) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const CounterInput = ({
  value: valueProp,
  defaultValue = 0,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
  onChange,
  className,
}: CounterInputProps) => {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = isControlled ? valueProp! : internalValue;

  const update = (next: number) => {
    if (min !== undefined && next < min) return;
    if (max !== undefined && next > max) return;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const canDecrement = min === undefined || current - step >= min;
  const canIncrement = max === undefined || current + step <= max;

  const rootClass = ["counter-input", disabled ? "counter-input--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="group" aria-label="Compteur">
      <button
        type="button"
        className="counter-input__btn counter-input__btn--dec"
        onClick={() => update(current - step)}
        disabled={disabled || !canDecrement}
        aria-label="Décrémenter"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="counter-input__value" aria-live="polite" aria-atomic="true">
        <span className="counter-input__number">{current}</span>
        {unit && <span className="counter-input__unit">{unit}</span>}
      </div>

      <button
        type="button"
        className="counter-input__btn counter-input__btn--inc"
        onClick={() => update(current + step)}
        disabled={disabled || !canIncrement}
        aria-label="Incrémenter"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
