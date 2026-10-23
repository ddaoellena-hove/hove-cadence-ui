import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Garde-fou : tout token défini dans tokens.css doit être documenté dans le
// tableau « Design tokens » de GUIDELINES.md, pour que l'écart ne revienne pas
// (cf. --cadence-color-text-secondary / --cadence-color-skeleton oubliés).

const root = join(import.meta.dirname, "..", "..");
const css = readFileSync(join(import.meta.dirname, "tokens.css"), "utf8");
const guidelines = readFileSync(join(root, "GUIDELINES.md"), "utf8");

// Ensemble des tokens documentés, en développant les notations abrégées.
const documented = new Set<string>();
const wildcardPrefixes: string[] = [];

// Littéraux.
for (const m of guidelines.matchAll(/--cadence-[a-z0-9-]+/g)) documented.add(m[0]);
// Plages « -1..8 ».
for (const m of guidelines.matchAll(/(--cadence-[a-z0-9-]+-)(\d+)\.\.(\d+)/g)) {
  for (let i = Number(m[2]); i <= Number(m[3]); i += 1) documented.add(`${m[1]}${i}`);
}
// Abréviations « `base` / `-suffixe` » (ajout et remplacement du dernier segment).
for (const m of guidelines.matchAll(/`(--cadence-[a-z0-9-]+)`((?:\s*\/\s*`-[a-z0-9-]+`)+)/g)) {
  const base = m[1];
  for (const s of m[2].matchAll(/`(-[a-z0-9-]+)`/g)) {
    documented.add(base + s[1]);
    documented.add(base.slice(0, base.lastIndexOf("-")) + s[1]);
  }
}
// Familles « --cadence-x-* ».
for (const m of guidelines.matchAll(/(--cadence-[a-z0-9-]+)-\*/g)) wildcardPrefixes.push(`${m[1]}-`);

const isDocumented = (token: string): boolean =>
  documented.has(token) ||
  wildcardPrefixes.some((prefix) => token.startsWith(prefix)) ||
  // Variante documentée dont le parent complet est listé (ex. `-thumb-hover`).
  guidelines.includes(token.slice(0, token.lastIndexOf("-")));

const defined = [...new Set([...css.matchAll(/(--cadence-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))];

describe("Tokens : tokens.css ↔ tableau GUIDELINES", () => {
  it("documente chaque token défini dans tokens.css", () => {
    expect(defined.filter((token) => !isDocumented(token))).toEqual([]);
  });
});
