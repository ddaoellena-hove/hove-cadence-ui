import { describe, expect, it } from "vitest";
import {
  toMinutes,
  modeOf,
  formatClock,
  formatDuration,
  formatDay,
  formatWindow,
  pickTickStep,
  clockTicks,
  roundWindow,
  scaleLabel,
  tonePattern,
  isDateValue,
} from "./timeline-utils";

const at = (iso: string) => new Date(iso).getTime() / 60000;

describe("timeline-utils", () => {
  it("toMinutes : Date → minutes depuis l'époque, heure de service → minutes (overnight)", () => {
    const d = new Date("2026-10-22T08:00:00Z");
    expect(toMinutes(d, false)).toBe(d.getTime() / 60000);
    expect(toMinutes("08:30", false)).toBe(510);
    expect(toMinutes("25:30", true)).toBe(1530);
  });

  it("isDateValue et modeOf", () => {
    expect(isDateValue(new Date())).toBe(true);
    expect(isDateValue("08:00")).toBe(false);
    expect(modeOf(["08:00", "09:00"])).toBe("time");
    expect(modeOf(["08:00", new Date()])).toBe("date");
  });

  it("formatClock : « 08h15 », après minuit en heures de service", () => {
    expect(formatClock(495, "time")).toBe("08h15");
    expect(formatClock(1530, "time")).toBe("25h30");
    expect(formatClock(at("2026-06-11T07:55:00"), "date")).toBe("07h55");
  });

  it("formatDuration : minutes puis heures", () => {
    expect(formatDuration(40)).toBe("40 min");
    expect(formatDuration(65)).toBe("1 h 05");
    expect(formatDuration(660)).toBe("11 h");
  });

  it("formatDay et formatWindow (fr-FR)", () => {
    const min = at("2026-06-11T07:55:00");
    const max = at("2026-06-11T08:35:00");
    expect(formatDay(min)).toBe("Jeu. 11/06/2026");
    expect(formatWindow(min, max, "date")).toBe("Jeu. 11/06/2026 07h55 → 08h35");
    expect(formatWindow(min, at("2026-06-12T01:00:00"), "date")).toBe("Jeu. 11/06/2026 07h55 → Ven. 12/06/2026 01h00");
    expect(formatWindow(475, 515, "time")).toBe("07h55 → 08h35");
  });

  it("pickTickStep : plus petit pas assez espacé", () => {
    expect(pickTickStep(12)).toBe(5); // 5 min × 12 px = 60 px
    expect(pickTickStep(1)).toBe(60);
    expect(pickTickStep(0.001)).toBe(1440);
  });

  it("clockTicks : alignées sur l'horloge, quarts d'heure majeurs pour un pas de 5 min", () => {
    const ticks = clockTicks(475, 515, 5, "time");
    expect(ticks.map((t) => formatClock(t.value, "time"))).toEqual([
      "07h55", "08h00", "08h05", "08h10", "08h15", "08h20", "08h25", "08h30", "08h35",
    ]);
    expect(ticks.filter((t) => t.major).map((t) => formatClock(t.value, "time"))).toEqual(["08h00", "08h15", "08h30"]);
  });

  it("clockTicks en mode date : heures locales rondes", () => {
    const ticks = clockTicks(at("2026-06-11T07:52:00"), at("2026-06-11T08:20:00"), 15, "date");
    expect(ticks.map((t) => formatClock(t.value, "date"))).toEqual(["08h00", "08h15"]);
    expect(ticks[0].major).toBe(true);
  });

  it("roundWindow et scaleLabel", () => {
    expect(roundWindow(476, 513)).toEqual([475, 515]);
    expect(roundWindow(480, 480)).toEqual([480, 485]);
    expect(scaleLabel(60)).toBe("1 h");
    expect(scaleLabel(15)).toBe("15 min");
  });

  it("tonePattern : solid pour active, un motif distinct sinon", () => {
    expect(tonePattern("active")).toBe("solid");
    expect(tonePattern("critical")).not.toBe("solid");
    expect(tonePattern(undefined)).toBe("solid");
  });
});
