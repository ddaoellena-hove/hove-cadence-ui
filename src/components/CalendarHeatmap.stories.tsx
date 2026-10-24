import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CalendarHeatmap } from "./CalendarHeatmap";

const meta: Meta<typeof CalendarHeatmap> = {
  title: "Composants/Visualisation de données/CalendarHeatmap",
  component: CalendarHeatmap,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1000, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CalendarHeatmap>;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Ponctualité quotidienne 2026, déterministe : creux les jours de grève, pas de donnée en août (fermeture estivale)
const STRIKES = ["2026-03-19", "2026-06-11", "2026-10-16"];
const punctuality2026 = (() => {
  const days: { date: string; value: number | null }[] = [];
  for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026 && d <= new Date(2026, 9, 24); d.setDate(d.getDate() + 1)) {
    const key = iso(d);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const base = 93 + Math.sin(d.getDate() / 3 + d.getMonth()) * 2 + (weekend ? 2 : 0);
    days.push({ date: key, value: d.getMonth() === 7 && d.getDate() < 16 ? null : STRIKES.includes(key) ? 78 : Math.round(base * 10) / 10 });
  }
  return days;
})();

const onDayClick = fn();

/** Ponctualité quotidienne sur l'année : grèves annotées, données manquantes hachurées. */
export const PonctualiteAnnuelle: Story = {
  name: "Ponctualité annuelle",
  args: {
    title: "Ponctualité quotidienne 2026",
    description: "Réseau bus, du 1er janvier au 24 octobre",
    unit: "%",
    domain: [75, 100],
    values: punctuality2026,
    annotations: STRIKES.map((date) => ({ date, label: "Grève" })),
    onDayClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onDayClick.mockClear();
    const grid = canvas.getByRole("grid", { name: "Ponctualité quotidienne 2026" });
    // Jour annoté : valeur et événement dans le nom
    const strike = within(grid).getByRole("gridcell", { name: /^vendredi 16 octobre 2026 : 78\s%\. Grève$/ });
    await userEvent.click(strike);
    await expect(onDayClick).toHaveBeenCalledWith(expect.objectContaining({ key: "2026-10-16", value: 78 }));
    // Clavier : flèche gauche = même jour, semaine précédente
    await userEvent.keyboard("{ArrowLeft}");
    await expect(within(grid).getByRole("gridcell", { name: /^vendredi 9 octobre 2026/ })).toHaveFocus();
    // Données manquantes
    await expect(within(grid).getByRole("gridcell", { name: "lundi 3 août 2026 : pas de donnée" })).toBeInTheDocument();
  },
};

/** Un trimestre : cases plus grandes, période imposée. */
export const Trimestre: Story = {
  args: {
    title: "Perturbations par jour, T3 2026",
    unit: "perturbations",
    range: ["2026-07-01", "2026-09-30"],
    values: Array.from({ length: 92 }, (_, i) => {
      const d = new Date(2026, 6, 1 + i);
      return { date: iso(d), value: (i * 7) % 11 };
    }),
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Ponctualité quotidienne", values: [], state: "loading" } };

export const Vide: Story = { args: { title: "Ponctualité quotidienne", values: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Ponctualité quotidienne", values: [], state: "error", onRetry: fn() } };
