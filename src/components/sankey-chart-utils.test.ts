import { describe, expect, it } from "vitest";
import { layoutSankey, ribbonPath } from "./sankey-chart-utils";

const nodes = [
  { id: "cha", label: "Châtelet" },
  { id: "gdl", label: "Gare de Lyon" },
  { id: "def", label: "La Défense" },
  { id: "nat", label: "Nation" },
];
const links = [
  { source: "cha", target: "def", value: 88 },
  { source: "cha", target: "nat", value: 31 },
  { source: "gdl", target: "def", value: 46 },
  { source: "gdl", target: "nat", value: 22 },
];

describe("SankeyChart", () => {
  it("colonnes déduites des liens, valeur d'un nœud = max(arrivées, départs)", () => {
    const { nodes: laid, columns } = layoutSankey(nodes, links, 600, 300);
    expect(columns).toBe(2);
    const byId = Object.fromEntries(laid.map((n) => [n.id, n]));
    expect(byId.cha.column).toBe(0);
    expect(byId.def.column).toBe(1);
    expect(byId.cha.value).toBe(119);
    expect(byId.def.value).toBe(134);
    expect(byId.def.x0).toBe(588);
  });

  it("hauteurs proportionnelles, colonne la plus chargée sur toute la hauteur", () => {
    const { nodes: laid } = layoutSankey(nodes, links, 600, 300, { nodeGap: 10 });
    const col1 = laid.filter((n) => n.column === 1);
    // 300 px − un espace de 10 px, répartis sur 187 de volume
    expect(col1[col1.length - 1].y1).toBeCloseTo(300);
    const cha = laid.find((n) => n.id === "cha")!;
    expect(cha.y1 - cha.y0).toBeCloseTo((119 * 290) / 187);
  });

  it("rubans : épaisseur du volume, empilés dans leur nœud, couleur de la source", () => {
    const { links: laid, nodes: n } = layoutSankey(nodes, links, 600, 300);
    const cha = n.find((x) => x.id === "cha")!;
    const first = laid[0];
    expect(first).toMatchObject({ source: "cha", target: "def" });
    expect(first.y0 - first.width / 2).toBeCloseTo(cha.y0);
    expect(laid.map((l) => `${l.source}>${l.target}`)).toEqual(["cha>def", "cha>nat", "gdl>def", "gdl>nat"]);
    expect(laid.filter((l) => l.source === "gdl").every((l) => l.group === 1)).toBe(true);
  });

  it("colonnes imposées, liens invalides ou rétrogrades écartés", () => {
    const withColumns = nodes.map((x) => ({ ...x, column: x.id === "cha" || x.id === "gdl" ? 0 : 1 }));
    const result = layoutSankey(withColumns, [...links, { source: "def", target: "cha", value: 5 }, { source: "x", target: "cha", value: 3 }, { source: "cha", target: "nat", value: 0 }], 600, 300);
    expect(result.links).toHaveLength(4);
    expect(result.ignored).toBe(1);
    // Cycle sans colonnes imposées : borné, pas de boucle infinie
    expect(layoutSankey(nodes, [{ source: "cha", target: "def", value: 1 }, { source: "def", target: "cha", value: 1 }], 100, 100).links.length).toBeLessThanOrEqual(1);
  });

  it("chemin du ruban", () => {
    expect(ribbonPath(0, 10, 100, 50, 4)).toBe("M0,8C50,8 50,48 100,48L100,52C50,52 50,12 0,12Z");
  });
});
