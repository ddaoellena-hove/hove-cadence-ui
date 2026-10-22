import { describe, expect, it } from "vitest";
import { formatFileSize, rejectFile } from "./file-upload-utils";

describe("rejectFile", () => {
  it("accepte une extension autorisée et une taille correcte", () => {
    expect(rejectFile({ name: "reseau.zip", size: 1000 }, ".zip,.csv", 50_000)).toBeNull();
  });

  it("rejette une extension non autorisée", () => {
    const msg = rejectFile({ name: "data.xls", size: 100 }, ".zip,.csv");
    expect(msg).toMatch(/Format non pris en charge/);
    expect(msg).toMatch(/\.xls/);
  });

  it("rejette un fichier trop volumineux", () => {
    const msg = rejectFile({ name: "gros.zip", size: 2000 }, ".zip", 1000);
    expect(msg).toMatch(/trop volumineux/);
  });

  it("accepte les jokers MIME et les extensions composées", () => {
    expect(rejectFile({ name: "photo.png", size: 10, type: "image/png" }, "image/*")).toBeNull();
    expect(rejectFile({ name: "network.tar.gz", size: 10 }, ".tar.gz")).toBeNull();
    expect(rejectFile({ name: "table.csv", size: 10, type: "text/csv" }, "image/*")).toMatch(/Format non pris en charge/);
    expect(rejectFile({ name: "vide.csv", size: 1 }, ".csv", 0)).toMatch(/trop volumineux/);
  });

  it("accepte un type MIME correspondant", () => {
    expect(rejectFile({ name: "x", size: 10, type: "text/csv" }, "text/csv")).toBeNull();
  });
});

describe("formatFileSize", () => {
  it("octets, kilo-octets, méga-octets", () => {
    expect(formatFileSize(500)).toMatch(/^500.o$/);
    expect(formatFileSize(1536)).toMatch(/1\.5.Ko/);
    expect(formatFileSize(5_000_000)).toMatch(/4\.8.Mo/);
  });
});
