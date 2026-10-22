import { useId, type ReactNode } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { Icons } from "./Icons";
import { Link } from "./Link";
import { formatDelta, formatKpiValue, formatValueWithUnit, getDeltaTone, type DeltaUnit, type GoodDirection } from "./chart-format";
import { barRatio, describeItem, prepareItems } from "./bar-list-utils";
import "./bar-list.css";

export interface BarListItem {
  id: string;
  /** Texte aujourd'hui ; plus tard un LineBadge. */
  label: ReactNode;
  /** Nom accessible quand `label` n'est pas du texte. */
  ariaLabel?: string;
  value: number;
  /** Variation affichée à droite (« +12 % »), colorée selon goodDirection. */
  delta?: { value: number; unit?: DeltaUnit };
}

export interface BarListProps extends ChartCommonProps {
  items: BarListItem[];
  /** "none" (défaut) garde l'ordre fourni ; "desc" trie par valeur décroissante. */
  sort?: "none" | "desc";
  /** Unité de la valeur (« perturbations », « min »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Sens favorable de la variation. Défaut "up". */
  goodDirection?: GoodDirection;
  /** N premières lignes, puis le lien « Voir tout ». */
  limit?: number;
  /** Clic sur « Voir tout ». */
  onShowAll?: () => void;
  /** Rend chaque ligne cliquable (bouton). */
  onItemClick?: (item: BarListItem) => void;
}

const ROW_HEIGHT = 32;

/** Texte d'une étiquette : `ariaLabel`, sinon le libellé s'il est une chaîne, sinon l'id. */
const labelText = (item: BarListItem) => item.ariaLabel ?? (typeof item.label === "string" ? item.label : item.id);

/**
 * Classement horizontal : libellé, barre proportionnelle, valeur (mono, à
 * droite) et variation facultative. Limite + « Voir tout », lignes cliquables.
 */
export const BarList = ({
  items,
  sort = "none",
  unit,
  format,
  goodDirection = "up",
  limit,
  onShowAll,
  onItemClick,
  ...frame
}: BarListProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const { shown, hidden } = prepareItems(items, sort, limit);
  const maxValue = Math.max(0, ...items.map((i) => i.value));

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Élément", unit ? `Valeur (${unit})` : "Valeur", "Variation"]}
      numeric={[1, 2]}
      rows={prepareItems(items, sort).shown.map((item) => [
        labelText(item),
        formatKpiValue(item.value, format),
        item.delta ? formatDelta(item.delta.value, item.delta.unit ?? "%") : "—",
      ])}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="bar-list"
      titleId={titleId}
      descriptionId={descriptionId}
      height={ROW_HEIGHT * Math.max(3, limit ?? items.length)}
      table={table}
    >
      <ol
        className="bar-list__items"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
      >
        {shown.map((item) => {
          const tone = item.delta ? getDeltaTone(item.delta.value, goodDirection) : "neutral";
          const accessibleName = describeItem(labelText(item), item, goodDirection, unit, format);
          const content = (
            <>
              <span className="bar-list__label">{item.label}</span>
              <span className="bar-list__track" aria-hidden="true">
                <span className="bar-list__bar" style={{ width: `${barRatio(item.value, maxValue) * 100}%` }} />
              </span>
              <span className="bar-list__value">{formatValueWithUnit(item.value, undefined, format)}</span>
              <span className={`bar-list__delta bar-list__delta--${tone}`}>
                {item.delta && (
                  <>
                    {item.delta.value !== 0 && (
                      <Icons icon={item.delta.value > 0 ? "arrow-up" : "arrow-down"} size={12} className="bar-list__delta-icon" />
                    )}
                    {formatDelta(item.delta.value, item.delta.unit ?? "%")}
                  </>
                )}
              </span>
            </>
          );
          return (
            <li key={item.id} className="bar-list__item" style={{ minHeight: ROW_HEIGHT }}>
              {onItemClick ? (
                <button type="button" className="bar-list__row bar-list__row--button" aria-label={accessibleName} onClick={() => onItemClick(item)}>
                  {content}
                </button>
              ) : (
                <div className="bar-list__row" role="group" aria-label={accessibleName}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {hidden > 0 && onShowAll && (
        <div className="bar-list__more">
          <Link size="sm" onClick={onShowAll}>
            {`Voir tout (${items.length})`}
          </Link>
        </div>
      )}
    </ChartFrame>
  );
};
