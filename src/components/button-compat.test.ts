import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetWarningsForTests,
  resolveButtonProps,
  warnDeprecated,
  warnOnce,
  type CompatButtonProps,
  type LegacySize,
  type LegacyWithIcon,
} from "./button-compat";

const OUTLINES = [false, true];
const DESTRUCTIVES = [false, true];
const WITH_ICONS: LegacyWithIcon[] = ["no", "left", "right", "only"];
const SIZES: (LegacySize | undefined)[] = [undefined, "medium", "large"];

describe("resolveButtonProps — matrice outline × destructive × withIcon × size", () => {
  for (const component of ["PrimaryButton", "SecondaryButton"] as const) {
    for (const outline of OUTLINES) {
      for (const destructive of DESTRUCTIVES) {
        for (const withIcon of WITH_ICONS) {
          for (const size of SIZES) {
            const name = `${component} outline=${outline} destructive=${destructive} withIcon=${withIcon} size=${size ?? "—"}`;
            it(name, () => {
              const input = { outline, destructive, withIcon, size, icon: "plus", label: "Ajouter" } as CompatButtonProps;
              const { variant, props } = resolveButtonProps(input, component);

              // Variante : outline → contour (PrimaryButton), sinon plein
              expect(variant).toBe(outline ? "outline" : "primary");
              // Ton : destructive → danger
              expect(props.tone).toBe(destructive ? "danger" : undefined);
              // Taille : Primary medium/large → md/lg ; Secondary → sm/md (sm par défaut)
              const expectedSize =
                component === "PrimaryButton"
                  ? { medium: "md", large: "md", none: undefined }[size ?? "none"]
                  : { medium: "sm", large: "md", none: "sm" }[size ?? "none"];
              expect(props.size).toBe(expectedSize);
              // Contenu
              if (withIcon === "only") {
                expect(props.icon).toBe("plus");
                expect(props.label).toBeUndefined();
                expect(props["aria-label"]).toBe("Ajouter");
              } else {
                expect(props.label).toBe("Ajouter");
                expect(props.icon).toBeUndefined();
                expect(props.iconStart).toBe(withIcon === "left" ? "plus" : undefined);
                expect(props.iconEnd).toBe(withIcon === "right" ? "plus" : undefined);
              }
            });
          }
        }
      }
    }
  }
});

describe("resolveButtonProps — cas particuliers", () => {
  it("laisse passer la nouvelle API sans dépréciation", () => {
    const { variant, props, deprecated } = resolveButtonProps(
      { label: "Valider", tone: "danger", size: "sm", iconStart: "check" },
      "PrimaryButton",
    );
    expect(variant).toBe("primary");
    expect(props).toMatchObject({ label: "Valider", tone: "danger", size: "sm", iconStart: "check" });
    expect(deprecated).toEqual([]);
  });

  it("garde l'icône seule de la nouvelle API", () => {
    const { props, deprecated } = resolveButtonProps({ icon: "trash", "aria-label": "Supprimer" }, "PrimaryButton");
    expect(props).toMatchObject({ icon: "trash", "aria-label": "Supprimer" });
    expect(props.label).toBeUndefined();
    expect(deprecated).toEqual([]);
  });

  it("traduit state=\"disabled\" en disabled et ignore les autres états", () => {
    expect(resolveButtonProps({ label: "A", state: "disabled" }, "PrimaryButton").props.disabled).toBe(true);
    expect(resolveButtonProps({ label: "A", state: "hover" }, "PrimaryButton").props.disabled).toBeUndefined();
  });

  it("donne un nom accessible de repli à une ancienne icône seule sans libellé", () => {
    const { props, deprecated } = resolveButtonProps({ withIcon: "only", icon: "copy-01" }, "PrimaryButton");
    expect(props["aria-label"]).toBe("copy");
    expect(deprecated).toContain("missingAriaLabel");
  });

  it("reprend l'icône et le libellé par défaut de l'ancienne API", () => {
    const { props, deprecated } = resolveButtonProps({ withIcon: "left" }, "PrimaryButton");
    expect(props).toMatchObject({ iconStart: "map-01", label: "Label" });
    expect(deprecated).toEqual(expect.arrayContaining(["withIcon", "missingLabel"]));
  });

  it("liste les anciennes props rencontrées ; outline n'en fait pas partie", () => {
    const { deprecated, variant } = resolveButtonProps(
      { label: "A", outline: true, destructive: true, size: "large", state: "enabled", iconMap: "x" },
      "PrimaryButton",
    );
    expect(deprecated).toEqual(expect.arrayContaining(["destructive", "size", "state", "iconMap"]));
    expect(deprecated).not.toContain("outline");
    expect(variant).toBe("outline");
  });
});

describe("avertissements", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetWarningsForTests();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it("n'avertit qu'une fois par composant et par prop", () => {
    warnDeprecated("PrimaryButton", ["withIcon", "destructive"]);
    warnDeprecated("PrimaryButton", ["withIcon", "destructive"]);
    warnDeprecated("PrimaryButton", ["withIcon"]);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain("iconStart");
  });

  it("distingue les composants", () => {
    warnOnce("PrimaryButton", "size", "message");
    warnOnce("SecondaryButton", "size", "message");
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("se tait en production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    warnOnce("PrimaryButton", "withIcon", "message");
    process.env.NODE_ENV = previous;
    expect(warn).not.toHaveBeenCalled();
  });
});
