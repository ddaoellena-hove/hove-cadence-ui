import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Sparkline } from "./Sparkline";
import { DataTable, type DataTableColumn } from "./DataTable";
import { LineBadge } from "./LineBadge";
import { formatValueWithUnit } from "./chart-format";
import { LINES } from "../stories/data/network";

const meta: Meta<typeof Sparkline> = {
  title: "Components/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

/** Retard moyen en hausse sur une semaine : nom accessible calculé. */
export const EnHausse: Story = {
  name: "En hausse",
  args: { values: [2.1, 2.4, 2.2, 3.1, 4.8, 3.6, 3.9], unit: "min" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img")).toHaveAccessibleName(/^Tendance en hausse : de 2,1\smin à 3,9\smin sur 7 points$/);
  },
};

export const EnBaisse: Story = {
  name: "En baisse",
  args: { values: [96.2, 95.8, 95.1, 94.9, 94.2], unit: "%" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img")).toHaveAccessibleName(/^Tendance en baisse/);
  },
};

export const Stable: Story = {
  args: { values: [12, 14, 11, 13, 12] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img")).toHaveAccessibleName(/^Tendance stable/);
  },
};

/** Couleurs de série dataviz (1 à 8), point final masqué. */
export const Series: Story = {
  name: "Couleurs de série",
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
        <Sparkline key={n} color={n} showLastPoint={false} values={[3, 5, 4, 6, 5 + n / 4, 7]} aria-label={`Série ${n}`} />
      ))}
    </div>
  ),
};

/** Moins de deux valeurs exploitables : rien n'est rendu. */
export const DonneesInsuffisantes: Story = {
  name: "Données insuffisantes",
  args: { values: [4, Number.NaN] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

/** Décorative : masquée aux lecteurs d'écran quand la valeur est écrite à côté. */
export const Decorative: Story = {
  name: "Décorative",
  args: { values: [4, 6, 5, 8], decorative: true },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(canvasElement.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
};

interface LineRow {
  id: string;
  line: (typeof LINES)[number];
  punctuality: number;
  week: number[];
}

const ROWS: LineRow[] = [
  { id: "1", line: LINES[0], punctuality: 97.4, week: [96.8, 97.1, 96.2, 97.5, 97.9, 97.6, 97.4] },
  { id: "4", line: LINES[1], punctuality: 93.1, week: [95.2, 94.8, 94.1, 92.6, 93.0, 92.8, 93.1] },
  { id: "rer-a", line: LINES[3], punctuality: 88.6, week: [90.4, 89.9, 84.2, 87.1, 88.0, 88.3, 88.6] },
];

const COLUMNS: DataTableColumn<LineRow>[] = [
  { id: "line", header: "Ligne", accessor: (r) => r.line.code, cell: (r) => <LineBadge code={r.line.code} mode={r.line.mode} color={r.line.color} textColor={r.line.textColor} />, width: 120 },
  { id: "punctuality", header: "Ponctualité", accessor: (r) => r.punctuality, numeric: true, cell: (r) => formatValueWithUnit(r.punctuality, "%"), width: 140 },
  {
    id: "trend",
    header: "7 derniers jours",
    accessor: (r) => r.week[r.week.length - 1] - r.week[0],
    cell: (r) => <Sparkline values={r.week} unit="%" color={1} />,
  },
];

/** Dans une cellule de DataTable : tendance de ponctualité par ligne. */
export const DansUnDataTable: Story = {
  name: "Dans un DataTable",
  render: () => <DataTable aria-label="Ponctualité par ligne" data={ROWS} columns={COLUMNS} getRowId={(r) => r.id} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("img", { name: /^Tendance/ })).toHaveLength(3);
  },
};
