/**
 * FormField — libellé, aide et erreur d'un contrôle qui n'en porte pas : groupe
 * de cases, champ métier composé. Les champs Cadence (`TextInput`, `Dropdown`,
 * `DatePicker`…) ont déjà ces props : ne pas les envelopper, le libellé serait
 * doublé.
 *
 * Avec une fonction en enfant, le contrôle reçoit `id` et les attributs ARIA.
 * Avec un contenu direct, l'ensemble forme un groupe nommé par le libellé.
 */
import { forwardRef, useId, type ReactNode } from "react";
import "./form-field.css";

/** Attributs à reporter sur le contrôle. */
export interface FormFieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
}

export interface FormFieldProps {
  /** Libellé visible. */
  label: string;
  /** Marque le libellé. La validation reste à l'app. */
  required?: boolean;
  /** Message d'aide sous le contrôle. */
  helperText?: string;
  /** Erreur fournie par l'app ; prioritaire sur `helperText`. */
  error?: string;
  /** Contrôle unique (fonction) ou groupe de contrôles (contenu). */
  children: ReactNode | ((control: FormFieldControlProps) => ReactNode);
  /** Id de la racine : cible possible d'`ErrorSummary`. */
  id?: string;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required = false, helperText, error, children, id, className }, ref) => {
    const uid = useId();
    const controlId = `form-field-${uid}`;
    const labelId = `${controlId}-label`;
    const messageId = `${controlId}-message`;
    const message = error || helperText;
    const describedBy = message ? messageId : undefined;
    const rootClass = ["form-field", className].filter(Boolean).join(" ");
    const labelContent = (
      <>
        {label}
        {required && <><span aria-hidden="true"> *</span><span className="form-field__sr-only"> (obligatoire)</span></>}
      </>
    );
    const messageNode = message && (
      <p id={messageId} className={`form-field__message${error ? " form-field__message--error" : ""}`}>{message}</p>
    );

    if (typeof children === "function") {
      return (
        <div ref={ref} id={id} className={rootClass}>
          <label id={labelId} className="form-field__label" htmlFor={controlId}>{labelContent}</label>
          {children({
            id: controlId,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
            "aria-required": required ? true : undefined,
          })}
          {messageNode}
        </div>
      );
    }

    return (
      <div ref={ref} id={id} className={rootClass} role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
        <span id={labelId} className="form-field__label">{labelContent}</span>
        {children}
        {messageNode}
      </div>
    );
  },
);

FormField.displayName = "FormField";
