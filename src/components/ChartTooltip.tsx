import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChartMarkerIcon } from "./ChartMarker";
import type { MarkerShape } from "./chart-palette";
import "./chart-tooltip.css";

export interface ChartTooltipRow {
  id: string;
  label: string;
  value: string;
  color?: string;
  marker?: MarkerShape;
  /** Pastille à la place du marqueur (motif de barre). */
  icon?: ReactNode;
  /** Valeur mise en avant (seuil franchi…). */
  tone?: "default" | "alert";
}

interface ChartTooltipProps {
  /** Point d'ancrage, en coordonnées de la fenêtre. */
  x: number;
  y: number;
  /** En-tête : date ou catégorie. */
  title: string;
  rows: ChartTooltipRow[];
  /** Ligne d'information sous les valeurs (seuil, annotation). */
  note?: string;
  /** Rappel d'interaction (« Entrée ou clic : voir le détail »), sur sa propre ligne sous la note. */
  hint?: string;
}

const OFFSET = 12;
const MARGIN = 8;

/**
 * Tooltip commun des graphiques (interne) : rendu dans un portail au-dessus de
 * tout (--cadence-z-popover), gardé dans la fenêtre. Décoratif pour les
 * lecteurs d'écran : chaque graphique annonce la même information dans une
 * zone aria-live.
 */
export const ChartTooltip = ({ x, y, title, rows, note, hint }: ChartTooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x + OFFSET, top: y + OFFSET });

  // À droite et sous le point ; bascule à gauche / au-dessus s'il sortirait de la fenêtre
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    let left = x + OFFSET;
    let top = y + OFFSET;
    if (left + width > viewportWidth - MARGIN) left = Math.max(MARGIN, x - OFFSET - width);
    if (top + height > viewportHeight - MARGIN) top = Math.max(MARGIN, y - OFFSET - height);
    setPosition({ left, top });
  }, [x, y, title, rows, note, hint]);

  return createPortal(
    <div ref={ref} className="chart-tooltip" style={position} aria-hidden="true">
      <p className="chart-tooltip__title">{title}</p>
      <ul className="chart-tooltip__rows">
        {rows.map((row) => (
          <li key={row.id} className={`chart-tooltip__row${row.tone === "alert" ? " chart-tooltip__row--alert" : ""}`}>
            {row.icon ?? (row.marker && row.color && <ChartMarkerIcon shape={row.marker} color={row.color} />)}
            <span className="chart-tooltip__label">{row.label}</span>
            <span className="chart-tooltip__value">{row.value}</span>
          </li>
        ))}
      </ul>
      {note && <p className="chart-tooltip__note">{note}</p>}
      {hint && <p className="chart-tooltip__note">{hint}</p>}
    </div>,
    document.body,
  );
};
