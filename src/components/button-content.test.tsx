import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { resetWarningsForTests } from "./button-compat";

// Contenu des boutons : même comportement pour PrimaryButton et GhostButton.
// Plus de libellé de repli « Label » : un bouton sans contenu est une erreur
// de développement, jamais un texte affiché à l'utilisateur.

describe("bouton sans libellé ni icône", () => {
  let error: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetWarningsForTests();
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => error.mockRestore());

  it("PrimaryButton : aucun « Label » dans le DOM, une erreur en développement", () => {
    // @ts-expect-error label ou icon + aria-label requis
    const html = renderToStaticMarkup(<PrimaryButton />);
    expect(html).not.toContain("Label");
    expect(html).toMatch(/^<button[^>]*><\/button>$/);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe("[cadence-ui] PrimaryButton : `label` ou `icon` + `aria-label` est requis.");
  });

  it("GhostButton : même comportement", () => {
    // @ts-expect-error label ou icon + aria-label requis
    const html = renderToStaticMarkup(<GhostButton />);
    expect(html).not.toContain("Label");
    expect(html).toMatch(/^<button[^>]*><\/button>$/);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe("[cadence-ui] GhostButton : `label` ou `icon` + `aria-label` est requis.");
  });

  it("n'émet l'erreur qu'une fois par composant", () => {
    // @ts-expect-error label ou icon + aria-label requis
    renderToStaticMarkup(<><PrimaryButton /><PrimaryButton /><GhostButton /><GhostButton /></>);
    expect(error).toHaveBeenCalledTimes(2);
  });

  it("les anciennes props sans libellé n'affichent plus « Label » non plus", () => {
    const html = renderToStaticMarkup(
      <>
        <PrimaryButton withIcon="left" icon="plus" />
        <SecondaryButton withIcon="no" />
      </>,
    );
    expect(html).not.toContain("Label");
    expect(error).toHaveBeenCalledTimes(1); // une fois pour PrimaryButton (SecondaryButton rend un PrimaryButton)
  });

  it("se tait en production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    // @ts-expect-error label ou icon + aria-label requis
    renderToStaticMarkup(<GhostButton />);
    process.env.NODE_ENV = previous;
    expect(error).not.toHaveBeenCalled();
  });
});

describe("icône seule sans aria-label", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetWarningsForTests();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it("déduit le nom accessible de l'icône, pour les deux composants, avec un avertissement unique", () => {
    const html = renderToStaticMarkup(
      <>
        <PrimaryButton withIcon="only" icon="trash" />
        <PrimaryButton withIcon="only" icon="trash" />
        {/* @ts-expect-error aria-label requis (le repli reste un garde-fou d'exécution) */}
        <GhostButton icon="copy-01" />
      </>,
    );
    expect(html).toContain('aria-label="trash"');
    expect(html).toContain('aria-label="copy"');
    const contentWarnings = warn.mock.calls
      .map((call: unknown[]) => String(call[0]))
      .filter((message: string) => message.includes("icône seule sans `aria-label`"));
    expect(contentWarnings.map((message: string) => message.split(" : ")[0])).toEqual([
      "[cadence-ui] PrimaryButton",
      "[cadence-ui] GhostButton",
    ]);
  });
});
