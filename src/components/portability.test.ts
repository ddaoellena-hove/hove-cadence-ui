import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Le paquet doit fonctionner hors Vite (webpack, Next, IIFE) et sous React 18 :
// garde-fous sur le code source des composants publiés (hors stories et tests).

const dir = join(import.meta.dirname);
const sources = readdirSync(dir).filter(
  (f) => /\.(ts|tsx)$/.test(f) && !/\.(stories|test)\.tsx?$/.test(f),
);
const styles = readdirSync(dir).filter((f) => f.endsWith(".css"));
const read = (f: string) => readFileSync(join(dir, f), "utf8");

describe("portabilité des composants", () => {
  it("aucun `import.meta` (propre à Vite) : passer par isDevMode()", () => {
    const offenders = sources.filter((f) => /\bimport\.meta\b/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("aucune prop JSX `inert` (ignorée par React 18) : passer par inertProps()", () => {
    const offenders = sources.filter((f) => /\binert=\{/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("aucun z-index de couche en dur : tokens --cadence-z-* (0 à 2 = empilement local)", () => {
    const offenders = styles.flatMap((f) =>
      [...read(f).matchAll(/z-index:\s*(\d+)/g)].filter((m) => Number(m[1]) > 2).map((m) => `${f} : ${m[0]}`),
    );
    expect(offenders).toEqual([]);
  });
});
