import { describe, expect, it } from "vitest";
import { axisTitle, buildLineScale } from "./combo-chart-utils";

const punctuality = [{ id: "p", data: [93.1, 94.8, null, 91.2] }];

describe("ComboChart", () => {
  it("axe droit : de 0 au maximum arrondi, seuils inclus", () => {
    const scale = buildLineScale(punctuality, 200);
    expect(scale.domain()).toEqual([0, 100]);
    expect(scale(0)).toBe(200);
    expect(scale(100)).toBe(0);
    expect(buildLineScale([{ id: "x", data: [4, 6] }], 100, undefined, [12]).domain()[1]).toBeGreaterThanOrEqual(12);
  });

  it("axe droit : bornes imposées, valeurs négatives, série vide", () => {
    expect(buildLineScale(punctuality, 200, [80, 100]).domain()).toEqual([80, 100]);
    expect(buildLineScale([{ id: "d", data: [-2, 3] }], 100).domain()[0]).toBeLessThanOrEqual(-2);
    expect(buildLineScale([], 100).domain()).toEqual([0, 1]);
  });

  it("titre d'axe avec unité", () => {
    expect(axisTitle("Validations", "k")).toBe("Validations (k)");
    expect(axisTitle("Ponctualité")).toBe("Ponctualité");
  });
});
