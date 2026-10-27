import { describe, expect, it } from "vitest";
import {
  delayBadge,
  delayText,
  describeLine,
  positionText,
  stackLevels,
  stopFractions,
  vehicleFraction,
  vehicleStatus,
} from "./line-diagram-utils";

const stops = [
  { id: "a", name: "Saint-Denis Université" },
  { id: "b", name: "Basilique" },
  { id: "c", name: "Garibaldi" },
  { id: "d", name: "Châtillon" },
];

describe("LineDiagram", () => {
  it("arrêts : espacement régulier, à l'échelle si toutes les distances sont fournies", () => {
    expect(stopFractions(stops)).toEqual([0, 1 / 3, 2 / 3, 1]);
    const scaled = stops.map((s, i) => ({ ...s, distance: [0, 1, 4, 10][i] }));
    expect(stopFractions(scaled)).toEqual([0, 0.1, 0.4, 1]);
    // Distance manquante ou décroissante : régulier
    expect(stopFractions(scaled.map((s, i) => (i === 2 ? { ...s, distance: undefined } : s)))).toEqual([0, 1 / 3, 2 / 3, 1]);
    expect(stopFractions([{ id: "x", name: "X" }])).toEqual([0]);
  });

  it("véhicules : à l'arrêt ou interpolé entre deux arrêts", () => {
    const index = new Map(stops.map((s, i) => [s.id, i]));
    const fractions = [0, 0.25, 0.5, 1];
    expect(vehicleFraction({ at: "c" }, index, fractions)).toBe(0.5);
    expect(vehicleFraction({ from: "c", to: "d", progress: 0.5 }, index, fractions)).toBe(0.75);
    // Sens retour : de d vers c
    expect(vehicleFraction({ from: "d", to: "c", progress: 0.25 }, index, fractions)).toBe(0.875);
    expect(vehicleFraction({ from: "a", to: "b" }, index, fractions)).toBe(0.125);
    expect(vehicleFraction({ at: "inconnu" }, index, fractions)).toBeNull();
  });

  it("statut et écart : incident d'abord, seuils de retard et d'avance", () => {
    expect(vehicleStatus({ delay: 6, incident: "Panne" })).toBe("incident");
    expect(vehicleStatus({ delay: 3 })).toBe("late");
    expect(vehicleStatus({ delay: -1 })).toBe("early");
    expect(vehicleStatus({ delay: 1 })).toBe("ontime");
    // Écart absent : inconnu, jamais « à l'heure »
    expect(vehicleStatus({})).toBe("unknown");
    expect(vehicleStatus({ delay: Number.NaN })).toBe("unknown");
    expect(vehicleStatus({ incident: "Panne" })).toBe("incident");
    expect(delayBadge()).toBe("?");
    expect(vehicleStatus({ delay: 2 }, { late: 2, early: -2 })).toBe("late");
    expect(delayBadge(4.2)).toBe("+4");
    expect(delayBadge(-1)).toBe("−1");
    expect(delayBadge(0.3)).toBe("");
    expect(delayText(4)).toBe("retard 4 min");
    expect(delayText(-2)).toBe("avance 2 min");
    expect(delayText(0)).toBe("à l'heure");
    expect(delayText()).toBe("écart inconnu");
  });

  it("position lue", () => {
    const names = new Map(stops.map((s) => [s.id, s.name]));
    expect(positionText({ at: "c" }, names)).toBe("à l'arrêt Garibaldi");
    expect(positionText({ from: "b", to: "c", progress: 0.4 }, names)).toBe("entre Basilique et Garibaldi");
  });

  it("empilement des véhicules proches, débordement au-delà de trois niveaux", () => {
    expect(stackLevels([0.1, 0.5, 0.9], 0.05)).toEqual([
      { level: 0, overflow: false },
      { level: 0, overflow: false },
      { level: 0, overflow: false },
    ]);
    const crowded = stackLevels([0.5, 0.51, 0.52, 0.53, 0.8], 0.05);
    expect(crowded.map((c) => c.level)).toEqual([0, 1, 2, 2, 0]);
    expect(crowded.map((c) => c.overflow)).toEqual([false, false, false, true, false]);
  });

  it("résumé de la ligne", () => {
    const vehicles = [
      { id: "1", label: "4521", direction: "outbound" as const, position: { at: "a" }, delay: 4 },
      { id: "2", label: "4498", direction: "outbound" as const, position: { at: "b" }, incident: "Panne" },
      { id: "3", label: "4477", direction: "inbound" as const, position: { at: "c" }, delay: -1 },
    ];
    expect(describeLine(vehicles, { outbound: "Vers Châtillon", inbound: "Vers Saint-Denis" }, 1)).toBe(
      "2 véhicules vers Châtillon, 1 vers Saint-Denis, 1 incident, 1 en retard, 1 arrêt fermé",
    );
  });
});
