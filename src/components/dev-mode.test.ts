import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevMode } from "./dev-mode";

describe("isDevMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("vrai en développement", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isDevMode()).toBe(true);
  });

  it("faux en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isDevMode()).toBe(false);
  });

  it("faux sans `process` (ESM chargé sans bundler), sans lever d'erreur", () => {
    vi.stubGlobal("process", undefined);
    expect(() => isDevMode()).not.toThrow();
    expect(isDevMode()).toBe(false);
  });
});
