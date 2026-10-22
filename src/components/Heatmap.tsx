import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { sequentialColor } from "./chart-palette";
import {
  buildStepScale,
  columnLabelEvery,
  heatmapDomain,
  indexCells,
  moveInGrid,
  rampThresholds,
  type GridPosition,
} from "./heatmap-utils";
import { useChartWidth } from "./use-chart-size";
import "./heatmap.css";

export interface HeatmapCell {
  /** Colonne : « 08 h ». */
  x: string;
  /** Ligne : « lun. ». */
  y: string;
  /** null = pas de donnée (hachures), différent de 0. */
  value: number | null;
}

export interface HeatmapProps extends ChartCommonProps {
  /** Ordre des colonnes. */
  xLabels: string[];
  /** Ordre des lignes. */
  yLabels: string[];
  cells: HeatmapCell[];
  /** Domaine de la rampe. Défaut [0, max]. 7 classes. */
  domain?: [number, number];
  /** Unité du tooltip et de la légende (« perturbations »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Clic ou Entrée sur une cellule (ouvrir la liste filtrée). */
  onCellClick?: (cell: HeatmapCell) => void;
  /** Hauteur d'une ligne. Défaut 28. */
  rowHeight?: number;
}

const LABEL_COLUMN = 56;

/**
 * Carte de chaleur à deux catégories (jour × heure, ligne × jour) sur la
 * rampe séquentielle. Grille accessible (role="grid") : en-têtes de lignes et
 * de colonnes, navigation aux flèches, tooltip au survol et au focus.
 */
export const Heatmap = ({
  xLabels,
  yLabels,
  cells,
  domain: domainProp,
  unit,
  format,
  onCellClick,
  rowHeight = 28,
  ...frame
}: HeatmapProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(wrapRef);
  const [focus, setFocus] = useState<GridPosition>({ row: 0, col: 0 });
  const [tooltip, setTooltip] = useState<{ cell: HeatmapCell; x: number; y: number } | null>(null);

  const domain = heatmapDomain(cells, domainProp);
  const stepOf = buildStepScale(domain);
  const byKey = indexCells(cells);
  const cellAt = (row: number, col: number): HeatmapCell => {
    const x = xLabels[col];
    const y = yLabels[row];
    return byKey.get(`${y}|${x}`) ?? { x, y, value: null };
  };
  const labelEvery = columnLabelEvery(width - LABEL_COLUMN, xLabels.length);
  const height = rowHeight * (yLabels.length + 1) + 40;

  const describe = (cell: HeatmapCell) =>
    `${cell.y}, ${cell.x} : ${cell.value === null ? "pas de donnée" : formatValueWithUnit(cell.value, unit, format)}`;

  const showTooltip = (cell: HeatmapCell, element: Element) => {
    const rect = element.getBoundingClientRect();
    setTooltip({ cell, x: rect.right, y: rect.top });
  };

  // Le focus suit la cellule active (roving tabindex)
  const focusCell = (position: GridPosition) => {
    setFocus(position);
    const element = wrapRef.current?.querySelector<HTMLElement>(`[data-cell="${position.row}-${position.col}"]`);
    element?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    if ((e.key === "Enter" || e.key === " ") && onCellClick) {
      e.preventDefault();
      const cell = cellAt(focus.row, focus.col);
      if (cell.value !== null) onCellClick(cell);
      return;
    }
    if (e.key === "Escape") {
      setTooltip(null);
      return;
    }
    const next = moveInGrid(focus, e.key, e.ctrlKey || e.metaKey, yLabels.length, xLabels.length);
    if (!next) return;
    e.preventDefault();
    focusCell(next);
  };

  const ramp = rampThresholds(domain);
  const legend = (
    <div className="heatmap-legend" aria-label="Légende">
      <span className="heatmap-legend__bound">{formatKpiValue(domain[0], format)}</span>
      <span className="heatmap-legend__ramp" aria-hidden="true">
        {ramp.map((r) => (
          <span key={r.step} className="heatmap-legend__swatch" style={{ background: sequentialColor(r.step) }} />
        ))}
      </span>
      <span className="heatmap-legend__bound">{formatValueWithUnit(domain[1], unit, format)}</span>
      <span className="heatmap-legend__empty">
        <span className="heatmap-legend__swatch heatmap__cell--empty" aria-hidden="true" />
        Pas de donnée
      </span>
      <span className="chart__sr-only">
        {`Échelle de couleur en 7 classes, de ${formatKpiValue(domain[0], format)} à ${formatValueWithUnit(domain[1], unit, format)}, du plus clair au plus foncé.`}
      </span>
    </div>
  );

  return (
    <ChartFrame
      {...frame}
      kind="heatmap"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      legend={legend}
    >
      <div ref={wrapRef} className="heatmap__wrap">
        <table
          role="grid"
          className="heatmap__grid"
          aria-labelledby={titleId}
          aria-describedby={frame.description ? descriptionId : undefined}
          onKeyDown={handleKeyDown}
        >
          <thead>
            <tr>
              <td className="heatmap__corner" style={{ width: LABEL_COLUMN }} />
              {xLabels.map((x, col) => (
                <th key={x} scope="col" className="heatmap__col-label">
                  <span className={col % labelEvery === 0 ? undefined : "chart__sr-only"}>{x}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yLabels.map((y, row) => (
              <tr key={y}>
                <th scope="row" className="heatmap__row-label">
                  {y}
                </th>
                {xLabels.map((x, col) => {
                  const cell = cellAt(row, col);
                  const step = stepOf(cell.value);
                  const isFocus = focus.row === row && focus.col === col;
                  const clickable = Boolean(onCellClick) && cell.value !== null;
                  return (
                    <td
                      key={x}
                      role="gridcell"
                      data-cell={`${row}-${col}`}
                      tabIndex={isFocus ? 0 : -1}
                      aria-label={describe(cell)}
                      className={[
                        "heatmap__cell",
                        step === null ? "heatmap__cell--empty" : "",
                        clickable ? "heatmap__cell--clickable" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ height: rowHeight, background: step === null ? undefined : sequentialColor(step) }}
                      onClick={clickable ? () => onCellClick?.(cell) : undefined}
                      onFocus={(e: FocusEvent<HTMLTableCellElement>) => {
                        setFocus({ row, col });
                        showTooltip(cell, e.currentTarget);
                      }}
                      onBlur={() => setTooltip(null)}
                      onMouseEnter={(e: MouseEvent<HTMLTableCellElement>) => showTooltip(cell, e.currentTarget)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="chart__sr-only" aria-live="polite">
          {tooltip ? describe(tooltip.cell) : ""}
        </p>
      </div>
      {tooltip && (
        <ChartTooltip
          x={tooltip.x}
          y={tooltip.y}
          title={`${tooltip.cell.y} · ${tooltip.cell.x}`}
          rows={[
            {
              id: "value",
              label: unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : "Valeur",
              value: tooltip.cell.value === null ? "Pas de donnée" : formatKpiValue(tooltip.cell.value, format),
            },
          ]}
          note={onCellClick && tooltip.cell.value !== null ? "Entrée ou clic : voir la liste" : undefined}
        />
      )}
    </ChartFrame>
  );
};
