import { useId } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { bulletBands, bulletScale, bulletStatus, describeBullet, type BulletDirection } from "./bullet-chart-utils";
import type { ValueThreshold } from "./threshold-utils";
import "./bullet-chart.css";

export type BulletChartRange = ValueThreshold;

export interface BulletChartItem {
  id: string;
  /** Indicateur (« Ponctualité », « Taux de réalisation de l'offre »). */
  label: string;
  /** Valeur mesurée. */
  value: number;
  /** Objectif : repère vertical sur la ligne. */
  target?: number;
  /** Bornes libellées des plages (« Malus sous 85 % », « Bonus dès 92 % »), jugées selon `goodDirection`. */
  ranges?: BulletChartRange[];
  /** Début de l'échelle de la ligne. Défaut : `min` du graphique. */
  min?: number;
  /** Fin de l'échelle de la ligne. Défaut : `max` du graphique. */
  max?: number;
  /** Unité de la ligne. Défaut : `unit` du graphique. */
  unit?: string;
  /** Sens favorable de la ligne. Défaut : `goodDirection` du graphique. */
  goodDirection?: BulletDirection;
}

export interface BulletChartProps extends ChartCommonProps {
  /** Une ligne par indicateur. */
  items: BulletChartItem[];
  /** Début de l'échelle par défaut (« 80 » pour un taux entre 80 et 100 %). Défaut 0. */
  min?: number;
  /** Fin de l'échelle par défaut. Défaut 100. */
  max?: number;
  /** Unité par défaut des lignes (« % »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Sens favorable par défaut. Défaut "up". */
  goodDirection?: BulletDirection;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
}

const ROW_HEIGHT = 48;

/**
 * Performance par rapport à un objectif : une ligne par indicateur, barre de
 * la valeur sur des plages qualitatives (insuffisant / moyen / bon), repère
 * d'objectif, valeur et statut écrits. Pour les indicateurs contractuels
 * (ponctualité, régularité, taux de réalisation de l'offre).
 */
export const BulletChart = ({
  items,
  min = 0,
  max = 100,
  unit,
  format,
  goodDirection = "up",
  hideTitle = false,
  ...frame
}: BulletChartProps) => {
  const titleId = useId();
  const descriptionId = useId();

  const rows = items.map((item) => {
    const itemUnit = item.unit ?? unit;
    const dir = item.goodDirection ?? goodDirection;
    const scale = bulletScale(item.min ?? min, item.max ?? max, item.value, item.target, item.ranges);
    const { tone, status } = bulletStatus(item.value, item.ranges, dir);
    const ratio = (v: number) => Math.min(1, Math.max(0, (v - scale[0]) / (scale[1] - scale[0])));
    return {
      item,
      itemUnit,
      tone,
      status,
      bands: bulletBands(item.ranges, scale, dir).map((b) => ({ ...b, left: ratio(b.from), width: ratio(b.to) - ratio(b.from) })),
      valueRatio: Number.isFinite(item.value) ? ratio(item.value) : 0,
      targetRatio: item.target !== undefined && Number.isFinite(item.target) ? ratio(item.target) : null,
      name: describeBullet(item.label, item.value, item.target, status, itemUnit, format),
    };
  });

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Indicateur", "Valeur", "Objectif", "Statut"]}
      numeric={[1, 2]}
      rows={rows.map(({ item, itemUnit, status }) => [
        item.label,
        Number.isFinite(item.value) ? formatValueWithUnit(item.value, itemUnit, format) : "—",
        item.target !== undefined ? formatValueWithUnit(item.target, itemUnit, format) : "—",
        status ?? "—",
      ])}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="bullet-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={ROW_HEIGHT * Math.max(2, items.length)}
      hideHeader={hideTitle}
      table={table}
    >
      <ul
        className="bullet-chart__items"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
      >
        {rows.map(({ item, itemUnit, tone, status, bands, valueRatio, targetRatio, name }) => (
          <li key={item.id} className="bullet-chart__item">
            <div className={`bullet-chart__row bullet-chart__row--${tone}`} role="group" aria-label={name}>
              <div className="bullet-chart__heading" aria-hidden="true">
                <span className="bullet-chart__label">{item.label}</span>
                {status && <span className="bullet-chart__status">{status}</span>}
              </div>
              <div className="bullet-chart__plot" aria-hidden="true">
                {bands.map((b) => (
                  <span
                    key={`${b.from}-${b.to}`}
                    className={`bullet-chart__band bullet-chart__band--${b.tone}`}
                    style={{ left: `${b.left * 100}%`, width: `${b.width * 100}%` }}
                  />
                ))}
                <span className="bullet-chart__bar" style={{ width: `${valueRatio * 100}%` }} />
                {targetRatio !== null && <span className="bullet-chart__target" style={{ left: `${targetRatio * 100}%` }} />}
              </div>
              <span className="bullet-chart__value" aria-hidden="true">
                {Number.isFinite(item.value) ? formatKpiValue(item.value, format) : "—"}
                {itemUnit && Number.isFinite(item.value) && <span className="bullet-chart__unit">{itemUnit}</span>}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
};
