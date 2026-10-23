// Logique pure de DisruptionScopePicker : filtrage de l'arbre à la recherche
// et table des libellés pour les chips de sélection.

import type { TreeNode } from "./tree-view-utils";

/**
 * Filtre l'arbre selon une saisie : garde un nœud si son libellé correspond,
 * ou s'il a un descendant correspondant (la branche est alors dépliée). Ne
 * voit que les enfants déjà chargés.
 */
export const filterTree = (nodes: TreeNode[], query: string): { nodes: TreeNode[]; expandedIds: string[] } => {
  const q = query.trim().toLowerCase();
  if (!q) return { nodes, expandedIds: [] };

  const expandedIds: string[] = [];
  const walk = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const node of list) {
      const selfMatch = node.label.toLowerCase().includes(q);
      const matchedChildren = node.children ? walk(node.children) : [];
      if (matchedChildren.length) {
        out.push({ ...node, children: matchedChildren });
        expandedIds.push(node.id);
      } else if (selfMatch) {
        out.push(node); // branche entière conservée, dépliable à la demande
      }
    }
    return out;
  };

  return { nodes: walk(nodes), expandedIds };
};

/** Table id → libellé sur les nœuds chargés (pour l'affichage des chips). */
export const buildLabelMap = (nodes: TreeNode[], map: Record<string, string> = {}): Record<string, string> => {
  for (const node of nodes) {
    map[node.id] = node.label;
    if (node.children) buildLabelMap(node.children, map);
  }
  return map;
};
