import { describe, expect, it } from "vitest";
import { boxStats, describeBox } from "./box-plot-utils";

describe("BoxPlot", () => {
  it("quartiles, moustaches de Tukey et valeurs aberrantes", () => {
    const stats = boxStats([21, 22, 23, 24, 24, 25, 26, 28, 30, 55, NaN]);
    expect(stats).toMatchObject({ count: 10, min: 21, max: 55, median: 24.5 });
    expect(stats?.q1).toBeCloseTo(23.25);
    expect(stats?.q3).toBeCloseTo(27.5);
    // IQR 4,25 → bornes 16,875 et 33,875 : 55 est aberrant
    expect(stats?.outliers).toEqual([55]);
    expect(stats?.lowWhisker).toBe(21);
    expect(stats?.highWhisker).toBe(30);
  });

  it("groupe vide ou d'une seule valeur", () => {
    expect(boxStats([])).toBeNull();
    expect(boxStats([NaN])).toBeNull();
    expect(boxStats([12])).toMatchObject({ q1: 12, median: 12, q3: 12, lowWhisker: 12, highWhisker: 12, outliers: [] });
  });

  it("phrase lue", () => {
    expect(describeBox("Ligne 13", boxStats([20, 22, 24, 26, 28]), "courses", "min")).toBe(
      "Ligne 13 : médiane 24 min, moitié centrale de 22 min à 26 min, de 20 min à 28 min hors valeurs aberrantes, aucune valeur aberrante, 5 courses",
    );
    expect(describeBox("Ligne 4", null, "courses")).toBe("Ligne 4 : aucune valeur");
  });
});
