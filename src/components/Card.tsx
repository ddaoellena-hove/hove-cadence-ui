import type { ReactNode } from "react";
import { Icons, type IconName } from "./Icons";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { PrimaryButton } from "./PrimaryButton";
import { Skeleton } from "./Skeleton";
import { Sparkline } from "./Sparkline";
import { errorOnce } from "./button-compat";
import {
  describeDelta,
  formatDelta,
  formatKpiValue,
  getDeltaTone,
  type KpiDeltaUnit,
  type KpiGoodDirection,
} from "./card-utils";
import "./card.css";

export interface CardDelta {
  /** Variation (ex. -3.2 pour −3,2 %). */
  value: number;
  /** Unité de la variation. Défaut "%". "pt" = points de pourcentage. */
  unit?: KpiDeltaUnit;
  /** Période de comparaison : « vs hier », « vs semaine dernière »… */
  label?: string;
}

interface CardBaseProps {
  /** Titre de la carte (« Retard moyen », « Importer un réseau GTFS »). */
  title: string;
  /** Niveau de titre, selon la hiérarchie de la page. Défaut 3 (h3). */
  headingLevel?: 2 | 3 | 4;
  /** Texte secondaire (sous la valeur si la carte en a une, sinon sous le titre). */
  description?: string;
  /** Valeur principale. Un nombre est formaté en fr-FR ; une chaîne est affichée telle quelle. */
  value?: number | string;
  /** Unité accolée à la valeur (« min », « % », « courses »). */
  unit?: string;
  /** Options de formatage du nombre. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Évolution par rapport à la période de référence (affichée avec `value`). */
  delta?: CardDelta;
  /** Sens favorable : "up" (hausse = bien), "down" (baisse = bien), "neutral". Défaut "up". */
  goodDirection?: KpiGoodDirection;
  /** Statut sémantique optionnel, affiché avec un Indicator à droite du titre. */
  status?: IndicatorVariant;
  /** Libellé du statut (surcharge celui de la variante). */
  statusLabel?: string;
  /** Série de points pour une mini-courbe, de la plus ancienne à la plus récente. */
  trend?: number[];
  /** Squelette de chargement à la place de la valeur et de la variation. */
  loading?: boolean;
  /**
   * Illustration décorative en bas à droite (SVG inline ou `<img alt="">`).
   * Masquée aux lecteurs d'écran. Hauteur conseillée : 64 à 96px.
   */
  illustration?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

/** Carte informative : ni clic ni bouton. */
interface CardStaticProps {
  onClick?: never;
  actionLabel?: never;
  onAction?: never;
  actionIcon?: never;
}

/**
 * Toute la carte est cliquable (accès à la liste détaillée). Un bouton visible
 * (`actionLabel`) est obligatoire : il signale l'interactivité et porte le
 * clic, étiré sur toute la carte.
 */
interface CardClickableProps {
  /** Clic sur la carte entière (et son bouton). */
  onClick: () => void;
  /** Libellé du bouton qui signale le clic (« Voir les perturbations »). Obligatoire. */
  actionLabel: string;
  /** Icône avant le libellé du bouton. */
  actionIcon?: IconName;
  onAction?: never;
}

/** Seul le bouton d'action (PrimaryButton outline sm) est cliquable. */
interface CardActionProps {
  /** Libellé du bouton d'action (« Importer », « Configurer »). */
  actionLabel: string;
  /** Clic sur le bouton d'action. */
  onAction?: () => void;
  /** Icône avant le libellé du bouton. */
  actionIcon?: IconName;
  onClick?: never;
}

// Carte cliquable = bouton visible étiré sur toute la carte : une seule cible
// (pas de bouton dans une zone cliquable), et l'interactivité se voit.
export type CardProps = CardBaseProps & (CardStaticProps | CardClickableProps | CardActionProps);

// Libellé de repli si une carte cliquable arrive sans `actionLabel` (JS non typé)
const FALLBACK_ACTION_LABEL = "Voir le détail";


/**
 * Carte de tableau de bord : titre, statut, valeur chiffrée et son évolution,
 * mini-courbe, description, bouton d'action et illustration — tous facultatifs
 * sauf le titre. Interactive par `onClick` (toute la carte) ou par
 * `actionLabel` (le bouton seul) ; elle se soulève alors au survol.
 */
export const Card = (props: CardProps) => {
  const {
    title,
    headingLevel = 3,
    description,
    value,
    unit,
    format,
    delta,
    goodDirection = "up",
    status,
    statusLabel,
    trend,
    loading = false,
    illustration,
    className,
    onClick,
    actionLabel,
    onAction,
    actionIcon,
  } = props;

  const Heading = `h${headingLevel}` as const;
  if (onClick && !actionLabel) {
    errorOnce("Card", "missingActionLabel", "une carte cliquable (`onClick`) exige un bouton visible : fournissez `actionLabel`.");
  }
  const buttonLabel = actionLabel || (onClick ? FALLBACK_ACTION_LABEL : undefined);
  const hasFigures = value !== undefined || loading;
  const interactive = Boolean(onClick || actionLabel);
  const deltaUnit = delta?.unit ?? "%";
  const tone = delta ? getDeltaTone(delta.value, goodDirection) : "neutral";
  const deltaIcon = delta && delta.value !== 0 ? (delta.value > 0 ? "arrow-up" : "arrow-down") : null;

  const rootClass = [
    "card",
    interactive ? "card--interactive" : "",
    onClick ? "card--clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-busy={loading || undefined}>
      <div className="card__header">
        <Heading className="card__title">{title}</Heading>
        {status && !loading && <Indicator variant={status} label={statusLabel} />}
      </div>

      {hasFigures &&
        (loading ? (
          <div className="card__body card__body--loading">
            <Skeleton variant="rect" width={120} height={30} />
            <Skeleton variant="rect" width={80} height={14} />
          </div>
        ) : (
          <div className="card__body">
            <div className="card__figures">
              <p className="card__value">
                <span className="card__number">{formatKpiValue(value!, format)}</span>
                {unit && <span className="card__unit">{unit}</span>}
              </p>
              {delta && (
                <p className={`card__delta card__delta--${tone}`}>
                  {deltaIcon && <Icons icon={deltaIcon} size={14} className="card__delta-icon" />}
                  <span aria-hidden="true">{formatDelta(delta.value, deltaUnit)}</span>
                  {delta.label && (
                    <span className="card__delta-label" aria-hidden="true">
                      {delta.label}
                    </span>
                  )}
                  <span className="card__sr-only">
                    {describeDelta(delta.value, deltaUnit, goodDirection, delta.label)}
                  </span>
                </p>
              )}
            </div>
            {trend && trend.length > 1 && <Sparkline values={trend} decorative className="card__sparkline" />}
          </div>
        ))}

      {description && !loading && <p className="card__description">{description}</p>}

      {(buttonLabel || illustration) && (
        <div className="card__footer">
          {buttonLabel && (
            <div className="card__actions">
              {/* Carte cliquable : la zone du bouton est étirée sur toute la carte */}
              <PrimaryButton
                outline
                size="sm"
                label={buttonLabel}
                iconStart={actionIcon}
                className={onClick ? "card__stretched" : undefined}
                onClick={onClick ?? onAction}
              />
            </div>
          )}
          {illustration && (
            <div className="card__illustration" aria-hidden="true">
              {illustration}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
