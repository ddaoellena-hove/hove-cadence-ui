import type { KeyboardEvent, Ref } from "react";
import { Icons } from "./Icons";
import "./time-fields.css";

/** Module interne commun à DatePicker et TimePicker. */
export interface TimeFieldsProps {
  hour: string;
  minute: string;
  onStep: (unit: "hour" | "minute", direction: -1 | 1) => void;
  onEdit?: (unit: "hour" | "minute", value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>, unit: "hour" | "minute") => void;
  hourRef?: Ref<HTMLInputElement>;
  id?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  maxHour?: number;
  canDecrease?: boolean;
  canIncrease?: boolean;
  onInvalid?: () => void;
  onPasteTime?: (value: string) => void;
  /**
   * "stepper" (défaut) : deux cases avec flèches (panneau).
   * "inline" : deux cases éditables séparées d'un « : » fixe, sans flèches,
   * pour une saisie directe dans un champ de type TextInput.
   */
  layout?: "stepper" | "inline";
}

export function TimeFields({
  hour,
  minute,
  onStep,
  onEdit,
  onKeyDown,
  hourRef,
  id,
  label = "Heure",
  disabled = false,
  required = false,
  invalid,
  describedBy,
  maxHour = 23,
  canDecrease = true,
  canIncrease = true,
  onInvalid,
  onPasteTime,
  layout = "stepper",
}: TimeFieldsProps) {
  const value = (unit: "hour" | "minute") => (unit === "hour" ? hour : minute);
  const unitLabel = (unit: "hour" | "minute") => (unit === "hour" ? "Heures" : "Minutes");
  const max = (unit: "hour" | "minute") => (unit === "hour" ? maxHour : 59);

  const renderInput = (unit: "hour" | "minute") => {
    const current = value(unit);
    const valid = /^\d{1,2}$/.test(current) && Number(current) <= max(unit);
    return (
      <input
        ref={unit === "hour" ? hourRef : undefined}
        id={unit === "hour" ? id : undefined}
        className="time-fields__box"
        type="text"
        role="spinbutton"
        inputMode="numeric"
        autoComplete="off"
        placeholder={unit === "hour" ? "HH" : "mm"}
        aria-label={`${unitLabel(unit)} — ${label}`}
        aria-valuemin={0}
        aria-valuemax={max(unit)}
        aria-valuenow={valid ? Number(current) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={current}
        disabled={disabled}
        required={required}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text").trim();
          if (onPasteTime && /^\d{1,2}:\d{1,2}$/.test(text)) {
            event.preventDefault();
            onPasteTime(text);
          }
        }}
        onChange={(event) => onEdit?.(unit, event.target.value)}
        onKeyDown={(event) => onKeyDown?.(event, unit)}
        onInvalid={(event) => {
          if (onInvalid) {
            event.preventDefault();
            onInvalid();
          }
        }}
      />
    );
  };

  // ── Champ en ligne : HH : mm (saisie directe, sans flèches) ──
  if (layout === "inline") {
    return (
      <div className="time-fields time-fields--inline">
        {renderInput("hour")}
        <span className="time-fields__sep time-fields__sep--inline" aria-hidden="true">:</span>
        {renderInput("minute")}
      </div>
    );
  }

  // ── Panneau : deux cases avec flèches ──
  return (
    <div className="time-fields">
      {(["hour", "minute"] as const).map((unit, index) => (
        <div className="time-fields__col" key={unit}>
          {index === 1 && <span className="time-fields__sep" aria-hidden="true">:</span>}
          <span className="time-fields__label" aria-hidden="true">{unitLabel(unit)}</span>
          <button type="button" className="time-fields__arrow" disabled={disabled || !canIncrease} aria-label={unit === "hour" ? "Augmenter les heures" : "Augmenter les minutes"} onClick={() => onStep(unit, 1)}>
            <Icons icon="chevron-up" size={16} />
          </button>
          {onEdit ? renderInput(unit) : <div className="time-fields__box">{value(unit)}</div>}
          <button type="button" className="time-fields__arrow" disabled={disabled || !canDecrease} aria-label={unit === "hour" ? "Diminuer les heures" : "Diminuer les minutes"} onClick={() => onStep(unit, -1)}>
            <Icons icon="chevron-down" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
