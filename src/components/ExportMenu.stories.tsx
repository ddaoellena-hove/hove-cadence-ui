import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ExportMenu } from "./ExportMenu";

const meta: Meta<typeof ExportMenu> = {
  title: "Composants/Actions/ExportMenu",
  component: ExportMenu,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof ExportMenu>;

export const Defaut: Story = {
  name: "Défaut",
  render: () => {
    const [last, setLast] = useState("—");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13 }}>Dernier export : {last}</span>
        <ExportMenu counts={{ selection: 3, page: 50, total: 12430 }} onExport={(a) => setLast(`${a.scope} · ${a.format}`)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Exporter" }));
    const menu = await body.findByRole("menu", { name: "Exporter" });
    await expect(menu).toBeInTheDocument();
    // Les trois portées sont proposées.
    await expect(body.getByText(/Sélection \(3\)/)).toBeInTheDocument();
    await expect(body.getByText(/Tout le résultat \(12.430\)/)).toBeInTheDocument();
    // Export d'une portée.
    await userEvent.click(body.getAllByRole("menuitem", { name: "CSV" })[0]);
    await expect(canvas.getByText(/Dernier export : selection · csv/)).toBeInTheDocument();
  },
};

/** Sans sélection : la portée « Sélection » est désactivée. */
export const SansSelection: Story = {
  name: "Sans sélection",
  render: () => <ExportMenu counts={{ selection: 0, page: 50, total: 320 }} onExport={() => {}} />,
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Exporter" }));
    await body.findByRole("menu");
    // Les items de la portée « Sélection » sont désactivés.
    const items = body.getAllByRole("menuitem");
    const disabled = items.filter((i) => (i as HTMLButtonElement).disabled);
    await expect(disabled.length).toBeGreaterThanOrEqual(1);
  },
};
