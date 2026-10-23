import { describe, expect, it } from "vitest";
import { toNumber, formatValue, buildTicks, tonePattern, isDateValue } from "./timeline-utils";

describe("timeline-utils", () => {
  it("toNumber : Date → ms, heure de service → minutes (overnight)", () => {
    const d = new Date("2026-10-22T08:00:00Z");
    expect(toNumber(d, false)).toBe(d.getTime());
    expect(toNumber("08:30", false)).toBe(510);
    expect(toNumber("25:30", true)).toBe(1530);
  });

  it("isDateValue distingue Date et chaîne", () => {
    expect(isDateValue(new Date())).toBe(true);
    expect(isDateValue("08:00")).toBe(false);
  });

  it("formatValue : heure de service en HH:mm", () => {
    expect(formatValue(1530, "time")).toBe("25:30");
    expect(formatValue(510, "time")).toBe("08:30");
  });

  it("buildTicks répartit count graduations", () => {
    const ticks = buildTicks(0, 100, 6);
    expect(ticks).toHaveLength(6);
    expect(ticks[0].value).toBe(0);
    expect(ticks[5].value).toBe(100);
  });

  it("tonePattern : solid pour active, un motif distinct sinon", () => {
    expect(tonePattern("active")).toBe("solid");
    expect(tonePattern("critical")).not.toBe("solid");
    expect(tonePattern(undefined)).toBe("solid");
  });
});
