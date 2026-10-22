/**
 * EmptyState component.
 *
 * État vide d'une liste, d'une carte ou d'un graphique : rien encore
 * (`empty`), aucun résultat après filtrage (`no-results`) ou échec de
 * chargement (`error`). Les deux derniers portent `role="status"` pour être
 * annoncés sans voler le focus.
 */
import type { ReactNode } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";
import "./empty-state.css";

/** Nature de l'état vide. */
export type EmptyStateVariant = "empty" | "no-results" | "error";

/** Action proposée dans l'état vide. */
export interface EmptyStateAction {
  /** Libellé du bouton. */
  label: string;
  /** Clic. */
  onClick?: () => void;
}

export interface EmptyStateProps {
  /** Nature de l'état. Défaut "empty". */
  variant?: EmptyStateVariant;
  /**
   * Échelle. "page" : centré, padding 48px (remplace la recette 4).
   * "inline" : compact, dans un DataTable / une Card / un graphique. Défaut "page".
   */
  size?: "page" | "inline";
  /** Titre (ex. « Aucun scénario créé pour ce réseau »). */
  title: string;
  /** Texte secondaire explicatif. */
  description?: string;
  /** Action principale → PrimaryButton. */
  action?: EmptyStateAction;
  /** Action secondaire → GhostButton. */
  secondaryAction?: EmptyStateAction;
  /** Illustration décorative au-dessus du titre (masquée aux lecteurs d'écran). */
  illustration?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

export const EmptyState = ({
  variant = "empty",
  size = "page",
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className,
}: EmptyStateProps) => {
  const rootClass = [
    "empty-state",
    `empty-state--${variant}`,
    `empty-state--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // no-results et error sont des changements d'état à annoncer ; empty est statique.
  const isLive = variant === "no-results" || variant === "error";

  return (
    <div className={rootClass} role={isLive ? "status" : undefined}>
      {illustration && (
        <div className="empty-state__illustration" aria-hidden="true">
          {illustration}
        </div>
      )}
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {secondaryAction && (
            <GhostButton size="sm" label={secondaryAction.label} onClick={secondaryAction.onClick} />
          )}
          {action && <PrimaryButton size="sm" label={action.label} onClick={action.onClick} />}
        </div>
      )}
    </div>
  );
};
