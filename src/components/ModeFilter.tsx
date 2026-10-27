import { useState } from "react";
import { ModeIcon } from "./ModeIcon";
import { LineBadge, type LineBadgeProps } from "./LineBadge";
import { MODE_LABELS, type ModeName } from "./mode-icons";
import "./mode-filter.css";

interface ModeFilterCommonProps {
  /** Nom accessible du groupe (ex. « Filtrer par mode »). */
  "aria-label": string;
  /** `"multiple"` (défaut) ou `"single"` (un seul mode à la fois). */
  selection?: "multiple" | "single";
  /** Bouton facultatif pour vider la sélection (ex. « Toutes »). */
  allLabel?: string;
  /** Taille du picto, en px. Défaut 18. */
  iconSize?: number;
  id?: string;
  className?: string;
}

export interface ModeFilterItem {
  /** Identifiant unique et stable de la ligne. */
  id: string;
  label: string;
  /** Identité de ligne ; omise pour un groupe comme « Autres lignes ». */
  badge?: Omit<LineBadgeProps, "size" | "className">;
}

interface ModeFilterModesProps extends ModeFilterCommonProps {
  modes: ModeName[];
  items?: never;
  value?: ModeName[];
  defaultValue?: ModeName[];
  onChange?: (modes: ModeName[]) => void;
  labels?: Partial<Record<ModeName, string>>;
}

interface ModeFilterLinesProps extends ModeFilterCommonProps {
  items: ModeFilterItem[];
  modes?: never;
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  labels?: never;
}

/** Fournir soit `modes`, soit `items` ; les deux API sont exclusives. */
export type ModeFilterProps = ModeFilterModesProps | ModeFilterLinesProps;

/**
 * ModeFilter — filtre par mode de transport : une rangée de « chips »
 * togglables (picto `ModeIcon` + libellé), multi-sélection par défaut. Pour un
 * filtre de tableau de bord, posé dans une `FilterBar` ou une barre d'outils.
 *
 * Chaque chip est un bouton bascule (`aria-pressed`) ; le groupe est nommé par
 * `aria-label`. Une sélection vide = aucun filtre (tout est affiché côté app).
 */
export const ModeFilter = (props: ModeFilterProps) => {
  const {
    "aria-label": ariaLabel,
    value,
    defaultValue,
    selection = "multiple",
    allLabel,
    iconSize = 18,
    id,
    className,
  } = props;
  const controlled = value !== undefined;
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const selected = controlled ? value : inner;

  const commit = (next: string[]) => {
    if (!controlled) setInner(next);
    if (props.items !== undefined) props.onChange?.(next);
    else props.onChange?.(next as ModeName[]);
  };

  const toggle = (mode: string) => {
    const isOn = selected.includes(mode);
    if (selection === "single") commit(isOn ? [] : [mode]);
    else commit(isOn ? selected.filter((m) => m !== mode) : [...selected, mode]);
  };

  const items = props.items !== undefined
    ? props.items.map(item => ({ id: item.id, label: item.label,
      icon: item.badge ? <LineBadge {...item.badge} size="sm" /> : null }))
    : props.modes.map(mode => ({ id: mode, label: props.labels?.[mode] ?? MODE_LABELS[mode],
      icon: <ModeIcon mode={mode} size={iconSize} /> }));

  return (
    <div id={id} role="group" aria-label={ariaLabel} className={["mode-filter", className].filter(Boolean).join(" ")}>
      {allLabel && (
        <button type="button" className="mode-filter__chip" aria-pressed={selected.length === 0} onClick={() => commit([])}>
          <span className="mode-filter__label">{allLabel}</span>
        </button>
      )}
      {items.map((item) => {
        const on = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className="mode-filter__chip"
            aria-pressed={on}
            aria-label={item.label}
            onClick={() => toggle(item.id)}
          >
            {item.icon && <span aria-hidden="true" className="mode-filter__icon">{item.icon}</span>}
            <span className="mode-filter__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
