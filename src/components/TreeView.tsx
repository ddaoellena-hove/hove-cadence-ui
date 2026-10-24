/**
 * TreeView — arborescence dépliable (réseau → ligne → parcours, dépôt →
 * véhicules…).
 *
 * Motif ARIA `tree` aplati (`aria-level` / `aria-setsize` / `aria-posinset`,
 * pas de `group` imbriqué) pour rester compatible avec la virtualisation.
 * Une seule ligne tabulable (tabindex roving) ; clavier complet : flèches,
 * Début / Fin, `*` pour déplier les frères, saisie de la première lettre.
 *
 * Sélection `none` | `single` | `multiple`. En `multiple`, chaque ligne porte
 * une case tri-état (`aria-checked` mixte) qui remonte vers le parent.
 *
 * Chargement à la demande via `loadChildren` : `Skeleton` pendant le
 * chargement, ligne de reprise « Réessayer » en cas d'erreur.
 *
 * Au-delà de `virtualizeThreshold` lignes visibles (~500), la liste est
 * virtualisée (`@tanstack/react-virtual`).
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Icons } from "./Icons";
import { ModeIcon } from "./ModeIcon";
import { Skeleton } from "./Skeleton";
import {
  collectSelectableLeafIds,
  findByTypeahead,
  flattenTree,
  getCheckState,
  type CheckState,
  type FlatRow,
  type LoadedMap,
  type StatusMap,
  type TreeNode,
  type TreeSelection,
} from "./tree-view-utils";
import "./tree-view.css";
import "./checkbox.css";
import "./scrollbar.css";

export type { TreeNode, TreeSelection } from "./tree-view-utils";

export interface TreeViewProps {
  /** Arbre à afficher. */
  nodes: TreeNode[];
  /** Nom accessible de l'arbre (obligatoire). */
  "aria-label": string;
  /** Mode de sélection. Défaut `"single"`. */
  selection?: TreeSelection;
  /** Nœuds dépliés (contrôlé). */
  expandedIds?: string[];
  /** Nœuds dépliés au montage (non contrôlé). */
  defaultExpandedIds?: string[];
  /** Changement des nœuds dépliés. */
  onExpandedChange?: (ids: string[]) => void;
  /** Sélection (contrôlée) : feuilles et nœuds retenus. */
  selectedIds?: string[];
  /** Sélection au montage (non contrôlée). */
  defaultSelectedIds?: string[];
  /** Changement de la sélection. */
  onSelectionChange?: (ids: string[]) => void;
  /** Chargement des enfants d'un nœud `hasChildren` au premier dépliage. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** Activation d'un nœud (Entrée, clic) : pour ouvrir un détail côté app. */
  onNodeClick?: (node: TreeNode) => void;
  /** Seuil de virtualisation (lignes visibles). Défaut 500. */
  virtualizeThreshold?: number;
  /** Hauteur de la zone défilante (requise pour virtualiser). Défaut 420 si virtualisé. */
  maxHeight?: number | string;
  /** Texte quand l'arbre est vide. Défaut « Aucun élément. ». */
  emptyLabel?: string;
  id?: string;
  className?: string;
}

const ROW_HEIGHT = 36;
const INDENT = 20;

const toSize = (value: number | string | undefined): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

export const TreeView = ({
  nodes,
  "aria-label": ariaLabel,
  selection = "single",
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  loadChildren,
  onNodeClick,
  virtualizeThreshold = 500,
  maxHeight,
  emptyLabel = "Aucun élément.",
  id,
  className,
}: TreeViewProps) => {
  const reactId = useId();
  const treeId = id ?? `tree-${reactId}`;

  // ── État déplié (contrôlé ou non) ──
  const expandedControlled = expandedIds !== undefined;
  const [expandedInner, setExpandedInner] = useState<Set<string>>(() => new Set(defaultExpandedIds));
  const expandedSet = useMemo(
    () => (expandedControlled ? new Set(expandedIds) : expandedInner),
    [expandedControlled, expandedIds, expandedInner],
  );
  const commitExpanded = (next: Set<string>) => {
    if (!expandedControlled) setExpandedInner(next);
    onExpandedChange?.([...next]);
  };

  // ── État sélection (contrôlé ou non) ──
  const selectionControlled = selectedIds !== undefined;
  const [selectedInner, setSelectedInner] = useState<Set<string>>(() => new Set(defaultSelectedIds));
  const selectedSet = selectionControlled ? new Set(selectedIds) : selectedInner;
  const commitSelected = (next: Set<string>) => {
    if (!selectionControlled) setSelectedInner(next);
    onSelectionChange?.([...next]);
  };

  // ── Chargement à la demande (toujours interne) ──
  const [loaded, setLoaded] = useState<LoadedMap>({});
  const [status, setStatus] = useState<StatusMap>({});

  const flat = useMemo(
    () => flattenTree(nodes, { expanded: expandedSet, loaded, status }),
    [nodes, expandedSet, loaded, status],
  );

  // ── Focus roving ──
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const activeIndex = Math.max(0, flat.findIndex((r) => r.rowId === focusedRowId));
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const typeahead = useRef<{ text: string; timer: number }>({ text: "", timer: 0 });

  const virtualized = flat.length > virtualizeThreshold;
  const virtualizer = useVirtualizer({
    count: virtualized ? flat.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => flat[index]?.rowId ?? index,
    overscan: 12,
  });

  const focusRow = (rowId: string) => scrollRef.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(rowId)}"]`)?.focus({ preventScroll: virtualized });

  const moveTo = (index: number) => {
    const target = flat[Math.min(Math.max(0, index), flat.length - 1)];
    if (!target) return;
    setFocusedRowId(target.rowId);
    pendingFocusRef.current = target.rowId;
    if (virtualized) virtualizer.scrollToIndex(Math.min(Math.max(0, index), flat.length - 1));
    focusRow(target.rowId); // déjà monté : focus immédiat
  };

  // Focus d'une ligne montée après défilement (virtualisation).
  const mountFocus = (rowId: string) => (el: HTMLElement | null) => {
    if (el && pendingFocusRef.current === rowId) {
      pendingFocusRef.current = null;
      el.focus({ preventScroll: virtualized });
    }
  };

  const loadNode = (node: TreeNode) => {
    if (!loadChildren) return;
    setStatus((s) => ({ ...s, [node.id]: "loading" }));
    loadChildren(node).then(
      (kids) => {
        setLoaded((l) => ({ ...l, [node.id]: kids }));
        setStatus((s) => ({ ...s, [node.id]: "loaded" }));
      },
      () => setStatus((s) => ({ ...s, [node.id]: "error" })),
    );
  };

  const expand = (node: TreeNode) => {
    const next = new Set(expandedSet);
    next.add(node.id);
    commitExpanded(next);
    const needsLoad = node.hasChildren && node.children === undefined && loaded[node.id] === undefined && status[node.id] !== "loaded";
    if (needsLoad) loadNode(node);
  };
  const collapse = (node: TreeNode) => {
    const next = new Set(expandedSet);
    next.delete(node.id);
    commitExpanded(next);
  };
  const toggleExpand = (row: FlatRow) => {
    if (!row.expandable || row.node.disabled) return;
    if (row.expanded) collapse(row.node);
    else expand(row.node);
  };

  const expandSiblings = (row: FlatRow) => {
    const next = new Set(expandedSet);
    for (const sib of flat) {
      if (sib.kind === "node" && sib.parentId === row.parentId && sib.expandable && !sib.node.disabled) {
        next.add(sib.node.id);
        const n = sib.node;
        if (n.hasChildren && n.children === undefined && loaded[n.id] === undefined && status[n.id] !== "loaded") loadNode(n);
      }
    }
    commitExpanded(next);
  };

  const select = (node: TreeNode) => {
    if (node.disabled) return;
    commitSelected(new Set([node.id]));
  };

  const toggleCheck = (node: TreeNode) => {
    if (node.disabled) return;
    const leaves = collectSelectableLeafIds(node, loaded);
    const turnOn = getCheckState(node, selectedSet, loaded) !== "checked";
    const next = new Set(selectedSet);
    for (const id of leaves) {
      if (turnOn) next.add(id);
      else next.delete(id);
    }
    commitSelected(next);
  };

  const activate = (row: FlatRow) => {
    if (row.kind === "error") {
      loadNode(row.node);
      return;
    }
    if (row.kind !== "node" || row.node.disabled) return;
    if (selection === "single") select(row.node);
    else if (selection === "multiple") toggleCheck(row.node);
    else if (row.expandable) toggleExpand(row);
    onNodeClick?.(row.node);
  };

  const onType = (char: string) => {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.text += char.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.text = "";
    }, 500);
    const match = findByTypeahead(flat, typeahead.current.text, activeIndex);
    if (match >= 0) moveTo(match);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const row = flat[activeIndex];
    if (!row) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        moveTo(0);
        break;
      case "End":
        e.preventDefault();
        moveTo(flat.length - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        if (row.expandable && !row.expanded) expand(row.node);
        else if (row.expanded) moveTo(activeIndex + 1); // premier enfant
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (row.expandable && row.expanded) collapse(row.node);
        else {
          const parent = flat.findIndex((r) => r.rowId === row.parentId);
          if (parent >= 0) moveTo(parent);
        }
        break;
      case "Enter":
        e.preventDefault();
        activate(row);
        break;
      case " ":
        e.preventDefault();
        if (row.kind !== "node") activate(row);
        else if (selection === "multiple") toggleCheck(row.node);
        else if (selection === "single") select(row.node);
        else toggleExpand(row);
        break;
      case "*":
        e.preventDefault();
        expandSiblings(row);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          onType(e.key);
        }
    }
  };

  const onRowClick = (e: MouseEvent, row: FlatRow) => {
    setFocusedRowId(row.rowId);
    // Clic sur le chevron : (dé)plier seulement.
    if ((e.target as HTMLElement).closest("[data-twisty]")) {
      toggleExpand(row);
      return;
    }
    if (row.kind !== "node") {
      activate(row);
      return;
    }
    // En mode « none », un clic sur un parent (dé)plie.
    if (selection === "none" && row.expandable) toggleExpand(row);
    activate(row);
  };

  const renderTwisty = (row: FlatRow) =>
    row.expandable ? (
      <span className="tree-view__twisty" data-twisty aria-hidden="true">
        <Icons icon={row.expanded ? "chevron-down" : "chevron-right"} size={16} />
      </span>
    ) : (
      <span className="tree-view__twisty tree-view__twisty--leaf" aria-hidden="true" />
    );

  const renderCheck = (state: CheckState, disabled: boolean) => {
    const cls = ["checkbox", state === "mixed" ? "indeterminate" : state === "checked" ? "checked" : "", disabled ? "disabled" : ""]
      .filter(Boolean)
      .join(" ");
    return (
      <span className={cls} aria-hidden="true">
        {(state === "checked" || state === "mixed") && <span className="checkbox-inner" />}
      </span>
    );
  };

  const renderRow = (row: FlatRow, index: number, style?: React.CSSProperties) => {
    const isActive = index === activeIndex;
    const indent = { paddingInlineStart: (row.level - 1) * INDENT + 8 };

    // Lignes d'état (chargement / erreur) sous un parent déplié.
    if (row.kind === "loading") {
      return (
        <div
          key={row.rowId}
          data-row-id={row.rowId}
          ref={mountFocus(row.rowId)}
          role="treeitem"
          aria-level={row.level}
          aria-setsize={row.setsize}
          aria-posinset={row.posinset}
          aria-busy="true"
          aria-label="Chargement…"
          tabIndex={isActive ? 0 : -1}
          className="tree-view__item tree-view__item--status"
          style={{ ...style, ...indent }}
        >
          <span className="tree-view__twisty tree-view__twisty--leaf" aria-hidden="true" />
          <Skeleton variant="text" lines={1} width="60%" />
        </div>
      );
    }
    if (row.kind === "error") {
      return (
        <div
          key={row.rowId}
          data-row-id={row.rowId}
          ref={mountFocus(row.rowId)}
          role="treeitem"
          aria-level={row.level}
          aria-setsize={row.setsize}
          aria-posinset={row.posinset}
          tabIndex={isActive ? 0 : -1}
          className="tree-view__item tree-view__item--error"
          style={{ ...style, ...indent }}
          onClick={(e) => onRowClick(e, row)}
          title={`Réessayer le chargement de « ${row.node.label} »`}
        >
          <span className="tree-view__twisty tree-view__twisty--leaf" aria-hidden="true" />
          <Icons icon="alert-triangle" size={16} />
          <span className="tree-view__label">Échec du chargement</span>
          <span className="tree-view__retry">
            <Icons icon="refresh-ccw-05" size={14} />
            Réessayer
          </span>
        </div>
      );
    }

    const { node } = row;
    const checkState = selection === "multiple" ? getCheckState(node, selectedSet, loaded) : "unchecked";
    const isSelected = selection === "single" && selectedSet.has(node.id);

    const ariaSelected = selection === "single" ? isSelected || undefined : undefined;
    const ariaChecked = selection === "multiple" ? (checkState === "mixed" ? "mixed" : checkState === "checked") : undefined;

    const cls = [
      "tree-view__item",
      isSelected ? "tree-view__item--selected" : "",
      node.disabled ? "tree-view__item--disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        key={row.rowId}
        data-row-id={row.rowId}
        ref={mountFocus(row.rowId)}
        role="treeitem"
        aria-level={row.level}
        aria-setsize={row.setsize}
        aria-posinset={row.posinset}
        aria-expanded={row.expandable ? row.expanded : undefined}
        aria-selected={ariaSelected}
        aria-checked={ariaChecked}
        aria-disabled={node.disabled || undefined}
        tabIndex={isActive ? 0 : -1}
        className={cls}
        style={{ ...style, ...indent }}
        onClick={(e) => onRowClick(e, row)}
      >
        {renderTwisty(row)}
        {selection === "multiple" && renderCheck(checkState, !!node.disabled)}
        {/* Picto de mode (rempli, 20px : son gabarit a une marge interne) prioritaire
            sur l'icône d'interface (trait, 16px) */}
        {(node.mode || node.icon) && (
          <span className="tree-view__icon" aria-hidden="true">
            {node.mode ? <ModeIcon mode={node.mode} size={20} /> : <Icons icon={node.icon!} size={16} />}
          </span>
        )}
        <span className="tree-view__label">{node.label}</span>
        {node.meta !== undefined && <span className="tree-view__meta">{node.meta}</span>}
      </div>
    );
  };

  const rootClass = ["tree-view", "cadence-scrollbar", className].filter(Boolean).join(" ");
  const height = maxHeight ?? (virtualized ? 420 : undefined);
  const isEmpty = flat.length === 0;

  // Arbre vide : pas de rôle `tree` (il exigerait au moins un `treeitem`),
  // un simple message étiqueté en région.
  if (isEmpty) {
    return (
      <div id={treeId} role="region" aria-label={ariaLabel} className={rootClass}>
        <p className="tree-view__empty">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      id={treeId}
      role="tree"
      aria-label={ariaLabel}
      className={rootClass}
      style={{ maxHeight: toSize(height), height: virtualized ? toSize(height) : undefined }}
      onKeyDown={onKeyDown}
      onFocusCapture={(e) => {
        // Garder la ligne active (tabindex roving) alignée sur le focus réel.
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-row-id]");
        const rowId = el?.getAttribute("data-row-id");
        if (rowId && rowId !== focusedRowId) setFocusedRowId(rowId);
      }}
    >
      {virtualized ? (
        <div className="tree-view__spacer" role="presentation" style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((v) =>
            renderRow(flat[v.index], v.index, {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: ROW_HEIGHT,
              transform: `translateY(${v.start}px)`,
            }),
          )}
        </div>
      ) : (
        flat.map((row, index) => renderRow(row, index))
      )}
    </div>
  );
};
