import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import { formatValueWithUnit } from "./chart-format";

// Calculs du Treemap (purs, testés) : agrégation de la hiérarchie, pavage
// « squarify », feuilles dans l'ordre de lecture, chemins et parts.

export interface TreemapNodeInput {
  id: string;
  label: string;
  /** Valeur d'une feuille ; ignorée sur un nœud qui a des enfants (somme de ses feuilles). */
  value?: number;
  children?: TreemapNodeInput[];
}

export interface TreemapTile {
  id: string;
  label: string;
  value: number;
  /** Libellés de la racine (exclue) jusqu'à la feuille : ["Bus", "Ligne 91"]. */
  path: string[];
  /** Index de la branche de premier niveau (couleur et motif). */
  group: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapGroup {
  id: string;
  label: string;
  value: number;
  group: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Valeur d'une feuille exploitable : finie et positive, sinon 0 (feuille ignorée). */
const leafValue = (n: TreemapNodeInput) => (n.children?.length ? 0 : Number.isFinite(n.value) && (n.value ?? 0) > 0 ? (n.value as number) : 0);

/**
 * Pavage de la hiérarchie dans un rectangle `width` × `height`. Les branches
 * de premier niveau reçoivent un bandeau de `header` px pour leur libellé.
 * Tuiles triées par valeur décroissante dans chaque branche.
 */
export const layoutTreemap = (root: TreemapNodeInput, width: number, height: number, header = 18) => {
  const tree = hierarchy<TreemapNodeInput>(root, (n) => n.children)
    .sum(leafValue)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const laid = treemap<TreemapNodeInput>()
    .tile(treemapSquarify)
    .size([Math.max(0, width), Math.max(0, height)])
    .paddingInner(2)
    .paddingTop((n) => (n.depth === 1 && n.children ? header : 0))(tree);

  const groupIndex = new Map((laid.children ?? []).map((c, i) => [c, i]));
  const branchOf = (n: HierarchyRectangularNode<TreemapNodeInput>) => {
    let node = n;
    while (node.depth > 1 && node.parent) node = node.parent;
    return groupIndex.get(node) ?? 0;
  };

  const tiles: TreemapTile[] = laid
    .leaves()
    .filter((l) => (l.value ?? 0) > 0 && l.depth > 0)
    .map((l) => ({
      id: l.data.id,
      label: l.data.label,
      value: l.value ?? 0,
      path: l.ancestors().reverse().slice(1).map((a) => a.data.label),
      group: branchOf(l),
      x0: l.x0,
      y0: l.y0,
      x1: l.x1,
      y1: l.y1,
    }));
  const groups: TreemapGroup[] = (laid.children ?? [])
    .filter((c) => c.children && (c.value ?? 0) > 0)
    .map((c) => ({ id: c.data.id, label: c.data.label, value: c.value ?? 0, group: groupIndex.get(c) ?? 0, x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 }));

  // Toutes les branches de premier niveau, feuilles directes comprises (légende)
  const branches = (laid.children ?? [])
    .filter((c) => (c.value ?? 0) > 0)
    .map((c) => ({ id: c.data.id, label: c.data.label, value: c.value ?? 0, group: groupIndex.get(c) ?? 0 }));

  return { tiles, groups, branches, total: laid.value ?? 0 };
};

const percentFormat = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

/** Part en pourcentage fr-FR. */
export const formatTileShare = (value: number, total: number) => percentFormat.format(total > 0 ? value / total : 0);

/** Nom d'une tuile : « Bus › Ligne 91 : 640 km, 12,3 % du total ». */
export const describeTile = (tile: TreemapTile, total: number, unit?: string, format?: Intl.NumberFormatOptions) =>
  `${tile.path.join(" › ")} : ${formatValueWithUnit(tile.value, unit, format)}, ${formatTileShare(tile.value, total)} du total`;
