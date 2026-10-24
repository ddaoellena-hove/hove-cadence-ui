import { describe, expect, it } from "vitest";
import { csvField, csvFileName, csvNumber, toCsv } from "./chart-export";

describe("Export CSV des graphiques", () => {
  it("nombres fr-FR lisibles par un tableur", () => {
    expect(csvNumber("1 240,5")).toBe("1240,5");
    expect(csvNumber("−3,2")).toBe("-3,2");
    expect(csvNumber("42,5 %")).toBe("42,5%");
  });

  it("champs échappés, séparateur « ; », BOM et CRLF", () => {
    expect(csvField("Châtelet ; Nation")).toBe('"Châtelet ; Nation"');
    expect(csvField('Ligne "A"')).toBe('"Ligne ""A"""');
    expect(toCsv({ columns: ["Ligne", "Retard (min)"], rows: [["13", "1 240"], ["RER A", "3,5"]], numeric: [1] })).toBe(
      "﻿Ligne;Retard (min)\r\n13;1240\r\nRER A;3,5",
    );
  });

  it("nom de fichier sans accents ni espaces", () => {
    expect(csvFileName("Retard moyen par heure")).toBe("retard-moyen-par-heure.csv");
    expect(csvFileName("Ponctualité — Ligne 13 (%)")).toBe("ponctualite-ligne-13.csv");
    expect(csvFileName("—")).toBe("donnees.csv");
  });
});
