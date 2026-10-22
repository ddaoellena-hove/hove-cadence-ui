import { describe, expect, it } from "vitest";
import {
  breachesThreshold,
  buildXScale,
  buildXTicks,
  buildYScale,
  collectXs,
  nearestIndex,
  resolveAnnotations,
  stackSeries,
  type LineSeriesInput,
} from "./line-chart-utils";

const day = (d: number, h = 0) => new Date(2026, 9, d, h);

const delays: LineSeriesInput = {
  id: "delay",
  label: "Retard moyen",
  data: [
    { x: day(14, 8), y: 3 },
    { x: day(14, 9), y: 7.4 },
    { x: day(14, 10), y: null },
    { x: day(14, 11), y: 4 },
  ],
};

describe("abscisses et échelles", () => {
  it("collecte et trie les dates de toutes les séries", () => {
    const other: LineSeriesInput = { id: "b", label: "B", data: [{ x: day(14, 7), y: 1 }, { x: day(14, 9), y: 2 }] };
    const xs = collectXs([delays, other]) as Date[];
    expect(xs.map((d) => d.getHours())).toEqual([7, 8, 9, 10, 11]);
  });

  it("échelle de temps de 0 à la largeur, granularité horaire", () => {
    const xs = collectXs([delays]);
    const scale = buildXScale(xs, 300);
    expect(scale.time).toBe(true);
    expect(scale.granularity).toBe("hour");
    expect(scale.position(day(14, 8))).toBe(0);
    expect(scale.position(day(14, 11))).toBe(300);
  });

  it("échelle catégorielle centrée dans ses intervalles", () => {
    const scale = buildXScale(["Lun", "Mar"], 200);
    expect(scale.time).toBe(false);
    expect(scale.position("Lun")).toBe(50);
    expect(scale.position("Mar")).toBe(150);
  });

  it("ticks de dates en français", () => {
    const xs = [day(14), day(15), day(16), day(17), day(18), day(19), day(20)];
    const ticks = buildXTicks(xs, buildXScale(xs, 600), 600);
    expect(ticks[0].label).toBe("mer. 14 oct.");
    expect(ticks.length).toBeGreaterThan(1);
  });

  it("échelle Y : part de 0, arrondie, inclut les seuils", () => {
    const xs = collectXs([delays]);
    const y = buildYScale([delays], xs, 200, { thresholds: [10] });
    expect(y.domain()).toEqual([0, 10]);
    expect(y(0)).toBe(200);
    expect(y(10)).toBe(0);
  });

  it("échelle Y imposée par yDomain", () => {
    const y = buildYScale([delays], collectXs([delays]), 100, { yDomain: [80, 100] });
    expect(y.domain()).toEqual([80, 100]);
  });

  it("empile les séries (valeurs nulles à 0)", () => {
    const a: LineSeriesInput = { id: "a", label: "A", data: [{ x: "L", y: 2 }, { x: "M", y: 3 }] };
    const b: LineSeriesInput = { id: "b", label: "B", data: [{ x: "L", y: 1 }, { x: "M", y: null }] };
    expect(stackSeries([a, b], ["L", "M"])).toEqual([
      [[0, 2], [0, 3]],
      [[2, 3], [3, 3]],
    ]);
  });
});

describe("seuils", () => {
  it("baisse favorable : franchi au-dessus du seuil", () => {
    expect(breachesThreshold(6, 5, "down")).toBe(true);
    expect(breachesThreshold(4, 5, "down")).toBe(false);
  });

  it("hausse favorable : franchi en dessous (ponctualité < 95 %)", () => {
    expect(breachesThreshold(93.2, 95, "up")).toBe(true);
    expect(breachesThreshold(96, 95, "up")).toBe(false);
  });

  it("neutre ou valeur absente : jamais franchi", () => {
    expect(breachesThreshold(100, 5, "neutral")).toBe(false);
    expect(breachesThreshold(null, 5, "down")).toBe(false);
  });
});

describe("annotations", () => {
  const xs = [day(14), day(21)];
  const scale = buildXScale(xs, 700);

  it("trait vertical à une date et bande entre deux dates", () => {
    const [line, band] = resolveAnnotations(
      [
        { at: day(15), label: "Travaux" },
        { at: [day(16), day(17)], label: "Grève 16/10" },
      ],
      scale,
      700,
    );
    expect(line).toEqual({ label: "Travaux", x0: 100, x1: 100, band: false });
    expect(band).toMatchObject({ label: "Grève 16/10", x0: 200, x1: 300, band: true });
  });

  it("borne une bande qui déborde et ignore une annotation hors période", () => {
    const resolved = resolveAnnotations(
      [
        { at: [day(20), day(25)], label: "Fin" },
        { at: day(30), label: "Hors période" },
      ],
      scale,
      700,
    );
    expect(resolved).toHaveLength(1);
    expect(resolved[0].x1).toBe(700);
  });
});

describe("point le plus proche", () => {
  it("renvoie l'index de la position la plus proche", () => {
    expect(nearestIndex([0, 100, 200], 40)).toBe(0);
    expect(nearestIndex([0, 100, 200], 160)).toBe(2);
    expect(nearestIndex([], 10)).toBe(-1);
  });
});
