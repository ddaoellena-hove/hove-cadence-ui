import { useId } from "react";
import { svgId, type PatternKind } from "./chart-palette";

// Motifs de séries pour les barres (internes) : texture blanche semi-opaque
// posée sur la couleur, une par série, pour que le sens ne repose pas sur la
// couleur seule. Série 1 unie.

const STROKE = { stroke: "var(--cadence-color-white, #ffffff)", strokeWidth: 1.5, strokeOpacity: 0.65 };

/** <pattern> d'une série, à placer dans les <defs> d'un SVG. */
export const ChartPatternDef = ({ id, kind }: { id: string; kind: PatternKind }) => {
  if (kind === "solid") return null;
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={6} height={6}>
      {kind === "diagonal" && <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" {...STROKE} />}
      {kind === "diagonal-back" && <path d="M-1,5 l2,2 M0,0 l6,6 M5,-1 l2,2" {...STROKE} />}
      {kind === "horizontal" && <path d="M0,3 h6" {...STROKE} />}
      {kind === "vertical" && <path d="M3,0 v6" {...STROKE} />}
      {kind === "grid" && <path d="M0,3 h6 M3,0 v6" {...STROKE} />}
      {kind === "cross" && <path d="M0,0 l6,6 M6,0 l-6,6" {...STROKE} />}
      {kind === "dots" && <circle cx={3} cy={3} r={1.2} fill="var(--cadence-color-white, #ffffff)" fillOpacity={0.75} />}
    </pattern>
  );
};

/** Pastille de légende ou de tooltip : couleur + motif de la série. */
export const ChartPatternSwatch = ({ kind, color }: { kind: PatternKind; color: string }) => {
  const id = svgId(useId());
  return (
    <svg width={14} height={12} viewBox="0 0 14 12" aria-hidden="true" className="chart-marker-icon">
      <defs>
        <ChartPatternDef id={id} kind={kind} />
      </defs>
      <rect x={0} y={0} width={14} height={12} rx={2} fill={color} />
      {kind !== "solid" && <rect x={0} y={0} width={14} height={12} rx={2} fill={`url(#${id})`} />}
    </svg>
  );
};
