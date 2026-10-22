import { describe, expect, it } from "vitest";
import { contrastRatio, pickTextColor, normalizeLineColor, INK, WHITE } from "./line-badge-utils";

describe("contrastRatio", () => {
  it("noir vs blanc ≈ 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });
  it("même couleur = 1:1", () => {
    expect(contrastRatio("#1b6cff", "#1b6cff")).toBeCloseTo(1, 5);
  });
  it("accepte le format court #abc", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 0);
  });
});

describe("pickTextColor", () => {
  it("fond jaune vif → texte encre (AA)", () => {
    const r = pickTextColor("#FFCD00");
    expect(r.color).toBe(INK);
    expect(r.ok).toBe(true);
    expect(r.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("fond encre foncé → texte blanc (AA)", () => {
    const r = pickTextColor("#002830");
    expect(r.color).toBe(WHITE);
    expect(r.ok).toBe(true);
  });

  it("gris moyen : repli noir pour garantir AA", () => {
    const r = pickTextColor("#808080");
    expect(r.color).toBe("#000000");
    expect(r.ok).toBe(true);
    expect(r.ratio).toBeGreaterThanOrEqual(4.5);
  });
});

it("normalise les couleurs GTFS sans dièse et rejette les couleurs invalides", () => {
  expect(normalizeLineColor(" FFCD00 ")).toBe("#FFCD00");
  expect(normalizeLineColor("#abc")).toBe("#abc");
  expect(normalizeLineColor("invalid")).toBeNull();
});
