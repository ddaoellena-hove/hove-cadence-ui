import { describe, expect, it } from "vitest";
import { inertPropsFor } from "./inert-props";

describe("inertPropsFor", () => {
  it("React 19 : booléen", () => {
    expect(inertPropsFor(19, true)).toEqual({ inert: true });
  });

  it("React 18 : chaîne vide, seule valeur transmise au DOM", () => {
    expect(inertPropsFor(18, true)).toEqual({ inert: "" });
  });

  it("non inerte : aucune prop, quelle que soit la version", () => {
    expect(inertPropsFor(18, false)).toEqual({});
    expect(inertPropsFor(19, false)).toEqual({});
  });
});
