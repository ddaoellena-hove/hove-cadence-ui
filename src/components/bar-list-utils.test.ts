import { describe, expect, it } from "vitest";
import { barRatio, describeItem, prepareItems } from "./bar-list-utils";

const items = [
  { id: "l4", value: 27 },
  { id: "l13", value: 42, delta: { value: 12 } },
  { id: "rerb", value: 38 },
];

describe("BarList", () => {
  it("garde l'ordre fourni ou trie par valeur décroissante", () => {
    expect(prepareItems(items, "none").shown.map((i) => i.id)).toEqual(["l4", "l13", "rerb"]);
    expect(prepareItems(items, "desc").shown.map((i) => i.id)).toEqual(["l13", "rerb", "l4"]);
  });

  it("limite et compte les lignes masquées", () => {
    expect(prepareItems(items, "desc", 2)).toMatchObject({ hidden: 1 });
    expect(prepareItems(items, "desc", 2).shown).toHaveLength(2);
    expect(prepareItems(items, "none", 10).hidden).toBe(0);
  });

  it("proportion de la barre bornée entre 0 et 1", () => {
    expect(barRatio(21, 42)).toBe(0.5);
    expect(barRatio(-3, 42)).toBe(0);
    expect(barRatio(5, 0)).toBe(0);
  });

  it("nom accessible avec valeur, unité et variation jugée", () => {
    expect(describeItem("Ligne 13", items[1], "down", "perturbations")).toBe(
      "Ligne 13 : 42 perturbations, en hausse de 12 %, défavorable",
    );
    expect(describeItem("Ligne 4", items[0], "down")).toBe("Ligne 4 : 27");
  });
});
