import type { ReactNode } from "react";
import { PrimaryButton } from "./PrimaryButton";
import type { IconName } from "./Icons";
import "./action-card.css";

export interface ActionCardProps {
  /** Titre de la carte. */
  title: string;
  /** Texte d'explication sous le titre. */
  description?: string;
  /** Libellé du bouton (« Configurer », « Importer »…). */
  actionLabel: string;
  /** Clic sur le bouton (seul élément cliquable de la carte). */
  onAction?: () => void;
  /** Icône avant le libellé du bouton. */
  actionIcon?: IconName;
  /**
   * Illustration décorative en bas à droite de la carte (SVG inline ou `<img alt="">`).
   * Masquée aux lecteurs d'écran. Hauteur conseillée : 64 à 96px.
   */
  illustration?: ReactNode;
  /** Niveau de titre, selon la hiérarchie de la page. Défaut 3 (h3). */
  headingLevel?: 2 | 3 | 4;
  /** Classe CSS additionnelle. */
  className?: string;
}

/**
 * Carte d'action : un titre, une description et un bouton (PrimaryButton
 * outline sm), avec une illustration facultative en bas à droite. Seul le bouton est cliquable ; l'ombre portée au survol met
 * la carte en valeur.
 */
export const ActionCard = ({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  illustration,
  headingLevel = 3,
  className,
}: ActionCardProps) => {
  const Heading = `h${headingLevel}` as const;
  const rootClass = ["action-card", className].filter(Boolean).join(" ");

  return (
    <article className={rootClass}>
      <div className="action-card__content">
        <Heading className="action-card__title">{title}</Heading>
        {description && <p className="action-card__description">{description}</p>}
      </div>
      <div className="action-card__footer">
        <div className="action-card__actions">
          <PrimaryButton outline size="sm" label={actionLabel} iconStart={actionIcon} onClick={onAction} />
        </div>
        {illustration && (
          <div className="action-card__illustration" aria-hidden="true">
            {illustration}
          </div>
        )}
      </div>
    </article>
  );
};
