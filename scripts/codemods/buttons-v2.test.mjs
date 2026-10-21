import { describe, expect, it } from "vitest";
import { transformMarkdown, transformSource } from "./buttons-v2.mjs";

const run = (code) => transformSource(code, "fixture.tsx");

describe("codemod buttons-v2 — éléments", () => {
  it("PrimaryButton outline est conservé, size large → lg", () => {
    const { code, todos } = run(`const a = <PrimaryButton size="large" outline label="Annuler" onClick={f} />;`);
    expect(code).toBe(`const a = <PrimaryButton size="lg" outline label="Annuler" onClick={f} />;`);
    expect(todos).toEqual([]);
  });

  it("retire size medium (défaut) et traduit destructive", () => {
    const { code } = run(`const a = <PrimaryButton size="medium" destructive label="Supprimer" />;`);
    expect(code).toBe(`const a = <PrimaryButton tone="danger" label="Supprimer" />;`);
  });

  it("traduit un destructive dynamique en tone conditionnel", () => {
    const { code } = run(`const a = <PrimaryButton destructive={danger} label="OK" />;`);
    expect(code).toBe(`const a = <PrimaryButton tone={danger ? "danger" : "default"} label="OK" />;`);
  });

  it("withIcon left / right → iconStart / iconEnd", () => {
    expect(run(`const a = <PrimaryButton withIcon="left" icon="plus" label="Ajouter" />;`).code).toBe(
      `const a = <PrimaryButton iconStart="plus" label="Ajouter" />;`,
    );
    expect(run(`const a = <PrimaryButton withIcon="right" icon="chevron-right" label="Suivant" />;`).code).toBe(
      `const a = <PrimaryButton iconEnd="chevron-right" label="Suivant" />;`,
    );
  });

  it("withIcon only : le label devient aria-label", () => {
    const { code, todos } = run(`const a = <PrimaryButton withIcon="only" icon="trash" label="Supprimer" />;`);
    expect(code).toBe(`const a = <PrimaryButton icon="trash" aria-label="Supprimer" />;`);
    expect(todos).toEqual([]);
  });

  it("withIcon no : l'icône inutilisée est retirée ; state et iconMap aussi", () => {
    const { code } = run(`const a = <PrimaryButton withIcon="no" icon="map-01" state="enabled" iconMap="x" label="A" />;`);
    expect(code).toBe(`const a = <PrimaryButton label="A" />;`);
  });

  it('state="disabled" devient disabled', () => {
    expect(run(`const a = <PrimaryButton state="disabled" label="A" />;`).code).toBe(`const a = <PrimaryButton disabled label="A" />;`);
  });

  it("SecondaryButton outline → PrimaryButton outline sm, sans TODO", () => {
    const { code, todos } = run(`const a = <SecondaryButton outline label="Annuler" />;`);
    expect(code).toBe(`const a = <PrimaryButton size="sm" outline label="Annuler" />;`);
    expect(todos).toEqual([]);
  });

  it("SecondaryButton plein → PrimaryButton sm avec TODO ; large → md", () => {
    const { code, todos } = run(`const a = <SecondaryButton size="large" label="Appliquer" />;`);
    expect(code).toBe(
      `const a = /* TODO buttons-v2 : ancien bouton secondaire plein → PrimaryButton size="sm" : vérifier le rôle (principal, ou GhostButton ?) */ <PrimaryButton size="md" label="Appliquer" />;`,
    );
    expect(todos).toHaveLength(1);
  });

  it("met le TODO en commentaire JSX dans un parent JSX", () => {
    const { code } = run(`const a = (\n  <div>\n    <SecondaryButton label="Exporter" />\n  </div>\n);`);
    expect(code).toContain(`    {/* TODO buttons-v2 : ancien bouton secondaire plein`);
    expect(code).toContain(`\n    <PrimaryButton size="sm" label="Exporter" />`);
  });

  it("renomme aussi la balise fermante", () => {
    const { code } = run(`const a = <SecondaryButton outline label="A">x</SecondaryButton>;`);
    expect(code).toBe(`const a = <PrimaryButton size="sm" outline label="A">x</PrimaryButton>;`);
  });

  it("garde un outline dynamique sans TODO", () => {
    const { code, todos } = run(`const a = <PrimaryButton outline={secondary} withIcon="left" icon="plus" label="A" />;`);
    expect(code).toBe(`const a = <PrimaryButton outline={secondary} iconStart="plus" label="A" />;`);
    expect(todos).toEqual([]);
  });

  it("ne touche pas un fichier déjà migré", () => {
    const source = `const a = <PrimaryButton label="A" tone="danger" size="sm" />;`;
    expect(run(source)).toEqual({ code: source, changed: false, todos: [] });
  });
});

describe("codemod buttons-v2 — imports", () => {
  it("ajuste l'import du paquet", () => {
    const { code } = run(
      `import { Link, PrimaryButton, SecondaryButton } from "@ddaoellena/cadence-ui";\nconst a = <><SecondaryButton outline label="A" /><PrimaryButton label="B" /></>;`,
    );
    expect(code.split("\n")[0]).toBe(`import { Link, PrimaryButton } from "@ddaoellena/cadence-ui";`);
  });

  it("remplace un import par composant", () => {
    const { code } = run(`import { SecondaryButton } from "./SecondaryButton";\nconst a = <SecondaryButton outline label="A" />;`);
    expect(code.split("\n")[0]).toBe(`import { PrimaryButton } from "./PrimaryButton";`);
  });

  it("fusionne plusieurs imports par composant sans doublon", () => {
    const { code } = run(
      `import { PrimaryButton } from "../components/PrimaryButton";\nimport { SecondaryButton } from "../components/SecondaryButton";\nconst a = <><SecondaryButton outline label="A" /><PrimaryButton label="B" /></>;`,
    );
    expect(code.split("\n").slice(0, 2)).toEqual([
      `import { PrimaryButton } from "../components/PrimaryButton";`,
      `const a = <><PrimaryButton size="sm" outline label="A" /><PrimaryButton label="B" /></>;`,
    ]);
  });

  it("garde SecondaryButton s'il reste référencé (ex. meta de story)", () => {
    const { code } = run(
      `import { SecondaryButton } from "./SecondaryButton";\nconst meta = { component: SecondaryButton };\nconst a = <SecondaryButton outline label="A" />;`,
    );
    expect(code).toContain(`import { PrimaryButton } from "./PrimaryButton";`);
    expect(code).toContain(`import { SecondaryButton } from "./SecondaryButton";`);
  });
});

describe("codemod buttons-v2 — Markdown / MDX", () => {
  it("transforme les blocs tsx, y compris du JSX nu à plusieurs racines", () => {
    const mdx = "# Titre\n\n```tsx\n<SecondaryButton outline label=\"Réinitialiser\" />\n<PrimaryButton destructive label=\"Supprimer\" />\n```\n\nTexte avec `SecondaryButton outline`.\n";
    const { code, changed } = transformMarkdown(mdx);
    expect(changed).toBe(true);
    expect(code).toContain('```tsx\n<PrimaryButton size="sm" outline label="Réinitialiser" />\n<PrimaryButton tone="danger" label="Supprimer" />\n```');
    // Le texte hors des blocs de code n'est pas touché
    expect(code).toContain("Texte avec `SecondaryButton outline`.");
  });
});
