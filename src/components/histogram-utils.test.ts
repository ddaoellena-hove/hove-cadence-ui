import { describe, expect, it } from "vitest";
import { binLabel, buildBins, describeHistogram, edgePosition, formatBinShare } from "./histogram-utils";

const delays = [-1, 0, 0.5, 1, 1.5, 2, 2, 2.5, 3, 4, 6, 9, 14, 22];

describe("Histogram", () => {
  it("bornes rondes couvrant toutes les valeurs, effectifs et parts", () => {
    const bins = buildBins(delays, 5);
    expect(bins[0].x0).toBeLessThanOrEqual(-1);
    expect(bins[bins.length - 1].x1).toBeGreaterThanOrEqual(22);
    expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(delays.length);
    expect(bins.reduce((sum, b) => sum + b.share, 0)).toBeCloseTo(1);
    expect(bins.every((b) => !b.openStart && !b.openEnd)).toBe(true);
  });

  it("bornes imposées : valeurs hors bornes dans des classes ouvertes", () => {
    const bins = buildBins(delays, [0, 2, 5, 10]);
    expect(bins.map((b) => [b.x0, b.x1])).toEqual([
      [0, 2],
      [2, 5],
      [5, 10],
    ]);
    // −1 rejoint la première classe ; 14 et 22 la dernière
    expect(bins.map((b) => b.count)).toEqual([5, 5, 4]);
    expect(bins[0].openStart).toBe(true);
    expect(bins[2].openEnd).toBe(true);
  });

  it("ignore les valeurs non finies ; valeurs toutes égales", () => {
    expect(buildBins([NaN, Infinity])).toEqual([]);
    expect(buildBins([3, 3, 3]).reduce((sum, b) => sum + b.count, 0)).toBe(3);
    expect(buildBins([1, 2, NaN]).reduce((sum, b) => sum + b.count, 0)).toBe(2);
  });

  it("libellés de classe et résumé", () => {
    const [first, , last] = buildBins(delays, [0, 2, 5, 10]);
    expect(binLabel({ ...first, openStart: false }, "min")).toBe("De 0 à 2\u202fmin");
    expect(binLabel(first, "min")).toBe("Moins de 2\u202fmin");
    expect(binLabel(last, "min")).toBe("5\u202fmin et plus");
    expect(formatBinShare(0.3125)).toBe("31,3\u00a0%");
    expect(describeHistogram(delays, buildBins(delays, [0, 2, 5, 10]), "courses", "min")).toBe(
      "14 courses, médiane 2,3\u202fmin, classe la plus fournie : moins de 2\u202fmin (35,7\u00a0%).",
    );
    expect(describeHistogram([], [], "courses")).toBe("Aucune observation.");
  });

  it("position sur l'axe : classes de même largeur, valeur interpolée", () => {
    const edges = [0, 1, 2, 3, 5, 10];
    expect(edgePosition(edges, 0, 500)).toBe(0);
    expect(edgePosition(edges, 1, 500)).toBe(100);
    expect(edgePosition(edges, 4, 500)).toBe(350);
    expect(edgePosition(edges, 7.5, 500)).toBe(450);
    expect(edgePosition(edges, 12, 500)).toBe(500);
    expect(edgePosition(edges, -3, 500)).toBe(0);
    expect(edgePosition([1], 4, 500)).toBe(0);
  });

  it("heures de service : classes alignées sur l'horloge, libellés horaires", () => {
    // Derniers départs entre 22h40 et 25h10
    const departures = [1360, 1385, 1410, 1440, 1455, 1480, 1500, 1510];
    const bins = buildBins(departures, 5, true);
    expect(bins[0].x0).toBe(1350);
    expect(bins.map((b) => b.x1 - b.x0).every((w) => w === 30)).toBe(true);
    expect(bins[bins.length - 1].x1).toBe(1530);
    expect(binLabel(bins[0], undefined, undefined, true)).toBe("De 22h30 à 23h00");
    expect(binLabel({ ...bins[0], openStart: true }, undefined, undefined, true)).toBe("Avant 23h00");
    expect(binLabel({ ...bins[0], openEnd: true }, undefined, undefined, true)).toBe("22h30 et après");
    expect(describeHistogram(departures, bins, "départs", undefined, undefined, true)).toMatch(/^8 départs, médiane 24h08, classe la plus fournie : de /);
  });
});
