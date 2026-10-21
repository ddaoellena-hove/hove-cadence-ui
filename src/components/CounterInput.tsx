import { useState, useRef, useId } from "react";
import { GhostButton } from "./GhostButton";
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
  /** Label affiché au-dessus du composant (même style que TextInput). */
  label?: string;
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
  label,
  className,
}: CounterInputProps) => {
  const inputId = useId();
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [inputText, setInputText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = isControlled ? valueProp! : internalValue;

  const update = (next: number) => {
    const clamped = Math.round(
      Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)) / step
    ) * step;
    if (!isControlled) setInternalValue(clamped);
    onChange?.(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const commitInput = () => {
    if (inputText !== null) {
      const parsed = parseFloat(inputText);
      if (!isNaN(parsed)) update(parsed);
      setInputText(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { commitInput(); inputRef.current?.blur(); }
    if (e.key === "Escape") { setInputText(null); inputRef.current?.blur(); }
  };

  const canDecrement = min === undefined || current - step >= min;
  const canIncrement = max === undefined || current + step <= max;

  const rootClass = ["counter-input", disabled ? "counter-input--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="counter-input__wrapper">
      {label && (
        <label className="text-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={rootClass} role="group" aria-label={label ?? "Compteur"}>
        {/* Boutons discrets : GhostButton icône seule, dans le cadre du champ */}
        <GhostButton
          size="sm"
          icon="minus"
          aria-label="Décrémenter"
          onClick={() => update(current - step)}
          disabled={disabled || !canDecrement}
        />

        <div className="counter-input__value">
          <input
            ref={inputRef}
            id={inputId}
            type="number"
            className="counter-input__input"
            value={inputText !== null ? inputText : current}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={handleKeyDown}
            onFocus={(e) => { setInputText(String(current)); e.target.select(); }}
            disabled={disabled}
            aria-label="Valeur"
            min={min}
            max={max}
            step={step}
          />
          {unit && <span className="counter-input__unit">{unit}</span>}
        </div>

        <GhostButton
          size="sm"
          icon="plus"
          aria-label="Incrémenter"
          onClick={() => update(current + step)}
          disabled={disabled || !canIncrement}
        />
      </div>
    </div>
  );
};
