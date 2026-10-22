/**
 * ProgressBar component.
 *
 * Barre de progression déterminée (0–100) ou indéterminée (animation).
 * Réutilisée en interne par AlertToast et FileUpload.
 */
import { forwardRef, useId } from "react";
import "./progress-bar.css";

export interface ProgressBarProps {
  /** Valeur 0–100. Absente/undefined → indéterminée (animation continue). */
  value?: number;
  /** Libellé affiché au-dessus de la barre. */
  label?: string;
  /** Affiche la valeur en pourcentage à droite du libellé. */
  showValue?: boolean;
  /** Teinte du remplissage. Défaut "default" (accent `#1b6cff`). */
  tone?: "default" | "success" | "danger";
  /** Nom accessible quand il n'y a pas de `label` visible. */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));
// Espace insécable avant le %, en constante (évite un caractère irrégulier en source).
const NBSP = " ";

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, label, showValue = false, tone = "default", "aria-label": ariaLabel, className }, ref) => {
    const indeterminate = typeof value !== "number" || !Number.isFinite(value);
    const pct = indeterminate ? 0 : clamp(value);
    const labelId = useId();

    const rootClass = ["progress-bar", `progress-bar--${tone}`, indeterminate ? "progress-bar--indeterminate" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={rootClass}>
        {(label || showValue) && (
          <div className="progress-bar__header">
            {label && <span id={labelId} className="progress-bar__label">{label}</span>}
            {showValue && !indeterminate && (
              <span className="progress-bar__value">
                {Math.round(pct)}
                {NBSP}%
              </span>
            )}
          </div>
        )}
        <div
          className="progress-bar__track"
          role="progressbar"
          aria-valuemin={indeterminate ? undefined : 0}
          aria-valuemax={indeterminate ? undefined : 100}
          aria-valuenow={indeterminate ? undefined : Math.round(pct)}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : (ariaLabel ?? "Progression")}
        >
          <div className="progress-bar__fill" style={indeterminate ? undefined : { width: `${pct}%` }} />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
