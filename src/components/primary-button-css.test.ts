import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Garde-fou sur primary-button.css : les états de la variante outline doivent
// fixer leur propre fond. Sinon les règles :hover / :active du bouton plein
// (fond foncé) s'appliquent et le texte encre devient illisible.

const css = readFileSync(new URL("./primary-button.css", import.meta.url), "utf8");

/** Blocs « sélecteur { déclarations } » du fichier (sans commentaires). */
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
  selector: selector.trim(),
  body,
}));

describe("primary-button.css — variante outline", () => {
  const outlineStates = rules.filter((r) => /primary-button--outline[^,{]*:(hover|active)/.test(r.selector));

  it("définit le survol et l'appui de l'outline", () => {
    expect(outlineStates.length).toBeGreaterThanOrEqual(4);
  });

  it.each(outlineStates.map((r) => [r.selector, r.body]))("%s fixe background-color", (_selector, body) => {
    expect(body).toMatch(/background-color\s*:/);
  });

  it("garde un fond blanc sous le voile de survol", () => {
    const hover = outlineStates.find((r) => r.selector === ".primary-button--outline:hover:not(:disabled)");
    expect(hover?.body).toMatch(/background-color:\s*var\(--cadence-color-white/);
    expect(hover?.body).toMatch(/background-image:[\s\S]*--cadence-color-hover-overlay/);
  });

  it("fonce le survol du bouton plein avec --cadence-color-primary-hover", () => {
    const hover = rules.find((r) => r.selector === ".primary-button:hover:not(:disabled)");
    expect(hover?.body).toMatch(/background-color:\s*var\(--cadence-color-primary-hover/);
  });
});
