import type { CSSProperties } from "react";
import { BarChart } from "./BarChart";
import "./data-visualization.css";

// Déprécié depuis la 0.5.0, supprimé en 1.0.0 : simple enveloppe de BarChart,
// qui traduit l'ancienne API (type, categories, series) sans rien casser.

// Remplacé par le bundler de l'application (React exige déjà cette définition)
declare const process: { env: { NODE_ENV?: string } };

/** @deprecated Utiliser `BarChartSeries`. */
export interface DataVisualizationSeries {
  label: string;
  /** Couleur imposée. Défaut : `--cadence-dataviz-series-N`. */
  color?: string;
  data: number[];
}

/** @deprecated Utiliser `BarChartProps`. */
export interface DataVisualizationProps {
  /** "stacked-vertical" → BarChart empilé ; "grouped-vertical" → groupé ; "horizontal" → groupé horizontal. */
  type: "stacked-vertical" | "grouped-vertical" | "horizontal";
  series: DataVisualizationSeries[];
  categories: string[];
  /** Hauteur du tracé (hors légende). Défaut 260. */
  height?: number;
  showLegend?: boolean;
  showGridLines?: boolean;
  showValues?: boolean;
  /** Ignoré : le tooltip de BarChart est toujours actif (survol et clavier). */
  showTooltip?: boolean;
  style?: CSSProperties;
  className?: string;
}

const warned = new Set<string>();

/** Avertit une fois, en développement. */
const warnDeprecated = () => {
  if (warned.has("DataVisualization") || process.env.NODE_ENV === "production") return;
  warned.add("DataVisualization");
  console.warn(
    '[cadence-ui] DataVisualization est déprécié et sera supprimé en 1.0.0 : utilisez BarChart (layout="stacked" | "grouped", orientation="vertical" | "horizontal", title obligatoire).',
  );
};

/**
 * @deprecated Utiliser `BarChart` (`layout="stacked" | "grouped"`,
 * `orientation="vertical" | "horizontal"`, `title` obligatoire). Supprimé en 1.0.0.
 */
export function DataVisualization({
  type,
  series,
  categories,
  height = 260,
  showLegend = true,
  showGridLines = true,
  showValues = false,
  style,
  className,
}: DataVisualizationProps) {
  warnDeprecated();

  return (
    <div className={["dv", className].filter(Boolean).join(" ")} style={style}>
      <BarChart
        // Pas de titre dans l'ancienne API : nom générique, masqué visuellement
        title="Graphique"
        hideTitle
        categories={categories}
        series={series.map((s, i) => ({ id: `serie-${i}`, label: s.label, data: s.data, color: s.color }))}
        layout={type === "stacked-vertical" ? "stacked" : "grouped"}
        orientation={type === "horizontal" ? "horizontal" : "vertical"}
        height={height}
        showLegend={showLegend}
        showGrid={showGridLines}
        showValues={showValues}
      />
    </div>
  );
}
