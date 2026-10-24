import { describe, expect, it } from "vitest";
import { describeTile, formatTileShare, layoutTreemap } from "./treemap-utils";

const network = {
  id: "reseau",
  label: "Réseau",
  children: [
    {
      id: "bus",
      label: "Bus",
      children: [
        { id: "b91", label: "Ligne 91", value: 640 },
        { id: "b38", label: "Ligne 38", value: 360 },
        { id: "b0", label: "Ligne fantôme", value: 0 },
      ],
    },
    {
      id: "metro",
      label: "Métro",
      children: [
        { id: "m13", label: "Ligne 13", value: 1840 },
        { id: "m4", label: "Ligne 4", value: 1160 },
      ],
    },
    { id: "tram", label: "Tramway", value: 500 },
  ],
};

describe("Treemap", () => {
  it("agrège les feuilles, ignore les valeurs nulles, trie par valeur", () => {
    const { tiles, groups, total } = layoutTreemap(network, 400, 300);
    expect(total).toBe(4500);
    // Ordre de lecture : branches par valeur décroissante, puis feuilles ; « Ligne fantôme » (0) ignorée
    expect(tiles.map((t) => t.id)).toEqual(["m13", "m4", "b91", "b38", "tram"]);
    expect(groups.map((g) => [g.id, g.value])).toEqual([
      ["metro", 3000],
      ["bus", 1000],
    ]);
    // Légende : toutes les branches, y compris une feuille directe (Tramway)
    expect(layoutTreemap(network, 400, 300).branches.map((b) => b.id)).toEqual(["metro", "bus", "tram"]);
  });

  it("aires proportionnelles aux valeurs, dans le rectangle", () => {
    const { tiles } = layoutTreemap(network, 400, 300, 0);
    const area = (t: (typeof tiles)[number]) => (t.x1 - t.x0) * (t.y1 - t.y0);
    const m13 = tiles.find((t) => t.id === "m13")!;
    const b38 = tiles.find((t) => t.id === "b38")!;
    // Rapport des aires ≈ rapport des valeurs (aux marges intérieures près)
    expect(area(m13) / area(b38)).toBeGreaterThan(4);
    expect(tiles.every((t) => t.x0 >= 0 && t.y0 >= 0 && t.x1 <= 400 && t.y1 <= 300)).toBe(true);
  });

  it("chemins, branches et phrases lues", () => {
    const { tiles, total } = layoutTreemap(network, 400, 300);
    const b91 = tiles.find((t) => t.id === "b91")!;
    expect(b91.path).toEqual(["Bus", "Ligne 91"]);
    expect(tiles.find((t) => t.id === "tram")!.path).toEqual(["Tramway"]);
    // Métro (plus grosse branche) en premier : index 0
    expect(tiles.find((t) => t.id === "m13")!.group).toBe(0);
    expect(b91.group).toBe(1);
    expect(formatTileShare(640, 4500)).toBe("14,2 %");
    expect(describeTile(b91, total, "km")).toBe("Bus › Ligne 91 : 640 km, 14,2 % du total");
  });
});
