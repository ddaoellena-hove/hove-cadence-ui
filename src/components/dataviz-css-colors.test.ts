import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Couleurs des CSS de data viz : uniquement via tokens. Une valeur hex n'est
// admise que comme repli d'un token, à l'intérieur de var(--token, #repli)
// (règle de CLAUDE.md) ; jamais seule.

const FILES = ["line-chart.css", "heatmap.css", "bar-list.css", "chart-frame.css", "chart-tooltip.css"];
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/** Retire les commentaires puis chaque var(...) entier, parenthèses imbriquées comprises. */
const stripTokens = (css: string) => {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("var(", i)) {
      let depth = 0;
      for (; i < text.length; i++) {
        if (text[i] === "(") depth++;
        else if (text[i] === ")" && --depth === 0) break;
      }
      out += "var()";
    } else {
      out += text[i];
    }
  }
  return out;
};

describe("CSS de data viz : couleurs uniquement par tokens", () => {
  it("le contrôle détecte un hex hors var() et ignore les replis", () => {
    expect(stripTokens("a { color: var(--x, #fff); }").match(HEX)).toBeNull();
    expect(stripTokens("a { box-shadow: var(--ring, 0 0 0 2px #fff, 0 0 0 4px #1a3e45); }").match(HEX)).toBeNull();
    expect(stripTokens("a { color: #b91c1c; }").match(HEX)).toEqual(["#b91c1c"]);
    expect(stripTokens("/* #abcdef */ a { color: red; }").match(HEX)).toBeNull();
  });

  it.each(FILES)("%s : aucun hex hors d'un repli var()", (file) => {
    const css = readFileSync(join(import.meta.dirname, file), "utf8");
    const offenders = stripTokens(css)
      .split("\n")
      .flatMap((line, i) => (line.match(HEX) ? [`${file}:${i + 1}  ${line.trim()}`] : []));
    expect(offenders).toEqual([]);
  });
});
