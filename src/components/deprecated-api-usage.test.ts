import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// API dépréciées (suppression en 1.0.0) : les shims restent dans les
// composants, mais nos exemples (guides MDX, stories) ne doivent plus les
// utiliser. Seules les stories de démonstration des dépréciations et les docs
// de migration (CHANGELOG, GUIDELINES) peuvent les citer.
// Motifs volontairement non ambigus : `destructive` (Modal, Link) ou
// `size="large"` existent ailleurs avec un sens légitime.

const root = join(import.meta.dirname, "..", "..");

const DEPRECATED: { pattern: RegExp; replacement: string }[] = [
  { pattern: /<SecondaryButton\b/, replacement: 'PrimaryButton size="sm" (outline) ou GhostButton size="sm"' },
  { pattern: /<DataVisualization\b/, replacement: "BarChart (layout, orientation, title)" },
  { pattern: /\bwithIcon\s*=/, replacement: "iconStart / iconEnd / icon" },
];

/** Fichiers où les API dépréciées sont légitimes (démos et migration). */
const ALLOWED_FILES = [
  "CHANGELOG.md",
  "GUIDELINES.md",
  "src/components/PrimaryButton.stories.tsx",
  "src/components/SecondaryButton.stories.tsx",
  "src/components/DataVisualization.stories.tsx",
  "src/components/Link.stories.tsx",
];

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

describe("API dépréciées (suppression en 1.0.0)", () => {
  it("la liste blanche ne désigne que des fichiers analysés", () => {
    for (const file of ALLOWED_FILES) expect(files, file).toContain(file);
  });

  it("ne sont pas utilisées hors des démos de dépréciation et des docs de migration", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (ALLOWED_FILES.includes(file)) continue;
      readFileSync(join(root, file), "utf8")
        .split("\n")
        .forEach((text, i) => {
          const hit = DEPRECATED.find(({ pattern }) => pattern.test(text));
          if (hit) offenders.push(`${file}:${i + 1}  ${text.trim()}  → ${hit.replacement}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
