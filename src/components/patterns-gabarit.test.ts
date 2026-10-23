import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Chaque gabarit src/patterns/<Nom>.tsx est la source de vérité : il est
// affiché à l'identique dans GUIDELINES (copie verbatim contrôlée ici) et dans
// sa page MDX (via un import `?raw`, donc identique par construction).
const ROOT = join(__dirname, "..", "..");
const PATTERNS_DIR = join(ROOT, "src", "patterns");
const MDX_DIR = join(ROOT, "src", "stories", "patterns");
const guidelines = readFileSync(join(ROOT, "GUIDELINES.md"), "utf8");

const gabarits = existsSync(PATTERNS_DIR)
  ? readdirSync(PATTERNS_DIR).filter((f) => f.endsWith(".tsx"))
  : [];

const mdxSources = existsSync(MDX_DIR)
  ? readdirSync(MDX_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => readFileSync(join(MDX_DIR, f), "utf8"))
  : [];

describe("Gabarits de page patterns", () => {
  it("il existe au moins un gabarit", () => {
    expect(gabarits.length).toBeGreaterThan(0);
  });

  it.each(gabarits)("%s est affiché à l'identique dans GUIDELINES", (file) => {
    const code = readFileSync(join(PATTERNS_DIR, file), "utf8").trimEnd();
    expect(guidelines).toContain(code);
  });

  it.each(gabarits)("%s est affiché via un import ?raw dans un MDX de pattern", (file) => {
    const imported = mdxSources.some((src) => src.includes(`${file}?raw`));
    expect(imported).toBe(true);
  });
});
