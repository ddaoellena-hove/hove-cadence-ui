import type { ReactNode } from "react";
import { Icons, type IconName } from "./Icons";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { GhostButton } from "./GhostButton";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";
import { indicatorLabel } from "./indicator-label";
import "./summary-list.css";

export interface SummaryListItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: IconName;
  avatar?: ReactNode;
  status?: IndicatorVariant;
  statusLabel?: string;
  unread?: boolean;
  disabled?: boolean;
  action?: { label: string; onClick: () => void; icon?: IconName; disabled?: boolean };
}
export interface SummaryListProps {
  items: SummaryListItem[];
  "aria-label": string;
  onItemClick?: (item: SummaryListItem) => void;
  selectedId?: string;
  density?: "comfortable" | "compact";
  loading?: boolean;
  emptyTitle?: string;
  onShowAll?: () => void;
  showAllLabel?: string;
  className?: string;
}
/** Synthèse interactive : action principale et action secondaire sont des contrôles frères. */
export const SummaryList = ({ items, "aria-label": label, onItemClick, selectedId, density = "comfortable", loading = false, emptyTitle = "Aucun élément", onShowAll, showAllLabel = "Voir tout", className }: SummaryListProps) => (
  <section aria-label={label} aria-busy={loading || undefined} className={["summary-list", `summary-list--${density}`, className].filter(Boolean).join(" ")}>
    {loading ? <><Skeleton variant="rect" height={64} /><span role="status">Chargement…</span></> : !items.length ? <EmptyState title={emptyTitle} /> : <ul className="summary-list__items">
      {items.map(item => {
        const content = <>
          {(item.avatar || item.icon) && <span className="summary-list__icon" aria-hidden="true">{item.avatar ?? <Icons icon={item.icon!} size={20} />}</span>}
          <span className="summary-list__text"><span className="summary-list__title">{item.title}</span>{item.description && <span className="summary-list__description">{item.description}</span>}{item.meta && <span className="summary-list__meta">{item.meta}</span>}{item.unread && <span className="summary-list__unread">Non lu</span>}</span>
          {item.status && <Indicator variant={item.status} label={item.statusLabel} />}
          {onItemClick && <span className="summary-list__chevron" aria-hidden="true"><Icons icon="chevron-right" size={16} /></span>}
        </>;
        return <li key={item.id} className={`summary-list__item${selectedId === item.id ? " summary-list__item--selected" : ""}`}>
          {onItemClick ? <button type="button" className="summary-list__main" disabled={item.disabled} aria-current={selectedId === item.id || undefined} onClick={() => onItemClick(item)} aria-label={[item.title, item.description, item.meta, item.status ? item.statusLabel ?? indicatorLabel[item.status] : null, item.unread ? "Non lu" : null].filter(Boolean).join(", ")}>{content}</button> : <div className="summary-list__main" aria-disabled={item.disabled || undefined}>{content}</div>}
          {item.action && <GhostButton size="sm" label={item.action.label} aria-label={`${item.action.label} — ${item.title}`} iconStart={item.action.icon} disabled={item.disabled || item.action.disabled} onClick={item.action.onClick} />}
        </li>;
      })}
    </ul>}
    {onShowAll && <GhostButton label={showAllLabel} size="sm" onClick={onShowAll} />}
  </section>
);
