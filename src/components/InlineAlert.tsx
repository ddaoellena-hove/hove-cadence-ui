/**
 * InlineAlert component.
 *
 * Bandeau d'alerte **dans le flux** de la page (persistant, non bloquant) — à
 * distinguer d'un toast (éphémère, en surcouche). Couleurs issues des tokens
 * `--cadence-status-*` (fond et texte AA). Icône + texte, jamais la couleur
 * seule. `role="status"`, ou `role="alert"` pour le type « error ».
 */
import type { ReactNode } from "react";
import { InfoCircle } from "@untitledui/icons/InfoCircle";
import { CheckCircle } from "@untitledui/icons/CheckCircle";
import { AlertTriangle } from "@untitledui/icons/AlertTriangle";
import { AlertCircle } from "@untitledui/icons/AlertCircle";
import { CloseButton } from "./CloseButton";
import { PrimaryButton } from "./PrimaryButton";
import "./inline-alert.css";

export type InlineAlertType = "information" | "success" | "warning" | "error";

export interface InlineAlertProps {
  /** Type sémantique — couleur et icône. */
  type: InlineAlertType;
  /** Titre en gras (facultatif). */
  title?: string;
  /** Corps du message. */
  children: ReactNode;
  /** Action inline (ex. « Réessayer »). */
  action?: { label: string; onClick: () => void };
  /** Affiche un bouton de fermeture ×. */
  dismissible?: boolean;
  /** Appelé au clic sur ×. */
  onDismiss?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

const ICON: Record<InlineAlertType, React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>> = {
  information: InfoCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const InlineAlert = ({ type, title, children, action, dismissible = false, onDismiss, className }: InlineAlertProps) => {
  const Icon = ICON[type];
  const rootClass = ["inline-alert", `inline-alert--${type}`, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} role={type === "error" ? "alert" : "status"}>
      <Icon className="inline-alert__icon" size={20} aria-hidden="true" />
      <div className="inline-alert__body">
        {title && <p className="inline-alert__title">{title}</p>}
        <div className="inline-alert__text">{children}</div>
        {action && (
          <div className="inline-alert__actions">
            {/* Outline : contour visible sur le fond teinté du bandeau. */}
            <PrimaryButton outline size="sm" label={action.label} onClick={action.onClick} />
          </div>
        )}
      </div>
      {dismissible && (
        <CloseButton onClick={() => onDismiss?.()} />
      )}
    </div>
  );
};
