import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "./Checkbox";
import { Skeleton } from "./Skeleton";
import { SortIcon } from "./SortIcon";
import {
  compareValues,
  formatCellValue,
  getHeaderCheckboxState,
  getRangeIds,
  setIdsSelected,
  toggleSort,
  type DataTableSort,
  type DataTableValue,
} from "./data-table-utils";
import "./data-table.css";
import "./scrollbar.css";

export type { DataTableSort, DataTableValue };

// ── Types publics ──────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  /** Identifiant stable de la colonne (clé de tri et de masquage). */
  id: string;
  /** Libellé FR, affiché en majuscules (style de TableHeader). */
  header: string;
  /** Valeur brute : sert au tri et au rendu par défaut. */
  accessor: (row: T) => DataTableValue;
  /** Rendu personnalisé (Indicator, Badge…). Sans `cell`, rendu texte par défaut. */
  cell?: (row: T) => ReactNode;
  /** Alignement. Défaut "left" ; "right" si `numeric`. */
  align?: "left" | "right" | "center";
  /** Nombre : police mono + alignement à droite. */
  numeric?: boolean;
  /** Largeur fixe en px. Sans `width`, la colonne se partage l'espace restant. */
  width?: number;
  /** Largeur minimale (px) des colonnes sans `width`. Défaut 80. */
  minWidth?: number;
  /** Colonne triable. Défaut false. */
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Identifiant unique et stable d'une ligne. */
  getRowId: (row: T) => string;
  /** Nom accessible du tableau. */
  "aria-label": string;
  /** Hauteur de ligne : 36px (compact) / 48px (comfortable). Défaut "comfortable". */
  density?: "compact" | "comfortable";
  /** Ids des colonnes masquées. */
  hiddenColumnIds?: string[];
  /** Tri contrôlé. Sans `sort`, le tri est géré en interne. */
  sort?: DataTableSort[];
  /** Tri initial en mode non contrôlé. */
  defaultSort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[]) => void;
  /** Mode serveur : `data` arrive déjà trié. Défaut false. */
  manualSorting?: boolean;
  /** Page courante (1-based). Avec `pageSize`, découpe après le tri (mode client). */
  page?: number;
  pageSize?: number;
  /** Mode serveur : `data` est déjà la page courante. Défaut false. */
  manualPagination?: boolean;
  /** Colonne de cases à cocher. */
  selectable?: boolean;
  /** Sélection contrôlée (ids). */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Clic ou Entrée sur une ligne. Active la navigation au clavier entre lignes. */
  onRowClick?: (row: T) => void;
  /** Sans données : lignes squelettes. Avec données : lignes atténuées. */
  loading?: boolean;
  /** Contenu affiché sans résultat. Défaut « Aucun résultat. » */
  emptyState?: ReactNode;
  /** Hauteur max de la zone scrollable ; l'en-tête reste collant. */
  maxHeight?: number | string;
  /** Virtualisation des lignes. Défaut false. */
  virtualized?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────

const ROW_HEIGHT = { compact: 36, comfortable: 48 } as const;
const SELECT_COLUMN_WIDTH = 48;
const DEFAULT_MIN_WIDTH = 80;
/** Hauteur par défaut d'un tableau virtualisé sans `maxHeight`. */
const DEFAULT_VIRTUAL_HEIGHT = 560;
const SKELETON_ROWS = 8;
const EMPTY_SORT: DataTableSort[] = [];
const EMPTY_IDS: string[] = [];

// Fonctionnalités TanStack : tri et pagination côté client uniquement
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

// Forme de ligne attendue par TanStack ; les lignes de l'app (T) y sont
// converties à l'entrée et reconverties à la lecture de `row.original`.
type TableRow = Record<string, unknown>;

const ariaSort = (sort: DataTableSort | undefined) =>
  sort ? (sort.desc ? "descending" : "ascending") : "none";

// ── DataTable ──────────────────────────────────────────────────────────────

/**
 * Tableau dense pour les gros volumes : en-tête collant, tri (Maj+clic pour
 * plusieurs colonnes), sélection (Maj+clic pour une plage), navigation au
 * clavier et virtualisation optionnelle.
 *
 * ⚠️ Définir `columns` hors du rendu (ou via useMemo) : une nouvelle référence
 * à chaque rendu recalcule le tri.
 */
export function DataTable<T extends object>({
  columns,
  data,
  getRowId,
  "aria-label": ariaLabel,
  density = "comfortable",
  hiddenColumnIds = EMPTY_IDS,
  sort: sortProp,
  defaultSort = EMPTY_SORT,
  onSortChange,
  manualSorting = false,
  page,
  pageSize,
  manualPagination = false,
  selectable = false,
  selectedIds = EMPTY_IDS,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyState = "Aucun résultat.",
  maxHeight,
  virtualized = false,
  className,
}: DataTableProps<T>) {
  // ── Tri (contrôlé ou interne) ──
  const [internalSort, setInternalSort] = useState(defaultSort);
  const sort = sortProp ?? internalSort;

  const handleSort = (columnId: string, multi: boolean) => {
    const next = toggleSort(sort, columnId, multi);
    if (sortProp === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  // ── Colonnes visibles et grille ──
  const visibleColumns = useMemo(() => {
    const hidden = new Set(hiddenColumnIds);
    return columns.filter((col) => !hidden.has(col.id));
  }, [columns, hiddenColumnIds]);

  const gridTemplateColumns = [
    ...(selectable ? [`${SELECT_COLUMN_WIDTH}px`] : []),
    ...visibleColumns.map((col) =>
      col.width ? `${col.width}px` : `minmax(${col.minWidth ?? DEFAULT_MIN_WIDTH}px, 1fr)`,
    ),
  ].join(" ");
  // Largeur minimale du tableau : au-delà, défilement horizontal
  const minTableWidth =
    (selectable ? SELECT_COLUMN_WIDTH : 0) +
    visibleColumns.reduce((sum, col) => sum + (col.width ?? col.minWidth ?? DEFAULT_MIN_WIDTH), 0);

  // ── Modèle de lignes (TanStack) ──
  const tableColumns = useMemo(() => {
    const helper = createColumnHelper<typeof features, TableRow>();
    return helper.columns(
      columns.map((col) =>
        helper.accessor((row: TableRow) => col.accessor(row as T) ?? undefined, {
          id: col.id,
          sortDescFirst: false,
          sortUndefined: "last",
          sortFn: (rowA, rowB, columnId) =>
            compareValues(rowA.getValue(columnId) as DataTableValue, rowB.getValue(columnId) as DataTableValue),
        }),
      ),
    );
  }, [columns]);

  const paginate = !manualPagination && page !== undefined && pageSize !== undefined;

  const table = useTable({
    features,
    columns: tableColumns,
    data: data as TableRow[],
    getRowId: (row: TableRow) => getRowId(row as T),
    state: {
      sorting: sort,
      pagination: { pageIndex: Math.max(0, (page ?? 1) - 1), pageSize: pageSize ?? Math.max(1, data.length) },
    },
    // L'état est piloté par les props : les mises à jour passent par handleSort / l'app
    onSortingChange: () => {},
    onPaginationChange: () => {},
    manualSorting,
    manualPagination: !paginate,
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const displayedIds = useMemo(() => rows.map((row) => row.id), [rows]);

  // ── Sélection ──
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const anchorRef = useRef<string | null>(null);
  const shiftRef = useRef(false);

  const handleRowToggle = (rowId: string, checked: boolean) => {
    const ids = shiftRef.current ? getRangeIds(displayedIds, anchorRef.current, rowId) : [rowId];
    shiftRef.current = false;
    anchorRef.current = rowId;
    onSelectionChange?.(setIdsSelected(selectedIds, ids, checked));
  };

  const handleToggleAll = (checked: boolean) => {
    anchorRef.current = null;
    onSelectionChange?.(setIdsSelected(selectedIds, displayedIds, checked));
  };

  // Maj+clic / Maj+Espace sur une case : mémorisé avant le onChange de Checkbox
  const captureShift = (e: MouseEvent | KeyboardEvent) => {
    shiftRef.current = e.shiftKey;
  };

  // ── Virtualisation ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowHeight = ROW_HEIGHT[density];
  const virtualizer = useVirtualizer({
    count: virtualized ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 10,
  });

  // ── Navigation clavier entre lignes (focus mobile) ──
  const [focusedIndex, setFocusedIndex] = useState(0);
  const activeIndex = Math.min(focusedIndex, Math.max(0, rows.length - 1));
  // Ligne à focaliser dès qu'elle est montée (virtualisée : après le défilement)
  const pendingFocusRef = useRef<number | null>(null);

  const focusRowWhenMounted = (index: number) => (el: HTMLTableRowElement | null) => {
    if (el && pendingFocusRef.current === index) {
      pendingFocusRef.current = null;
      el.focus({ preventScroll: virtualized });
    }
  };

  const moveFocus = (index: number) => {
    const target = Math.min(Math.max(0, index), rows.length - 1);
    pendingFocusRef.current = target;
    setFocusedIndex(target);
    if (virtualized) virtualizer.scrollToIndex(target);
    // Ligne déjà montée et index inchangé : focus immédiat
    scrollRef.current?.querySelector<HTMLElement>(`[data-row-index="${target}"]`)?.focus({ preventScroll: virtualized });
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, index: number, row: T, rowId: string) => {
    // Les touches venant d'une case à cocher ou d'un contenu interactif restent à eux
    if (e.target !== e.currentTarget) return;
    const page = Math.max(1, Math.floor((scrollRef.current?.clientHeight ?? rowHeight * 10) / rowHeight) - 1);
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: rows.length - 1,
      PageDown: index + page,
      PageUp: index - page,
    };
    if (e.key in moves) {
      e.preventDefault();
      moveFocus(moves[e.key]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onRowClick?.(row);
    } else if (e.key === " " && selectable) {
      e.preventDefault();
      shiftRef.current = e.shiftKey;
      handleRowToggle(rowId, !selectedSet.has(rowId));
    }
  };

  // ── Rendu ──
  const headerState = getHeaderCheckboxState(displayedIds, selectedSet);
  const showSkeleton = loading && rows.length === 0;
  const isEmpty = !loading && rows.length === 0;
  const scrollHeight = maxHeight ?? (virtualized ? DEFAULT_VIRTUAL_HEIGHT : undefined);
  const firstColumn = visibleColumns[0];

  const rootClass = [
    "data-table",
    "cadence-scrollbar",
    `data-table--${density}`,
    loading && rows.length > 0 ? "data-table--busy" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cellClass = (col: DataTableColumn<T>) => {
    const align = col.align ?? (col.numeric ? "right" : "left");
    return ["data-table__cell", `data-table__cell--${align}`, col.numeric ? "data-table__cell--numeric" : ""]
      .filter(Boolean)
      .join(" ");
  };

  const renderRow = (index: number, style?: CSSProperties) => {
    const row = rows[index];
    const original = row.original as T;
    const rowId = row.id;
    const isSelected = selectedSet.has(rowId);
    const rowLabel = firstColumn ? formatCellValue(firstColumn.accessor(original)) : rowId;
    const rowClass = [
      "data-table__row",
      isSelected ? "data-table__row--selected" : "",
      onRowClick ? "data-table__row--clickable" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <tr
        key={rowId}
        role="row"
        className={rowClass}
        style={{ gridTemplateColumns, height: rowHeight, ...style }}
        ref={onRowClick ? focusRowWhenMounted(index) : undefined}
        data-row-index={index}
        aria-rowindex={virtualized ? index + 2 : undefined}
        tabIndex={onRowClick ? (index === activeIndex ? 0 : -1) : undefined}
        onClick={onRowClick ? () => { setFocusedIndex(index); onRowClick(original); } : undefined}
        onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, index, original, rowId) : undefined}
      >
        {selectable && (
          <td
            role="cell"
            className="data-table__cell data-table__cell--select"
            onClickCapture={captureShift}
            onKeyDownCapture={captureShift}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              aria-label={`Sélectionner ${rowLabel}`}
              state={isSelected ? "checked" : "unchecked"}
              onChange={(checked) => handleRowToggle(rowId, checked)}
            />
          </td>
        )}
        {visibleColumns.map((col) => (
          <td key={col.id} role="cell" className={cellClass(col)}>
            {col.cell ? col.cell(original) : (
              <span className="data-table__text">{formatCellValue(col.accessor(original))}</span>
            )}
          </td>
        ))}
      </tr>
    );
  };

  const renderBody = () => {
    if (showSkeleton) {
      return Array.from({ length: Math.min(pageSize ?? SKELETON_ROWS, SKELETON_ROWS) }, (_, i) => (
        <tr key={`skeleton-${i}`} role="row" className="data-table__row" style={{ gridTemplateColumns, height: rowHeight }}>
          {selectable && <td role="cell" className="data-table__cell data-table__cell--select" />}
          {visibleColumns.map((col) => (
            <td key={col.id} role="cell" className={cellClass(col)}>
              <Skeleton variant="rect" width="70%" height={12} />
            </td>
          ))}
        </tr>
      ));
    }
    if (isEmpty) {
      return (
        <tr role="row" className="data-table__row data-table__row--empty" style={{ gridTemplateColumns }}>
          <td role="cell" className="data-table__empty">{emptyState}</td>
        </tr>
      );
    }
    if (virtualized) {
      return virtualizer.getVirtualItems().map((item) =>
        renderRow(item.index, { position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }),
      );
    }
    return rows.map((_, index) => renderRow(index));
  };

  return (
    <div
      ref={scrollRef}
      className={rootClass}
      style={{ maxHeight: scrollHeight, height: virtualized ? scrollHeight : undefined }}
    >
      <table
        role="table"
        className="data-table__table"
        aria-label={ariaLabel}
        aria-rowcount={virtualized ? rows.length + 1 : undefined}
        aria-busy={loading || undefined}
        style={{ minWidth: minTableWidth }}
      >
        <thead role="rowgroup" className="data-table__head">
          <tr role="row" className="data-table__row data-table__row--header" style={{ gridTemplateColumns }} aria-rowindex={virtualized ? 1 : undefined}>
            {selectable && (
              <th role="columnheader" scope="col" className="data-table__cell data-table__cell--select">
                <Checkbox
                  aria-label="Tout sélectionner"
                  state={rows.length === 0 ? "disabled" : headerState}
                  onChange={handleToggleAll}
                />
              </th>
            )}
            {visibleColumns.map((col) => {
              const colSort = sort.find((s) => s.id === col.id);
              const sortIndex = sort.length > 1 && colSort ? sort.indexOf(colSort) + 1 : null;
              const headerClass = [
                cellClass(col),
                "data-table__header",
                colSort ? "data-table__header--active" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <th
                  key={col.id}
                  role="columnheader"
                  scope="col"
                  className={headerClass}
                  aria-sort={col.sortable ? ariaSort(colSort) : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="data-table__sort"
                      onClick={(e) => handleSort(col.id, e.shiftKey)}
                    >
                      <span className="data-table__label">{col.header}</span>
                      <SortIcon direction={colSort ? (colSort.desc ? "desc" : "asc") : "none"} />
                      {sortIndex !== null && (
                        <span className="data-table__sort-index" aria-hidden="true">{sortIndex}</span>
                      )}
                    </button>
                  ) : (
                    <span className="data-table__label">{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          role="rowgroup"
          className="data-table__body"
          aria-busy={loading || undefined}
          style={virtualized && !showSkeleton && !isEmpty ? { height: virtualizer.getTotalSize(), position: "relative" } : undefined}
        >
          {renderBody()}
        </tbody>
      </table>
    </div>
  );
}
