import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// API supprimées (en 0.4.0, puis en 1.0.0) : elles ne doivent pas réapparaître
// dans nos exemples (GUIDELINES.md, guides MDX, stories). Seul le CHANGELOG,
// qui documente les suppressions et leur migration, peut les citer.
// Motifs volontairement non ambigus : `destructive` (Modal, Link) ou
// `variant="secondary"` (autre composant) existent ailleurs avec un sens
// légitime, d'où l'ancrage sur le composant concerné.

const root = join(import.meta.dirname, "..", "..");

const REMOVED: { pattern: RegExp; replacement: string }[] = [
  // 0.4.0
  { pattern: /\buseElementWidth\b/, replacement: "AppLayout (le conteneur suit la Sidebar)" },
  { pattern: /\bHEADER_HEIGHT\b/, replacement: "AppLayout + PageHeader" },
  { pattern: /<Header\b/, replacement: "Sidebar scope / user" },
  { pattern: /\bTableCardAction\b/, replacement: 'GhostButton size="sm" icône seule' },
  { pattern: /\bNavigationDropdown\b/, replacement: 'Dropdown variant="button"' },
  // 1.0.0
  { pattern: /\bSecondaryButton\b/, replacement: 'PrimaryButton size="sm" (outline) ou GhostButton size="sm"' },
  { pattern: /\bDataVisualization\b(?!\.mdx)/, replacement: "BarChart (layout, orientation, title)" },
  { pattern: /--CAI-dv-series-/, replacement: "--cadence-dataviz-series-N" },
  { pattern: /\bwithIcon\s*[=:]/, replacement: "iconStart / iconEnd / icon" },
  { pattern: /<PrimaryButton\b[^>]*\s(destructive|state)\b/, replacement: 'tone="danger" / disabled' },
  { pattern: /<(Primary|Ghost)Button\b[^>]*size="(medium|large)"/, replacement: 'size="sm" | "md"' },
  { pattern: /<Link\b[^>]*variant="secondary"/, replacement: 'Link (variant="primary", rendu identique)' },
  { pattern: /user=\{\{[^}]*\bemail\b/, replacement: "Sidebar user = { name, avatarSrc? }" },
];

/** Fichiers où les anciennes API sont légitimes. */
const ALLOWED_FILES = ["CHANGELOG.md"];

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = [
  join(root, "GUIDELINES.md"),
  join(root, "CHANGELOG.md"),
  ...walk(join(root, "src", "stories")),
  ...walk(join(root, "src", "components")).filter((f) => /\.stories\.tsx$/.test(f)),
].map((f) => relative(root, f));

describe("API supprimées", () => {
  it("analyse GUIDELINES.md, les guides et les stories", () => {
    expect(files).toContain("GUIDELINES.md");
    expect(files.some((f) => f.startsWith("src/stories/") && f.endsWith(".mdx"))).toBe(true);
    expect(files.some((f) => f.endsWith(".stories.tsx"))).toBe(true);
  });

  it("ne réapparaissent pas hors du CHANGELOG", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (ALLOWED_FILES.includes(file)) continue;
      readFileSync(join(root, file), "utf8")
        .split("\n")
        .forEach((text, i) => {
          const hit = REMOVED.find(({ pattern }) => pattern.test(text));
          if (hit) offenders.push(`${file}:${i + 1}  ${text.trim()}  → ${hit.replacement}`);
        });
    }
    expect(offenders).toEqual([]);
  });

  it("le CHANGELOG, en liste blanche, documente bien chaque suppression", () => {
    const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
    for (const name of ["Header", "TableCardAction", "NavigationDropdown", "SecondaryButton", "DataVisualization"]) {
      expect(changelog, name).toMatch(new RegExp(`\\*\\*\`${name}\` est supprimé`));
    }
  });
});
