import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ColumnManager, type ColumnManagerColumn } from "./ColumnManager";

const meta: Meta<typeof ColumnManager> = {
  title: "Components/ColumnManager",
  component: ColumnManager,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof ColumnManager>;

const COLUMNS: ColumnManagerColumn[] = [
  { id: "line", label: "Ligne" },
  { id: "stop", label: "Arrêt" },
  { id: "severity", label: "Sévérité" },
  { id: "start", label: "Début" },
  { id: "impacted", label: "Arrêts impactés" },
];

export const Defaut: Story = {
  name: "Défaut",
  render: () => {
    const [visibleIds, setVisible] = useState(COLUMNS.map((c) => c.id));
    const [order, setOrder] = useState(["line", "stop", "line", "unknown"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13 }}>
          Visibles : {visibleIds.length} · ordre : {order.join(", ")}
        </span>
        <ColumnManager
          columns={COLUMNS}
          visibleIds={visibleIds}
          order={order}
          onChange={({ visibleIds, order }) => {
            setVisible(visibleIds);
            setOrder(order);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Colonnes" }));
    await body.findByRole("dialog");

    await expect(body.getByRole("button", { name: "Réinitialiser" })).toHaveFocus();
    await expect(body.getAllByRole("checkbox")).toHaveLength(5);

    // Masquer « Sévérité » : la case se décoche, le compteur baisse.
    await userEvent.click(body.getByRole("checkbox", { name: /Sévérité/ }));
    await expect(canvas.getByText(/Visibles : 4/)).toBeInTheDocument();

    // Descendre « Ligne » : l'ordre change.
    await userEvent.click(body.getByRole("button", { name: "Descendre Ligne" }));
    await expect(canvas.getByText(/ordre : stop, line/)).toBeInTheDocument();

    // Réinitialiser.
    await userEvent.click(body.getByRole("button", { name: "Réinitialiser" }));
    await expect(canvas.getByText(/Visibles : 5/)).toBeInTheDocument();
    await expect(canvas.getByText(/ordre : line, stop/)).toBeInTheDocument();

    // Échap ferme et rend le focus au déclencheur.
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Colonnes" })).toHaveFocus();
  },
};
