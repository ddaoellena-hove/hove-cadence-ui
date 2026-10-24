import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { sequentialColor } from "./chart-palette";
import {
  axisTotals,
  buildStepScale,
  columnLabelEvery,
  heatmapDomain,
  indexCells,
  moveInGrid,
  rampThresholds,
  sortByTotal,
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
  /**
   * Totaux par ligne (dernière colonne), par colonne (dernière ligne) et total
   * général, en chiffres hors rampe : matrice origine-destination. Défaut false.
   */
  showTotals?: boolean;
  /** "desc" : lignes et colonnes triées par total décroissant. Défaut "none" (ordre fourni). */
  sort?: "none" | "desc";
}

const LABEL_COLUMN = 56;

/** Case de total (matrice OD) : chiffre hors rampe, focusable comme les autres cases de la grille. */
const TotalCell = ({
  row,
  col,
  focused,
  label,
  onFocus,
  grand = false,
  children,
}: {
  row: number;
  col: number;
  focused: boolean;
  label: string;
  onFocus: (position: GridPosition) => void;
  grand?: boolean;
  children: string;
}) => (
  <td
    role="gridcell"
    data-cell={`${row}-${col}`}
    tabIndex={focused ? 0 : -1}
    aria-label={label}
    className={`heatmap__cell heatmap__total${grand ? " heatmap__total--grand" : ""}`}
    onFocus={() => onFocus({ row, col })}
  >
    <span aria-hidden="true">{children}</span>
  </td>
);

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
  showTotals = false,
  sort = "none",
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
  const totals = axisTotals(cells);
  const xs = sort === "desc" ? sortByTotal(xLabels, totals.cols) : xLabels;
  const ys = sort === "desc" ? sortByTotal(yLabels, totals.rows) : yLabels;
  // Avec les totaux, une colonne et une ligne de plus dans la grille (navigation comprise)
  const gridRows = ys.length + (showTotals ? 1 : 0);
  const gridCols = xs.length + (showTotals ? 1 : 0);
  const isTotal = (row: number, col: number) => showTotals && (row === ys.length || col === xs.length);
  const cellAt = (row: number, col: number): HeatmapCell => {
    const x = xs[col];
    const y = ys[row];
    return byKey.get(`${y}|${x}`) ?? { x, y, value: null };
  };
  // Colonne des libellés de ligne : selon le plus long (~6,5px par caractère), bornée
  const labelColumn = Math.min(160, Math.max(LABEL_COLUMN, Math.max(0, ...ys.map((y) => y.length), showTotals ? 5 : 0) * 6.5 + 16));
  const labelEvery = columnLabelEvery(width - labelColumn, gridCols);
  const height = rowHeight * (gridRows + 1) + 40;
  const totalName = (label: string, value: number) => `Total ${label} : ${formatValueWithUnit(value, unit, format)}`;

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
      if (isTotal(focus.row, focus.col)) return;
      const cell = cellAt(focus.row, focus.col);
      if (cell.value !== null) onCellClick(cell);
      return;
    }
    if (e.key === "Escape") {
      setTooltip(null);
      return;
    }
    const next = moveInGrid(focus, e.key, e.ctrlKey || e.metaKey, gridRows, gridCols);
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
              <td className="heatmap__corner" style={{ width: labelColumn }} />
              {xs.map((x, col) => (
                <th key={x} scope="col" className="heatmap__col-label">
                  <span className={col % labelEvery === 0 ? undefined : "chart__sr-only"}>{x}</span>
                </th>
              ))}
              {showTotals && (
                <th scope="col" className="heatmap__col-label heatmap__total-label">
                  Total
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ys.map((y, row) => (
              <tr key={y}>
                <th scope="row" className="heatmap__row-label">
                  {y}
                </th>
                {xs.map((x, col) => {
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
                {showTotals && (
                  <TotalCell row={row} col={xs.length} focused={focus.row === row && focus.col === xs.length} label={totalName(y, totals.rows.get(y) ?? 0)} onFocus={setFocus}>
                    {formatKpiValue(totals.rows.get(y) ?? 0, format)}
                  </TotalCell>
                )}
              </tr>
            ))}
            {showTotals && (
              <tr className="heatmap__totals">
                <th scope="row" className="heatmap__row-label heatmap__total-label">
                  Total
                </th>
                {xs.map((x, col) => (
                  <TotalCell key={x} row={ys.length} col={col} focused={focus.row === ys.length && focus.col === col} label={totalName(x, totals.cols.get(x) ?? 0)} onFocus={setFocus}>
                    {formatKpiValue(totals.cols.get(x) ?? 0, format)}
                  </TotalCell>
                ))}
                <TotalCell
                  row={ys.length}
                  col={xs.length}
                  focused={focus.row === ys.length && focus.col === xs.length}
                  label={`Total général : ${formatValueWithUnit(totals.grand, unit, format)}`}
                  onFocus={setFocus}
                  grand
                >
                  {formatKpiValue(totals.grand, format)}
                </TotalCell>
              </tr>
            )}
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
