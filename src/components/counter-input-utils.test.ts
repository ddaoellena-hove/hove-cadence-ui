import { describe, expect, it } from "vitest";
import { canDecrementCounter, canIncrementCounter, normalizeCounterValue } from "./counter-input-utils";

describe("normalizeCounterValue : arrondi au pas, puis bornage", () => {
  it("ne dépasse jamais max, même si max n'est pas un multiple du pas", () => {
    // Avant : borné puis arrondi → 60 > 58
    expect(normalizeCounterValue(60, { max: 58, step: 5 })).toBe(58);
    expect(normalizeCounterValue(57, { max: 58, step: 5 })).toBe(55);
  });

  it("va jusqu'à min au lieu de rester bloqué", () => {
    // value 5, pas 15, min 0 : « − » donne 0
    expect(normalizeCounterValue(5 - 15, { min: 0, step: 15 })).toBe(0);
  });

  it("borne une saisie clavier hors bornes", () => {
    expect(normalizeCounterValue(250, { min: 0, max: 120, step: 5 })).toBe(120);
    expect(normalizeCounterValue(-40, { min: 0, max: 120, step: 5 })).toBe(0);
    expect(normalizeCounterValue(33, { min: 0, max: 120, step: 5 })).toBe(35);
  });

  it("gère un pas décimal sans erreur d'arrondi", () => {
    expect(normalizeCounterValue(1.3, { step: 0.5 })).toBe(1.5);
    expect(normalizeCounterValue(0.5 + 0.5 + 0.5, { min: 0, max: 2, step: 0.5 })).toBe(1.5);
    expect(normalizeCounterValue(0.1 + 0.2, { step: 0.1 })).toBe(0.3);
    expect(normalizeCounterValue(2.4, { max: 2.2, step: 0.5 })).toBe(2.2);
  });
});

describe("boutons − et + : désactivés seulement sur la borne", () => {
  it("« − » reste actif tant que la valeur est au-dessus de min", () => {
    expect(canDecrementCounter(5, 0)).toBe(true); // pas 15 : ira jusqu'à 0
    expect(canDecrementCounter(0, 0)).toBe(false);
    expect(canDecrementCounter(-3)).toBe(true);
  });

  it("« + » reste actif tant que la valeur est sous max", () => {
    expect(canIncrementCounter(55, 58)).toBe(true); // pas 5 : ira jusqu'à 58
    expect(canIncrementCounter(58, 58)).toBe(false);
    expect(canIncrementCounter(1000)).toBe(true);
  });
});
