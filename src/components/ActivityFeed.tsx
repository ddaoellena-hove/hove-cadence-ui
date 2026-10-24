import type { ReactNode } from "react";
import { Icons, type IconName } from "./Icons";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { Skeleton } from "./Skeleton";
import "./activity-feed.css";

export type ActivityTone = "neutral" | "success" | "warning" | "danger";
export interface ActivityItem {
  id: string;
  title: string;
  /** Date absolue, non relative : stable et compréhensible après relecture. */
  date: Date;
  author?: string;
  description?: ReactNode;
  tone?: ActivityTone;
  icon?: IconName;
}
export interface ActivityFeedProps {
  items: ActivityItem[];
  "aria-label": string;
  /** L'app fournit les événements dans l'ordre voulu. */
  loading?: boolean;
  emptyTitle?: string;
  /** Fuseau explicite recommandé. Défaut UTC pour un rendu SSR stable. */
  timeZone?: string;
  className?: string;
}

const ICON: Record<ActivityTone, IconName> = { neutral: "clock-rewind", success: "check-circle", warning: "alert-triangle", danger: "x-close" };
const TONE_LABEL: Record<ActivityTone, string> = { neutral: "Information", success: "Succès", warning: "Avertissement", danger: "Erreur" };
// Statut de l'étape en Indicator (couleur sémantique). Neutre : pas de statut affiché.
const STATUS: Record<Exclude<ActivityTone, "neutral">, IndicatorVariant> = { success: "completed", warning: "warning", danger: "critical" };

/**
 * Historique d'événements ponctuels ; ce composant n'est pas une frise de périodes.
 * Hiérarchie d'une étape : titre + statut (Indicator), puis auteur (avatar) et
 * date en secondaire, puis le contenu mis en avant dans un encadré.
 */
export const ActivityFeed = ({ items, "aria-label": ariaLabel, loading = false, emptyTitle = "Aucune activité", timeZone = "UTC", className }: ActivityFeedProps) => {
  const format = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone });
  return <div aria-label={ariaLabel} role="region" aria-busy={loading || undefined} className={["activity-feed", className].filter(Boolean).join(" ")}>
    {loading ? <><span className="activity-feed__sr" role="status">Chargement de l’historique…</span><Skeleton lines={3} /></> :
      items.length === 0 ? <EmptyState size="inline" title={emptyTitle} /> :
      <ol className="activity-feed__list">
        {items.map((item) => {
          const tone = item.tone ?? "neutral";
          const validDate = Number.isFinite(item.date.getTime());
          return <li className={`activity-feed__item activity-feed__item--${tone}`} key={item.id}>
            <span className="activity-feed__marker"><Icons icon={item.icon ?? ICON[tone]} size={16} /></span>
            <div className="activity-feed__body">
              <div className="activity-feed__heading">
                <span className="activity-feed__title">{item.title}</span>
                {tone !== "neutral" && <Indicator variant={STATUS[tone]} label={TONE_LABEL[tone]} className="activity-feed__status" />}
              </div>
              <div className="activity-feed__meta">
                {item.author && <span className="activity-feed__author">
                  {/* Avatar décoratif : le nom est écrit juste à côté */}
                  <span className="activity-feed__avatar" aria-hidden="true"><Avatar name={item.author} size="sm" /></span>
                  <span className="activity-feed__author-name">{item.author}</span>
                </span>}
                {validDate ? <time dateTime={item.date.toISOString()}>{format.format(item.date)}</time> : <span>Date indisponible</span>}
              </div>
              {item.description !== undefined && <div className="activity-feed__description">{item.description}</div>}
            </div>
          </li>;
        })}
      </ol>}
  </div>;
};
