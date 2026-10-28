// Logique pure de TreeView : résolution des enfants, aplatissement de l'arbre
// visible (pour le rendu, la virtualisation et le focus roving) et calcul de
// l'état de case tri-état qui remonte vers les parents. Isolée du rendu pour
// être testée seule.

import type { ReactNode } from "react";
import type { IconName } from "./Icons";
import type { ModeName } from "./mode-icons";

export interface TreeNode {
  /** Identifiant unique dans tout l'arbre. */
  id: string;
  /** Libellé visible (et base de la saisie au clavier). */
  label: string;
  /** Picto optionnel avant le libellé (registre d'icônes). */
  icon?: IconName;
  /**
   * Picto de mode de transport (`ModeIcon`) avant le libellé, pour un nœud
   * de réseau (Métro, Tramway…). Prioritaire sur `icon`.
   */
  mode?: ModeName;
  /** Enfants déjà connus. `undefined` + `hasChildren` = chargement à la demande. */
  children?: TreeNode[];
  /** Marque un parent dont les enfants se chargent à la demande (`loadChildren`). */
  hasChildren?: boolean;
  /** Nœud non sélectionnable ni dépliable. */
  disabled?: boolean;
  /** Contenu secondaire à droite (compteur, `Badge`…), non focusable. */
  meta?: ReactNode;
}

export type TreeSelection = "none" | "single" | "multiple";
export type NodeStatus = "loading" | "error" | "loaded";
export type CheckState = "checked" | "mixed" | "unchecked";

/** Ligne synthétique du sous-arbre en chargement ou en erreur. */
export type RowKind = "node" | "loading" | "error";

export interface FlatRow {
  node: TreeNode;
  /** Profondeur 1-based (`aria-level`). */
  level: number;
  /** Position 1-based parmi les frères (`aria-posinset`). */
  posinset: number;
  /** Nombre de frères (`aria-setsize`). */
  setsize: number;
  /** Nœud déplié. */
  expanded: boolean;
  /** Nœud qui a (ou aura) des enfants. */
  expandable: boolean;
  /** Identifiant du parent, ou `null` à la racine. */
  parentId: string | null;
  /** Ligne réelle ou ligne d'état (chargement / erreur). */
  kind: RowKind;
  /** Identifiant de ligne pour le DOM et le focus. */
  rowId: string;
}

export type LoadedMap = Record<string, TreeNode[] | undefined>;
export type StatusMap = Record<string, NodeStatus | undefined>;

/** Enfants effectifs d'un nœud : statiques ou chargés à la demande. */
export const resolveChildren = (node: TreeNode, loaded: LoadedMap): TreeNode[] | undefined =>
  node.children ?? loaded[node.id];

/** Un nœud est dépliable s'il a des enfants connus ou annoncés (`hasChildren`). */
export const isExpandable = (node: TreeNode, loaded: LoadedMap): boolean => {
  if (node.hasChildren) return true;
  const children = resolveChildren(node, loaded);
  return Array.isArray(children) && children.length > 0;
};

/**
 * Aplatit l'arbre en la liste des lignes visibles, dans l'ordre d'affichage.
 * Un parent déplié insère une ligne d'état (`loading` / `error`) ou ses enfants.
 */
export const flattenTree = (
  nodes: TreeNode[],
  opts: { expanded: Set<string>; loaded: LoadedMap; status: StatusMap },
): FlatRow[] => {
  const out: FlatRow[] = [];

  const walk = (siblings: TreeNode[], level: number, parentId: string | null) => {
    siblings.forEach((node, index) => {
      const expandable = isExpandable(node, opts.loaded);
      const expanded = expandable && opts.expanded.has(node.id);
      out.push({
        node,
        level,
        posinset: index + 1,
        setsize: siblings.length,
        expanded,
        expandable,
        parentId,
        kind: "node",
        rowId: node.id,
      });
      if (!expanded) return;

      const status = opts.status[node.id];
      if (status === "loading" || status === "error") {
        out.push({
          node,
          level: level + 1,
          posinset: 1,
          setsize: 1,
          expanded: false,
          expandable: false,
          parentId: node.id,
          kind: status,
          rowId: `${node.id}::${status}`,
        });
        return;
      }
      const children = resolveChildren(node, opts.loaded);
      if (children && children.length) walk(children, level + 1, node.id);
    });
  };

  walk(nodes, 1, null);
  return out;
};

/**
 * État de case d'un nœud, dérivé de ses feuilles : une feuille suit sa présence
 * dans la sélection ; un parent est « checked » si toutes ses feuilles le sont,
 * « unchecked » si aucune, « mixed » sinon.
 */
export const getCheckState = (node: TreeNode, selected: Set<string>, loaded: LoadedMap): CheckState => {
  const children = resolveChildren(node, loaded);
  if (!children || children.length === 0) {
    return selected.has(node.id) ? "checked" : "unchecked";
  }
  let checked = 0;
  let unchecked = 0;
  for (const child of children) {
    if (child.disabled) continue;
    const state = getCheckState(child, selected, loaded);
    if (state === "mixed") return "mixed";
    if (state === "checked") checked += 1;
    else unchecked += 1;
    if (checked > 0 && unchecked > 0) return "mixed";
  }
  return checked > 0 && unchecked === 0 ? "checked" : "unchecked";
};

/**
 * Feuilles sélectionnables sous un nœud (chargées). Un nœud dépliable non
 * encore chargé est traité comme une feuille : l'app résout son sous-arbre au
 * chargement.
 */
export const collectSelectableLeafIds = (node: TreeNode, loaded: LoadedMap): string[] => {
  if (node.disabled) return [];
  const children = resolveChildren(node, loaded);
  if (!children || children.length === 0) return [node.id];
  return children.flatMap((child) => collectSelectableLeafIds(child, loaded));
};

/** Prochaine ligne dont le libellé commence par la saisie, à partir de `from` (bouclé). */
export const findByTypeahead = (rows: FlatRow[], query: string, from: number): number => {
  if (!query) return -1;
  const q = query.toLowerCase();
  const matches = (row: FlatRow) => row.kind === "node" && !row.node.disabled && row.node.label.toLowerCase().startsWith(q);
  for (let step = 1; step <= rows.length; step++) {
    const i = (from + step) % rows.length;
    if (matches(rows[i])) return i;
  }
  // Inclure la ligne courante en dernier recours (saisie répétée d'une lettre).
  return matches(rows[from]) ? from : -1;
};
