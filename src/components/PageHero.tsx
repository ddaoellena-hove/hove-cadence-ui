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

/** Accent du bandeau : vert sous contrôle, ambre ou rouge à investiguer. Toujours doublé d'un statut textuel. */
export type PageHeroTone = "neutral" | "positive" | "warning" | "critical";

/** Fraîcheur ; `updatedAt: null` = heure d'actualisation inconnue (jamais reconstruite). */
export type PageHeroFreshness = Omit<DataFreshnessProps, "updatedAt"> & { updatedAt: DataFreshnessProps["updatedAt"] | null };

/** Panneau d'action à côté du KPI principal : sujets à traiter, impact, action principale. */
export interface PageHeroActionPanel {
  /** « 2 sujets à traiter » : un nombre issu d'une source et d'un périmètre explicites. */
  title: string;
  /** « Impact possible dès le 1er septembre » : au conditionnel tant qu'il n'est pas confirmé. */
  description?: string;
  action?: { label: string; onClick: () => void; disabled?: boolean };
}

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
  /** Libellé d'action de la tuile cliquable (« Consulter les flux »). Défaut « Voir le détail ». */
  actionLabel?: string;
  disabled?: boolean;
}

export interface PageHeroProps {
  title: string;
  description?: string;
  /** h1 pour remplacer PageHeader, h2 pour une synthèse sous un PageHeader. */
  headingLevel?: 1 | 2;
  /** Tuile d'icône à gauche du titre, teintée par `status` (statique). */
  icon?: IconName;
  /** Libellé du KPI principal (« Variation des courses »). */
  valueLabel?: string;
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
  /** Accent du bandeau (filet en haut, bordure du panneau d'action). Défaut "neutral". */
  tone?: PageHeroTone;
  freshness?: PageHeroFreshness;
  /** Panneau d'action à côté du KPI principal (côte à côte en large, dessous en étroit). */
  actionPanel?: PageHeroActionPanel;
  kpis?: PageHeroKpi[];
  actions?: ReactNode;
  /** "loading" : squelettes, aucune valeur ancienne ; "error" : message et « Réessayer ». Défaut "ready". */
  state?: "ready" | "loading" | "error";
  /** Équivalent de `state="loading"`. */
  loading?: boolean;
  /** Message de l'état "error". */
  errorMessage?: string;
  /** Bouton « Réessayer » de l'état "error". */
  onRetry?: () => void;
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
  valueLabel,
  valueType,
  unit,
  valueCaption,
  valueTone = "default",
  status,
  statusLabel,
  tone = "neutral",
  freshness,
  actionPanel,
  kpis = [],
  actions,
  state: stateProp = "ready",
  loading = false,
  errorMessage = "Impossible de charger la synthèse.",
  onRetry,
  className,
}: PageHeroProps) => {
  const id = useId();
  const state = loading ? "loading" : stateProp;
  // En chargement ou en erreur, ni accent ni icône teintée : l'état affiché ne serait plus à jour
  const shownTone = state === "ready" ? tone : "neutral";
  const iconTone = state === "ready" ? status : undefined;
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const mainType = value === undefined ? "number" : typeOf(value, valueType);

  return (
    <section
      aria-labelledby={id}
      aria-busy={state === "loading" || undefined}
      className={["page-hero", shownTone !== "neutral" ? `page-hero--${shownTone}` : "", className].filter(Boolean).join(" ")}
    >
      <header className="page-hero__header">
        <div className="page-hero__heading">
          {icon && (
            <span className={`page-hero__icon${iconTone ? ` page-hero__icon--${iconTone}` : ""}`} aria-hidden="true">
              <Icons icon={icon} size={20} />
            </span>
          )}
          <div>
            <Heading id={id} className={`page-hero__title page-hero__title--${headingLevel}`}>
              {title}
            </Heading>
            {description && <p className="page-hero__description">{description}</p>}
            {/* Fraîcheur dans l'en-tête, à côté de la version ; masquée en chargement et en erreur */}
            {freshness && state === "ready" && (
              <div className="page-hero__freshness">
                {freshness.updatedAt === null ? (
                  <p className="page-hero__freshness-unknown">Heure d’actualisation inconnue</p>
                ) : (
                  <DataFreshness {...freshness} updatedAt={freshness.updatedAt} inverse />
                )}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="page-hero__actions">{actions}</div>}
      </header>
      {state === "loading" ? (
        // Squelettes seulement : aucune valeur ancienne présentée comme actuelle
        <div className="page-hero__loading">
          <Skeleton variant="rect" width={240} height={48} />
          {kpis.length > 0 && (
            <div className="page-hero__kpis">
              {kpis.map((kpi) => (
                <Skeleton key={kpi.id} variant="rect" height={96} />
              ))}
            </div>
          )}
          <span role="status" className="page-hero__sr-only">
            Chargement…
          </span>
        </div>
      ) : state === "error" ? (
        // Pas de fraîcheur affichée : une actualisation échouée ne garde pas son badge « à jour »
        <div className="page-hero__error" role="alert">
          <p className="page-hero__error-message">{errorMessage}</p>
          {onRetry && (
            <button type="button" className="page-hero__button" onClick={onRetry}>
              Réessayer
            </button>
          )}
        </div>
      ) : (
        <>
          {(value !== undefined || status || actionPanel) && (
            <div className={`page-hero__main${actionPanel ? " page-hero__main--panel" : ""}`}>
              {(value !== undefined || status) && (
                <div className="page-hero__primary">
                  {valueLabel && <p className="page-hero__value-label">{valueLabel}</p>}
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
                </div>
              )}
              {actionPanel && (
                <div className="page-hero__panel">
                  <p className="page-hero__panel-title">{actionPanel.title}</p>
                  {actionPanel.description && <p className="page-hero__panel-description">{actionPanel.description}</p>}
                  {actionPanel.action && (
                    <button type="button" className="page-hero__button" disabled={actionPanel.action.disabled} onClick={actionPanel.action.onClick}>
                      {actionPanel.action.label}
                      <Icons icon="arrow-right" size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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
                        {kpi.actionLabel ?? "Voir le détail"} <Icons icon="arrow-right" size={14} />
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
                          kpi.actionLabel ?? "voir le détail",
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
