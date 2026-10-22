/**
 * CopyableText component.
 *
 * Identifiant technique (arrêt, course, véhicule) en police mono, tronqué si
 * besoin, avec un bouton de copie. Le retour « Copié » (ou « Copie
 * impossible ») est visible et annoncé par une région `role="status"`, puis
 * s'efface après 2 s.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GhostButton } from "./GhostButton";
import { copyToClipboard } from "./copy-to-clipboard";
import "./copyable-text.css";

export interface CopyableTextProps {
  /** Texte copié (et affiché par défaut). */
  value: string;
  /** Contenu affiché à la place de `value` (ex. identifiant abrégé). */
  children?: ReactNode;
  /** Nom du bouton. Défaut : « Copier {value} ». */
  copyLabel?: string;
  /** Police mono (identifiants). Défaut `true`. */
  mono?: boolean;
  /** Tronque le texte avec une ellipse (valeur complète en infobulle native). */
  truncate?: boolean;
  /** Appelé après une copie réussie. */
  onCopy?: (value: string) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

const FEEDBACK_MS = 2000;

export const CopyableText = ({
  value,
  children,
  copyLabel,
  mono = true,
  truncate = true,
  onCopy,
  className,
}: CopyableTextProps) => {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    setStatus(ok ? "copied" : "failed");
    if (ok) onCopy?.(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
  };

  const rootClass = [
    "copyable-text",
    mono ? "copyable-text--mono" : "",
    truncate ? "copyable-text--truncate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClass}>
      <span className="copyable-text__value" title={truncate ? value : undefined}>
        {children ?? value}
      </span>
      <GhostButton
        size="sm"
        icon={status === "copied" ? "check" : "copy-01"}
        aria-label={copyLabel ?? `Copier ${value}`}
        className="copyable-text__button"
        onClick={handleCopy}
      />
      <span
        className={`copyable-text__status${status === "failed" ? " copyable-text__status--failed" : ""}`}
        role="status"
      >
        {status === "copied" ? "Copié" : status === "failed" ? "Copie impossible" : ""}
      </span>
    </span>
  );
};
