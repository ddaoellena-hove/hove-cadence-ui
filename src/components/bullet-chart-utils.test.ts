import { describe, expect, it } from "vitest";
import { bulletBands, bulletScale, bulletStatus, describeBullet } from "./bullet-chart-utils";

const contract = [
  { value: 85, label: "Malus sous 85 %" },
  { value: 92, label: "Bonus dès 92 %" },
];

describe("BulletChart", () => {
  it("échelle : bornes étendues à la valeur, à l'objectif ou à une borne de plage", () => {
    expect(bulletScale(0, 100, 91)).toEqual([0, 100]);
    expect(bulletScale(80, 100, 91, 92, contract)).toEqual([80, 100]);
    expect(bulletScale(0, 10, 12.5, 8)).toEqual([0, 12.5]);
    expect(bulletScale(0, 10, 4, 14)).toEqual([0, 14]);
    expect(bulletScale(80, 100, 76.5)).toEqual([76.5, 100]);
    expect(bulletScale(0, 0, 0)).toEqual([0, 1]);
    expect(bulletScale(0, 100, NaN)).toEqual([0, 100]);
  });

  it("plages : défavorable → favorable en « up », l'inverse en « down »", () => {
    expect(bulletBands(contract, [0, 100], "up")).toEqual([
      { from: 0, to: 85, tone: "danger" },
      { from: 85, to: 92, tone: "warning" },
      { from: 92, to: 100, tone: "success" },
    ]);
    expect(bulletBands([{ value: 3, label: "Seuil 3 min" }, { value: 5, label: "Seuil 5 min" }], [0, 10], "down")).toEqual([
      { from: 0, to: 3, tone: "success" },
      { from: 3, to: 5, tone: "warning" },
      { from: 5, to: 10, tone: "danger" },
    ]);
    // Une seule borne : deux plages
    expect(bulletBands([{ value: 95, label: "Objectif 95 %" }], [80, 100], "up").map((b) => b.tone)).toEqual(["danger", "success"]);
  });

  it("plages : neutre sans borne, bornes hors échelle ignorées", () => {
    expect(bulletBands(undefined, [0, 100], "up")).toEqual([{ from: 0, to: 100, tone: "neutral" }]);
    expect(bulletBands(contract, [80, 100], "neutral")).toEqual([{ from: 80, to: 100, tone: "neutral" }]);
    expect(bulletBands([{ value: 120, label: "x" }, { value: 0, label: "y" }], [0, 100], "up")).toHaveLength(1);
  });

  it("statut et nom accessible", () => {
    expect(bulletStatus(93.4, contract, "up")).toEqual({ tone: "success", status: "Favorable — Bonus dès 92 %" });
    expect(bulletStatus(88, contract, "up").tone).toBe("warning");
    expect(bulletStatus(NaN, contract, "up")).toEqual({ tone: "neutral", status: null });
    expect(describeBullet("Ponctualité", 88, 92, "Intermédiaire — Bonus dès 92 %", "%")).toBe(
      "Ponctualité : 88 %, objectif 92 %, Intermédiaire — Bonus dès 92 %",
    );
    expect(describeBullet("Régularité", NaN, 92, null)).toBe("Régularité : donnée indisponible");
  });
});
