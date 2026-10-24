import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartPatternDef } from "./ChartPattern";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesPattern, svgId } from "./chart-palette";
import { isDevMode } from "./dev-mode";
import { layoutSankey, ribbonPath, type SankeyLinkInput, type SankeyNodeInput } from "./sankey-chart-utils";
import { useChartWidth } from "./use-chart-size";
import "./sankey-chart.css";

export type SankeyChartNode = SankeyNodeInput;
export type SankeyChartLink = SankeyLinkInput;

export interface SankeyChartProps extends ChartCommonProps {
  /** Nœuds (gares, zones, modes) ; `column` impose l'étape, sinon déduite des liens. */
  nodes: SankeyChartNode[];
  /** Flux orientés source → cible ; volumes nuls, négatifs ou rétrogrades ignorés. */
  links: SankeyChartLink[];
  /** Unité des volumes (« k voyages »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Clic ou Entrée sur un flux. */
  onLinkClick?: (link: SankeyChartLink) => void;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 360. */
  height?: number;
}

const LABEL_SPACE = 150; // px réservés à gauche et à droite pour les libellés des colonnes extrêmes
const NODE_WIDTH = 12;

const percentFormat = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });

/**
 * Diagramme de flux (Sankey / alluvial) : volumes entre étapes, de gauche à
 * droite (origine → destination, correspondances entre modes). Rubans de
 * l'épaisseur du volume, à la couleur et au motif de leur origine. Flux
 * parcourus au clavier, chemin et part annoncés, alternative tabulaire.
 */
export const SankeyChart = ({
  nodes: nodesInput,
  links: linksInput,
  unit,
  format,
  onLinkClick,
  hideTitle = false,
  height = 360,
  ...frame
}: SankeyChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const patternPrefix = svgId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const innerWidth = Math.max(0, width - 2 * LABEL_SPACE);
  const { nodes, links, ignored } = layoutSankey(nodesInput, linksInput, innerWidth, height - 8, { nodeWidth: NODE_WIDTH });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lastColumn = Math.max(0, ...nodes.map((n) => n.column));

  useEffect(() => {
    if (ignored > 0 && isDevMode()) console.warn(`[cadence-ui] SankeyChart : ${ignored} flux ignoré(s) (cycle ou retour vers une étape antérieure).`);
  }, [ignored]);

  const v = (n: number) => formatValueWithUnit(n, unit, format);
  const share = (link: (typeof links)[number]) => {
    const source = byId.get(link.source);
    return source && source.value > 0 ? link.value / source.value : 0;
  };
  const describe = (link: (typeof links)[number]) => {
    const s = byId.get(link.source);
    const t = byId.get(link.target);
    return `${s?.label} → ${t?.label} : ${v(link.value)}, ${percentFormat.format(share(link))} des départs de ${s?.label}`;
  };

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest("[data-link]");
    activate(target ? Number(target.getAttribute("data-link")) : null, e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (links.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && onLinkClick && active !== null) {
      e.preventDefault();
      const { source, target, value } = links[active];
      onLinkClick({ source, target, value });
      return;
    }
    const last = links.length - 1;
    const current = active ?? 0;
    const next = ["ArrowRight", "ArrowDown"].includes(e.key)
      ? Math.min(last, current + 1)
      : ["ArrowLeft", "ArrowUp"].includes(e.key)
        ? Math.max(0, current - 1)
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? last
            : null;
    if (next === null) return;
    e.preventDefault();
    activate(next, e.currentTarget);
  };

  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Origine", "Destination", unit ? `Volume (${unit})` : "Volume", "Part de l'origine"]}
      numeric={[2, 3]}
      rows={links.map((l) => [byId.get(l.source)?.label ?? l.source, byId.get(l.target)?.label ?? l.target, formatKpiValue(l.value, format), percentFormat.format(share(l))])}
    />
  );

  const activeLink = active !== null ? links[active] : null;
  const groups = [...new Set(nodes.map((n) => n.group))];

  return (
    <ChartFrame
      {...frame}
      kind="sankey-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      table={table}
    >
      <div
        ref={plotRef}
        className={`chart__plot${onLinkClick && activeLink ? " sankey-chart__plot--clickable" : ""}`}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="diagramme de flux"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onClick={() => activeLink && onLinkClick?.({ source: activeLink.source, target: activeLink.target, value: activeLink.value })}
        onFocus={(e) => activate(active ?? (links.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <defs>
            {groups.map((g) => (
              <ChartPatternDef key={g} id={`${patternPrefix}-${g}`} kind={seriesPattern(g)} />
            ))}
          </defs>
          <g transform={`translate(${LABEL_SPACE},4)`}>
            {/* Rubans : sous les nœuds, à la couleur (et au motif) de leur origine */}
            {links.map((l, i) => {
              const s = byId.get(l.source);
              const t = byId.get(l.target);
              if (!s || !t) return null;
              const d = ribbonPath(s.x1, l.y0, t.x0, l.y1, Math.max(1, l.width));
              const dimmed = active !== null && active !== i;
              return (
                <g key={`${l.source}-${l.target}`} data-link={i} className={`sankey-chart__link${dimmed ? " sankey-chart__link--dimmed" : ""}${active === i ? " sankey-chart__link--active" : ""}`}>
                  <path d={d} fill={seriesColor(l.group)} />
                  {seriesPattern(l.group) !== "solid" && <path d={d} fill={`url(#${patternPrefix}-${l.group})`} />}
                </g>
              );
            })}
            {nodes.map((n) => {
              const labelLeft = n.column === 0;
              const labelRight = n.column === lastColumn;
              const x = labelLeft ? n.x0 - 8 : n.x1 + 8;
              return (
                <g key={n.id} className="sankey-chart__node">
                  <rect x={n.x0} y={n.y0} width={n.x1 - n.x0} height={Math.max(1, n.y1 - n.y0)} rx={2} fill={seriesColor(n.group)} />
                  <text
                    className="sankey-chart__label"
                    x={x}
                    y={(n.y0 + n.y1) / 2}
                    dy="0.32em"
                    textAnchor={labelLeft ? "end" : "start"}
                  >
                    <tspan>{n.label}</tspan>
                    {(labelLeft || labelRight || n.y1 - n.y0 > 24) && (
                      <tspan className="sankey-chart__value">{` · ${formatKpiValue(n.value, format)}`}</tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {activeLink ? describe(activeLink) : ""}
        </p>
      </div>
      {activeLink && (
        <ChartTooltip
          x={origin.left + LABEL_SPACE + ((byId.get(activeLink.source)?.x1 ?? 0) + (byId.get(activeLink.target)?.x0 ?? 0)) / 2}
          y={origin.top + 4 + (activeLink.y0 + activeLink.y1) / 2}
          title={`${byId.get(activeLink.source)?.label} → ${byId.get(activeLink.target)?.label}`}
          rows={[
            { id: "value", label: "Volume", value: v(activeLink.value) },
            { id: "share", label: "Part des départs", value: percentFormat.format(share(activeLink)) },
          ]}
          note={onLinkClick ? "Entrée ou clic : voir le détail" : undefined}
        />
      )}
    </ChartFrame>
  );
};
