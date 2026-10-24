import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ScatterChart } from "./ScatterChart";

const meta: Meta<typeof ScatterChart> = {
  title: "Composants/Visualisation de données/ScatterChart",
  component: ScatterChart,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScatterChart>;

// Une ligne de transport = un point : charge à la pointe (%) et retard moyen (min)
const metro = [
  { id: "m1", label: "Ligne 1", x: 92, y: 2.1 },
  { id: "m4", label: "Ligne 4", x: 86, y: 1.8 },
  { id: "m7", label: "Ligne 7", x: 78, y: 2.4 },
  { id: "m13", label: "Ligne 13", x: 112, y: 4.6 },
  { id: "m14", label: "Ligne 14", x: 98, y: 0.9 },
];
const bus = [
  { id: "b38", label: "Bus 38", x: 64, y: 3.2 },
  { id: "b91", label: "Bus 91", x: 88, y: 5.8 },
  { id: "b183", label: "Bus 183", x: 72, y: 6.4 },
  { id: "b21", label: "Bus 21", x: 54, y: 2.7 },
  { id: "b95", label: "Bus 95", x: 81, y: 4.1 },
];

const onPointClick = fn();

/** Charge vs retard, une série par mode, seuils délimitant le quadrant « chargé et en retard ». */
export const ChargeEtRetard: Story = {
  name: "Charge et retard par ligne",
  args: {
    title: "Charge à la pointe et retard moyen",
    description: "Une ligne par point, semaine 43",
    xAxis: { label: "Charge à la pointe", unit: "%", domain: [40, 120] },
    yAxis: { label: "Retard moyen", unit: "min" },
    series: [
      { id: "metro", label: "Métro", points: metro },
      { id: "bus", label: "Bus", points: bus },
    ],
    thresholds: [
      { axis: "x", value: 100, label: "Capacité 100 %" },
      { axis: "y", value: 5, label: "Seuil d'alerte 5 min" },
    ],
    onPointClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onPointClick.mockClear();
    const plot = canvas.getByRole("group", { name: "Charge à la pointe et retard moyen" });
    plot.focus();
    // Parcours de gauche à droite : le point le plus chargé en dernier
    await userEvent.keyboard("{End}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^Ligne 13 \(Métro\) : Charge à la pointe 112\s%, Retard moyen 4,6\smin$/);
    await userEvent.keyboard("{Enter}");
    await expect(onPointClick).toHaveBeenCalledWith(expect.objectContaining({ id: "m13" }), expect.objectContaining({ id: "metro" }));
    const table = canvas.getByRole("table", { name: "Charge à la pointe et retard moyen" });
    await expect(within(table).getAllByRole("row")).toHaveLength(11);
  },
};

/** Une seule série : distance vs temps de parcours, sans zéro sur l'axe des distances. */
export const DistanceEtTemps: Story = {
  name: "Distance et temps de parcours",
  args: {
    title: "Distance et temps de parcours des lignes de bus",
    xAxis: { label: "Longueur", unit: "km", includeZero: false },
    yAxis: { label: "Temps de parcours", unit: "min", includeZero: false },
    series: [
      {
        id: "bus",
        label: "Bus",
        points: Array.from({ length: 24 }, (_, i) => {
          const km = 6 + ((i * 7) % 17);
          return { id: `b${i}`, label: `Bus ${100 + i}`, x: km, y: Math.round(km * 3.2 + ((i * 13) % 9) - 4) };
        }),
      },
    ],
  },
};

/** États : chargement, vide, erreur. */
const emptyArgs = { title: "Charge et retard", series: [], xAxis: { label: "Charge" }, yAxis: { label: "Retard" } };

export const Chargement: Story = { args: { ...emptyArgs, state: "loading" } };

export const Vide: Story = { args: { ...emptyArgs, state: "empty" } };

export const Erreur: Story = { args: { ...emptyArgs, state: "error", onRetry: fn() } };
