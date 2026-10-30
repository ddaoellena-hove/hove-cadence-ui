import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Couches du design system (docs/proposals/refactoring-v2.md) : Core ← DataViz
// ← Domain. Le socle n'importe ni le métier transport ni d3, pour qu'un produit
// d'un autre domaine n'embarque rien de tout cela. Seuls les imports exécutés
// comptent : un `import type` disparaît à la compilation.

const dir = import.meta.dirname;

const DOMAIN = new Set([
  "DataSourceStatus", "DatasetHealth", "DisruptionScopePicker", "JourneyTimeline", "LineBadge", "LineDiagram",
  "ModeFilter", "ModeIcon", "RouteStopList", "ServiceCalendar", "StopLabel", "TimeSpaceDiagram", "ValidationIssueInspector",
  "mode-icons",
]);

const DATAVIZ = new Set([
  "BarChart", "BoxPlot", "BulletChart", "CalendarHeatmap", "ChartSyncGroup", "ComboChart", "DonutChart", "Gauge",
  "Heatmap", "Histogram", "LineChart", "SankeyChart", "ScatterChart", "SmallMultiples", "Treemap",
  "bar-chart-utils", "box-plot-utils", "combo-chart-utils", "heatmap-utils", "histogram-utils", "line-chart-utils",
  "scatter-chart-utils", "treemap-utils",
]);

// Fuites connues : les retirer change l'API publique, donc en v2 (projet 15). Ne pas en ajouter.
const FUITES_CONNUES = ["ColorField → LineBadge", "ScopePicker → LineBadge", "TreeView → ModeIcon"];

const modules = readdirSync(dir)
  .filter((file) => /\.tsx?$/.test(file) && !/\.(stories|test)\.tsx?$|\.d\.ts$/.test(file))
  .map((file) => file.replace(/\.tsx?$/, ""))
  .filter((name) => name !== "index");

const source = (name: string) => {
  const file = readdirSync(dir).find((candidate) => candidate === `${name}.ts` || candidate === `${name}.tsx`)!;
  return readFileSync(join(dir, file), "utf8");
};

/** Modules importés à l'exécution, hors `import type`. */
const imports = (name: string) =>
  [...source(name).matchAll(/^(?:import|export)\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gms)].map((match) => match[1]);

const versDomain = (from: Set<string> | null) =>
  modules
    .filter((name) => !DOMAIN.has(name) && (from ? from.has(name) : !DATAVIZ.has(name)))
    .flatMap((name) => imports(name).filter((path) => DOMAIN.has(path.slice(2))).map((path) => `${name} → ${path.slice(2)}`));

describe("Couches : sens des dépendances", () => {
  it("les listes de couches ne citent que des modules existants", () => {
    expect([...DOMAIN, ...DATAVIZ].filter((name) => !modules.includes(name))).toEqual([]);
  });

  it("Core n'importe pas le métier transport, hors fuites connues", () => {
    expect(versDomain(null).sort()).toEqual(FUITES_CONNUES);
  });

  it("DataViz n'importe pas le métier transport", () => {
    expect(versDomain(DATAVIZ)).toEqual([]);
  });

  it("Core n'importe pas d3", () => {
    const offenders = modules.filter((name) => !DATAVIZ.has(name) && !DOMAIN.has(name) && imports(name).some((path) => path.startsWith("d3-")));
    expect(offenders).toEqual([]);
  });
});
