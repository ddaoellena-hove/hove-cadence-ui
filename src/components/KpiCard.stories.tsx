import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { KpiCard } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  title: "Components/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Courses réalisées",
    value: 12430,
    delta: { value: 1.8, label: "vs semaine dernière" },
  },
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

/** Valeur formatée en fr-FR et hausse favorable (sens par défaut : « up »). */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("12 430")).toBeInTheDocument();
    await expect(canvas.getByText("en hausse de 1,8 % vs semaine dernière, favorable")).toBeInTheDocument();
  },
};

/** Retard moyen : une baisse est favorable (`goodDirection="down"`). */
export const BaisseFavorable: Story = {
  name: "Baisse favorable",
  args: {
    label: "Retard moyen",
    value: 3.4,
    unit: "min",
    delta: { value: -12, label: "vs hier" },
    goodDirection: "down",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("−12 %")).toBeInTheDocument();
    await expect(canvas.getByText("en baisse de 12 % vs hier, favorable")).toBeInTheDocument();
  },
};

/** Seuil dépassé : statut sémantique avec un Indicator, hausse défavorable. */
export const AvecStatut: Story = {
  name: "Avec statut",
  args: {
    label: "Perturbations actives",
    value: 27,
    status: "critical",
    statusLabel: "Seuil dépassé",
    goodDirection: "down",
    delta: { value: 35, label: "vs hier" },
    description: "Seuil d'alerte : 20 perturbations",
  },
};

/** Mini-courbe des 7 derniers jours. */
export const AvecCourbe: Story = {
  name: "Avec courbe",
  args: {
    label: "Ponctualité",
    value: 94.2,
    unit: "%",
    delta: { value: -0.6, unit: "pt", label: "vs hier" },
    trend: [95.1, 94.8, 95.4, 95.0, 94.6, 94.8, 94.2],
  },
};

const onOpen = fn();

/** Carte cliquable : toute la surface ouvre la liste détaillée. */
export const Cliquable: Story = {
  args: {
    label: "Courses supprimées",
    value: 42,
    goodDirection: "down",
    delta: { value: -8, label: "vs hier" },
    onClick: onOpen,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onOpen.mockClear();
    // Au-dessus de la valeur (hors du libellé), c'est la zone étirée du bouton
    // qui reçoit le pointeur : toute la carte est cliquable
    const rect = canvas.getByText("42").getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await expect(hit?.closest("button")).toBe(canvas.getByRole("button", { name: "Courses supprimées" }));
    await userEvent.click(hit as Element);
    await expect(onOpen).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", { name: "Courses supprimées" })).toBeInTheDocument();
  },
};

/** Chargement : squelettes à la place de la valeur et de la variation. */
export const Chargement: Story = {
  args: { loading: true },
};

/** Grille de 4 indicateurs, comme en haut d'un tableau de bord. */
export const Grille: Story = {
  name: "Grille de 4",
  decorators: [
    (Story) => (
      <div style={{ width: 1080 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      <KpiCard label="Courses réalisées" value={12430} delta={{ value: 1.8, label: "vs semaine dernière" }} />
      <KpiCard
        label="Ponctualité"
        value={94.2}
        unit="%"
        delta={{ value: -0.6, unit: "pt", label: "vs hier" }}
        trend={[95.1, 94.8, 95.4, 95.0, 94.6, 94.8, 94.2]}
      />
      <KpiCard
        label="Retard moyen"
        value={3.4}
        unit="min"
        goodDirection="down"
        delta={{ value: -12, label: "vs hier" }}
        trend={[4.1, 3.9, 4.4, 3.8, 3.6, 3.4]}
      />
      <KpiCard
        label="Perturbations actives"
        value={27}
        status="critical"
        statusLabel="Seuil dépassé"
        goodDirection="down"
        delta={{ value: 35, label: "vs hier" }}
      />
    </div>
  ),
};
