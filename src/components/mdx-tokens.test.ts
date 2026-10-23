import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Les exemples de code des MDX de guidelines passent par les tokens : pas de
// couleur en dur (#hex, rgba…) dans les blocs ```…```. Exception : un bloc qui
// DÉFINIT des tokens (`--cadence-…: #hex;`) montre forcément les valeurs.

const mdxDir = join(import.meta.dirname, "..", "stories", "guidelines");
const files = readdirSync(mdxDir).filter((f) => f.endsWith(".mdx"));

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/;

/** Couleurs en dur d'un fichier MDX, dans ses blocs de code uniquement. */
const hardCodedInFences = (file: string): string[] => {
  const text = readFileSync(join(mdxDir, file), "utf8");
  const offenders: string[] = [];
  for (const fence of text.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
    for (const rawLine of fence[1].split("\n")) {
      // Repli var(--token, …) et lignes de définition de token : tolérés.
      const line = rawLine.replace(/var\(--[a-z0-9-]+,[^)]*\)/g, "");
      if (/^\s*--cadence-[a-z0-9-]+\s*:/.test(rawLine)) continue;
      if (COLOR.test(line)) offenders.push(`${file}: ${rawLine.trim()}`);
    }
  }
  return offenders;
};

describe("MDX guidelines : tokens uniquement dans les exemples", () => {
  it("aucune couleur en dur dans les blocs de code", () => {
    expect(files.flatMap(hardCodedInFences)).toEqual([]);
  });
});
