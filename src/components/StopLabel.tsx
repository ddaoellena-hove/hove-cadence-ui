/**
 * StopLabel component.
 *
 * Libellé d'un arrêt : nom lisible (Inter), identifiant technique dans un
 * Badge mono, et lignes desservies. Prévu pour une cellule de DataTable ou une
 * option d'Autocomplete. Le nom est tronqué par ellipse, son texte complet
 * reste disponible en infobulle native (title).
 */
import type { ReactNode } from "react";
import { Badge } from "./Badge";
import "./stop-label.css";

export interface StopLabelProps {
  /** Nom affiché (« Châtelet »). */
  name: string;
  /** Identifiant technique (« stop_area:IDFM:47026 »), en mono et atténué. */
  id?: string;
  /** Commune (« Paris 1er »). */
  city?: string;
  /** Lignes desservies (ex. des <LineBadge/>). */
  lines?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

export const StopLabel = ({ name, id, city, lines, className }: StopLabelProps) => {
  const rootClass = ["stop-label", className].filter(Boolean).join(" ");
  // Nom complet + commune en infobulle quand le texte est tronqué.
  const title = city ? `${name} — ${city}` : name;

  return (
    <span className={rootClass}>
      <span className="stop-label__text">
        <span className="stop-label__name" title={title}>
          <span className="stop-label__name-text">{name}</span>
          {city && <span className="stop-label__city">{city}</span>}
        </span>
        {id && (
          <span className="stop-label__id">
            <Badge label={id} mono />
          </span>
        )}
      </span>
      {lines && <span className="stop-label__lines">{lines}</span>}
    </span>
  );
};
