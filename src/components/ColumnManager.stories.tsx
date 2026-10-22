import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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

/** Démo contrôlée : l'ordre transmis par onChange est affiché sous le bouton. */
function ReorderDemo() {
  const [visibleIds, setVisible] = useState(COLUMNS.map((c) => c.id));
  const [order, setOrder] = useState(COLUMNS.map((c) => c.id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span data-testid="order" style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13 }}>
        Ordre : {order.join(", ")} · visibles : {visibleIds.length}
      </span>
      <ColumnManager
        columns={COLUMNS}
        visibleIds={visibleIds}
        order={order}
        onChange={(next) => {
          setVisible(next.visibleIds);
          setOrder(next.order);
        }}
      />
    </div>
  );
}

const pointer = (type: string, target: Element, clientY: number) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0, isPrimary: true, clientY }));

const rowMiddle = (row: Element) => {
  const r = row.getBoundingClientRect();
  return r.top + r.height / 2;
};

/**
 * Glisser-déposer : saisir la poignée, repère de dépôt pendant le
 * déplacement, nouvel ordre transmis au relâchement. La visibilité reste
 * indépendante.
 */
export const GlisserDeposer: Story = {
  name: "Glisser-déposer",
  render: () => <ReorderDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Colonnes" }));
    const dialog = await body.findByRole("dialog");
    const rows = () => Array.from(dialog.querySelectorAll(".column-manager__row"));

    // « Ligne » glissée sous « Sévérité » (3e ligne).
    const handle = body.getByRole("button", { name: "Déplacer Ligne" });
    pointer("pointerdown", handle, rowMiddle(rows()[0]));
    await waitFor(() => expect(rows()[0]).toHaveClass("column-manager__row--dragging"));
    pointer("pointermove", handle, rowMiddle(rows()[2]) + 6);
    await waitFor(() => expect(rows()[3]).toHaveClass("column-manager__row--drop-before"));
    pointer("pointerup", handle, rowMiddle(rows()[2]) + 6);
    await waitFor(() => expect(canvas.getByTestId("order")).toHaveTextContent("Ordre : stop, severity, line, start, impacted"));
    await expect(dialog.querySelector(".column-manager__row--drop-before, .column-manager__row--dragging")).toBeNull();

    // Jusqu'en bas : repère sous la dernière ligne.
    const startHandle = body.getByRole("button", { name: "Déplacer Début" });
    pointer("pointerdown", startHandle, rowMiddle(rows()[3]));
    await waitFor(() => expect(rows()[3]).toHaveClass("column-manager__row--dragging"));
    pointer("pointermove", startHandle, rows()[4].getBoundingClientRect().bottom + 4);
    await waitFor(() => expect(rows()[4]).toHaveClass("column-manager__row--drop-after"));
    pointer("pointerup", startHandle, rows()[4].getBoundingClientRect().bottom + 4);
    await waitFor(() => expect(canvas.getByTestId("order")).toHaveTextContent("Ordre : stop, severity, line, impacted, start"));

    // La visibilité reste pilotée par les cases.
    await userEvent.click(body.getByRole("checkbox", { name: /Arrêts impactés/ }));
    await expect(canvas.getByTestId("order")).toHaveTextContent("visibles : 4");
  },
};

/** Clavier : ↑ / ↓ sur la poignée déplacent la colonne, position annoncée, focus conservé. */
export const ReordonnerAuClavier: Story = {
  name: "Réordonner au clavier",
  render: () => <ReorderDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Colonnes" }));
    const dialog = await body.findByRole("dialog");
    const handle = body.getByRole("button", { name: "Déplacer Sévérité" });
    await expect(handle).toHaveAccessibleDescription(/flèches haut et bas/);
    handle.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByTestId("order")).toHaveTextContent("Ordre : line, severity, stop, start, impacted");
    await expect(within(dialog).getByRole("status")).toHaveTextContent("Sévérité déplacée en position 2 sur 5");
    await waitFor(() => expect(body.getByRole("button", { name: "Déplacer Sévérité" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByTestId("order")).toHaveTextContent("Ordre : line, stop, start, severity, impacted");
  },
};
