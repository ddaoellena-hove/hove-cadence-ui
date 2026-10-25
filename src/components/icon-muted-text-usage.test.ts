import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// `--cadence-color-icon-muted` (#69797d) est réservé aux icônes, chevrons et
// poignées : 3:1 suffit pour un composant graphique (WCAG 1.4.11). Il ne fait
// que 4,53:1 sur blanc et passe sous 4,5:1 sur tout fond teinté : jamais en
// couleur de texte (`color` ou `fill` d'un libellé SVG). Le texte secondaire
// passe par `--cadence-color-text-secondary` (audit docs/audits/0.8.5/contraste-aa.md).

const dir = import.meta.dirname;

/** Sélecteurs d'icônes : seuls autorisés à prendre icon-muted en `color` / `fill`. */
const ICON_SELECTOR = /(icon|chevron|handle|dismiss|twisty|move|glyph|drag|\bsvg\b)/;

const USES_ICON_MUTED = /(^|[\s;{])(color|fill)\s*:\s*var\(--cadence-color-icon-muted\b/;

/** Règles les plus internes `sélecteur { déclarations }` (les blocs @media sont traversés). */
const rulesOf = (css: string) =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));

const cssFiles = readdirSync(dir).filter((f) => f.endsWith(".css") && f !== "tokens.css");

describe("icon-muted réservé aux icônes", () => {
  it("analyse les CSS des composants", () => {
    expect(cssFiles.length).toBeGreaterThan(30);
  });

  it("n'est jamais une couleur de texte", () => {
    const offenders: string[] = [];
    for (const file of cssFiles) {
      for (const { selector, body } of rulesOf(readFileSync(join(dir, file), "utf8"))) {
        if (!USES_ICON_MUTED.test(body)) continue;
        const selectors = selector.split(",").map((s) => s.trim());
        const textual = selectors.filter((s) => !ICON_SELECTOR.test(s));
        if (textual.length) offenders.push(`${file} — ${textual.join(", ")} → --cadence-color-text-secondary`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("détecte bien un texte en icon-muted (contrôle du garde-fou)", () => {
    const rules = rulesOf(".x__label {\n  color: var(--cadence-color-icon-muted, #69797d);\n}\n.x__icon { color: var(--cadence-color-icon-muted); }");
    const flagged = rules.filter(({ selector, body }) => USES_ICON_MUTED.test(body) && !ICON_SELECTOR.test(selector));
    expect(flagged.map((r) => r.selector)).toEqual([".x__label"]);
  });
});
