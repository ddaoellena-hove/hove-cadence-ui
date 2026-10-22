import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ActionMenu, type ActionMenuItem } from "./ActionMenu";
import { TableCard } from "./TableCard";
import { Modal } from "./Modal";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Badge } from "./Badge";
import { generateTrips, type Trip } from "../stories/data/transport";
import { TRIP_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof ActionMenu> = {
  title: "Components/ActionMenu",
  component: ActionMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

const TRIPS = generateTrips(12);

/** Actions d'un élément de liste : dupliquer, modifier, puis supprimer (danger). */
function useTripActions(onInfo: (msg: string) => void, onDelete: () => void): ActionMenuItem[] {
  return useMemo(
    () => [
      { id: "dup", label: "Dupliquer", icon: "copy-01", onSelect: () => onInfo("Dupliqué") },
      { id: "edit", label: "Modifier", icon: "edit-02", onSelect: () => onInfo("Modifié") },
      { id: "export", label: "Exporter", icon: "download-02", onSelect: () => onInfo("Exporté") },
      { id: "del", label: "Supprimer", icon: "trash", tone: "danger", divider: true, onSelect: onDelete },
    ],
    [onInfo, onDelete],
  );
}

/* ── Dans une TableCard, avec confirmation de suppression ── */

function TableCardDemo() {
  const [last, setLast] = useState("—");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const items = useTripActions(setLast, () => setConfirmOpen(true));

  return (
    <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
        Dernière action : {last}
      </span>
      <TableCard
        title="Ligne 13 → Châtelet"
        icon="route"
        actions={<ActionMenu items={items} />}
        columns={[
          { key: "mode", content: <Badge label="Métro" />, flex: 1 },
          { key: "id", content: <Badge label="course-00007" mono />, width: 140 },
        ]}
      />

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Supprimer la course"
        size="small"
        primaryAction={{
          label: "Supprimer",
          destructive: true,
          onClick: () => {
            setLast("Supprimé");
            setConfirmOpen(false);
          },
        }}
        secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
      >
        Cette action est définitive. La course et ses données seront supprimées.
      </Modal>
    </div>
  );
}

/**
 * Menu d'actions dans le slot `actions` d'une TableCard. L'action destructive
 * « Supprimer » ouvre une confirmation (Modal) avant d'agir.
 */
export const DansUneTableCard: Story = {
  name: "Dans une TableCard",
  render: () => <TableCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Plus d'actions" });

    // Ouverture : le menu apparaît et le 1er item prend le focus.
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    await expect(menu).toBeInTheDocument();
    const items = body.getAllByRole("menuitem");
    await expect(items[0]).toHaveFocus();

    // Flèche bas : focus sur l'item suivant.
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[1]).toHaveFocus();

    // Échap : ferme et rend le focus au déclencheur.
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/* ── Dans la colonne d'actions d'un DataTable (collée à droite) ── */

const STICKY_ACTIONS_CSS = `
.am-sticky .data-table__row > *:last-child {
  position: sticky;
  right: 0;
  background: var(--cadence-color-white, #ffffff);
  z-index: 1;
}
.am-sticky .data-table__body .data-table__row:hover > *:last-child {
  background: var(--cadence-color-surface-alt, #eef1f4);
}
.am-sticky .data-table__row > *:last-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--cadence-color-border, #e5e5e5);
  pointer-events: none;
}
`;

function DataTableDemo() {
  const [last, setLast] = useState("—");
  const columns = useMemo<DataTableColumn<Trip>[]>(
    () => [
      ...TRIP_COLUMNS,
      {
        id: "actions",
        header: "Actions",
        accessor: () => "",
        width: 64,
        align: "right",
        cell: (row) => (
          <ActionMenu
            label={`Actions pour ${row.line} → ${row.terminus}`}
            items={[
              { id: "dup", label: "Dupliquer", icon: "copy-01", onSelect: () => setLast(`Dupliquer ${row.line}`) },
              { id: "edit", label: "Modifier", icon: "edit-02", onSelect: () => setLast(`Modifier ${row.line}`) },
              { id: "del", label: "Supprimer", icon: "trash", tone: "danger", divider: true, onSelect: () => setLast(`Supprimer ${row.line}`) },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{STICKY_ACTIONS_CSS}</style>
      <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
        Dernière action : {last}
      </span>
      <DataTable<Trip>
        aria-label="Courses de la journée"
        columns={columns}
        getRowId={(t) => t.id}
        data={TRIPS}
        maxHeight={320}
        className="am-sticky"
      />
    </div>
  );
}

/**
 * Menu d'actions dans la colonne collée à droite d'un DataTable. Rendu dans un
 * portail : il n'est pas rogné par l'overflow du tableau et passe au-dessus.
 */
export const DansUnDataTable: Story = {
  name: "Dans un DataTable",
  render: () => <DataTableDemo />,
};

export const ClavierEtDialogue: Story = {
  render: () => <TableCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Plus d'actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");
    const remove = await body.findByRole("menuitem", { name: "Supprimer" });
    await expect(remove).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await body.findByRole("dialog", { name: "Supprimer la course" });
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const ToutesDesactivees: Story = {
  args: { items: [{ id: "locked", label: "Indisponible", disabled: true, onSelect: () => { throw new Error("Action désactivée exécutée"); } }] },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Plus d'actions" }));
    const menu = await body.findByRole("menu");
    await expect(menu).toHaveFocus();
    await userEvent.keyboard("{Enter}{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  },
};
