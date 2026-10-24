import { describe, expect, it } from "vitest";
import { OTHERS_ID, describeDonut, describeSlice, formatShare, prepareSlices, sliceTotal } from "./donut-chart-utils";

const modes = [
  { id: "bus", label: "Bus", value: 1240 },
  { id: "metro", label: "Métro", value: 980 },
  { id: "tram", label: "Tram", value: 420 },
  { id: "rer", label: "RER", value: 278 },
];

describe("DonutChart", () => {
  it("garde l'ordre fourni et calcule la part de chaque catégorie", () => {
    const slices = prepareSlices(modes);
    expect(slices.map((s) => s.id)).toEqual(["bus", "metro", "tram", "rer"]);
    expect(sliceTotal(slices)).toBe(2918);
    expect(slices[0].share).toBeCloseTo(1240 / 2918);
    expect(slices.map((s) => s.index)).toEqual([0, 1, 2, 3]);
  });

  it("ignore les valeurs nulles, négatives ou non finies", () => {
    const slices = prepareSlices([...modes, { id: "x", label: "X", value: 0 }, { id: "y", label: "Y", value: -3 }, { id: "z", label: "Z", value: NaN }]);
    expect(slices).toHaveLength(4);
  });

  it("regroupe les plus petites parts dans « Autres » au-delà de maxSlices", () => {
    const slices = prepareSlices(modes, 3);
    expect(slices.map((s) => s.id)).toEqual(["bus", "metro", OTHERS_ID]);
    expect(slices[2]).toMatchObject({ label: "Autres", value: 698 });
    expect(sliceTotal(slices)).toBe(2918);
    expect(prepareSlices(modes, 3, "Autres modes")[2].label).toBe("Autres modes");
  });

  it("conserve l'ordre d'origine des parts gardées", () => {
    const slices = prepareSlices(
      [
        { id: "a", label: "A", value: 5 },
        { id: "b", label: "B", value: 50 },
        { id: "c", label: "C", value: 1 },
        { id: "d", label: "D", value: 30 },
      ],
      3,
    );
    expect(slices.map((s) => s.id)).toEqual(["b", "d", OTHERS_ID]);
  });

  it("formate les parts et les phrases lues", () => {
    expect(formatShare(0.425)).toBe("42,5 %");
    const [bus] = prepareSlices(modes);
    expect(describeSlice(bus, "trajets")).toBe("Bus : 1 240 trajets, 42,5 %");
    expect(describeDonut(prepareSlices(modes), "trajets")).toBe(
      "Total 2 918 trajets en 4 parts. Plus grande part : Bus, 42,5 %.",
    );
    expect(describeDonut([])).toBe("Aucune part.");
  });
});
