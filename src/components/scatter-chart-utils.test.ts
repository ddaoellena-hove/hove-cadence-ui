import { describe, expect, it } from "vitest";
import { buildAxisScale, nearestPoint, traversalOrder } from "./scatter-chart-utils";

describe("ScatterChart", () => {
  it("échelles : zéro inclus par défaut, bornes imposées, valeurs non finies ignorées", () => {
    expect(buildAxisScale([42, 96, NaN], [0, 100]).domain()).toEqual([0, 100]);
    expect(buildAxisScale([42, 96], [0, 100], undefined, false).domain()).toEqual([40, 100]);
    expect(buildAxisScale([1, 2], [0, 10], [0, 5]).domain()).toEqual([0, 5]);
    expect(buildAxisScale([], [0, 10]).domain()).toEqual([0, 1]);
  });

  it("parcours de gauche à droite, puis de bas en haut", () => {
    const order = traversalOrder([
      { id: "a", x: 3, y: 1 },
      { id: "b", x: 1, y: 5 },
      { id: "c", x: 1, y: 2 },
      { id: "d", x: NaN, y: 2 },
    ]);
    expect(order.map((p) => p.id)).toEqual(["c", "b", "a"]);
  });

  it("point le plus proche dans un rayon", () => {
    const positions = [
      { px: 10, py: 10 },
      { px: 50, py: 50 },
    ];
    expect(nearestPoint(positions, 14, 12)).toBe(0);
    expect(nearestPoint(positions, 46, 55)).toBe(1);
    expect(nearestPoint(positions, 200, 200)).toBe(-1);
  });
});
