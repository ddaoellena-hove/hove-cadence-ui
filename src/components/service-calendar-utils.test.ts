import { describe, expect, it } from "vitest";
import { parseServiceDate, serviceDateKey, runsOnServiceDate, validServicePeriod, type ServiceCalendarValue } from "./service-calendar-utils";
const value: ServiceCalendarValue = { startDate: "2026-11-01", endDate: "2026-11-30", weekdays: [1, 2, 3, 4, 5], exceptions: [
  { date: "2026-11-11", type: "removed" }, { date: "2026-11-15", type: "added" },
] };
describe("Calendrier de service", () => {
  it("valide les dates réelles et les années bissextiles", () => {
    expect(parseServiceDate("2026-02-29")).toBeNull();
    expect(parseServiceDate("2028-02-29")).not.toBeNull();
    expect(parseServiceDate("2026-13-01")).toBeNull();
  });
  it("conserve la date civile à l’aller-retour", () => {
    for (const key of ["2026-03-29", "2026-10-25", "2028-02-29"]) expect(serviceDateKey(parseServiceDate(key)!)).toBe(key);
  });
  it("applique le rythme de semaine et les exceptions prioritaires", () => {
    expect(runsOnServiceDate(value, "2026-11-09")).toBe(true);
    expect(runsOnServiceDate(value, "2026-11-08")).toBe(false);
    expect(runsOnServiceDate(value, "2026-11-11")).toBe(false);
    expect(runsOnServiceDate(value, "2026-11-15")).toBe(true);
  });
  it("respecte les bornes inclusives même avec une exception hors période", () => {
    expect(runsOnServiceDate(value, "2026-11-30")).toBe(true);
    expect(runsOnServiceDate({ ...value, exceptions: [{ date: "2026-12-01", type: "added" }] }, "2026-12-01")).toBe(false);
  });
  it("accepte un service uniquement sur exceptions et rejette une période inversée", () => {
    expect(runsOnServiceDate({ ...value, weekdays: [] }, "2026-11-15")).toBe(true);
    expect(validServicePeriod({ ...value, endDate: "2026-10-31" })).toBe(false);
  });
});
