import { Icons } from "./Icons";
import { Indicator, type IndicatorVariant } from "./Indicator";
import {
  buildSparklinePoints,
  describeDelta,
  formatDelta,
  formatKpiValue,
  getDeltaTone,
  type KpiDeltaUnit,
  type KpiGoodDirection,
} from "./kpi-card-utils";
import "./kpi-card.css";

export interface KpiCardDelta {
  /** Variation (ex. -3.2 pour −3,2 %). */
  value: number;
  /** Unité de la variation. Défaut "%". "pt" = points de pourcentage. */
  unit?: KpiDeltaUnit;
  /** Période de comparaison : « vs hier », « vs semaine dernière »… */
  label?: string;
}

export interface KpiCardProps {
  /** Libellé de l'indicateur (« Retard moyen »). */
  label: string;
  /** Valeur principale. Un nombre est formaté en fr-FR ; une chaîne est affichée telle quelle. */
  value: number | string;
  /** Unité accolée à la valeur (« min », « % », « courses »). */
  unit?: string;
  /** Options de formatage du nombre. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Évolution par rapport à la période de référence. */
  delta?: KpiCardDelta;
  /** Sens favorable : "up" (hausse = bien), "down" (baisse = bien), "neutral". Défaut "up". */
  goodDirection?: KpiGoodDirection;
  /** Statut sémantique optionnel, affiché avec un Indicator. */
  status?: IndicatorVariant;
  /** Libellé du statut (surcharge celui de la variante). */
  statusLabel?: string;
  /** Série de points pour une mini-courbe, de la plus ancienne à la plus récente. */
  trend?: number[];
  /** Texte secondaire sous la valeur. */
  description?: string;
  /** Squelette de chargement. */
  loading?: boolean;
  /** Rend la carte cliquable (accès à la liste détaillée). */
  onClick?: () => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

// Boîte de la mini-courbe (px)
const SPARK_WIDTH = 80;
const SPARK_HEIGHT = 32;

const Sparkline = ({ values }: { values: number[] }) => {
  const points = buildSparklinePoints(values, SPARK_WIDTH, SPARK_HEIGHT);
  const last = points[points.length - 1];
  return (
    <svg
      className="kpi-card__sparkline"
      width={SPARK_WIDTH}
      height={SPARK_HEIGHT}
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      aria-hidden="true"
    >
      <polyline className="kpi-card__sparkline-line" points={points.map((p) => `${p.x},${p.y}`).join(" ")} />
      <circle className="kpi-card__sparkline-dot" cx={last.x} cy={last.y} r={2.5} />
    </svg>
  );
};

/**
 * Carte d'indicateur chiffré : libellé, valeur, évolution colorée selon le
 * sens favorable, statut et mini-courbe optionnels. Cliquable via `onClick`.
 */
export const KpiCard = ({
  label,
  value,
  unit,
  format,
  delta,
  goodDirection = "up",
  status,
  statusLabel,
  trend,
  description,
  loading = false,
  onClick,
  className,
}: KpiCardProps) => {
  const rootClass = ["kpi-card", onClick ? "kpi-card--clickable" : "", className].filter(Boolean).join(" ");
  const deltaUnit = delta?.unit ?? "%";
  const tone = delta ? getDeltaTone(delta.value, goodDirection) : "neutral";
  const deltaIcon = delta && delta.value !== 0 ? (delta.value > 0 ? "arrow-up" : "arrow-down") : null;

  return (
    <div className={rootClass} aria-busy={loading || undefined}>
      <div className="kpi-card__header">
        {onClick ? (
          // Bouton étiré sur toute la carte : la carte entière est cliquable
          <button type="button" className="kpi-card__label kpi-card__action" onClick={onClick}>
            {label}
          </button>
        ) : (
          <span className="kpi-card__label">{label}</span>
        )}
        {status && !loading && <Indicator variant={status} label={statusLabel} />}
      </div>

      {loading ? (
        <div className="kpi-card__body">
          <span className="kpi-card__skeleton kpi-card__skeleton--value" />
          <span className="kpi-card__skeleton kpi-card__skeleton--delta" />
        </div>
      ) : (
        <div className="kpi-card__body">
          <div className="kpi-card__figures">
            <p className="kpi-card__value">
              <span className="kpi-card__number">{formatKpiValue(value, format)}</span>
              {unit && <span className="kpi-card__unit">{unit}</span>}
            </p>
            {delta && (
              <p className={`kpi-card__delta kpi-card__delta--${tone}`}>
                {deltaIcon && <Icons icon={deltaIcon} size={14} className="kpi-card__delta-icon" />}
                <span aria-hidden="true">{formatDelta(delta.value, deltaUnit)}</span>
                {delta.label && (
                  <span className="kpi-card__delta-label" aria-hidden="true">
                    {delta.label}
                  </span>
                )}
                <span className="kpi-card__sr-only">
                  {describeDelta(delta.value, deltaUnit, goodDirection, delta.label)}
                </span>
              </p>
            )}
          </div>
          {trend && trend.length > 1 && <Sparkline values={trend} />}
        </div>
      )}

      {description && !loading && <p className="kpi-card__description">{description}</p>}
    </div>
  );
};
