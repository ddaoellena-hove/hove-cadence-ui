import { describe, expect, it } from "vitest";
import {
  addMonths,
  buildWeeks,
  countDays,
  dateToParts,
  endOfDay,
  formatDate,
  formatLongDate,
  formatMonthLabel,
  getKeyboardTarget,
  isOutsideBounds,
  parseDateText,
  partsToDate,
} from "./date-utils";

describe("buildWeeks", () => {
  it("commence le lundi : octobre 2026 commence un jeudi", () => {
    const weeks = buildWeeks(2026, 9);
    // Lu 28/09, Ma 29/09, Me 30/09, puis le jeudi 1er octobre
    expect(weeks[0].map((d) => d.getDate())).toEqual([28, 29, 30, 1, 2, 3, 4]);
    expect(weeks[0][3].getMonth()).toBe(9);
  });

  it("produit toujours six semaines, quel que soit le mois", () => {
    for (let year = 2026; year <= 2032; year++) {
      for (let month = 0; month < 12; month++) {
        expect(buildWeeks(year, month)).toHaveLength(6);
      }
    }
    // Février 2027 commence un lundi et tient sur quatre semaines : mois le plus court
    const february = buildWeeks(2027, 1);
    expect(february[0][0].getDate()).toBe(1);
    expect(february[5][6].getMonth()).toBe(2);
  });

  it("complète la dernière semaine jusqu'au dimanche", () => {
    const weeks = buildWeeks(2026, 9);
    const last = weeks[weeks.length - 1];
    expect(last[6].getDay()).toBe(0);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
});

describe("formatage", () => {
  it("formate JJ/MM/AAAA et HH:mm", () => {
    const date = new Date(2026, 9, 19, 8, 5);
    expect(formatDate(date)).toBe("19/10/2026");
    expect(formatDate(date, true)).toBe("19/10/2026 08:05");
  });

  it("écrit la date en toutes lettres et le mois avec une majuscule", () => {
    expect(formatLongDate(new Date(2026, 9, 19))).toBe("lundi 19 octobre 2026");
    expect(formatMonthLabel(2026, 1)).toBe("Février 2026");
  });
});

describe("calculs", () => {
  it("borne addMonths au dernier jour du mois", () => {
    expect(formatDate(addMonths(new Date(2026, 0, 31), 1))).toBe("28/02/2026");
  });

  it("compte les jours bornes incluses", () => {
    expect(countDays(new Date(2026, 9, 1), new Date(2026, 9, 1))).toBe(1);
    expect(countDays(new Date(2026, 9, 1), new Date(2026, 9, 19, 23, 59))).toBe(19);
    // Passage à l'heure d'hiver (25/10/2026) sans décalage
    expect(countDays(new Date(2026, 9, 20), new Date(2026, 9, 31))).toBe(12);
  });

  it("fixe la fin de journée à 23:59:59.999", () => {
    const end = endOfDay(new Date(2026, 9, 19, 8));
    expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([23, 59, 59, 999]);
  });

  it("compare les bornes au jour près", () => {
    const min = new Date(2026, 9, 10, 18);
    expect(isOutsideBounds(new Date(2026, 9, 10, 8), min)).toBe(false);
    expect(isOutsideBounds(new Date(2026, 9, 9), min)).toBe(true);
  });
});

describe("getKeyboardTarget", () => {
  const monday19 = new Date(2026, 9, 19);

  it("déplace d'un jour, d'une semaine et d'un mois", () => {
    expect(formatDate(getKeyboardTarget(monday19, "ArrowLeft")!)).toBe("18/10/2026");
    expect(formatDate(getKeyboardTarget(monday19, "ArrowDown")!)).toBe("26/10/2026");
    expect(formatDate(getKeyboardTarget(monday19, "PageUp")!)).toBe("19/09/2026");
  });

  it("va au lundi et au dimanche de la semaine", () => {
    const thursday = new Date(2026, 9, 22);
    expect(formatDate(getKeyboardTarget(thursday, "Home")!)).toBe("19/10/2026");
    expect(formatDate(getKeyboardTarget(thursday, "End")!)).toBe("25/10/2026");
  });

  it("ignore les autres touches", () => {
    expect(getKeyboardTarget(monday19, "a")).toBeNull();
  });
});

describe("saisie d'une date en cases", () => {
  it("découpe une date en JJ / MM / AAAA (+ HH:mm)", () => {
    expect(dateToParts(new Date(2026, 5, 3))).toEqual(["03", "06", "2026"]);
    expect(dateToParts(new Date(2026, 5, 3, 9, 5), true)).toEqual(["03", "06", "2026", "09", "05"]);
    expect(dateToParts(null)).toEqual(["", "", ""]);
    expect(dateToParts(null, true)).toEqual(["", "", "", "", ""]);
  });

  it("reconstruit une date réelle", () => {
    expect(partsToDate(["3", "6", "2026"])).toEqual(new Date(2026, 5, 3));
    expect(partsToDate(["29", "02", "2028"])).toEqual(new Date(2028, 1, 29));
    expect(partsToDate(["03", "06", "2026", "14", "30"], true)).toEqual(new Date(2026, 5, 3, 14, 30));
  });

  it("refuse une date qui n'existe pas ou incomplète", () => {
    expect(partsToDate(["31", "02", "2026"])).toBeNull();
    expect(partsToDate(["29", "02", "2026"])).toBeNull();
    expect(partsToDate(["12", "13", "2026"])).toBeNull();
    expect(partsToDate(["12", "06", "26"])).toBeNull();
    expect(partsToDate(["", "06", "2026"])).toBeNull();
    expect(partsToDate(["12", "06", "2026", "24", "00"], true)).toBeNull();
    expect(partsToDate(["12", "06", "2026", "", ""], true)).toBeNull();
  });

  it("lit un texte collé", () => {
    expect(parseDateText("12/06/2026")).toEqual(["12", "06", "2026"]);
    expect(parseDateText(" 3.6.2026 ")).toEqual(["03", "06", "2026"]);
    expect(parseDateText("12/06/2026 14:30", true)).toEqual(["12", "06", "2026", "14", "30"]);
    expect(parseDateText("12/06/2026", true)).toEqual(["12", "06", "2026", "", ""]);
    expect(parseDateText("demain")).toBeNull();
  });
});
