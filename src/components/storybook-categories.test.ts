import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Le menu Storybook range les composants par catégorie (ordre dans
// .storybook/preview.ts) : chaque story de composant doit y être rangée.
const ROOT = join(__dirname, "..", "..");
const preview = readFileSync(join(ROOT, ".storybook", "preview.ts"), "utf8");
const block = preview.slice(preview.indexOf("'Composants'"), preview.indexOf("'Recettes'"));
const categories = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((c) => c !== "Composants");

const titleOf = (file: string) => /title:\s*"([^"]+)"/.exec(readFileSync(file, "utf8"))?.[1];

describe("organisation du Storybook", () => {
  it("les catégories de composants sont déclarées dans preview.ts", () => {
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it("chaque story de src/components est rangée sous Composants/<catégorie connue>/<Nom>", () => {
    const dir = join(ROOT, "src", "components");
    const wrong = readdirSync(dir)
      .filter((f) => f.endsWith(".stories.tsx"))
      .map((f) => ({ f, title: titleOf(join(dir, f)) }))
      .filter(({ title }) => {
        const [root, category, name] = (title ?? "").split("/");
        return root !== "Composants" || !categories.includes(category) || !name;
      });
    expect(wrong).toEqual([]);
  });
});
