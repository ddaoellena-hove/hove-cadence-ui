import { describe, expect, it } from "vitest";
import { describeSlot, endsNextDay, slotsOverlap, validatePeriod, validateSlot, type Slot } from "./schedule-rules";

const slot = (over: Partial<Slot>): Slot => ({ id: "s", days: [1], from: "08:00", to: "10:00", ...over });

describe("validatePeriod", () => {
  it("refuse une période incomplète, inversée ou de durée nulle", () => {
    const start = new Date(2026, 9, 12, 8);
    expect(validatePeriod({ id: "p", start, end: null })).toMatch(/Renseignez/);
    expect(validatePeriod({ id: "p", start, end: new Date(2026, 9, 11) })).toMatch(/suivre/);
    expect(validatePeriod({ id: "p", start, end: start })).toMatch(/suivre/);
    expect(validatePeriod({ id: "p", start, end: new Date(2026, 9, 13) })).toBeUndefined();
  });
});

describe("validateSlot", () => {
  it("exige un jour et des heures distinctes", () => {
    expect(validateSlot(slot({ days: [] }))).toMatch(/jour/);
    expect(validateSlot(slot({ to: "" }))).toMatch(/heures/);
    expect(validateSlot(slot({ from: "08:00", to: "08:00" }))).toMatch(/différer/);
    expect(validateSlot(slot({}))).toBeUndefined();
  });
});

describe("nuit", () => {
  it("une fin antérieure au début désigne le lendemain", () => {
    expect(endsNextDay(slot({ from: "22:00", to: "02:00" }))).toBe(true);
    expect(endsNextDay(slot({}))).toBe(false);
    expect(describeSlot(slot({ days: [5, 1], from: "22:00", to: "02:00" }))).toBe("Lundi, Vendredi : 22:00 → 02:00 (lendemain)");
  });
});

describe("slotsOverlap", () => {
  it("compare les jours et les heures", () => {
    expect(slotsOverlap(slot({}), slot({ from: "09:00", to: "11:00" }))).toBe(true);
    expect(slotsOverlap(slot({}), slot({ from: "10:00", to: "11:00" }))).toBe(false);
    expect(slotsOverlap(slot({}), slot({ days: [2] }))).toBe(false);
  });

  it("voit une nuit qui déborde sur le lendemain, même du dimanche au lundi", () => {
    expect(slotsOverlap(slot({ days: [1], from: "23:00", to: "02:00" }), slot({ days: [2], from: "01:00", to: "03:00" }))).toBe(true);
    expect(slotsOverlap(slot({ days: [7], from: "23:00", to: "02:00" }), slot({ days: [1], from: "01:00", to: "03:00" }))).toBe(true);
  });
});
