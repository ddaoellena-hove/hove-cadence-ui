import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BulkActionBar } from "./BulkActionBar";
import { DataTable } from "./DataTable";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { Modal } from "./Modal";
import { generateTrips, type Trip } from "../stories/data/transport";
import { TRIP_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof BulkActionBar> = {
  title: "Composants/Données et tableaux/BulkActionBar",
  component: BulkActionBar,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof BulkActionBar>;

// Scénario qui coche et supprime des lignes : exécuté par Vitest seulement,
// pour que la démo reste au repos dans Storybook.
const testOnly = (play: NonNullable<Story["play"]>): Story["play"] =>
  import.meta.env.MODE === "test" ? play : undefined;

const courses = (n: number) =>
  n === 0 ? "Aucune course sélectionnée" : `${n} ${n > 1 ? "courses sélectionnées" : "course sélectionnée"}`;

/* ── Avec DataTable ── */

const TripsWithBulkActions = () => {
  const [trips, setTrips] = useState<Trip[]>(() => generateTrips(40));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const deleteSelected = () => {
    setTrips((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
    setSelectedIds([]);
    setConfirmOpen(false);
    // La barre disparaît avec la sélection : le focus revient sur le tableau
    requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLElement>('[role="checkbox"][aria-label="Tout sélectionner"]')?.focus(),
    );
  };

  return (
    // La barre est la sœur du tableau, dans le même conteneur : elle colle au
    // bas de la zone visible tant que ce conteneur défile.
    <div ref={listRef}>
      <DataTable<Trip>
        aria-label="Courses de la journée"
        columns={TRIP_COLUMNS}
        getRowId={(t) => t.id}
        data={trips}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      <BulkActionBar count={selectedIds.length} countLabel={courses}>
        <GhostButton size="sm" iconStart="download-02" label="Exporter" onClick={() => {}} />
        <GhostButton size="sm" iconStart="edit-02" label="Modifier le statut" onClick={() => {}} />
        <PrimaryButton size="sm" tone="danger" iconStart="trash" label="Supprimer" onClick={() => setConfirmOpen(true)} />
      </BulkActionBar>
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Supprimer ${courses(selectedIds.length).replace(/ sélectionnées?$/, "")} ?`}
        size="small"
        secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
        primaryAction={{ label: "Supprimer", destructive: true, onClick: deleteSelected }}
      >
        Cette action est irréversible.
      </Modal>
    </div>
  );
};

/**
 * Sélection dans un `DataTable` : la barre apparaît à la première case cochée,
 * colle au bas de la zone visible pendant le défilement et disparaît quand la
 * sélection est vide. Supprimer passe par une confirmation `Modal`.
 */
export const AvecDataTable: Story = {
  name: "Avec DataTable",
  render: () => <TripsWithBulkActions />,
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const status = canvas.getByRole("status");

    // Rien de sélectionné : pas de barre, région d'annonce déjà montée
    await expect(canvas.queryByRole("region", { name: "Actions groupées" })).not.toBeInTheDocument();
    await expect(status).toHaveTextContent("Aucune course sélectionnée");

    const rowBoxes = canvas.getAllByRole("checkbox", { name: /^Sélectionner course/ });
    await user.click(rowBoxes[0]);
    const bar = canvas.getByRole("region", { name: "Actions groupées" });
    await expect(status).toHaveTextContent("1 course sélectionnée");
    await user.click(rowBoxes[1]);
    await expect(status).toHaveTextContent("2 courses sélectionnées");
    await expect(within(bar).getByRole("button", { name: "Supprimer" })).toBeVisible();

    // Suppression confirmée : lignes retirées, barre masquée, focus sur le tableau
    await user.click(within(bar).getByRole("button", { name: "Supprimer" }));
    const dialog = await within(document.body).findByRole("dialog", { name: "Supprimer 2 courses ?" });
    await user.click(within(dialog).getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(canvas.queryByRole("region", { name: "Actions groupées" })).not.toBeInTheDocument());
    await expect(status).toHaveTextContent("Aucune course sélectionnée");
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Tout sélectionner" })).toHaveFocus());
    await expect(canvas.getAllByRole("checkbox", { name: /^Sélectionner course/ })).toHaveLength(38);
  }),
};

/* ── Libellé par défaut ── */

/** Compteur par défaut : accord au singulier et au pluriel, nombres formatés à la française. */
export const LibelleParDefaut: Story = {
  name: "Libellé par défaut",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <BulkActionBar count={1} aria-label="Actions groupées, un élément">
        <GhostButton size="sm" iconStart="download-02" label="Exporter" onClick={() => {}} />
      </BulkActionBar>
      <BulkActionBar count={1248} aria-label="Actions groupées, plusieurs éléments">
        <GhostButton size="sm" iconStart="download-02" label="Exporter" onClick={() => {}} />
        <PrimaryButton size="sm" tone="danger" iconStart="trash" label="Supprimer" onClick={() => {}} />
      </BulkActionBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [one, many] = within(canvasElement).getAllByRole("status");
    await expect(one).toHaveTextContent("1 élément sélectionné");
    // Séparateur des milliers : espace fine insécable (Intl fr-FR)
    await expect(many.textContent).toMatch(/^1\s248 éléments sélectionnés$/u);
  },
};

/** Largeur réduite : les actions passent à la ligne sous le compteur, sans débordement. */
export const LargeurReduite: Story = {
  name: "Largeur réduite",
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
  render: () => (
    <BulkActionBar count={12}>
      <GhostButton size="sm" iconStart="download-02" label="Exporter" onClick={() => {}} />
      <GhostButton size="sm" iconStart="edit-02" label="Modifier le statut" onClick={() => {}} />
      <PrimaryButton size="sm" tone="danger" iconStart="trash" label="Supprimer" onClick={() => {}} />
    </BulkActionBar>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("region", { name: "Actions groupées" });
    await expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth + 1);
  },
};
