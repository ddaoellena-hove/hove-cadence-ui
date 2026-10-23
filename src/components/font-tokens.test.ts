import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Harmonisation des polices : dans les CSS des composants, toute
// `font-family` passe par un token (`--cadence-font-sans`, `-display` ou
// `-mono`), ou hérite (`inherit`). Changer la police (ex. remplacer Inter) se
// fait alors au seul endroit : `tokens.css`. Les commentaires sont ignorés.

const dir = import.meta.dirname;
const styles = readdirSync(dir).filter((f) => f.endsWith(".css") && f !== "tokens.css");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Déclarations `font-family: valeur`, hors commentaires. */
const fontFamilies = (file: string) =>
  [...stripComments(readFileSync(join(dir, file), "utf8")).matchAll(/font-family\s*:\s*([^;{}]+);/g)].map((m) => m[1].trim());

describe("Polices des composants : token uniquement", () => {
  it("le token de police est défini une seule fois dans tokens.css", () => {
    const tokens = readFileSync(join(dir, "tokens.css"), "utf8");
    expect(tokens).toMatch(/--cadence-font-sans:/);
  });

  it("aucune police en dur : --cadence-font-* ou inherit", () => {
    const offenders = styles.flatMap((file) =>
      fontFamilies(file)
        .filter((value) => value !== "inherit" && !/var\(\s*--cadence-font-(sans|display|mono)/.test(value))
        .map((value) => `${file} : font-family: ${value}`),
    );
    expect(offenders).toEqual([]);
  });
});
