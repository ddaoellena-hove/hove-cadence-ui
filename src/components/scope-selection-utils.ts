import type { TreeNode } from "./TreeView";
import { collectSelectableLeafIds } from "./tree-view-utils";

/** Développe les parents sélectionnés ; les identifiants inconnus sont conservés. */
export const expandScopeSelection = (nodes: TreeNode[], ids: string[]): string[] => {
  const map = new Map<string, TreeNode>();
  const walk = (list: TreeNode[]) => list.forEach(n => { map.set(n.id, n); if (n.children) walk(n.children); });
  walk(nodes);
  return [...new Set(ids.flatMap(id => map.has(id) ? collectSelectableLeafIds(map.get(id)!, {}) : [id]))];
};
/** Regroupe les sous-arbres entièrement sélectionnés, dans l'ordre de l'arbre. */
export const compactScopeSelection = (nodes: TreeNode[], ids: string[]): string[] => {
  const selected = new Set(ids);
  const covered = new Set<string>();
  const walk = (list: TreeNode[]): string[] => list.flatMap(node => {
    const leaves = collectSelectableLeafIds(node, {});
    if (leaves.length && leaves.every(id => selected.has(id))) { leaves.forEach(id => covered.add(id)); return [node.id]; }
    return node.children ? walk(node.children) : [];
  });
  const result = walk(nodes);
  return [...result, ...ids.filter(id => !covered.has(id))];
};
