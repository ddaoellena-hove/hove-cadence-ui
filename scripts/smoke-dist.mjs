// Test de fumée hors Vite : assemble dist/ (ESM publié) avec esbuild en IIFE,
// comme le ferait une app webpack/Next, puis le monte dans Chromium
// (Playwright). Vérifie l'absence d'erreur, qu'un avertissement de dev
// s'affiche (garde isDevMode, Tab hors TabList), et que le contenu fermé
// (Accordion, Drawer) n'est pas focusable.
import { build } from "esbuild";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const entry = `
import { createElement as h, useState, version } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { LineBadge, RouteStopList, Accordion, Drawer, Tab } from "./dist/hove-cadence-ui.js";

const stops = [
  { id: "a", name: "Châtelet", arrival: "08:00", departure: "08:01" },
  { id: "b", name: "Nation", arrival: "08:12" },
];

let setDrawer;
const App = () => {
  const [open, setOpen] = useState(true);
  setDrawer = setOpen;
  return h("div", null,
    h(LineBadge, { code: "38", mode: "bus", color: "#005E73" }),
    h(Tab, { label: "Hors TabList" }),
    h(RouteStopList, { label: "Course 146243", stops }),
    h(Accordion, { items: [{ id: "x", title: "Arrêts concernés", content: h("button", { id: "in-accordion" }, "Dans l’accordéon") }] }),
    h(Drawer, { isOpen: open, onClose: () => setOpen(false), title: "Détail" }, h("button", { id: "in-drawer" }, "Dans le tiroir")),
  );
};

const root = createRoot(document.getElementById("root"));
flushSync(() => root.render(h(App)));
window.__smoke = { version, closeDrawer: () => flushSync(() => setDrawer(false)) };
`;

const { outputFiles } = await build({
  stdin: { contents: entry, resolveDir: root, loader: "js" },
  bundle: true,
  format: "iife",
  platform: "browser",
  write: false,
  define: { "process.env.NODE_ENV": '"development"' },
  logLevel: "silent",
});

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const warnings = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
  if (m.type() === "warning") warnings.push(m.text());
});
await page.setContent('<!doctype html><html lang="fr"><body><div id="root"></div></body></html>');
await page.addScriptTag({ content: outputFiles[0].text });
await page.waitForFunction(() => window.__smoke);

const result = await page.evaluate(async () => {
  const focusable = (id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    // Repart d'un focus neutre : un élément déjà focalisé le resterait.
    document.activeElement?.blur();
    el.focus();
    return document.activeElement === el;
  };
  const accordionClosed = !focusable("in-accordion");
  const drawerOpenFocusable = focusable("in-drawer");
  window.__smoke.closeDrawer();
  const drawerClosed = !focusable("in-drawer");
  await new Promise((r) => setTimeout(r, 400));
  return {
    react: window.__smoke.version,
    lineBadge: Boolean(document.body.textContent?.includes("38")),
    routeStops: Boolean(document.body.textContent?.includes("Nation")),
    accordionClosed,
    drawerOpenFocusable,
    drawerClosed,
    drawerGone: !focusable("in-drawer"),
  };
});
await browser.close();

const checks = {
  "aucune erreur": errors.length === 0,
  "LineBadge et RouteStopList montés": result.lineBadge && result.routeStops,
  "avertissement de dev affiché": warnings.some((w) => w.includes("hors d'un <TabList>")),
  "Accordion fermé non focusable": result.accordionClosed,
  "Drawer ouvert focusable": result.drawerOpenFocusable,
  "Drawer fermé non focusable": result.drawerClosed && result.drawerGone,
};
console.log(`Fumée hors Vite — React ${result.react}`);
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "✓" : "✗"} ${name}`);
if (errors.length) console.log(errors.join("\n"));
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
