import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { stripTokens } from "./css-test-utils";

// Couleurs des CSS de data viz : uniquement via tokens. Une valeur hex n'est
// admise que comme repli d'un token, à l'intérieur de var(--token, #repli)
// (règle de CLAUDE.md) ; jamais seule.

const FILES = ["line-chart.css", "heatmap.css", "bar-list.css", "chart-frame.css", "chart-tooltip.css", "donut-chart.css", "meter.css", "bullet-chart.css", "histogram.css"];
const HEX = /#[0-9a-fA-F]{3,8}\b/g;


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
