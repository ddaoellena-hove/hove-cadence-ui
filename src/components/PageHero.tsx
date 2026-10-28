import { useId, type ReactNode } from "react";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { DataFreshness, type DataFreshnessProps } from "./DataFreshness";
import { Icons, type IconName } from "./Icons";
import { Skeleton } from "./Skeleton";
import { formatKpiValue, formatDelta } from "./card-utils";
import { indicatorLabel } from "./indicator-label";
import "./page-hero.css";

/**
 * "number" : chiffre en mono (tabulaire) ; "text" : texte court en sans-serif
 * (« Intégrées · à vérifier », « 27 août · 15:41 »). Défaut : "number" pour
 * un nombre, "text" pour une chaîne.
 */
export type PageHeroValueType = "number" | "text";

/** Couleur d'alerte de la valeur principale, toujours doublée d'un statut textuel. */
export type PageHeroValueTone = "default" | "warning" | "critical";

export interface PageHeroKpi {
  id: string;
  label: string;
  value: number | string;
  /** Défaut : "number" pour un nombre, "text" pour une chaîne. */
  valueType?: PageHeroValueType;
  unit?: string;
  status?: IndicatorVariant;
  statusLabel?: string;
  delta?: { value: number; unit?: "%" | "pt"; label?: string };
  onClick?: () => void;
  disabled?: boolean;
}

export interface PageHeroProps {
  title: string;
  description?: string;
  /** h1 pour remplacer PageHeader, h2 pour une synthèse sous un PageHeader. */
  headingLevel?: 1 | 2;
  /** Tuile d'icône à gauche du titre, teintée par `status` (statique). */
  icon?: IconName;
  value?: number | string;
  /** Défaut : "number" pour un nombre, "text" pour une chaîne. */
  valueType?: PageHeroValueType;
  /** Unité courte collée à la valeur (« courses »). */
  unit?: string;
  /** Légende de la valeur, distincte de l'unité (« vs 26 août · −16 227 »). */
  valueCaption?: string;
  /** Couleur d'alerte de la valeur. ⚠️ Jamais seule : fournir aussi `status` / `statusLabel`. */
  valueTone?: PageHeroValueTone;
  status?: IndicatorVariant;
  statusLabel?: string;
  freshness?: DataFreshnessProps;
  kpis?: PageHeroKpi[];
  actions?: ReactNode;
  loading?: boolean;
  className?: string;
}

const typeOf = (value: number | string, valueType?: PageHeroValueType): PageHeroValueType =>
  valueType ?? (typeof value === "number" ? "number" : "text");

// Texte : affiché tel quel ; nombre : formaté fr-FR
const display = (value: number | string, type: PageHeroValueType) => (type === "text" ? value : formatKpiValue(value));

export const PageHero = ({
  title,
  description,
  headingLevel = 1,
  icon,
  value,
  valueType,
  unit,
  valueCaption,
  valueTone = "default",
  status,
  statusLabel,
  freshness,
  kpis = [],
  actions,
  loading = false,
  className,
}: PageHeroProps) => {
  const id = useId();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const mainType = value === undefined ? "number" : typeOf(value, valueType);

  return (
    <section aria-labelledby={id} aria-busy={loading || undefined} className={["page-hero", className].filter(Boolean).join(" ")}>
      <header className="page-hero__header">
        <div className="page-hero__heading">
          {icon && (
            <span className={`page-hero__icon${status ? ` page-hero__icon--${status}` : ""}`} aria-hidden="true">
              <Icons icon={icon} size={20} />
            </span>
          )}
          <div>
            <Heading id={id} className={`page-hero__title page-hero__title--${headingLevel}`}>
              {title}
            </Heading>
            {description && <p className="page-hero__description">{description}</p>}
          </div>
        </div>
        {actions && <div className="page-hero__actions">{actions}</div>}
      </header>
      {loading ? (
        <>
          <Skeleton variant="rect" width={160} height={48} />
          <span role="status">Chargement…</span>
        </>
      ) : (
        <>
          {(value !== undefined || status) && (
            <div className="page-hero__summary">
              {value !== undefined && (
                <span className={`page-hero__value page-hero__value--${mainType} page-hero__value--${valueTone}`}>
                  {display(value, mainType)}
                  {unit && <span className="page-hero__unit"> {unit}</span>}
                </span>
              )}
              {valueCaption && <span className="page-hero__caption">{valueCaption}</span>}
              {status && <Indicator variant={status} label={statusLabel} inverse />}
            </div>
          )}
          {freshness && <DataFreshness {...freshness} inverse />}
          {kpis.length > 0 && (
            <ul className="page-hero__kpis">
              {kpis.map((kpi) => {
                const type = typeOf(kpi.value, kpi.valueType);
                const shown = display(kpi.value, type);
                const delta = kpi.delta ? `${formatDelta(kpi.delta.value, kpi.delta.unit ?? "%")} ${kpi.delta.label ?? ""}` : null;
                const content = (
                  <>
                    <span className="page-hero__kpi-label">{kpi.label}</span>
                    <span className={`page-hero__kpi-value page-hero__kpi-value--${type}`}>
                      {shown}
                      {kpi.unit && <small> {kpi.unit}</small>}
                    </span>
                    {kpi.status && <Indicator variant={kpi.status} label={kpi.statusLabel} inverse />}
                    {delta && <span className="page-hero__kpi-delta">{delta}</span>}
                    {kpi.onClick && (
                      <span className="page-hero__kpi-action">
                        Voir le détail <Icons icon="arrow-right" size={14} />
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={kpi.id}>
                    {kpi.onClick ? (
                      <button
                        type="button"
                        className="page-hero__kpi"
                        disabled={kpi.disabled}
                        onClick={kpi.onClick}
                        aria-label={[
                          kpi.label,
                          `${shown} ${kpi.unit ?? ""}`,
                          kpi.status ? (kpi.statusLabel ?? indicatorLabel[kpi.status]) : null,
                          delta,
                          "voir le détail",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="page-hero__kpi">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
};
