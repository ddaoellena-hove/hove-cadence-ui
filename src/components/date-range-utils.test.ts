import { describe, expect, it } from "vitest";
import { formatDate } from "./date-utils";
import { DEFAULT_PRESETS, exceedsMaxDays, findMatchingPreset, formatRange, normalizeRange } from "./date-range-utils";

const REF = new Date(2026, 9, 19, 14, 30);
const presetRange = (id: string) => {
  const range = DEFAULT_PRESETS.find((p) => p.id === id)!.getRange(REF);
  return `${formatDate(range.start)} → ${formatDate(range.end)}`;
};

describe("préréglages par défaut", () => {
  it("sont relatifs à la date de référence", () => {
    expect(presetRange("today")).toBe("19/10/2026 → 19/10/2026");
    expect(presetRange("yesterday")).toBe("18/10/2026 → 18/10/2026");
    expect(presetRange("last-7-days")).toBe("13/10/2026 → 19/10/2026");
    expect(presetRange("last-30-days")).toBe("20/09/2026 → 19/10/2026");
    expect(presetRange("this-month")).toBe("01/10/2026 → 19/10/2026");
    expect(presetRange("last-month")).toBe("01/09/2026 → 30/09/2026");
  });

  it("gèrent le changement d'année", () => {
    const range = DEFAULT_PRESETS.find((p) => p.id === "last-month")!.getRange(new Date(2027, 0, 5));
    expect(formatRange(range.start, range.end)).toBe("01/12/2026 – 31/12/2026");
  });
});

describe("normalizeRange", () => {
  it("ordonne les dates et couvre des jours entiers", () => {
    const { start, end } = normalizeRange(new Date(2026, 9, 19, 10), new Date(2026, 9, 1, 15));
    expect(formatDate(start, true)).toBe("01/10/2026 00:00");
    expect([end.getDate(), end.getHours(), end.getMinutes(), end.getMilliseconds()]).toEqual([19, 23, 59, 999]);
  });
});

describe("findMatchingPreset", () => {
  it("reconnaît un préréglage au jour près, quelle que soit l'heure", () => {
    const range = normalizeRange(new Date(2026, 9, 13), new Date(2026, 9, 19));
    expect(findMatchingPreset(range, DEFAULT_PRESETS, REF)?.label).toBe("7 derniers jours");
  });

  it("ne renvoie rien pour une période libre ou incomplète", () => {
    expect(findMatchingPreset(normalizeRange(new Date(2026, 9, 2), new Date(2026, 9, 9)), DEFAULT_PRESETS, REF)).toBeUndefined();
    expect(findMatchingPreset({ start: REF, end: null }, DEFAULT_PRESETS, REF)).toBeUndefined();
  });
});

describe("formatRange", () => {
  it("affiche une seule date si début et fin sont le même jour", () => {
    expect(formatRange(new Date(2026, 9, 19), new Date(2026, 9, 19, 23))).toBe("19/10/2026");
  });
});

describe("exceedsMaxDays", () => {
  it("compte la durée bornes incluses, dans les deux sens", () => {
    const anchor = new Date(2026, 9, 1);
    expect(exceedsMaxDays(anchor, new Date(2026, 9, 31), 31)).toBe(false);
    expect(exceedsMaxDays(anchor, new Date(2026, 10, 1), 31)).toBe(true);
    expect(exceedsMaxDays(anchor, new Date(2026, 8, 1), 31)).toBe(false);
    expect(exceedsMaxDays(anchor, new Date(2026, 7, 31), 31)).toBe(true);
    expect(exceedsMaxDays(anchor, new Date(2027, 0, 1))).toBe(false);
  });
});
