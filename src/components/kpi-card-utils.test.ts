import { describe, expect, it } from "vitest";
import { buildSparklinePoints, describeDelta, formatDelta, formatKpiValue, getDeltaTone } from "./kpi-card-utils";

describe("formatKpiValue", () => {
  it("formate les nombres en fr-FR", () => {
    expect(formatKpiValue(12430)).toBe("12 430");
    expect(formatKpiValue(94.25)).toBe("94,3");
    expect(formatKpiValue(1240000, { notation: "compact" })).toBe("1,2 M");
  });

  it("utilise le vrai signe moins et laisse les chaînes intactes", () => {
    expect(formatKpiValue(-3)).toBe("−3");
    expect(formatKpiValue("N/D")).toBe("N/D");
  });
});

describe("formatDelta", () => {
  it("signe la variation et ajoute l'unité après une espace fine", () => {
    expect(formatDelta(1.8)).toBe("+1,8 %");
    expect(formatDelta(-0.6, "pt")).toBe("−0,6 pt");
    expect(formatDelta(0)).toBe("0 %");
    expect(formatDelta(35, "")).toBe("+35");
  });
});

describe("getDeltaTone", () => {
  it("juge la variation selon le sens favorable", () => {
    expect(getDeltaTone(5, "up")).toBe("positive");
    expect(getDeltaTone(-12, "down")).toBe("positive");
    expect(getDeltaTone(35, "down")).toBe("negative");
    expect(getDeltaTone(5, "neutral")).toBe("neutral");
    expect(getDeltaTone(0, "up")).toBe("neutral");
  });
});

describe("describeDelta", () => {
  it("rédige une phrase complète pour les lecteurs d'écran", () => {
    expect(describeDelta(-12, "%", "down", "vs hier")).toBe("en baisse de 12 % vs hier, favorable");
    expect(describeDelta(35, "", "down")).toBe("en hausse de 35, défavorable");
    expect(describeDelta(0, "%", "up", "vs hier")).toBe("stable vs hier");
  });
});

describe("buildSparklinePoints", () => {
  it("place le minimum en bas et le maximum en haut", () => {
    const points = buildSparklinePoints([1, 3, 2], 80, 32);
    expect(points[0]).toEqual({ x: 2, y: 30 });
    expect(points[1]).toEqual({ x: 40, y: 2 });
    expect(points[2]).toEqual({ x: 78, y: 16 });
  });

  it("centre une série plate", () => {
    expect(buildSparklinePoints([5, 5], 80, 32).map((p) => p.y)).toEqual([16, 16]);
  });
});
