import { useState } from "react";
import { ModeIcon } from "./ModeIcon";
import { MODE_LABELS, type ModeName } from "./mode-icons";
import "./mode-filter.css";

export interface ModeFilterProps {
  /** Modes proposés (dans l'ordre d'affichage). */
  modes: ModeName[];
  /** Nom accessible du groupe (ex. « Filtrer par mode »). */
  "aria-label": string;
  /** Modes sélectionnés (contrôlé). */
  value?: ModeName[];
  /** Sélection au montage (non contrôlé). */
  defaultValue?: ModeName[];
  /** Changement de la sélection. */
  onChange?: (modes: ModeName[]) => void;
  /** `"multiple"` (défaut) ou `"single"` (un seul mode à la fois). */
  selection?: "multiple" | "single";
  /** Libellés personnalisés (sinon libellés FR par défaut). */
  labels?: Partial<Record<ModeName, string>>;
  /** Taille du picto, en px. Défaut 18. */
  iconSize?: number;
  id?: string;
  className?: string;
}

/**
 * ModeFilter — filtre par mode de transport : une rangée de « chips »
 * togglables (picto `ModeIcon` + libellé), multi-sélection par défaut. Pour un
 * filtre de tableau de bord, posé dans une `FilterBar` ou une barre d'outils.
 *
 * Chaque chip est un bouton bascule (`aria-pressed`) ; le groupe est nommé par
 * `aria-label`. Une sélection vide = aucun filtre (tout est affiché côté app).
 */
export const ModeFilter = ({
  modes,
  "aria-label": ariaLabel,
  value,
  defaultValue,
  onChange,
  selection = "multiple",
  labels,
  iconSize = 18,
  id,
  className,
}: ModeFilterProps) => {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<ModeName[]>(defaultValue ?? []);
  const selected = controlled ? value : inner;

  const commit = (next: ModeName[]) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  const toggle = (mode: ModeName) => {
    const isOn = selected.includes(mode);
    if (selection === "single") commit(isOn ? [] : [mode]);
    else commit(isOn ? selected.filter((m) => m !== mode) : [...selected, mode]);
  };

  return (
    <div id={id} role="group" aria-label={ariaLabel} className={["mode-filter", className].filter(Boolean).join(" ")}>
      {modes.map((mode) => {
        const on = selected.includes(mode);
        return (
          <button
            key={mode}
            type="button"
            className="mode-filter__chip"
            aria-pressed={on}
            onClick={() => toggle(mode)}
          >
            <ModeIcon mode={mode} size={iconSize} />
            <span className="mode-filter__label">{labels?.[mode] ?? MODE_LABELS[mode]}</span>
          </button>
        );
      })}
    </div>
  );
};
