import { describe, expect, it } from "vitest";
import { compactScopeSelection, expandScopeSelection } from "./scope-selection-utils";
const nodes = [{ id: "network", label: "Réseau", children: [{ id: "a", label: "A" }, { id: "b", label: "B" }] }];
describe("Périmètre regroupé", () => {
  it("développe un réseau et le regroupe sans perdre les identifiants inconnus", () => {
    expect(expandScopeSelection(nodes, ["network", "a", "external"])).toEqual(["a", "b", "external"]);
    expect(compactScopeSelection(nodes, ["a", "b", "external"])).toEqual(["network", "external"]);
  });
  it("conserve la sélection partielle et ne sélectionne pas les feuilles désactivées", () => {
    expect(compactScopeSelection(nodes, ["b"])).toEqual(["b"]);
    expect(expandScopeSelection([{ ...nodes[0], children: [{ id: "a", label: "A", disabled: true }, { id: "b", label: "B" }] }], ["network"])).toEqual(["b"]);
  });
});
