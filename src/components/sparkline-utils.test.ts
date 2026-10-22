import { describe, expect, it } from "vitest";
import { describeTrend, trendDirection } from "./sparkline-utils";

describe("trendDirection", () => {
  it("compare la dernière valeur à la première", () => {
    expect(trendDirection([12, 20, 18])).toBe("up");
    expect(trendDirection([18, 9, 12])).toBe("down");
    expect(trendDirection([5, 9, 5])).toBe("flat");
  });
});

describe("describeTrend", () => {
  it("résume sens, bornes, unité et nombre de points", () => {
    expect(describeTrend([12, 15, 18], "min")).toBe("Tendance en hausse : de 12 min à 18 min sur 3 points");
  });

  it("ajoute minimum et maximum quand un pic ou un creux dépasse les extrémités", () => {
    expect(describeTrend([95, 84, 95], "%")).toBe(
      "Tendance stable : de 95\u202F% à 95\u202F% sur 3 points, minimum 84\u202F%, maximum 95\u202F%",
    );
  });

  it("formate en fr-FR, sans unité", () => {
    expect(describeTrend([95.1, 94.2])).toBe("Tendance en baisse : de 95,1 à 94,2 sur 2 points");
  });
});
