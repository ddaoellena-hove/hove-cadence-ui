import { describe, expect, it } from "vitest";
import { buildStepScale, columnLabelEvery, heatmapDomain, indexCells, moveInGrid, rampThresholds } from "./heatmap-utils";

const cells = [
  { x: "08 h", y: "lun.", value: 0 },
  { x: "09 h", y: "lun.", value: 35 },
  { x: "08 h", y: "dim.", value: null },
];

describe("rampe séquentielle", () => {
  it("domaine [0, max] par défaut, ou imposé", () => {
    expect(heatmapDomain(cells)).toEqual([0, 35]);
    expect(heatmapDomain(cells, [0, 70])).toEqual([0, 70]);
    expect(heatmapDomain([{ x: "a", y: "b", value: null }])).toEqual([0, 1]);
  });

  it("7 pas, bornes incluses ; null pour une cellule vide", () => {
    const step = buildStepScale([0, 70]);
    expect(step(0)).toBe(1);
    expect(step(9.9)).toBe(1);
    expect(step(10)).toBe(2);
    expect(step(70)).toBe(7);
    expect(step(999)).toBe(7);
    expect(step(null)).toBeNull();
  });

  it("classes de la légende", () => {
    const ramp = rampThresholds([0, 70]);
    expect(ramp).toHaveLength(7);
    expect(ramp[0]).toEqual({ step: 1, from: 0, to: 10 });
    expect(ramp[6]).toEqual({ step: 7, from: 60, to: 70 });
  });

  it("indexe les cellules par ligne et colonne", () => {
    expect(indexCells(cells).get("lun.|09 h")?.value).toBe(35);
  });
});

describe("navigation au clavier dans la grille", () => {
  const at = { row: 1, col: 1 };

  it("flèches, bornées aux bords", () => {
    expect(moveInGrid(at, "ArrowRight", false, 3, 3)).toEqual({ row: 1, col: 2 });
    expect(moveInGrid({ row: 0, col: 0 }, "ArrowUp", false, 3, 3)).toEqual({ row: 0, col: 0 });
    expect(moveInGrid(at, "ArrowDown", false, 3, 3)).toEqual({ row: 2, col: 1 });
  });

  it("Début / Fin sur la ligne, Ctrl+Début / Fin sur la grille", () => {
    expect(moveInGrid(at, "Home", false, 3, 4)).toEqual({ row: 1, col: 0 });
    expect(moveInGrid(at, "End", false, 3, 4)).toEqual({ row: 1, col: 3 });
    expect(moveInGrid(at, "End", true, 3, 4)).toEqual({ row: 2, col: 3 });
    expect(moveInGrid(at, "Enter", false, 3, 4)).toBeNull();
  });

  it("allège les étiquettes de colonnes quand la place manque", () => {
    expect(columnLabelEvery(640, 20)).toBe(1);
    expect(columnLabelEvery(300, 20)).toBe(3);
  });
});
