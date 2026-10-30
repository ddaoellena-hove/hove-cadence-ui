/**
 * RadioGroup — choix exclusif : nom du groupe, exclusivité, aide, erreur et
 * clavier du motif ARIA (une seule tabulation, flèches pour changer d'option).
 * Compose `RadioButton`, en ligne ou en cartes de choix.
 */
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import type { IconName } from "./Icons";
import { RadioButton } from "./RadioButton";
import "./radio-group.css";

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  /** Complément décoratif après le libellé. */
  aside?: ReactNode;
  /** Icône décorative, en apparence carte. */
  icon?: IconName;
  iconElement?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Libellé visible du groupe. Sinon, fournir `aria-label`. */
  label?: string;
  "aria-label"?: string;
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Présentation des options. Défaut "default". */
  appearance?: "default" | "card";
  /** Taille des cartes. Défaut "md". */
  size?: "md" | "lg";
  /** Colonnes de cartes ; une seule sous 560px. Défaut 1. */
  columns?: 1 | 2;
  helperText?: string;
  /** Erreur fournie par l'app ; prioritaire sur `helperText`. */
  error?: string;
  /** Marque le libellé. La validation reste à l'app. */
  required?: boolean;
  className?: string;
}

export const RadioGroup = ({
  label,
  "aria-label": ariaLabel,
  options,
  value,
  onChange,
  appearance = "default",
  size = "md",
  columns = 1,
  helperText,
  error,
  required = false,
  className,
}: RadioGroupProps) => {
  const uid = useId();
  const labelId = `${uid}-label`;
  const messageId = `${uid}-message`;
  const listRef = useRef<HTMLDivElement>(null);
  const message = error || helperText;
  const enabled = options.filter((option) => !option.disabled);
  // Une seule étape de tabulation : l'option choisie, sinon la première disponible
  const tabStop = enabled.some((option) => option.value === value) ? value : enabled[0]?.value;

  const select = (next: RadioGroupOption) => {
    onChange?.(next.value);
    const index = options.indexOf(next);
    listRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step || enabled.length === 0) return;
    event.preventDefault();
    const current = enabled.findIndex((option) => option.value === tabStop);
    select(enabled[(current + step + enabled.length) % enabled.length]);
  };

  return (
    <div className={["radio-group", className].filter(Boolean).join(" ")}>
      {label && (
        <span id={labelId} className="radio-group__label">
          {label}
          {required && <><span aria-hidden="true"> *</span><span className="radio-group__sr-only"> (obligatoire)</span></>}
        </span>
      )}
      <div
        ref={listRef}
        className={`radio-group__list radio-group__list--${appearance}${columns === 2 ? " radio-group__list--columns" : ""}`}
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        onKeyDown={handleKeyDown}
      >
        {options.map((option) => (
          <RadioButton
            key={option.value}
            appearance={appearance}
            size={size}
            label={option.label}
            description={option.description}
            aside={option.aside}
            icon={option.icon}
            iconElement={option.iconElement}
            state={option.disabled ? "disabled" : option.value === value ? "selected" : "default"}
            tabIndex={option.value === tabStop ? 0 : -1}
            onChange={() => select(option)}
          />
        ))}
      </div>
      {message && <p id={messageId} className={`radio-group__message${error ? " radio-group__message--error" : ""}`}>{message}</p>}
    </div>
  );
};
