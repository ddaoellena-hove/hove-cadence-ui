import { describe, expect, it } from "vitest";
import {
  describePassage,
  describeTrips,
  maxDelay,
  passageDelay,
  serviceTimeToMinutes,
  tripPoints,
  tripsWindow,
} from "./time-space-utils";

const stopIndex = new Map([
  ["a", 0],
  ["b", 1],
  ["c", 2],
]);

const trip = {
  id: "t1",
  label: "13-0712",
  direction: "outbound" as const,
  scheduled: [
    { stopId: "a", departure: "06:30" },
    { stopId: "b", arrival: "06:38", departure: "06:39" },
    { stopId: "c", arrival: "06:47" },
  ],
  actual: [
    { stopId: "a", departure: "06:31" },
    { stopId: "b", arrival: "06:41", departure: "06:42" },
  ],
};

describe("TimeSpaceDiagram", () => {
  it("heures de service, secondes comprises, au-delà de minuit", () => {
    expect(serviceTimeToMinutes("06:30")).toBe(390);
    expect(serviceTimeToMinutes("25:10:30")).toBe(1510.5);
    expect(serviceTimeToMinutes("48:00")).toBeNull();
    expect(serviceTimeToMinutes("6h30")).toBeNull();
    expect(serviceTimeToMinutes()).toBeNull();
  });

  it("points d'une course : arrivée puis départ (palier), arrêts inconnus ignorés", () => {
    expect(tripPoints(trip.scheduled, stopIndex)).toEqual([
      { stopIndex: 0, time: 390 },
      { stopIndex: 1, time: 398 },
      { stopIndex: 1, time: 399 },
      { stopIndex: 2, time: 407 },
    ]);
    expect(tripPoints([{ stopId: "x", departure: "07:00" }, { stopId: "a", arrival: "07:00", departure: "07:00" }], stopIndex)).toEqual([{ stopIndex: 0, time: 420 }]);
  });

  it("fenêtre arrondie au quart d'heure", () => {
    expect(tripsWindow([trip], stopIndex)).toEqual([390, 420]);
    expect(tripsWindow([], stopIndex)).toEqual([360, 420]);
  });

  it("écarts théorique / réalisé", () => {
    expect(passageDelay(trip, "a")).toBe(1);
    expect(passageDelay(trip, "b")).toBe(3);
    expect(passageDelay(trip, "c")).toBeNull();
    expect(maxDelay(trip)).toBe(3);
    expect(maxDelay({ ...trip, actual: undefined })).toBeNull();
  });

  it("phrases lues", () => {
    expect(describePassage(trip, "b", "Garibaldi")).toBe("Garibaldi : prévu 06h39, réalisé 06h42, retard 3 min");
    expect(describePassage(trip, "c", "Montparnasse")).toBe("Montparnasse : prévu 06h47");
    expect(
      describeTrips(
        [trip, { ...trip, id: "t2", direction: "inbound", status: "cancelled" }, { ...trip, id: "t3", status: "incident" }],
        { outbound: "Vers Montparnasse", inbound: "Vers Saint-Denis" },
      ),
    ).toBe("3 courses dans la fenêtre, 2 vers Montparnasse, 1 vers Saint-Denis, 1 supprimée, 1 incident");
  });
});
