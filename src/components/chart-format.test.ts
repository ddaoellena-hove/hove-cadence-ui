import { describe, expect, it } from "vitest";
import {
  describeDelta,
  formatAxisDate,
  formatDelta,
  formatFullDate,
  formatValueWithUnit,
  getDateGranularity,
  getDeltaTone,
} from "./chart-format";

describe("nombres fr-FR", () => {
  it("valeur et unité, signe moins typographique", () => {
    expect(formatValueWithUnit(4.25, "min")).toBe("4,3 min");
    expect(formatValueWithUnit(12430)).toBe("12 430");
    expect(formatValueWithUnit(-3, "%")).toBe("−3 %");
  });

  it("variation et ton selon le sens favorable (partagés avec Card)", () => {
    expect(formatDelta(-0.6, "pt")).toBe("−0,6 pt");
    expect(getDeltaTone(5, "down")).toBe("negative");
    expect(describeDelta(-12, "%", "down", "vs hier")).toBe("en baisse de 12 % vs hier, favorable");
  });
});

describe("dates d'axe adaptées à l'étendue", () => {
  const start = new Date(2026, 9, 14, 0);

  it("choisit heures, jours ou mois", () => {
    expect(getDateGranularity(start, new Date(2026, 9, 15, 6))).toBe("hour");
    expect(getDateGranularity(start, new Date(2026, 9, 21))).toBe("day");
    expect(getDateGranularity(start, new Date(2027, 2, 1))).toBe("month");
  });

  it("formate en français", () => {
    expect(formatAxisDate(new Date(2026, 9, 14, 8), "hour")).toBe("08 h");
    expect(formatAxisDate(new Date(2026, 9, 14), "day")).toBe("mer. 14 oct.");
    expect(formatAxisDate(new Date(2026, 9, 14), "month")).toBe("oct. 2026");
    expect(formatFullDate(new Date(2026, 9, 14), "day")).toBe("mercredi 14 octobre 2026");
    expect(formatFullDate(new Date(2026, 9, 14, 8, 30), "hour")).toBe("mercredi 14 octobre à 08:30");
  });
});
