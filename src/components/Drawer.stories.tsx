import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Drawer } from "./Drawer";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Indicator } from "./Indicator";
import { Badge } from "./Badge";
import { PrimaryButton } from "./PrimaryButton";
import { SEVERITY_LABELS, generateDisruptions, type Disruption } from "../stories/data/transport";
import { DISRUPTION_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const DISRUPTIONS = generateDisruptions(20);

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

/** Détail d'une perturbation ouvert depuis une ligne de DataTable. */
function DrawerDemo() {
  const [selected, setSelected] = useState<Disruption | null>(null);
  const columns = useMemo<DataTableColumn<Disruption>[]>(() => DISRUPTION_COLUMNS, []);

  return (
    <div style={{ padding: 24, minHeight: 480 }}>
      <DataTable<Disruption>
        aria-label="Perturbations"
        columns={columns}
        getRowId={(d) => d.id}
        data={DISRUPTIONS}
        maxHeight={400}
        onRowClick={setSelected}
      />

      <Drawer
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        subtitle={selected ? `Ligne ${selected.line}` : undefined}
        primaryAction={{ label: "Modifier la perturbation", onClick: () => setSelected(null) }}
        secondaryAction={{ label: "Fermer", onClick: () => setSelected(null) }}
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Indicator variant={selected.severity} label={SEVERITY_LABELS[selected.severity]} />
              <Badge label={selected.cause} />
            </div>
            <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", margin: 0, fontSize: 13 }}>
              <dt style={{ color: "var(--cadence-color-text-muted)" }}>Ligne</dt>
              <dd style={{ margin: 0 }}>{selected.line}</dd>
              <dt style={{ color: "var(--cadence-color-text-muted)" }}>Arrêts impactés</dt>
              <dd style={{ margin: 0 }}>{selected.impactedStops}</dd>
              <dt style={{ color: "var(--cadence-color-text-muted)" }}>Début</dt>
              <dd style={{ margin: 0 }}>{dateFormat.format(selected.start)}</dd>
            </dl>
            <p style={{ color: "var(--cadence-color-text-muted)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Consultez le détail de la perturbation sans quitter la liste. Les actions de modification restent
              accessibles dans le pied du panneau.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/**
 * Cliquer une ligne ouvre le panneau de détail à droite ; Échap, le voile, le
 * bouton fermer ou « Fermer » le referment. Le focus est piégé dans le panneau
 * et revient à la liste à la fermeture.
 */
export const Defaut: Story = {
  name: "Détail depuis un DataTable",
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Ouvre le détail de la première ligne au clavier.
    const firstRow = canvas.getAllByRole("row")[1];
    firstRow.focus();
    await expect(firstRow).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const dialog = await body.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    // Le focus est entré dans le panneau.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Piège à focus : plusieurs Tab restent dans le panneau.
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    // Échap ferme le panneau.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** Panneau large (720px) en lecture seule, sans pied. */
function WideDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24, minHeight: 320 }}>
      <PrimaryButton label="Ouvrir le journal" onClick={() => setOpen(true)} />
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Journal des modifications" width="lg">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
          <li>09:12 — Perturbation créée par M. Dupont</li>
          <li>09:40 — Sévérité passée de « Information » à « Ralenti »</li>
          <li>10:05 — 3 arrêts supplémentaires impactés</li>
        </ul>
      </Drawer>
    </div>
  );
}

export const Large: Story = {
  name: "Large (lg, sans pied)",
  render: () => <WideDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const opener = canvas.getByRole("button", { name: "Ouvrir le journal" });

    // Ouverture : le focus entre dans le panneau.
    await userEvent.click(opener);
    const dialog = await body.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Échap rend le focus au bouton déclencheur (dès la fermeture).
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
  },
};
