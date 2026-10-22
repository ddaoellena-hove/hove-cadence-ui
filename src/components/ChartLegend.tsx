import { ChartMarkerIcon } from "./ChartMarker";
import type { MarkerShape } from "./chart-palette";

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  marker: MarkerShape;
  hidden?: boolean;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  /** Masquer / afficher une série (bouton aria-pressed). Sans callback, légende statique. */
  onToggle?: (id: string) => void;
}

/** Légende des séries (interne) : forme de marqueur + couleur + libellé. */
export const ChartLegend = ({ items, onToggle }: ChartLegendProps) => (
  <ul className="chart-legend" aria-label="Légende">
    {items.map((item) => (
      <li key={item.id}>
        {onToggle ? (
          <button
            type="button"
            className="chart-legend__item"
            aria-pressed={!item.hidden}
            onClick={() => onToggle(item.id)}
          >
            <ChartMarkerIcon shape={item.marker} color={item.color} />
            {item.label}
          </button>
        ) : (
          <span className="chart-legend__item">
            <ChartMarkerIcon shape={item.marker} color={item.color} />
            {item.label}
          </span>
        )}
      </li>
    ))}
  </ul>
);
