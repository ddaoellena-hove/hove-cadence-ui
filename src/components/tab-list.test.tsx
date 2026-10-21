import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Tab } from "./Tab";
import { SecondaryTab } from "./SecondaryTab";
import { TabList } from "./TabList";
import { resetTabWarningsForTests } from "./tab-list-context";

// Avertissement en développement : role="tab" exige un conteneur role="tablist".

describe("Tab et SecondaryTab hors TabList", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetTabWarningsForTests();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it("avertit une fois par composant, rendu inchangé", () => {
    const html = renderToStaticMarkup(
      <>
        <Tab label="En cours" variant="active" />
        <Tab label="À venir" />
        <SecondaryTab label="Bus" />
      </>,
    );
    expect(html).toContain('role="tab"');
    expect(html).not.toContain("tabindex");
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toMatch(/^\[cadence-ui\] <Tab> rendu hors d'un <TabList>/);
    expect(warn.mock.calls[1][0]).toMatch(/^\[cadence-ui\] <SecondaryTab> rendu hors d'un <TabList>/);
  });

  it("silencieux dans un TabList, avec roving tabindex", () => {
    const html = renderToStaticMarkup(
      <TabList aria-label="État">
        <Tab label="En cours" variant="active" id="tab-a" controls="panel-a" />
        <Tab label="À venir" />
      </TabList>,
    );
    expect(warn).not.toHaveBeenCalled();
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="État"');
    expect(html).toMatch(/id="tab-a"[^>]*aria-selected="true"[^>]*aria-controls="panel-a"[^>]*tabindex="0"/);
    expect(html).toMatch(/aria-selected="false"[^>]*tabindex="-1"/);
  });

  it("silencieux en production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    renderToStaticMarkup(<Tab label="En cours" />);
    process.env.NODE_ENV = previous;
    expect(warn).not.toHaveBeenCalled();
  });
});
