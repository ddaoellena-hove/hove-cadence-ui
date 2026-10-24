import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesMarker, seriesPattern, svgId } from "./chart-palette";
import { describeTile, formatTileShare, layoutTreemap, type TreemapNodeInput, type TreemapTile } from "./treemap-utils";
import { useChartWidth } from "./use-chart-size";
import "./treemap.css";

export type TreemapNode = TreemapNodeInput;

export interface TreemapProps extends ChartCommonProps {
  /** Racine de la hiérarchie (réseau) ; ses enfants sont les branches colorées (modes). */
  data: TreemapNode;
  /** Unité des valeurs (« km », « k validations »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Clic ou Entrée sur une tuile (ouvrir le détail de la ligne). */
  onTileClick?: (tile: { id: string; label: string; value: number; path: string[] }) => void;
  /** Légende des branches (dès deux branches). Défaut true. */
  showLegend?: boolean;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du pavage. Défaut 360. */
  height?: number;
}

const HEADER = 18;
// Libellé d'une tuile seulement s'il tient (largeur, hauteur en px)
const LABEL_MIN = { width: 56, height: 30 };

/**
 * Pavage hiérarchique : poids de chaque élément dans un total (réseau → mode
 * → ligne) en km, coûts ou validations. Une couleur et un motif par branche
 * de premier niveau, aire proportionnelle à la valeur, libellé quand il tient.
 * Tuiles parcourues au clavier, chemin complet annoncé, alternative tabulaire.
 */
export const Treemap = ({
  data,
  unit,
  format,
  onTileClick,
  showLegend = true,
  hideTitle = false,
  height = 360,
  ...frame
}: TreemapProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const patternPrefix = svgId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const { tiles, groups, branches, total } = layoutTreemap(data, width, height, HEADER);
  const colorOf = (group: number) => seriesColor(group);

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const index = tiles.findIndex((t) => px >= t.x0 && px <= t.x1 && py >= t.y0 && py <= t.y1);
    activate(index >= 0 ? index : null, e.currentTarget);
  };

  const open = (tile: TreemapTile) => onTileClick?.({ id: tile.id, label: tile.label, value: tile.value, path: tile.path });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (tiles.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && onTileClick && active !== null) {
      e.preventDefault();
      open(tiles[active]);
      return;
    }
    const last = tiles.length - 1;
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

  const legend =
    showLegend && branches.length > 1 ? (
      <ChartLegend
        items={branches.map((g) => ({
          id: g.id,
          label: `${g.label} · ${formatTileShare(g.value, total)}`,
          color: colorOf(g.group),
          marker: seriesMarker(g.group),
          icon: <ChartPatternSwatch kind={seriesPattern(g.group)} color={colorOf(g.group)} />,
        }))}
      />
    ) : undefined;

  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Élément", unit ? `Valeur (${unit})` : "Valeur", "Part du total"]}
      numeric={[1, 2]}
      rows={tiles.map((t) => [t.path.join(" › "), formatKpiValue(t.value, format), formatTileShare(t.value, total)])}
    />
  );

  const activeTile = active !== null ? tiles[active] : null;

  return (
    <ChartFrame
      {...frame}
      kind="treemap"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      legend={legend}
      table={table}
    >
      <div
        ref={plotRef}
        className={`chart__plot${onTileClick && activeTile ? " treemap__plot--clickable" : ""}`}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="pavage hiérarchique"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onClick={() => activeTile && open(activeTile)}
        onFocus={(e) => activate(active ?? (tiles.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <defs>
            {branches.map((g) => (
              <ChartPatternDef key={g.id} id={`${patternPrefix}-${g.group}`} kind={seriesPattern(g.group)} />
            ))}
          </defs>
          {/* Bandeau de chaque branche : libellé et total */}
          {groups.map((g) => (
            <g key={g.id} className="treemap__group">
              <rect className="treemap__group-frame" x={g.x0} y={g.y0} width={g.x1 - g.x0} height={g.y1 - g.y0} rx={3} />
              {g.x1 - g.x0 > 60 && (
                <text className="treemap__group-label" x={g.x0 + 6} y={g.y0 + 13}>
                  {`${g.label} · ${formatValueWithUnit(g.value, unit, format)}`}
                </text>
              )}
            </g>
          ))}
          {tiles.map((t, i) => {
            const w = t.x1 - t.x0;
            const h = t.y1 - t.y0;
            const color = colorOf(t.group);
            const pattern = seriesPattern(t.group);
            return (
              <g key={t.id} className={`treemap__tile${active === i ? " treemap__tile--active" : ""}`}>
                <rect x={t.x0} y={t.y0} width={w} height={h} rx={2} fill={color} />
                {pattern !== "solid" && <rect x={t.x0} y={t.y0} width={w} height={h} rx={2} fill={`url(#${patternPrefix}-${t.group})`} />}
                {w >= LABEL_MIN.width && h >= LABEL_MIN.height && (
                  <text className="treemap__label" x={t.x0 + 6} y={t.y0 + 15}>
                    <tspan>{t.label}</tspan>
                    {h >= LABEL_MIN.height + 14 && (
                      <tspan className="treemap__value" x={t.x0 + 6} dy={14}>
                        {formatValueWithUnit(t.value, unit, format)}
                      </tspan>
                    )}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {activeTile ? describeTile(activeTile, total, unit, format) : ""}
        </p>
      </div>
      {activeTile && (
        <ChartTooltip
          x={origin.left + activeTile.x1}
          y={origin.top + activeTile.y0}
          title={activeTile.path.join(" › ")}
          rows={[
            {
              id: "value",
              label: "Valeur",
              value: formatValueWithUnit(activeTile.value, unit, format),
              icon: <ChartPatternSwatch kind={seriesPattern(activeTile.group)} color={colorOf(activeTile.group)} />,
            },
            { id: "share", label: "Part du total", value: formatTileShare(activeTile.value, total) },
          ]}
          note={onTileClick ? "Entrée ou clic : voir le détail" : undefined}
        />
      )}
    </ChartFrame>
  );
};
