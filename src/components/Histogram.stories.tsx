import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Histogram } from "./Histogram";

const meta: Meta<typeof Histogram> = {
  title: "Composants/Visualisation de données/Histogram",
  component: Histogram,
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
type Story = StoryObj<typeof Histogram>;

// Générateur pseudo-aléatoire déterministe : mêmes données à chaque rendu
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** Retards à l'arrivée (min) : majorité à l'heure, longue traîne. */
const arrivalDelays = (() => {
  const random = seeded(42);
  return Array.from({ length: 480 }, () => {
    const r = random();
    // Exponentielle décalée : quelques avances, beaucoup de petits retards, une traîne
    return Math.round((-Math.log(1 - r) * 2.6 - 1) * 10) / 10;
  });
})();

/** Intervalles entre passages (min) autour de 6 min, cible de régularité. */
const headways = (() => {
  const random = seeded(7);
  return Array.from({ length: 220 }, () => {
    const gauss = (random() + random() + random() + random() - 2) * 1.8;
    return Math.max(0.5, Math.round((6 + gauss) * 10) / 10);
  });
})();

/** Distribution des retards : classes métier imposées (avances dans « moins de 1 min »), seuil « Retard 5 min ». */
export const DistributionDesRetards: Story = {
  name: "Distribution des retards",
  args: {
    title: "Distribution des retards à l'arrivée",
    description: "Ligne 13, du 14 au 20 octobre 2026",
    values: arrivalDelays,
    bins: [0, 1, 2, 3, 5, 10],
    unit: "min",
    countLabel: "courses",
    thresholds: [{ value: 5, label: "Retard 5 min" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Distribution des retards à l'arrivée" });
    await expect(plot).toHaveAccessibleDescription(/480 courses, médiane .*\smin, classe la plus fournie/);

    // Clavier : la première classe s'active au focus, ←/→ et Fin parcourent les classes
    await userEvent.tab();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    await expect(canvas.getByText(/^Moins de 1\smin : \d+ courses/)).toBeInTheDocument();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByText(/^5\smin et plus : \d+ courses/)).toBeInTheDocument();

    // Alternative tabulaire : 5 classes
    const table = canvas.getByRole("table", { name: "Distribution des retards à l'arrivée" });
    await expect(within(table).getAllByRole("row")).toHaveLength(6);
  },
};

/** Intervalles entre passages : classes automatiques, objectif de régularité. */
export const IntervallesEntrePassages: Story = {
  name: "Intervalles entre passages",
  args: {
    title: "Intervalles entre passages",
    description: "Métro ligne 4, heure de pointe du matin",
    values: headways,
    bins: 12,
    unit: "min",
    countLabel: "passages",
    thresholds: [{ value: 6, label: "Intervalle prévu 6 min" }],
    annotations: [{ at: [5.5, 6.5], label: "Tolérance ±30 s" }],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Tolérance ±30 s")).toBeInTheDocument();
    await expect(canvasElement.querySelector(".histogram__annotation-band")).not.toBeNull();
  },
};

/** Heures de service : derniers départs, classes alignées sur l'horloge au-delà de minuit. */
export const DerniersDeparts: Story = {
  name: "Derniers départs (heures de service)",
  args: {
    title: "Heure des derniers départs",
    description: "Toutes lignes de bus, jour ouvré type — en heures de service",
    values: (() => {
      const random = seeded(11);
      // Derniers départs entre 22h00 et 25h30 (minutes depuis 00:00 du jour de service)
      return Array.from({ length: 140 }, () => Math.round(1320 + Math.pow(random(), 0.8) * 210));
    })(),
    bins: 7,
    serviceTime: true,
    countLabel: "lignes",
    thresholds: [{ value: 1440, label: "Minuit" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Heure des derniers départs" });
    await expect(within(table).getAllByRole("rowheader")[0]).toHaveTextContent(/^De 22h00 à 22h30$/);
    await expect(canvas.getByRole("group", { name: "Heure des derniers départs" })).toHaveAccessibleDescription(/140 lignes, médiane \d{2}h\d{2}/);
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Distribution des retards", values: [], state: "loading" } };

export const Vide: Story = { args: { title: "Distribution des retards", values: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Distribution des retards", values: [], state: "error", onRetry: fn() } };
