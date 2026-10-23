import { describe, expect, it } from "vitest";
import { hexToHsv, hsvToHex } from "./color-field-utils";

describe("color-field-utils", () => {
  it("hexToHsv : couleurs de référence", () => {
    expect(hexToHsv("#FF0000")).toEqual({ h: 0, s: 100, v: 100 });
    expect(hexToHsv("00ff00")).toEqual({ h: 120, s: 100, v: 100 });
    expect(hexToHsv("#000")).toEqual({ h: 0, s: 0, v: 0 });
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 100 });
    expect(hexToHsv("#12345")).toBeNull();
  });

  it("hsvToHex : majuscules, aller-retour stable", () => {
    expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe("#0000FF");
    for (const hex of ["#6EC4E8", "#E3051B", "#FFCD00", "#002830", "#00A88F"]) {
      expect(hsvToHex(hexToHsv(hex)!)).toBe(hex);
    }
  });
});
