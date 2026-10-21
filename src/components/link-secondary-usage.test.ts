import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// `Link variant="secondary"` est déprécié depuis la 0.3.0 : il ne doit plus
// apparaître dans nos exemples (guides, stories, GUIDELINES.md), hors liste
// blanche explicite.

const root = join(import.meta.dirname, "..", "..");
const PATTERN = /variant(=|:\s*)["']secondary["']/;

/** Occurrences tolérées, volontaires. */
const ALLOWLIST: { file: string; line: RegExp; reason: string }[] = [
  {
    file: "GUIDELINES.md",
    line: /^\| `Link variant="secondary"` \|/,
    reason: "table de migration depuis la 0.2",
  },
  {
    file: "src/components/Link.stories.tsx",
    line: /^\s+variant: "secondary",$/,
    reason: "story « Dépréciée — secondary »",
  },
];

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = [
  join(root, "GUIDELINES.md"),
  ...walk(join(root, "src")).filter((f) => /\.mdx$/.test(f) || /\.stories\.tsx$/.test(f)),
].map((f) => relative(root, f));

describe('Link variant="secondary" (déprécié)', () => {
  it("analyse les guides, les stories et GUIDELINES.md", () => {
    expect(files).toContain("GUIDELINES.md");
    expect(files.some((f) => f.endsWith(".mdx"))).toBe(true);
    expect(files).toContain("src/components/Link.stories.tsx");
  });

  it("n'apparaît plus hors de la liste blanche", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(join(root, file), "utf8")
        .split("\n")
        .forEach((text, i) => {
          if (!PATTERN.test(text)) return;
          const allowed = ALLOWLIST.some((a) => a.file === file && a.line.test(text));
          if (!allowed) offenders.push(`${file}:${i + 1}  ${text.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });

  it("garde chaque entrée de la liste blanche utile (une occurrence exactement)", () => {
    for (const { file, line } of ALLOWLIST) {
      const count = readFileSync(join(root, file), "utf8")
        .split("\n")
        .filter((text) => PATTERN.test(text) && line.test(text)).length;
      expect(count, file).toBe(1);
    }
  });
});
