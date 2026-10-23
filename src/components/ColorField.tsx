/**
 * ColorField component.
 *
 * Saisie d'une couleur de ligne GTFS (`route_color`), avec `route_text_color`
 * optionnel. Champ de 40 px : pastille (sélecteur natif), champ hex validé
 * (avec ou sans `#`) et aperçu `LineBadge` en direct. Le contraste texte/fond
 * est contrôlé via `line-badge-utils` : sous 4,5:1 l'aide passe en erreur et un
 * bouton « Calculer la couleur du texte » propose une couleur lisible.
 */
import { forwardRef, useId, useState } from "react";
import { LineBadge, type LineMode } from "./LineBadge";
import { GhostButton } from "./GhostButton";
import { normalizeLineColor, contrastRatio, pickTextColor, AA_RATIO } from "./line-badge-utils";
import "./color-field.css";

export interface ColorFieldProps {
  /** Libellé visible du champ. */
  label: string;
  /** Couleur de fond hex (avec ou sans `#`). */
  value: string;
  /** Appelé avec la couleur normalisée `#RRGGBB`. */
  onChange: (hex: string) => void;
  /** Couleur de texte GTFS (route_text_color), si fournie. */
  textColor?: string;
  /** Appelé par « Calculer la couleur du texte ». */
  onTextColorChange?: (hex: string) => void;
  /** Code affiché dans l'aperçu `LineBadge`. Défaut « 00 ». */
  previewCode?: string;
  /** Mode de l'aperçu (nom accessible du badge). */
  previewMode?: LineMode;
  /** Message d'aide, remplacé par l'erreur de validation/contraste. */
  helperText?: string;
  /** État du champ. "error" force le rendu d'erreur. */
  state?: "enabled" | "error";
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  (
    { label, value, onChange, textColor, onTextColorChange, previewCode = "00", previewMode, helperText, state = "enabled", disabled = false, required = false, id, className },
    ref,
  ) => {
    const uid = useId();
    const inputId = id ?? `color-field-${uid}`;
    const messageId = `${inputId}-message`;

    // Brouillon de saisie (l'utilisateur peut taper sans `#`) ; synchronisé sur `value`.
    const [draft, setDraft] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);
    if (value !== syncedValue) {
      setSyncedValue(value);
      setDraft(value);
    }

    const normalized = normalizeLineColor(draft);
    const invalidHex = draft.trim() !== "" && normalized === null;

    // Contraste : couleur de texte fournie, sinon calculée pour AA.
    const resolvedText = textColor ?? (normalized ? pickTextColor(normalized).color : undefined);
    const ratio = normalized && resolvedText ? contrastRatio(resolvedText, normalized) : null;
    const lowContrast = Boolean(textColor && ratio !== null && ratio < AA_RATIO);

    const hasError = state === "error" || invalidHex || lowContrast;
    const message = invalidHex
      ? "Couleur hexadécimale invalide (ex. « 6EC4E8 » ou « #6EC4E8 »)."
      : lowContrast
        ? `Contraste insuffisant : ${ratio!.toFixed(1)}:1 (minimum 4,5:1).`
        : helperText;

    const commit = (next: string) => {
      setDraft(next);
      const norm = normalizeLineColor(next);
      if (norm) onChange(norm);
    };

    const rootClass = ["color-field", hasError ? "color-field--error" : "", disabled ? "color-field--disabled" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClass}>
        <label className="color-field__label" htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>

        <div className="color-field__row">
          <div className="color-field__box">
            {/* Pastille = sélecteur natif */}
            <input
              type="color"
              className="color-field__swatch"
              value={normalized ?? "#000000"}
              disabled={disabled}
              aria-label={`Sélecteur de couleur — ${label}`}
              onChange={(e) => commit(e.target.value)}
            />
            <input
              ref={ref}
              id={inputId}
              type="text"
              className="color-field__hex"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="#6EC4E8"
              value={draft}
              disabled={disabled}
              required={required}
              aria-invalid={hasError || undefined}
              aria-describedby={message ? messageId : undefined}
              onChange={(e) => commit(e.target.value)}
            />
          </div>

          {/* Aperçu en direct */}
          <span className="color-field__preview" aria-hidden={normalized ? undefined : true}>
            <LineBadge code={previewCode} mode={previewMode} color={normalized ?? undefined} textColor={textColor} />
          </span>
        </div>

        {message && (
          <p id={messageId} className="color-field__message" role={hasError ? "alert" : undefined}>
            {message}
          </p>
        )}

        {lowContrast && onTextColorChange && normalized && (
          <div className="color-field__action">
            <GhostButton
              size="sm"
              label="Calculer la couleur du texte"
              onClick={() => onTextColorChange(pickTextColor(normalized).color)}
            />
          </div>
        )}
      </div>
    );
  },
);

ColorField.displayName = "ColorField";
