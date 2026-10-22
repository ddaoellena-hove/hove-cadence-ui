import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { stripTokens } from "./css-test-utils";

// Harmonisation : dans les CSS des composants, couleurs et rayons passent par
// les tokens (tokens.css), une valeur en dur n'étant admise qu'en repli d'un
// var(--token, repli). Exceptions assumées : les ombres décoratives
// (box-shadow, filter : reliefs propres à un composant) et les micro-rayons
// de 5px ou moins.

const dir = import.meta.dirname;
const styles = readdirSync(dir).filter((f) => f.endsWith(".css") && f !== "tokens.css");

/** Déclarations `propriété: valeur` d'une feuille, hors commentaires et tokens. */
const declarations = (file: string) =>
  [...stripTokens(readFileSync(join(dir, file), "utf8")).matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)].map((m) => ({
    property: m[1],
    value: m[2],
  }));

const COLOR_PROPERTIES = /^(color|background|background-color|border(-[a-z]+)*|outline(-color)?|fill|stroke|scrollbar-color|text-decoration-color|caret-color|accent-color)$/;
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/;

describe("CSS des composants : tokens uniquement", () => {
  it("le contrôle ignore les replis et repère une couleur en dur", () => {
    expect(COLOR_LITERAL.test(stripTokens("a { color: var(--x, #fff); }"))).toBe(false);
    expect(COLOR_LITERAL.test(stripTokens("a { background: rgba(0, 0, 0, 0.5); }"))).toBe(true);
  });

  it("aucune couleur en dur dans une propriété de couleur", () => {
    const offenders = styles.flatMap((file) =>
      declarations(file)
        .filter((d) => COLOR_PROPERTIES.test(d.property) && COLOR_LITERAL.test(d.value))
        .map((d) => `${file} : ${d.property}: ${d.value.trim()}`),
    );
    expect(offenders).toEqual([]);
  });

  it("aucun rayon en dur au-delà de 5px : --cadence-radius-*", () => {
    const offenders = styles.flatMap((file) =>
      declarations(file)
        .filter((d) => d.property === "border-radius")
        .filter((d) => [...d.value.matchAll(/(\d+)px/g)].some((m) => Number(m[1]) > 5))
        .map((d) => `${file} : border-radius: ${d.value.trim()}`),
    );
    expect(offenders).toEqual([]);
  });
});
