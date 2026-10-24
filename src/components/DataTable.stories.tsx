import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";
import { GhostButton } from "./GhostButton";
import { LineBadge } from "./LineBadge";
import { Meter } from "./Meter";
import { Sparkline } from "./Sparkline";
import { Tooltip } from "./Tooltip";
import type { IconName } from "./Icons";
import { Pagination } from "./Pagination";
import { compareValues } from "./data-table-utils";
import { generateDisruptions, generateTrips, type Disruption, type Trip } from "../stories/data/transport";
import { DISRUPTION_COLUMNS, TRIP_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof DataTable<Trip>> = {
  title: "Composants/Données et tableaux/DataTable",
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
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
          Dernière action : {last}
        </span>
        <DataTable<Trip>
          aria-label="Courses de la journée"
          columns={columns}
          getRowId={(t) => t.id}
          data={TRIPS_50}
          maxHeight={360}
          stickyActions
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
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
          Dernière action : {last}
        </span>
        <DataTable<Trip>
          aria-label="Courses de la journée"
          columns={columns}
          getRowId={(t) => t.id}
          data={TRIPS_50}
          maxHeight={320}
          stickyActions
        />
      </div>
    );
  },
};

/* ── Mini-graphiques en cellule ── */

interface LineQuality {
  id: string;
  code: string;
  mode: "metro" | "bus" | "tram" | "rer";
  color: string;
  /** Ponctualité des 7 derniers jours (%), du plus ancien au plus récent. */
  punctuality: number[];
  /** Taux de charge à la pointe (%). */
  load: number;
  /** Taux de réalisation de l'offre (%). */
  offer: number;
  /** Kilomètres du jour : commerciaux, haut-le-pied, annulés. */
  km: [number, number, number];
}

const LINE_QUALITY: LineQuality[] = [
  { id: "m13", code: "13", mode: "metro", color: "#6ec4e8", punctuality: [93.1, 94.0, 92.4, 90.8, 93.5, 94.2, 95.0], load: 104, offer: 97.2, km: [1840, 120, 64] },
  { id: "m4", code: "4", mode: "metro", color: "#bb4d98", punctuality: [95.2, 95.8, 96.1, 95.4, 96.0, 96.4, 96.2], load: 86, offer: 99.1, km: [1520, 90, 12] },
  { id: "rera", code: "A", mode: "rer", color: "#e3051c", punctuality: [88.4, 87.1, 85.9, 89.2, 90.1, 88.7, 87.5], load: 112, offer: 95.4, km: [3210, 260, 180] },
  { id: "t3a", code: "T3a", mode: "tram", color: "#ff7e2e", punctuality: [96.8, 97.1, 96.5, 97.4, 97.0, 96.9, 97.6], load: 64, offer: 99.6, km: [720, 40, 4] },
  { id: "b91", code: "91", mode: "bus", color: "#82c8e6", punctuality: [82.5, 84.1, 80.9, 83.7, 85.2, 84.0, 86.3], load: 78, offer: 98.2, km: [640, 72, 22] },
];

const LOAD_THRESHOLDS = [
  { value: 80, label: "Charge élevée 80 %" },
  { value: 100, label: "Capacité 100 %" },
];

const QUALITY_COLUMNS: DataTableColumn<LineQuality>[] = [
  { id: "line", header: "Ligne", accessor: (r) => r.code, width: 80, cell: (r) => <LineBadge code={r.code} mode={r.mode} color={r.color} /> },
  { id: "punctuality", header: "Ponctualité", accessor: (r) => r.punctuality[r.punctuality.length - 1], align: "right", width: 132, cell: (r) => `${r.punctuality[r.punctuality.length - 1].toLocaleString("fr-FR")} %` },
  { id: "trend", header: "Tendance 7 j", accessor: (r) => r.punctuality[r.punctuality.length - 1] - r.punctuality[0], width: 136, cell: (r) => <Sparkline values={r.punctuality} unit="%" color={1} /> },
  {
    id: "load",
    header: "Charge à la pointe",
    accessor: (r) => r.load,
    width: 180,
    cell: (r) => <Meter size="sm" label={`Charge à la pointe, ligne ${r.code}`} value={r.load} unit="%" goodDirection="down" thresholds={LOAD_THRESHOLDS} />,
  },
  {
    id: "offer",
    header: "Réalisation de l'offre",
    accessor: (r) => r.offer,
    width: 180,
    cell: (r) => (
      <Meter
        size="sm"
        label={`Réalisation de l'offre, ligne ${r.code}`}
        value={r.offer}
        min={90}
        target={98.5}
        unit="%"
        thresholds={[
          { value: 97, label: "Malus sous 97 %" },
          { value: 98.5, label: "Bonus dès 98,5 %" },
        ]}
      />
    ),
  },
  {
    id: "km",
    header: "Kilomètres du jour",
    accessor: (r) => r.km[0] + r.km[1] + r.km[2],
    width: 200,
    cell: (r) => (
      <Meter
        size="sm"
        label={`Kilomètres du jour, ligne ${r.code}`}
        unit="km"
        segments={[
          { id: "commercial", label: "Commerciaux", value: r.km[0] },
          { id: "hlp", label: "Haut-le-pied", value: r.km[1] },
          { id: "annules", label: "Annulés", value: r.km[2] },
        ]}
      />
    ),
  },
];

/**
 * Mini-graphiques en cellule : `Sparkline` pour la tendance, `Meter size="sm"`
 * pour une valeur vs capacité (seuils), vs objectif (`target`, bullet
 * compact, échelle `min` 90 → 100 %) ou décomposée (`segments`). La valeur brute reste triable par
 * `accessor`.
 */
export const MiniGraphiques: Story = {
  name: "Mini-graphiques en cellule",
  render: () => (
    <DataTable<LineQuality>
      aria-label="Qualité de service par ligne"
      columns={QUALITY_COLUMNS}
      getRowId={(r) => r.id}
      data={LINE_QUALITY}
      defaultSort={[{ id: "load", desc: true }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Tri par charge décroissante : RER A (112 %) en tête, jugé défavorable
    const loads = canvas.getAllByRole("meter", { name: /^Charge à la pointe/ });
    await expect(loads[0]).toHaveAccessibleName("Charge à la pointe, ligne A");
    await expect(loads[0]).toHaveAttribute("aria-valuetext", "112 % — Défavorable — Capacité 100 %");
    // Objectif rappelé dans la valeur lue
    const offer = canvas.getByRole("meter", { name: "Réalisation de l'offre, ligne 13" });
    await expect(offer).toHaveAttribute("aria-valuetext", "97,2 % — objectif 98,5 % — Intermédiaire — Bonus dès 98,5 %");
    // Décomposition résumée pour les lecteurs d'écran
    await expect(canvas.getByRole("img", { name: "Kilomètres du jour, ligne 4" })).toHaveAccessibleDescription(/^Commerciaux : 1\s520\skm/);
  },
};
