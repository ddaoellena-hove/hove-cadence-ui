import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BoxPlot } from "./BoxPlot";

const meta: Meta<typeof BoxPlot> = {
  title: "Composants/Visualisation de données/BoxPlot",
  component: BoxPlot,
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
type Story = StoryObj<typeof BoxPlot>;

// Générateur pseudo-aléatoire déterministe : mêmes données à chaque rendu
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** Temps de parcours (min) : centre, dispersion, quelques courses très lentes. */
const travelTimes = (seed: number, centerMin: number, spread: number, slow: number[] = []) => {
  const random = seeded(seed);
  return [
    ...Array.from({ length: 80 }, () => Math.round((centerMin + (random() + random() + random() - 1.5) * spread) * 10) / 10),
    ...slow,
  ];
};

/** Temps de parcours par ligne, avec le temps prévu. */
export const TempsDeParcours: Story = {
  name: "Temps de parcours par ligne",
  args: {
    title: "Temps de parcours terminus à terminus",
    description: "Courses du 14 au 20 octobre 2026",
    unit: "min",
    countLabel: "courses",
    groups: [
      { id: "m13", label: "Ligne 13", values: travelTimes(1, 31, 3, [44, 47]) },
      { id: "m4", label: "Ligne 4", values: travelTimes(2, 27, 2) },
      { id: "t3a", label: "T3a", values: travelTimes(3, 48, 5, [66]) },
      { id: "b91", label: "Bus 91", values: travelTimes(4, 38, 7, [62, 65, 71]) },
    ],
    thresholds: [{ value: 35, label: "Objectif 35 min" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Temps de parcours terminus à terminus" });
    await userEvent.click(plot);
    await userEvent.keyboard("{End}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^Bus 91 : médiane .*\smin, moitié centrale de .*, 3 valeurs aberrantes, 83 courses$/);
    const table = canvas.getByRole("table", { name: "Temps de parcours terminus à terminus" });
    await expect(within(table).getByRole("columnheader", { name: "Médiane (min)" })).toBeInTheDocument();
    await expect(within(table).getAllByRole("row")).toHaveLength(5);
  },
};

/** Par créneau horaire : la pointe allonge et disperse les temps. */
export const ParCreneau: Story = {
  name: "Par créneau horaire",
  args: {
    title: "Temps de parcours de la ligne 13 par créneau",
    unit: "min",
    countLabel: "courses",
    groups: ["06 h", "07 h", "08 h", "09 h", "10 h", "12 h", "17 h", "18 h", "19 h"].map((label, i) => ({
      id: label,
      label,
      values: travelTimes(10 + i, [1, 2, 7, 8].includes(i) || i === 6 ? 34 : 29, [2, 7, 8].includes(i) ? 5 : 2),
    })),
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Temps de parcours", groups: [], state: "loading" } };

export const Vide: Story = { args: { title: "Temps de parcours", groups: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Temps de parcours", groups: [], state: "error", onRetry: fn() } };
