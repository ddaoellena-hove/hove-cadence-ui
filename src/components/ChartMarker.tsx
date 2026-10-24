import { REFERENCE_COLOR, type MarkerShape } from "./chart-palette";

interface ChartMarkerProps {
  shape: MarkerShape;
  /** Centre du marqueur (dans un <svg>). */
  x: number;
  y: number;
  /** Demi-taille. Défaut 4. */
  size?: number;
  color: string;
  className?: string;
}

/** Marqueur de série (interne) : une forme par série, en plus de la couleur. */
export const ChartMarker = ({ shape, x, y, size = 4, color, className }: ChartMarkerProps) => {
  const s = size;
  const common = { className, fill: color, stroke: "var(--cadence-color-white, #ffffff)", strokeWidth: 1.5 };
  switch (shape) {
    case "square":
      return <rect {...common} x={x - s} y={y - s} width={s * 2} height={s * 2} />;
    case "triangle":
      return <polygon {...common} points={`${x},${y - s * 1.2} ${x + s * 1.1},${y + s * 0.9} ${x - s * 1.1},${y + s * 0.9}`} />;
    case "triangle-down":
      return <polygon {...common} points={`${x},${y + s * 1.2} ${x + s * 1.1},${y - s * 0.9} ${x - s * 1.1},${y - s * 0.9}`} />;
    case "diamond":
      return <polygon {...common} points={`${x},${y - s * 1.3} ${x + s * 1.3},${y} ${x},${y + s * 1.3} ${x - s * 1.3},${y}`} />;
    case "cross":
      return (
        <path
          className={className}
          d={`M${x - s},${y - s}L${x + s},${y + s}M${x + s},${y - s}L${x - s},${y + s}`}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    case "star": {
      const points = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? s * 1.4 : s * 0.6;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
      });
      return <polygon {...common} points={points.join(" ")} />;
    }
    case "ring":
      return <circle className={className} cx={x} cy={y} r={s} fill="var(--cadence-color-white, #ffffff)" stroke={color} strokeWidth={2.5} />;
    default:
      return <circle {...common} cx={x} cy={y} r={s} />;
  }
};

/** Marqueur seul dans un petit <svg> (légende, tooltip). */
export const ChartMarkerIcon = ({ shape, color }: { shape: MarkerShape; color: string }) => (
  <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" className="chart-marker-icon">
    <ChartMarker shape={shape} x={7} y={7} size={4} color={color} />
  </svg>
);

/** Pastille de légende ou de tooltip d'une série de référence (interne) : trait tireté ardoise. */
export const ReferenceSwatch = () => (
  <svg width={16} height={12} viewBox="0 0 16 12" aria-hidden="true" className="chart-marker-icon">
    <line x1={0} x2={16} y1={6} y2={6} stroke={REFERENCE_COLOR} strokeWidth={2} strokeDasharray="4 3" />
  </svg>
);
