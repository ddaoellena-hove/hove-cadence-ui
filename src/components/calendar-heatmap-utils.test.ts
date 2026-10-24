import { describe, expect, it } from "vitest";
import { buildWeeks, cellSize, dayKey, defaultYearRange, formatDayLong, monthLabels, toDay, weekdayIndex } from "./calendar-heatmap-utils";

describe("CalendarHeatmap", () => {
  it("jours locaux sans décalage de fuseau, clés AAAA-MM-JJ", () => {
    expect(dayKey("2026-10-14")).toBe("2026-10-14");
    expect(dayKey(new Date(2026, 9, 14, 23, 30))).toBe("2026-10-14");
    expect(toDay("2026-03-01").getDate()).toBe(1);
    expect(weekdayIndex(new Date(2026, 9, 12))).toBe(0); // lundi
    expect(weekdayIndex(new Date(2026, 9, 18))).toBe(6); // dimanche
  });

  it("semaines du lundi au dimanche, cases hors période vides", () => {
    // Jeudi 1er octobre → samedi 31 octobre 2026
    const weeks = buildWeeks("2026-10-01", "2026-10-31");
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]?.key).toBe("2026-10-01");
    expect(weeks[4][5]?.key).toBe("2026-10-31");
    expect(weeks[4][6]).toBeNull();
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
    expect(buildWeeks("2026-10-10", "2026-10-01")).toEqual([]);
  });

  it("étiquettes de mois sur la semaine du 1er", () => {
    const weeks = buildWeeks("2026-01-01", "2026-03-31");
    const labels = monthLabels(weeks);
    expect(labels.map((l) => l.label)).toEqual(["janv.", "févr.", "mars"]);
    expect(labels[0].col).toBe(0);
    // Le 1er février 2026 est un dimanche : semaine 4 (index 4)
    expect(labels[1].col).toBe(4);
  });

  it("année civile du jour le plus récent, format long, taille des cases", () => {
    const [start, end] = defaultYearRange(["2026-03-02", "2025-12-30"]);
    expect(dayKey(start)).toBe("2026-01-01");
    expect(dayKey(end)).toBe("2026-12-31");
    expect(formatDayLong(new Date(2026, 9, 14))).toBe("mercredi 14 octobre 2026");
    expect(cellSize(1000, 53)).toBe(16);
    expect(cellSize(300, 53)).toBe(8);
    expect(cellSize(3000, 53)).toBe(18);
  });
});
