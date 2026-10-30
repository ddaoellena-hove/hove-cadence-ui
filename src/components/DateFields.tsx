import { useRef, type KeyboardEvent, type Ref } from "react";
import "./date-fields.css";

/** Module interne de DatePicker : cases JJ / MM / AAAA (+ HH:mm) en ligne. */
export interface DateFieldsProps {
  /** Valeur de chaque case : [JJ, MM, AAAA] (+ [HH, mm] si withTime). */
  parts: string[];
  withTime?: boolean;
  onEdit: (index: number, value: string) => void;
  /** Texte collé reconnu comme une date complète. */
  onPaste?: (text: string) => boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Ref de la première case (jour) : cible du label et du focus. */
  firstRef?: Ref<HTMLInputElement>;
  id?: string;
  /** Nom du champ, repris dans le nom de chaque case. */
  label: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

const SEGMENTS = [
  { name: "Jour", placeholder: "JJ", length: 2 },
  { name: "Mois", placeholder: "MM", length: 2 },
  { name: "Année", placeholder: "AAAA", length: 4 },
  { name: "Heures", placeholder: "HH", length: 2 },
  { name: "Minutes", placeholder: "mm", length: 2 },
];
// Séparateur affiché avant chaque case (fixe, non saisi)
const SEPARATORS = ["", "/", "/", " ", ":"];
// Touches qui font passer à la case suivante, comme un séparateur tapé
const NEXT_KEYS = ["/", ".", "-", " ", ":"];

export function DateFields({
  parts,
  withTime = false,
  onEdit,
  onPaste,
  onKeyDown,
  firstRef,
  id,
  label,
  disabled = false,
  required = false,
  invalid,
  describedBy,
}: DateFieldsProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const count = withTime ? 5 : 3;
  const focusAt = (index: number) => {
    const input = refs.current[index];
    if (!input) return;
    input.focus();
    input.select();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    const input = event.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const atEnd = input.selectionStart === input.value.length;
    if (NEXT_KEYS.includes(event.key)) {
      event.preventDefault();
      if (index < count - 1 && input.value !== "") focusAt(index + 1);
    } else if (event.key === "Backspace" && input.value === "" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft" && atStart && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight" && atEnd && index < count - 1) {
      event.preventDefault();
      focusAt(index + 1);
    }
    onKeyDown?.(event);
  };

  return (
    <div className="date-fields" role="group" aria-label={label}>
      {SEGMENTS.slice(0, count).map((segment, index) => (
        <span key={segment.name} className="date-fields__segment">
          {SEPARATORS[index] && (
            <span className={`date-fields__sep${SEPARATORS[index] === " " ? " date-fields__sep--space" : ""}`} aria-hidden="true">
              {SEPARATORS[index]}
            </span>
          )}
          <input
            ref={(el) => {
              refs.current[index] = el;
              if (index === 0 && firstRef) {
                if (typeof firstRef === "function") firstRef(el);
                // RefObject est en lecture seule dans les types React 18 : même cast que DisruptionScopePicker
                else (firstRef as { current: HTMLInputElement | null }).current = el;
              }
            }}
            id={index === 0 ? id : undefined}
            className={`date-fields__box date-fields__box--${segment.length}`}
            aria-required={required || undefined}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder={segment.placeholder}
            aria-label={`${segment.name} — ${label}`}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            value={parts[index] ?? ""}
            disabled={disabled}
            onChange={(event) => {
              // Les chiffres en trop (frappe rapide, remplissage auto) débordent
              // sur les cases suivantes ; une case remplie fait passer à la suivante.
              let rest = event.target.value.replace(/\D/g, "");
              let last = index;
              let lastChunk = "";
              for (let i = index; i < count; i++) {
                const chunk = rest.slice(0, SEGMENTS[i].length);
                if (i > index && chunk === "") break;
                onEdit(i, chunk);
                rest = rest.slice(chunk.length);
                last = i;
                lastChunk = chunk;
                if (rest === "") break;
              }
              const lastFilled = lastChunk.length === SEGMENTS[last].length;
              if (lastFilled && last < count - 1) focusAt(last + 1);
              else if (last !== index) refs.current[last]?.focus();
            }}
            onPaste={(event) => {
              if (onPaste?.(event.clipboardData.getData("text"))) event.preventDefault();
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onFocus={(event) => event.currentTarget.select()}
          />
        </span>
      ))}
    </div>
  );
}
