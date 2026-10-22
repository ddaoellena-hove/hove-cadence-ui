export interface ChartTick {
  key: string;
  /** Position en px le long de l'axe. */
  position: number;
  label: string;
}

interface ChartAxisLeftProps {
  ticks: ChartTick[];
  /** Largeur de la zone de tracé (longueur des lignes de grille). */
  plotWidth: number;
  /** Lignes de grille horizontales. Défaut true. */
  grid?: boolean;
}

/** Axe vertical (interne) : valeurs en mono à gauche, grille horizontale. */
export const ChartAxisLeft = ({ ticks, plotWidth, grid = true }: ChartAxisLeftProps) => (
  <g aria-hidden="true">
    {ticks.map((tick) => (
      <g key={tick.key}>
        {grid && <line className="chart__grid-line" x1={0} x2={plotWidth} y1={tick.position} y2={tick.position} />}
        <text className="chart__axis-label" x={-8} y={tick.position} dy="0.32em" textAnchor="end">
          {tick.label}
        </text>
      </g>
    ))}
  </g>
);

interface ChartAxisBottomProps {
  ticks: ChartTick[];
  /** Ordonnée de l'axe (bas de la zone de tracé). */
  y: number;
  plotWidth: number;
  /** Étiquettes de dates (police sans) plutôt que de nombres (mono). */
  dates?: boolean;
}

/** Axe horizontal (interne) : ligne de base et étiquettes centrées. */
export const ChartAxisBottom = ({ ticks, y, plotWidth, dates = false }: ChartAxisBottomProps) => (
  <g aria-hidden="true">
    <line className="chart__axis-line" x1={0} x2={plotWidth} y1={y} y2={y} />
    {ticks.map((tick) => (
      <text
        key={tick.key}
        className={`chart__axis-label${dates ? " chart__axis-label--date" : ""}`}
        x={tick.position}
        y={y + 18}
        textAnchor="middle"
      >
        {tick.label}
      </text>
    ))}
  </g>
);
