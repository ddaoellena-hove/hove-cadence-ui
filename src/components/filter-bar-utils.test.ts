import { describe, expect, it } from "vitest";
import { formatResultCount } from "./filter-bar-utils";

describe("formatResultCount", () => {
  it("accorde au pluriel et sépare les milliers", () => {
    expect(formatResultCount(12430)).toBe("12 430 résultats");
    expect(formatResultCount(2)).toBe("2 résultats");
  });

  it("reste au singulier pour 1", () => {
    expect(formatResultCount(1)).toBe("1 résultat");
  });

  it("affiche « Aucun résultat » pour 0", () => {
    expect(formatResultCount(0)).toBe("Aucun résultat");
  });
});
