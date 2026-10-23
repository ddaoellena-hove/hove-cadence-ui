import { describe, expect, it } from "vitest";
import { buildLabelMap, filterTree } from "./scope-picker-utils";
import type { TreeNode } from "./tree-view-utils";

const TREE: TreeNode[] = [
  { id: "metro", label: "Métro", children: [
    { id: "m1", label: "Ligne 1", children: [{ id: "m1a", label: "Aller" }] },
    { id: "m4", label: "Ligne 4" },
  ] },
  { id: "bus", label: "Bus", children: [{ id: "b38", label: "38 Gare du Nord" }] },
];

describe("scope-picker-utils", () => {
  it("filterTree : saisie vide → arbre inchangé, rien à déplier", () => {
    const r = filterTree(TREE, "  ");
    expect(r.nodes).toBe(TREE);
    expect(r.expandedIds).toEqual([]);
  });

  it("filterTree : garde les branches correspondantes et les déplie", () => {
    const r = filterTree(TREE, "ligne 1");
    expect(r.nodes.map((n) => n.id)).toEqual(["metro"]);
    expect(r.nodes[0].children!.map((n) => n.id)).toEqual(["m1"]);
    expect(r.expandedIds).toContain("metro");
  });

  it("filterTree : un libellé de parent qui correspond garde toute sa branche", () => {
    const r = filterTree(TREE, "métro");
    expect(r.nodes.map((n) => n.id)).toEqual(["metro"]);
    expect(r.nodes[0].children!.map((n) => n.id)).toEqual(["m1", "m4"]); // branche entière
    expect(r.expandedIds).not.toContain("metro"); // pas de dépliage forcé
  });

  it("filterTree : correspondance en profondeur (feuille)", () => {
    const r = filterTree(TREE, "gare du nord");
    expect(r.nodes.map((n) => n.id)).toEqual(["bus"]);
    expect(r.expandedIds).toContain("bus");
  });

  it("buildLabelMap : id → libellé sur tout l'arbre", () => {
    const map = buildLabelMap(TREE);
    expect(map.m1a).toBe("Aller");
    expect(map.b38).toBe("38 Gare du Nord");
    expect(Object.keys(map)).toHaveLength(6);
  });
});
