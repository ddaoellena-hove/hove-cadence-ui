/**
 * AlertToast component.
 *
 * A notification toast supporting information, success, warning, and error
 * types with an optional progress bar, close button, and action buttons.
 */
import { useContext, type CSSProperties, type FC, type MouseEventHandler, type SVGProps } from "react";
import { InfoCircle } from "@untitledui/icons/InfoCircle";
import { CheckCircle } from "@untitledui/icons/CheckCircle";
import { AlertTriangle } from "@untitledui/icons/AlertTriangle";
import { AlertCircle } from "@untitledui/icons/AlertCircle";
import { CloseButton } from "./CloseButton";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { ProgressBar } from "./ProgressBar";
import { ToastAnnouncedContext } from "./toast-announce-context";
import "./alert-toast.css";

/** Visual type of the toast, controls the accent color and status icon. */
export type AlertToastType = "information" | "success" | "warning" | "error";

/** An action button rendered inside the toast. */
export interface AlertToastAction {
  /** Button label text. */
  label: string;
  /** Click handler. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Action secondaire : rendue en GhostButton. Défaut : true pour la 1re action, false pour la 2e (PrimaryButton). */
  outline?: boolean;
}

export interface AlertToastProps {
  /** Semantic type — drives the accent color and status icon. */
  type?: AlertToastType;

  /** Primary bold heading of the toast. Defaults to the type label. */
  title?: string;

  /** Secondary descriptive text below the title. */
  description?: string;

  /**
   * Progress value between 0 and 100.
   * When provided a progress bar is shown at the bottom of the card.
   * When omitted the progress bar is hidden.
   */
  progress?: number;

  /**
   * Up to two action buttons to render at the bottom of the body.
   * When provided the close button is shown automatically.
   */
  actions?: [AlertToastAction] | [AlertToastAction, AlertToastAction];

  /**
   * Whether to show the close (×) button.
   * Automatically `true` when `actions` are provided.
   */
  dismissible?: boolean;

  /** Callback fired when the close button is clicked. */
  onDismiss?: () => void;

  /** Optional extra class name applied to the root element. */
  className?: string;

  /** Inline style escape hatch. */
  style?: CSSProperties;
}

/** Icône d'état par type — SVG inline (couleur pilotée par le CSS, via currentColor). */
const STATE_ICON: Record<
  AlertToastType,
  FC<SVGProps<SVGSVGElement> & { size?: number }>
> = {
  information: InfoCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const DEFAULT_TITLE: Record<AlertToastType, string> = {
  information: "Information",
  success: "Succès",
  warning: "Avertissement",
  error: "Erreur",
};

/**
 * AlertToast renders a compact notification card with a coloured left-accent
 * strip, a status icon, a title + description, an optional progress bar, and
 * optional inline action buttons.
 */
export const AlertToast = ({
  type = "information",
  title,
  description,
  progress,
  actions,
  dismissible = false,
  onDismiss,
  className,
  style,
}: AlertToastProps) => {
  const showDismiss = dismissible || Boolean(actions?.length);
  const resolvedTitle = title ?? DEFAULT_TITLE[type];
  const showProgress = typeof progress === "number";
  const StateIcon = STATE_ICON[type];

  const rootClass = [
    "alert-toast",
    `alert-toast--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Erreur / avertissement : role="alert" (annonce immédiate) ; succès /
  // information : role="status" (annonce polie). Pas d'aria-live en plus : le
  // rôle l'implique déjà, et deux politiques contradictoires se court-circuitent.
  // Dans le Toaster, ses régions permanentes annoncent : pas de rôle ici.
  const announcedByToaster = useContext(ToastAnnouncedContext);
  const role = announcedByToaster ? undefined : type === "error" || type === "warning" ? "alert" : "status";

  return (
    <div className={rootClass} style={{ ...style, flexWrap: "wrap" }} role={role}>
      {/* Left accent bar */}
      <div className="alert-toast__accent" aria-hidden="true" />

      {/* Status icon */}
      <div className="alert-toast__icon-col">
        <StateIcon className="alert-toast__state-icon" size={20} aria-hidden="true" />
      </div>

      {/* Main body */}
      <div className="alert-toast__body">
        <div className="alert-toast__text">
          <p className="alert-toast__title">{resolvedTitle}</p>
          {description && (
            <p className="alert-toast__description">{description}</p>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="alert-toast__actions">
            {actions.map((action, idx) =>
              // Faible emphase dans un toast : action secondaire → Ghost ;
              // action principale → PrimaryButton outline (jamais rempli)
              (action.outline ?? idx === 0) ? (
                <GhostButton key={idx} size="sm" label={action.label} onClick={action.onClick} />
              ) : (
                <PrimaryButton key={idx} outline size="sm" label={action.label} onClick={action.onClick} />
              ),
            )}
          </div>
        )}

        {!showProgress && !actions && <div style={{ height: 12 }} />}
      </div>

      {/* Close button */}
      {showDismiss && (
        <div className="alert-toast__close-col">
          <CloseButton onClick={() => onDismiss?.()} aria-label="Fermer la notification" />
        </div>
      )}

      {/* Full-width progress bar — outside flex row, spans entire card width.
          Rendue par ProgressBar ; le style par type est préservé en CSS. */}
      {showProgress && (
        <ProgressBar value={progress} aria-label="Progression" className="alert-toast__progress" />
      )}
    </div>
  );
};
