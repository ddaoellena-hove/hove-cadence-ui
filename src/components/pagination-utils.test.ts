import { describe, expect, it } from "vitest";
import { clampPage, formatRange, getPageCount, getPageItems } from "./pagination-utils";

// Intl fr-FR sépare les milliers par une espace fine insécable (U+202F)
const NNBSP = " ";

describe("getPageCount", () => {
  it("arrondit au supérieur", () => {
    expect(getPageCount(12430, 50)).toBe(249);
    expect(getPageCount(100, 50)).toBe(2);
  });

  it("renvoie au moins 1 page, même sans résultat", () => {
    expect(getPageCount(0, 50)).toBe(1);
  });
});

describe("clampPage", () => {
  it("ramène la page dans les bornes", () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(12, 10)).toBe(10);
    expect(clampPage(4, 10)).toBe(4);
  });
});

describe("getPageItems", () => {
  it("affiche toutes les pages jusqu'à 7", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("met des ellipses des deux côtés au milieu", () => {
    expect(getPageItems(5, 249)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 249]);
  });

  it("n'a qu'une ellipse de fin au début", () => {
    expect(getPageItems(1, 249)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 249]);
    expect(getPageItems(4, 249)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 249]);
  });

  it("n'a qu'une ellipse de début à la fin", () => {
    expect(getPageItems(249, 249)).toEqual([1, "ellipsis-start", 245, 246, 247, 248, 249]);
    expect(getPageItems(246, 249)).toEqual([1, "ellipsis-start", 245, 246, 247, 248, 249]);
  });

  it("garde une longueur fixe de 7 au-delà de 7 pages", () => {
    for (let page = 1; page <= 20; page++) {
      expect(getPageItems(page, 20)).toHaveLength(7);
    }
  });
});

describe("formatRange", () => {
  it("formate « 1–50 sur 12 430 »", () => {
    expect(formatRange(1, 50, 12430)).toBe(`1–50 sur 12${NNBSP}430`);
  });

  it("borne la fin de la dernière page", () => {
    expect(formatRange(249, 50, 12430)).toBe(`12${NNBSP}401–12${NNBSP}430 sur 12${NNBSP}430`);
  });

  it("gère l'absence de résultat", () => {
    expect(formatRange(1, 50, 0)).toBe("0 résultat");
  });
});
