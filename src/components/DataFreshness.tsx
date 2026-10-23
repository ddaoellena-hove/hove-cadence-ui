/**
 * DataFreshness — fraîcheur d'une donnée : un point coloré (ton de statut) et
 * un libellé relatif compact (« Mis à jour il y a 3 min »), avec la date
 * absolue en `title` et pour les lecteurs d'écran. En-tête de tableau de bord,
 * barre d'outils, carte d'indicateur.
 *
 * Le ton suit l'âge : frais (`nominal`) < `freshWithin` ≤ vieillissant
 * (`warning`) < `staleWithin` ≤ périmé (`critical`).
 */
import { freshnessLevel, freshnessTone, formatRelative, toDate } from "./data-freshness-utils";
import "./data-freshness.css";

export interface DataFreshnessProps {
  /** Date de dernière mise à jour (Date, ISO ou timestamp). */
  updatedAt: Date | string | number;
  /** Instant de référence. Défaut : maintenant (fixer pour les tests). */
  now?: Date | string | number;
  /** Seuil « frais », en secondes. Défaut 300 (5 min). */
  freshWithin?: number;
  /** Seuil « vieillissant », en secondes. Défaut 3600 (1 h). */
  staleWithin?: number;
  /** Préfixe du libellé. Défaut « Mis à jour ». */
  label?: string;
  /** Masquer le point coloré. */
  hideDot?: boolean;
  /** Fuseau du format absolu. Défaut : fuseau local. */
  timeZone?: string;
  className?: string;
}

export const DataFreshness = ({
  updatedAt,
  now,
  freshWithin = 300,
  staleWithin = 3600,
  label = "Mis à jour",
  hideDot = false,
  timeZone,
  className,
}: DataFreshnessProps) => {
  const date = toDate(updatedAt);
  const reference = now !== undefined ? toDate(now) : new Date();

  if (!date || !reference) {
    return <span className={["data-freshness", "data-freshness--unknown", className].filter(Boolean).join(" ")}>Date indisponible</span>;
  }

  const ageSeconds = (reference.getTime() - date.getTime()) / 1000;
  const tone = freshnessTone(freshnessLevel(ageSeconds, freshWithin, staleWithin));
  const absolute = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone }).format(date);
  const relative = formatRelative(ageSeconds);
  const value = relative ?? `le ${absolute}`;

  const rootClass = ["data-freshness", className].filter(Boolean).join(" ");

  return (
    <time dateTime={date.toISOString()} className={rootClass} title={absolute}>
      {!hideDot && <span className={`data-freshness__dot data-freshness__dot--${tone}`} aria-hidden="true" />}
      <span className="data-freshness__text">
        {label} {value}
      </span>
      {/* Date absolue pour les lecteurs d'écran (le title n'est pas annoncé partout). */}
      {relative && <span className="data-freshness__sr"> — le {absolute}</span>}
    </time>
  );
};
