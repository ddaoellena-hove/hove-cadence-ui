import { describe, expect, it } from "vitest";
import {
  collectSelectableLeafIds,
  findByTypeahead,
  flattenTree,
  getCheckState,
  isExpandable,
  resolveChildren,
  type TreeNode,
} from "./tree-view-utils";

const TREE: TreeNode[] = [
  {
    id: "m",
    label: "Métro",
    children: [
      { id: "m1", label: "Ligne 1", children: [{ id: "m1a", label: "Parcours aller" }, { id: "m1r", label: "Parcours retour" }] },
      { id: "m2", label: "Ligne 2" },
    ],
  },
  { id: "bus", label: "Bus", hasChildren: true }, // chargement à la demande
];

describe("tree-view-utils", () => {
  it("resolveChildren : statiques puis chargés à la demande", () => {
    expect(resolveChildren(TREE[0], {})?.length).toBe(2);
    expect(resolveChildren(TREE[1], {})).toBeUndefined();
    expect(resolveChildren(TREE[1], { bus: [{ id: "b1", label: "38" }] })?.length).toBe(1);
  });

  it("isExpandable : enfants connus ou annoncés", () => {
    expect(isExpandable(TREE[0], {})).toBe(true); // enfants statiques
    expect(isExpandable(TREE[1], {})).toBe(true); // hasChildren
    expect(isExpandable({ id: "x", label: "feuille" }, {})).toBe(false);
  });

  it("flattenTree : seules les lignes visibles, dans l'ordre, avec posinset/setsize", () => {
    const rows = flattenTree(TREE, { expanded: new Set(["m"]), loaded: {}, status: {} });
    expect(rows.map((r) => r.rowId)).toEqual(["m", "m1", "m2", "bus"]);
    const m1 = rows.find((r) => r.rowId === "m1")!;
    expect(m1.level).toBe(2);
    expect(m1.posinset).toBe(1);
    expect(m1.setsize).toBe(2);
    expect(rows.find((r) => r.rowId === "m")!.expanded).toBe(true);
    expect(rows.find((r) => r.rowId === "m1")!.expanded).toBe(false);
  });

  it("flattenTree : un parent en chargement insère une ligne d'état", () => {
    const rows = flattenTree(TREE, { expanded: new Set(["bus"]), loaded: {}, status: { bus: "loading" } });
    expect(rows.map((r) => r.rowId)).toEqual(["m", "bus", "bus::loading"]);
    expect(rows[2].kind).toBe("loading");
    expect(rows[2].level).toBe(2);
  });

  it("flattenTree : un parent en erreur insère une ligne de reprise", () => {
    const rows = flattenTree(TREE, { expanded: new Set(["bus"]), loaded: {}, status: { bus: "error" } });
    expect(rows.at(-1)!.kind).toBe("error");
    expect(rows.at(-1)!.rowId).toBe("bus::error");
  });

  it("getCheckState : feuille, parent plein, parent partiel", () => {
    expect(getCheckState(TREE[0].children![0], new Set(["m1a", "m1r"]), {})).toBe("checked");
    expect(getCheckState(TREE[0].children![0], new Set(["m1a"]), {})).toBe("mixed");
    expect(getCheckState(TREE[0].children![0], new Set(), {})).toBe("unchecked");
    expect(getCheckState(TREE[0], new Set(["m1a", "m1r", "m2"]), {})).toBe("checked");
    expect(getCheckState(TREE[0], new Set(["m1a"]), {})).toBe("mixed");
  });

  it("collectSelectableLeafIds : feuilles du sous-arbre, nœud non chargé = feuille, disabled ignoré", () => {
    expect(collectSelectableLeafIds(TREE[0], {})).toEqual(["m1a", "m1r", "m2"]);
    expect(collectSelectableLeafIds(TREE[1], {})).toEqual(["bus"]); // non chargé → feuille
    expect(collectSelectableLeafIds({ id: "d", label: "x", disabled: true }, {})).toEqual([]);
  });

  it("findByTypeahead : prochaine ligne correspondante, bouclée", () => {
    const rows = flattenTree(TREE, { expanded: new Set(["m", "m1"]), loaded: {}, status: {} });
    // rows: m, m1, m1a, m1r, m2, bus
    expect(findByTypeahead(rows, "b", 0)).toBe(rows.findIndex((r) => r.rowId === "bus"));
    expect(findByTypeahead(rows, "m", 5)).toBe(0); // boucle vers « Métro »
    expect(findByTypeahead(rows, "zz", 0)).toBe(-1);
  });
});

// Une feuille verrouillée ne rend pas le réseau indéterminé à tort.
it("ignore les enfants désactivés dans le statut agrégé du parent", () => {
  const node = { id: "network", label: "Réseau", children: [{ id: "a", label: "A" }, { id: "b", label: "B", disabled: true }] };
  expect(getCheckState(node, new Set(["a"]), {})).toBe("checked");
  expect(getCheckState(node, new Set(), {})).toBe("unchecked");
  expect(getCheckState({ ...node, children: [{ id: "b", label: "B", disabled: true }] }, new Set(), {})).toBe("unchecked");
});
