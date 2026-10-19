import { describe, expect, it } from "vitest";
import {
  compareValues,
  formatCellValue,
  getHeaderCheckboxState,
  getRangeIds,
  setIdsSelected,
  toggleSort,
} from "./data-table-utils";

describe("compareValues", () => {
  it("trie les chaînes à la française, nombres inclus", () => {
    const lines = ["Ligne 10", "ligne 2", "Ligne 1"];
    expect([...lines].sort(compareValues)).toEqual(["Ligne 1", "ligne 2", "Ligne 10"]);
  });

  it("ignore les accents", () => {
    expect(compareValues("Étoile", "etoile")).toBe(0);
  });

  it("compare les nombres et les dates numériquement", () => {
    expect(compareValues(9, 10)).toBeLessThan(0);
    expect(compareValues(new Date(2026, 9, 2), new Date(2026, 9, 1))).toBeGreaterThan(0);
  });
});

describe("toggleSort", () => {
  it("cycle croissant → décroissant → aucun", () => {
    const asc = toggleSort([], "name", false);
    expect(asc).toEqual([{ id: "name", desc: false }]);
    const desc = toggleSort(asc, "name", false);
    expect(desc).toEqual([{ id: "name", desc: true }]);
    expect(toggleSort(desc, "name", false)).toEqual([]);
  });

  it("remplace le tri existant sans Maj", () => {
    expect(toggleSort([{ id: "name", desc: false }], "delay", false)).toEqual([{ id: "delay", desc: false }]);
  });

  it("ajoute, modifie puis retire une colonne avec Maj", () => {
    const first = [{ id: "line", desc: false }];
    const multi = toggleSort(first, "delay", true);
    expect(multi).toEqual([{ id: "line", desc: false }, { id: "delay", desc: false }]);
    const flipped = toggleSort(multi, "delay", true);
    expect(flipped).toEqual([{ id: "line", desc: false }, { id: "delay", desc: true }]);
    expect(toggleSort(flipped, "delay", true)).toEqual(first);
  });
});

describe("getHeaderCheckboxState", () => {
  const displayed = ["a", "b", "c"];

  it("est décochée sans sélection ou sans ligne", () => {
    expect(getHeaderCheckboxState(displayed, new Set())).toBe("unchecked");
    expect(getHeaderCheckboxState([], new Set(["a"]))).toBe("unchecked");
  });

  it("est indéterminée avec une sélection partielle", () => {
    expect(getHeaderCheckboxState(displayed, new Set(["b"]))).toBe("indeterminate");
  });

  it("est cochée quand toutes les lignes affichées le sont", () => {
    expect(getHeaderCheckboxState(displayed, new Set(["a", "b", "c", "z"]))).toBe("checked");
  });
});

describe("getRangeIds", () => {
  const displayed = ["a", "b", "c", "d", "e"];

  it("renvoie la plage dans l'ordre affiché, dans les deux sens", () => {
    expect(getRangeIds(displayed, "b", "d")).toEqual(["b", "c", "d"]);
    expect(getRangeIds(displayed, "d", "b")).toEqual(["b", "c", "d"]);
  });

  it("se réduit à la cible sans ancre affichée", () => {
    expect(getRangeIds(displayed, null, "c")).toEqual(["c"]);
    expect(getRangeIds(displayed, "x", "c")).toEqual(["c"]);
  });
});

describe("setIdsSelected", () => {
  it("ajoute sans doublon et retire", () => {
    expect(setIdsSelected(["a", "b"], ["b", "c"], true)).toEqual(["a", "b", "c"]);
    expect(setIdsSelected(["a", "b", "c"], ["b", "c"], false)).toEqual(["a"]);
  });
});

describe("formatCellValue", () => {
  it("formate nombres, booléens, dates et valeurs vides", () => {
    expect(formatCellValue(12430)).toBe("12 430");
    expect(formatCellValue(true)).toBe("Oui");
    expect(formatCellValue(new Date(2026, 9, 1, 8, 5))).toBe("01/10/2026 08:05");
    expect(formatCellValue(null)).toBe("—");
  });
});
