import { describe, expect, it } from "vitest";
import { formatRelative, freshnessLevel, freshnessTone, toDate } from "./data-freshness-utils";

describe("data-freshness-utils", () => {
  it("toDate : Date, ISO, timestamp ; null si invalide", () => {
    expect(toDate("2026-06-12T08:15:00Z")?.getUTCFullYear()).toBe(2026);
    expect(toDate(0)?.getTime()).toBe(0);
    expect(toDate("pas une date")).toBeNull();
  });

  it("freshnessLevel : frais / vieillissant / périmé selon les seuils", () => {
    expect(freshnessLevel(60, 300, 3600)).toBe("fresh");
    expect(freshnessLevel(1200, 300, 3600)).toBe("stale");
    expect(freshnessLevel(7200, 300, 3600)).toBe("old");
    // Bornes : strictement inférieur.
    expect(freshnessLevel(300, 300, 3600)).toBe("stale");
  });

  it("freshnessTone : ton de statut par niveau", () => {
    expect(freshnessTone("fresh")).toBe("nominal");
    expect(freshnessTone("stale")).toBe("warning");
    expect(freshnessTone("old")).toBe("critical");
  });

  it("formatRelative : libellés compacts", () => {
    expect(formatRelative(5)).toBe("à l'instant");
    expect(formatRelative(70)).toBe("il y a 1 min");
    expect(formatRelative(180)).toBe("il y a 3 min");
    expect(formatRelative(3 * 3600)).toBe("il y a 3 h");
    expect(formatRelative(2 * 86400)).toBe("il y a 2 j");
  });

  it("formatRelative : null au-delà de 7 jours ou dans le futur", () => {
    expect(formatRelative(10 * 86400)).toBeNull();
    expect(formatRelative(-30)).toBeNull();
  });
});
