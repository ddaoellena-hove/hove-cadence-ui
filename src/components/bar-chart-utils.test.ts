import { describe, expect, it } from "vitest";
import { buildCategoryScale, buildSeriesScale, buildValueScale, categoryTotal, stackBars } from "./bar-chart-utils";

const categories = ["lun.", "mar.", "mer."];
const series = [
  { id: "travaux", label: "Travaux", data: [4, 6, null] },
  { id: "incident", label: "Incident technique", data: [3, 2, 9] },
];

describe("BarChart", () => {
  it("empile les séries par catégorie (valeurs nulles à 0)", () => {
    expect(stackBars(series, categories)).toEqual([
      [[0, 4], [0, 6], [0, 0]],
      [[4, 7], [6, 8], [0, 9]],
    ]);
  });

  it("total d'une catégorie", () => {
    expect(categoryTotal(series, 0)).toBe(7);
    expect(categoryTotal(series, 2)).toBe(9);
  });

  it("échelle des valeurs : somme si empilé, maximum si groupé, arrondie", () => {
    expect(buildValueScale(series, categories, 100, "stacked").domain()).toEqual([0, 10]);
    expect(buildValueScale(series, categories, 100, "grouped").domain()).toEqual([0, 10]); // 9 arrondi à 10
    expect(buildValueScale([], categories, 100, "grouped").domain()).toEqual([0, 1]);
  });

  it("bandes des catégories et sous-bandes des séries", () => {
    const band = buildCategoryScale(categories, 300, "grouped");
    expect(band("lun.")).toBeGreaterThan(0);
    expect(band("mer.")! + band.bandwidth()).toBeLessThan(300);
    const sub = buildSeriesScale(["travaux", "incident"], band.bandwidth());
    expect(sub("incident")! + sub.bandwidth()).toBeLessThanOrEqual(band.bandwidth());
    expect(sub("travaux")).toBeLessThan(sub("incident")!);
  });
});
