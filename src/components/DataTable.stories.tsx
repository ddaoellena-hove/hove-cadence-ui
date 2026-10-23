import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";
import { GhostButton } from "./GhostButton";
import { Tooltip } from "./Tooltip";
import type { IconName } from "./Icons";
import { Pagination } from "./Pagination";
import { compareValues } from "./data-table-utils";
import { generateDisruptions, generateTrips, type Disruption, type Trip } from "../stories/data/transport";
import { DISRUPTION_COLUMNS, TRIP_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof DataTable<Trip>> = {
  title: "Components/DataTable",
  component: DataTable<Trip>,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: {
    "aria-label": "Courses de la journée",
    columns: TRIP_COLUMNS,
    getRowId: (t: Trip) => t.id,
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<Trip>>;

const TRIPS_50 = generateTrips(50);
const TRIPS_10K = generateTrips(10000);

/* ── Défaut ── */

/** 50 courses, tri non contrôlé (clic sur un en-tête). */
export const Defaut: Story = {
  name: "Défaut",
  args: { data: TRIPS_50, maxHeight: 480 },
};

/** Densité compacte : lignes de 36px. */
export const Compact: Story = {
  args: { data: TRIPS_50, density: "compact", maxHeight: 480 },
};

/* ── Sélection ── */

const SelectableTable = (args: Story["args"]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
        {selectedIds.length} course(s) sélectionnée(s)
      </span>
      <DataTable<Trip>
        aria-label="Courses de la journée"
        columns={TRIP_COLUMNS}
        getRowId={(t) => t.id}
        data={TRIPS_50}
        {...args}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
};

/** Cases à cocher, case d'en-tête à trois états, Maj+clic pour une plage. */
export const Selection: Story = {
  name: "Sélection",
  render: (args) => <SelectableTable {...args} maxHeight={480} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Instance partagée : la touche Maj maintenue persiste entre les actions
    const user = userEvent.setup();
    const rowBoxes = canvas.getAllByRole("checkbox", { name: /^Sélectionner course/ });
    const headerBox = canvas.getByRole("checkbox", { name: "Tout sélectionner" });

    // Une case, puis Maj+clic quatre lignes plus bas : plage de 4 lignes
    await user.click(rowBoxes[0]);
    await user.keyboard("{Shift>}");
    await user.click(rowBoxes[3]);
    await user.keyboard("{/Shift}");
    for (const box of rowBoxes.slice(0, 4)) await expect(box).toHaveAttribute("aria-checked", "true");
    await expect(rowBoxes[4]).toHaveAttribute("aria-checked", "false");
    await expect(headerBox).toHaveAttribute("aria-checked", "mixed");

    // L'en-tête indéterminé sélectionne tout, puis désélectionne tout
    await user.click(headerBox);
    await expect(headerBox).toHaveAttribute("aria-checked", "true");
    await user.click(headerBox);
    await expect(headerBox).toHaveAttribute("aria-checked", "false");
  },
};

/* ── Tri multiple ── */

/** Clic : asc → desc → aucun. Maj+clic : tri sur plusieurs colonnes (ordre affiché). */
export const TriMultiple: Story = {
  name: "Tri multiple",
  args: { data: TRIPS_50, maxHeight: 480 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const lineHeader = canvas.getByRole("columnheader", { name: /Ligne/ });
    const delayHeader = canvas.getByRole("columnheader", { name: /Retard/ });

    // Cycle simple sur « Ligne »
    await user.click(within(lineHeader).getByRole("button"));
    await expect(lineHeader).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(lineHeader).getByRole("button"));
    await expect(lineHeader).toHaveAttribute("aria-sort", "descending");

    // Maj+clic sur « Retard » : les deux colonnes restent triées
    await user.keyboard("{Shift>}");
    await user.click(within(delayHeader).getByRole("button"));
    await user.keyboard("{/Shift}");
    await expect(lineHeader).toHaveAttribute("aria-sort", "descending");
    await expect(delayHeader).toHaveAttribute("aria-sort", "ascending");

    // Clic simple sur « Ligne » : retour à un tri sur une seule colonne, puis aucun
    await user.click(within(lineHeader).getByRole("button"));
    await expect(lineHeader).toHaveAttribute("aria-sort", "none");
    await expect(delayHeader).toHaveAttribute("aria-sort", "none");
  },
};

/* ── États ── */

/** Chargement sans données : lignes squelettes, pas de spinner plein écran. */
export const Chargement: Story = {
  args: { data: [], loading: true, maxHeight: 480 },
};

/** Aucun résultat. */
export const Vide: Story = {
  args: { data: [], emptyState: "Aucune course ne correspond à ces filtres." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucune course ne correspond à ces filtres.")).toBeInTheDocument();
  },
};

/* ── 10 000 lignes virtualisées ── */

const VirtualTable = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
        {selectedIds.length} sélectionnée(s) · dernière ouverte : {opened ?? "—"}
      </span>
      <DataTable<Trip>
        aria-label="Courses de la journée"
        columns={TRIP_COLUMNS}
        data={TRIPS_10K}
        getRowId={(t) => t.id}
        density="compact"
        virtualized
        maxHeight={560}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(t) => setOpened(t.id)}
      />
    </div>
  );
};

/**
 * 10 000 courses, seules les lignes visibles sont montées. Flèches haut/bas,
 * Début/Fin et Page préc./suiv. naviguent entre les lignes ; Entrée ouvre,
 * Espace sélectionne.
 */
export const DixMilleLignes: Story = {
  name: "10 000 lignes virtualisées",
  render: () => <VirtualTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table");
    await expect(table).toHaveAttribute("aria-rowcount", "10001");
    // Seule une fraction des lignes est dans le DOM
    await expect(canvas.getAllByRole("row").length).toBeLessThan(80);
  },
};

/* ── Mode serveur ── */

const SERVER_DATA = generateDisruptions(12430);
const EMPTY: Disruption[] = [];

// Fausse API : tri et pagination « côté serveur », avec un délai réseau
const fetchDisruptions = (sort: DataTableSort[], page: number, pageSize: number) =>
  new Promise<{ items: Disruption[]; total: number }>((resolve) => {
    const sorted = [...SERVER_DATA].sort((a, b) => {
      for (const { id, desc } of sort) {
        const column = DISRUPTION_COLUMNS.find((c) => c.id === id);
        if (!column) continue;
        const result = compareValues(column.accessor(a), column.accessor(b));
        if (result !== 0) return desc ? -result : result;
      }
      return 0;
    });
    const items = sorted.slice((page - 1) * pageSize, page * pageSize);
    window.setTimeout(() => resolve({ items, total: SERVER_DATA.length }), 600);
  });

const ServerTable = () => {
  const [sort, setSort] = useState<DataTableSort[]>([{ id: "start", desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [result, setResult] = useState<{ items: Disruption[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDisruptions(sort, page, pageSize).then((response) => {
      if (cancelled) return;
      setResult(response);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sort, page, pageSize]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DataTable<Disruption>
        aria-label="Perturbations"
        columns={DISRUPTION_COLUMNS}
        data={result?.items ?? EMPTY}
        getRowId={(d) => d.id}
        manualSorting
        manualPagination
        sort={sort}
        onSortChange={(next) => {
          setLoading(true);
          setSort(next);
          setPage(1);
        }}
        loading={loading}
        maxHeight={480}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={result?.total ?? 0}
        onPageChange={(next) => {
          setLoading(true);
          setPage(next);
        }}
        onPageSizeChange={(size) => {
          setLoading(true);
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
};

/** Tri et pagination calculés par une API simulée (600 ms de latence). */
export const ModeServeur: Story = {
  name: "Mode serveur",
  render: () => <ServerTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("1–50 sur 12 430")).toBeInTheDocument(), { timeout: 3000 });
    await waitFor(() => expect(canvas.getByRole("table")).not.toHaveAttribute("aria-busy"), { timeout: 3000 });
  },
};

/* ── Accents (non-régression) ── */

interface AccentRow {
  id: string;
  stop: string;
  start: string;
  severity: string;
  event: string;
  letters: string;
}

const ACCENT_COLUMNS: DataTableColumn<AccentRow>[] = [
  { id: "stop", header: "Arrêt", accessor: (r) => r.stop, sortable: true },
  { id: "start", header: "Début", accessor: (r) => r.start, width: 150, sortable: true },
  { id: "severity", header: "Sévérité", accessor: (r) => r.severity, width: 150 },
  { id: "event", header: "Événement", accessor: (r) => r.event, minWidth: 160 },
  { id: "letters", header: "ÀÇÉÈÊÎÔÛ", accessor: (r) => r.letters, width: 150 },
];

const ACCENT_ROWS: AccentRow[] = [
  { id: "1", stop: "Châtelet", start: "19/10/2026", severity: "Critique", event: "Grève", letters: "Été" },
  { id: "2", stop: "Gare de Lyon", start: "20/10/2026", severity: "Ralenti", event: "Travaux", letters: "Île" },
];

/**
 * Les majuscules accentuées des en-têtes (« ARRÊT », « DÉBUT », « SÉVÉRITÉ »)
 * ne doivent pas être rognées, dans les deux densités.
 */
export const Accents: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["compact", "comfortable"] as const).map((density) => (
        <DataTable<AccentRow>
          key={density}
          aria-label={`En-têtes accentués (${density})`}
          columns={ACCENT_COLUMNS}
          data={ACCENT_ROWS}
          getRowId={(r) => r.id}
          density={density}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const labels = canvasElement.querySelectorAll<HTMLElement>(".data-table__label");
    await expect(labels.length).toBe(10);
    for (const label of labels) {
      const style = getComputedStyle(label);
      // Boîte de ligne assez haute pour les accents des capitales (≥ 1,3 × la taille)
      await expect(parseFloat(style.lineHeight)).toBeGreaterThanOrEqual(1.3 * parseFloat(style.fontSize));
    }
    // Hauteur de l'en-tête inchangée : 40px
    for (const row of canvasElement.querySelectorAll<HTMLElement>(".data-table__row--header")) {
      await expect(Math.round(row.getBoundingClientRect().height)).toBe(40);
    }
  },
};

/* ── Colonne d'actions (GhostButton + tooltip non clippé) ─────────────────── */

/**
 * Bouton d'action icône (GhostButton) avec un tooltip rendu dans un PORTAIL
 * (`createPortal` vers `document.body`, `position: fixed`, z-index élevé) :
 * il échappe à l'overflow du tableau et ne se fait donc pas clipper.
 */
function ActionButton({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: IconName;
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left + r.width / 2, top: r.top });
  };
  const hide = () => setPos(null);

  return (
    <span
      style={{ display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <GhostButton ref={ref} size="sm" icon={icon} aria-label={label} tone={tone} onClick={onClick} />
      {pos &&
        createPortal(
          <div
            role="presentation"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, calc(-100% - 8px))",
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            <Tooltip label={label} theme="dark" arrow="bottom" />
          </div>,
          document.body,
        )}
    </span>
  );
}

/** Rangée d'actions d'une ligne : dupliquer, modifier, supprimer. */
function RowActions({ row, onAction }: { row: Trip; onAction: (msg: string) => void }) {
  const name = `${row.line} → ${row.terminus}`;
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      <ActionButton icon="copy-01" label="Dupliquer" onClick={() => onAction(`Dupliquer : ${name}`)} />
      <ActionButton icon="edit-02" label="Modifier" onClick={() => onAction(`Modifier : ${name}`)} />
      <ActionButton icon="trash" label="Supprimer" tone="danger" onClick={() => onAction(`Supprimer : ${name}`)} />
    </div>
  );
}

/**
 * Colonne d'actions en fin de ligne (GhostButton). Le tooltip au survol est
 * rendu dans un portail : non clippé par l'overflow du tableau, au-dessus de
 * tout grâce au z-index. Tester le survol d'une action sur une ligne du bas.
 */
/* Colonne d'actions collée à droite (dernière cellule) + masquage du tooltip
   intégré de GhostButton (clippé) au profit du tooltip en portail. */
const STICKY_ACTIONS_CSS = `
.dt-sticky .data-table__row > *:last-child {
  position: sticky;
  right: 0;
  background: var(--cadence-color-white, #ffffff);
  z-index: 1;
  /* Ombre de séparation : la colonne se lit « au-dessus » du contenu qui
     défile dessous, au lieu de sembler masquer la colonne précédente. */
  box-shadow: -8px 0 8px -8px var(--cadence-color-scrollbar-thumb, rgba(0, 40, 48, 0.2));
}
.dt-sticky .data-table__body .data-table__row:hover > *:last-child {
  background: var(--cadence-color-surface-alt, #eef1f4);
}
.dt-sticky .data-table__row--selected > *:last-child {
  background: var(--cadence-color-accent-subtle, #f0f6ff);
}
.dt-sticky .data-table__row > *:last-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--cadence-color-border, #e5e5e5);
  pointer-events: none;
}
.dt-sticky .base-button-tip__bubble {
  display: none;
}
`;

export const ColonneActions: Story = {
  name: "Colonne d'actions",
  render: () => {
    const [last, setLast] = useState("—");
    const columns = useMemo<DataTableColumn<Trip>[]>(
      () => [
        ...TRIP_COLUMNS,
        {
          id: "actions",
          header: "Actions",
          accessor: () => "",
          width: 132,
          align: "right",
          cell: (row) => <RowActions row={row} onAction={setLast} />,
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
          data={TRIPS_50}
          maxHeight={360}
          className="dt-sticky"
        />
      </div>
    );
  },
};

/**
 * Conteneur étroit (800px) : le tableau déborde, la colonne d'actions reste
 * collée à droite et se détache par son ombre ; le reste défile dessous sans
 * être masqué. Tester le défilement horizontal.
 */
export const ColonneActionsEtroite: Story = {
  name: "Colonne d'actions (800px)",
  render: () => {
    const [last, setLast] = useState("—");
    const columns = useMemo<DataTableColumn<Trip>[]>(
      () => [
        ...TRIP_COLUMNS,
        { id: "actions", header: "Actions", accessor: () => "", width: 132, align: "right", cell: (row) => <RowActions row={row} onAction={setLast} /> },
      ],
      [],
    );
    return (
      <div style={{ width: 800, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <style>{STICKY_ACTIONS_CSS}</style>
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
          Dernière action : {last}
        </span>
        <DataTable<Trip>
          aria-label="Courses de la journée"
          columns={columns}
          getRowId={(t) => t.id}
          data={TRIPS_50}
          maxHeight={320}
          className="dt-sticky"
        />
      </div>
    );
  },
};
