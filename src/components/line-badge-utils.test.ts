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

describe("pickTextColor : AA garanti", () => {
  // Blanc atteint 4,5:1 jusqu'à une luminance de 0,183, le noir dès 0,175 :
  // une des trois couleurs (blanc, encre, noir) suffit toujours.
  it("pour toute la rampe de gris et 5 000 couleurs pseudo-aléatoires", () => {
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    const samples: string[] = [];
    for (let g = 0; g < 256; g++) samples.push(`#${hex(g)}${hex(g)}${hex(g)}`);
    let seed = 42;
    const next = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) % 256;
    for (let i = 0; i < 5000; i++) samples.push(`#${hex(next())}${hex(next())}${hex(next())}`);
    const failing = samples.filter((c) => !pickTextColor(c).ok);
    expect(failing).toEqual([]);
  });
});
