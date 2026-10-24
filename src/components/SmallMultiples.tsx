import { useId } from "react";
import { scaleLinear } from "d3-scale";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartSyncGroup } from "./ChartSyncGroup";
import { LineChart, type LineChartThreshold } from "./LineChart";
import { formatKpiValue, formatValueWithUnit, type GoodDirection } from "./chart-format";
import "./small-multiples.css";

export interface SmallMultiplesItem {
  id: string;
  /** « Ligne 13 », « Bus » */
  label: string;
  /** Points de l'élément, comme une série de `LineChart`. */
  data: { x: Date | string; y: number | null }[];
}

export interface SmallMultiplesProps extends ChartCommonProps {
  /** Un petit graphique par élément (ligne, mode, arrêt), dans l'ordre. */
  items: SmallMultiplesItem[];
  /** Unité des valeurs (« % », « min »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Seuils communs à tous les éléments (objectif, alerte). */
  thresholds?: LineChartThreshold[];
  /** Sens favorable (points du mauvais côté d'un seuil signalés). Défaut "up". */
  goodDirection?: GoodDirection;
  /** Échelle Y commune. Défaut : de min(0, valeurs) au maximum de tous les éléments, arrondi. */
  yDomain?: [number, number];
  /** Abscisses en heures de service « HH:mm » (voir `LineChart serviceTime`). */
  serviceTime?: boolean;
  /** Largeur minimale d'une case de la grille. Défaut 200. */
  minItemWidth?: number;
  /** Hauteur du tracé de chaque case. Défaut 56. */
  itemHeight?: number;
}

/**
 * Petits multiples : un `LineChart` compact par élément, sur une **échelle
 * commune** pour comparer les formes, dans une grille fluide. Curseur
 * synchronisé entre les cases (`ChartSyncGroup`), dernière valeur écrite,
 * alternative tabulaire (dernière valeur, minimum, maximum).
 */
export const SmallMultiples = ({
  items,
  unit,
  format,
  thresholds = [],
  goodDirection = "up",
  yDomain,
  serviceTime = false,
  minItemWidth = 200,
  itemHeight = 56,
  ...frame
}: SmallMultiplesProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const valuesOf = (item: SmallMultiplesItem) => item.data.map((p) => p.y).filter((y): y is number => y !== null && Number.isFinite(y));
  const all = [...items.flatMap(valuesOf), ...thresholds.map((t) => t.value)];
  const low = Math.min(0, ...all);
  const high = Math.max(low + 1, ...all);
  const domain = yDomain ?? (scaleLinear().domain([low, high]).nice(4).domain() as [number, number]);
  const headingLevel = Math.min(4, (frame.headingLevel ?? 3) + 1) as 3 | 4;

  const last = (item: SmallMultiplesItem) => {
    const values = item.data.filter((p) => p.y !== null && Number.isFinite(p.y));
    return values.length ? (values[values.length - 1].y as number) : null;
  };

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Élément", ...[unit ? `Dernière valeur (${unit})` : "Dernière valeur", "Minimum", "Maximum"]]}
      numeric={[1, 2, 3]}
      rows={items.map((item) => {
        const values = valuesOf(item);
        const lastValue = last(item);
        return [
          item.label,
          lastValue === null ? "—" : formatKpiValue(lastValue, format),
          values.length ? formatKpiValue(Math.min(...values), format) : "—",
          values.length ? formatKpiValue(Math.max(...values), format) : "—",
        ];
      })}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="small-multiples"
      titleId={titleId}
      descriptionId={descriptionId}
      height={Math.max(1, Math.ceil(items.length / 3)) * (itemHeight + 48)}
      table={table}
    >
      <ChartSyncGroup>
        <ul
          className="small-multiples__grid"
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))` }}
          aria-labelledby={titleId}
          aria-describedby={frame.description ? descriptionId : undefined}
        >
          {items.map((item) => {
            const lastValue = last(item);
            return (
              <li key={item.id} className="small-multiples__item">
                <div className="small-multiples__header" aria-hidden="true">
                  <span className="small-multiples__label">{item.label}</span>
                  {lastValue !== null && <span className="small-multiples__value">{formatValueWithUnit(lastValue, unit, format)}</span>}
                </div>
                <LineChart
                  compact
                  title={lastValue === null ? item.label : `${item.label} — dernière valeur ${formatValueWithUnit(lastValue, unit, format)}`}
                  headingLevel={headingLevel}
                  height={itemHeight}
                  unit={unit}
                  format={format}
                  yDomain={domain}
                  thresholds={thresholds}
                  goodDirection={goodDirection}
                  serviceTime={serviceTime}
                  series={[{ id: item.id, label: item.label, data: item.data }]}
                />
              </li>
            );
          })}
        </ul>
      </ChartSyncGroup>
    </ChartFrame>
  );
};
