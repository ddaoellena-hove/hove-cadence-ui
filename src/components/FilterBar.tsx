import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Badge } from "./Badge";
import { GhostButton } from "./GhostButton";
import { SearchInput } from "./SearchInput";
import { formatResultCount } from "./filter-bar-utils";
import "./filter-bar.css";

/** Délai de debounce de la recherche (ms). */
const SEARCH_DEBOUNCE = 300;

export interface FilterBarSearch {
  /** Valeur appliquée (contrôlée). */
  value: string;
  /** Appelé 300 ms après la dernière frappe, ou immédiatement sur Entrée. */
  onChange: (value: string) => void;
  /** Défaut « Rechercher… ». */
  placeholder?: string;
  /** Nom accessible du champ. Défaut « Rechercher ». */
  "aria-label"?: string;
}

export interface FilterBarActiveFilter {
  id: string;
  label: string;
}

export interface FilterBarProps {
  /** Champ de recherche (debounce interne, valeur contrôlée). */
  search?: FilterBarSearch;
  /** Slot : Dropdown, SegmentedControl… fournis par l'app. */
  quickFilters?: ReactNode;
  /** Filtres actifs, affichés en Badge supprimables. */
  activeFilters?: FilterBarActiveFilter[];
  /** Retrait d'un filtre actif (croix du Badge). */
  onRemoveFilter?: (id: string) => void;
  /** « Tout effacer », affiché à partir de 2 filtres actifs. */
  onClearAll?: () => void;
  /** Nombre de résultats : « 12 430 résultats ». */
  resultCount?: number;
  /** Slot à droite : export, menu de colonnes… */
  actions?: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

// ── Recherche différée ─────────────────────────────────────────────────────

const DebouncedSearch = ({
  value,
  onChange,
  placeholder = "Rechercher…",
  "aria-label": ariaLabel = "Rechercher",
}: FilterBarSearch) => {
  // Saisie locale immédiate ; la valeur appliquée suit avec un délai
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Valeur modifiée de l'extérieur (ex. « Tout effacer ») : on la reprend
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  // Toujours appeler le dernier onChange sans relancer le délai à chaque rendu
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChangeRef.current(draft), SEARCH_DEBOUNCE);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  // Entrée : applique la recherche sans attendre
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && draft !== value) onChangeRef.current(draft);
  };

  return (
    <div className="filter-bar__search" role="search" onKeyDown={handleKeyDown}>
      {/* Même hauteur que les filtres en variante bouton (29px), forme de champ */}
      <SearchInput aria-label={ariaLabel} placeholder={placeholder} value={draft} onChange={setDraft} />
    </div>
  );
};

// ── FilterBar ──────────────────────────────────────────────────────────────

/**
 * Barre au-dessus d'une liste : recherche, filtres rapides et actions sur une
 * première ligne, puis filtres actifs et nombre de résultats.
 */
export const FilterBar = ({
  search,
  quickFilters,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  resultCount,
  actions,
  className,
}: FilterBarProps) => {
  const hasSecondaryRow = activeFilters.length > 0 || resultCount !== undefined;
  const rootClass = ["filter-bar", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="filter-bar__main">
        {search && <DebouncedSearch {...search} />}
        {quickFilters && <div className="filter-bar__quick">{quickFilters}</div>}
        {actions && <div className="filter-bar__actions">{actions}</div>}
      </div>

      {hasSecondaryRow && (
        <div className="filter-bar__secondary">
          {activeFilters.length > 0 && (
            <ul className="filter-bar__filters" aria-label="Filtres actifs">
              {activeFilters.map((filter) => (
                <li key={filter.id}>
                  <Badge
                    label={filter.label}
                    dismissible={Boolean(onRemoveFilter)}
                    onDismiss={() => onRemoveFilter?.(filter.id)}
                  />
                </li>
              ))}
            </ul>
          )}
          {activeFilters.length >= 2 && onClearAll && (
            <GhostButton size="sm" label="Tout effacer" onClick={onClearAll} />
          )}
          {resultCount !== undefined && (
            <span className="filter-bar__count" aria-live="polite">
              {formatResultCount(resultCount)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
