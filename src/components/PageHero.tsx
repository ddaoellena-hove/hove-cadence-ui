import { useId, type ReactNode } from "react";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { DataFreshness, type DataFreshnessProps } from "./DataFreshness";
import { Icons } from "./Icons";
import { Skeleton } from "./Skeleton";
import { formatKpiValue, formatDelta } from "./card-utils";
import { indicatorLabel } from "./indicator-label";
import "./page-hero.css";
export interface PageHeroKpi {
  id: string;
  label: string;
  value: number | string;
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
  value?: number | string;
  unit?: string;
  status?: IndicatorVariant;
  statusLabel?: string;
  freshness?: DataFreshnessProps;
  kpis?: PageHeroKpi[];
  actions?: ReactNode;
  loading?: boolean;
  className?: string;
}
export const PageHero = ({ title, description, headingLevel = 1, value, unit, status, statusLabel, freshness, kpis = [], actions, loading = false, className }: PageHeroProps) => {
  const id = useId();
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <section aria-labelledby={id} aria-busy={loading || undefined} className={["page-hero", className].filter(Boolean).join(" ")}>
    <header className="page-hero__header"><div><Heading id={id} className={`page-hero__title page-hero__title--${headingLevel}`}>{title}</Heading>{description && <p className="page-hero__description">{description}</p>}</div>{actions && <div className="page-hero__actions">{actions}</div>}</header>
    {loading ? <><Skeleton variant="rect" width={160} height={48} /><span role="status">Chargement…</span></> : <>
      {(value !== undefined || status) && <div className="page-hero__summary">{value !== undefined && <span className="page-hero__value">{formatKpiValue(value)}{unit && <span className="page-hero__unit"> {unit}</span>}</span>}{status && <Indicator variant={status} label={statusLabel} inverse />}</div>}
      {freshness && <DataFreshness {...freshness} inverse />}
      {kpis.length > 0 && <ul className="page-hero__kpis">{kpis.map(kpi => {
        const content = <><span className="page-hero__kpi-label">{kpi.label}</span><span className="page-hero__kpi-value">{formatKpiValue(kpi.value)}{kpi.unit && <small> {kpi.unit}</small>}</span>{kpi.status && <Indicator variant={kpi.status} label={kpi.statusLabel} inverse />}{kpi.delta && <span className="page-hero__kpi-delta">{formatDelta(kpi.delta.value, kpi.delta.unit ?? "%")} {kpi.delta.label}</span>}{kpi.onClick && <span className="page-hero__kpi-action">Voir le détail <Icons icon="arrow-right" size={14} /></span>}</>;
        return <li key={kpi.id}>{kpi.onClick ? <button type="button" className="page-hero__kpi" disabled={kpi.disabled} onClick={kpi.onClick} aria-label={[kpi.label, `${formatKpiValue(kpi.value)} ${kpi.unit ?? ""}`, kpi.status ? kpi.statusLabel ?? indicatorLabel[kpi.status] : null, kpi.delta ? `${formatDelta(kpi.delta.value, kpi.delta.unit ?? "%")} ${kpi.delta.label ?? ""}` : null, "voir le détail"].filter(Boolean).join(", ")}>{content}</button> : <div className="page-hero__kpi">{content}</div>}</li>;
      })}</ul>}
    </>}
  </section>;
};
