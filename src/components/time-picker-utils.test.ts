import { describe, expect, it } from "vitest";
import { formatTime, parseTime, timeBounds } from "./time-picker-utils";

describe("heure seule et heure de service", () => {
  it.each([["0:0", 0], ["9:5", 545], ["23:59", 1439], [" 08:30 ", 510]])("normalise %s sans Date JS", (value, minutes) => {
    expect(parseTime(value)).toBe(minutes);
    expect(parseTime(formatTime(minutes))).toBe(minutes);
  });
  it.each(["", "-1:00", "12:60", "24:00", "9h30", "12:30:00", "12:2x", "123:00"])("rejette %s en mode civil", (value) => {
    expect(parseTime(value)).toBeNull();
  });
  it("conserve les heures après minuit seulement sur demande", () => {
    expect(parseTime("25:30", true)).toBe(1530);
    expect(formatTime(1530)).toBe("25:30");
    expect(parseTime("47:59", true)).toBe(2879);
    expect(parseTime("48:00", true)).toBeNull();
  });
  it("borne la saisie et ignore une configuration vide ou inversée", () => {
    expect(timeBounds(false, "08:00", "18:00")).toEqual({ min: 480, max: 1080 });
    expect(timeBounds(true, "23:00", "26:00")).toEqual({ min: 1380, max: 1560 });
    expect(timeBounds(false, "erreur", "18:00")).toEqual({ min: 0, max: 1080 });
    expect(timeBounds(false, "18:00", "08:00")).toEqual({ min: 0, max: 1439 });
  });
});
