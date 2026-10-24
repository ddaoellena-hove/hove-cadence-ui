import { describe, expect, it } from "vitest";
import { describeSegments, formatMeterValue, meterRatio, prepareSegments } from "./meter-utils";
import { evaluateThresholds, thresholdStatus } from "./threshold-utils";

const km = [
  { id: "commercial", label: "Commerciaux", value: 1020 },
  { id: "hlp", label: "Haut-le-pied", value: 140 },
  { id: "annules", label: "Annulés", value: 80 },
];

describe("Meter", () => {
  it("proportion bornée entre 0 et 1", () => {
    expect(meterRatio(96, 120)).toBe(0.8);
    expect(meterRatio(150, 120)).toBe(1);
    expect(meterRatio(-4, 120)).toBe(0);
    expect(meterRatio(5, 0)).toBe(0);
    expect(meterRatio(NaN, 100)).toBe(0);
  });

  it("valeur seule en %, sinon valeur / capacité", () => {
    expect(formatMeterValue(86, 100, "%")).toBe("86 %");
    expect(formatMeterValue(96, 120, "places")).toBe("96 / 120 places");
    expect(formatMeterValue(1240, 1500)).toBe("1 240 / 1 500");
  });

  it("segments : part du maximum, ou de la somme sans maximum", () => {
    const sum = prepareSegments(km);
    expect(sum).toMatchObject({ total: 1240, max: 1240, rest: 0 });
    expect(sum.segments[0].share).toBeCloseTo(1020 / 1240);

    const capped = prepareSegments(km, 1500);
    expect(capped).toMatchObject({ total: 1240, max: 1500 });
    expect(capped.rest).toBeCloseTo(260 / 1500);

    // Maximum inférieur à la somme : la somme l'emporte
    expect(prepareSegments(km, 1000).max).toBe(1240);
    // Valeurs non exploitables ignorées
    expect(prepareSegments([...km, { id: "x", label: "X", value: -1 }]).segments).toHaveLength(3);
  });

  it("résumé lu du mode proportionnel", () => {
    const { segments, total, max } = prepareSegments(km, 1500);
    expect(describeSegments(segments, total, max, "km")).toBe(
      "Commerciaux : 1 020 km (68 %), Haut-le-pied : 140 km (9,3 %), Annulés : 80 km (5,3 %). Total 1 240 km sur 1 500 km.",
    );
    expect(describeSegments([], 0, 0)).toBe("Aucune donnée.");
  });

  it("seuils : jugement selon le sens favorable", () => {
    const load = [
      { value: 80, label: "Charge élevée 80 %" },
      { value: 100, label: "Capacité 100 %" },
    ];
    expect(evaluateThresholds(62, load, "down")).toEqual({ tone: "success", label: "Charge élevée 80 %" });
    expect(evaluateThresholds(92, load, "down")).toEqual({ tone: "warning", label: "Capacité 100 %" });
    expect(evaluateThresholds(112, load, "down")).toEqual({ tone: "danger", label: "Capacité 100 %" });
    expect(evaluateThresholds(92, load, "neutral")).toEqual({ tone: "neutral", label: null });
    expect(evaluateThresholds(92, [{ value: 85, label: "Objectif 85 %" }], "up")).toEqual({ tone: "success", label: "Objectif 85 %" });
    expect(thresholdStatus("warning", "Capacité 100 %")).toBe("Niveau intermédiaire — Capacité 100 %");
    expect(thresholdStatus("neutral", null)).toBeNull();
  });
});
