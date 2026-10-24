import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Composants/Structure et mise en page/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Courses réalisées",
    value: 12430,
    delta: { value: 1.8, label: "vs semaine dernière" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/** Illustration de démonstration (SVG inline, couleurs par tokens). */
const Illustration = () => (
  <svg width="112" height="88" viewBox="0 0 112 88" fill="none">
    <circle cx="84" cy="74" r="52" fill="var(--cadence-color-accent-subtle, #f0f6ff)" />
    <rect x="44" y="34" width="52" height="40" rx="6" fill="var(--cadence-color-white, #ffffff)" stroke="var(--cadence-color-border, #e5e5e5)" />
    <path d="M52 62l10-12 8 8 6-6 12 10" stroke="var(--cadence-color-accent, #1b6cff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="80" cy="44" r="4" fill="var(--cadence-color-accent, #1b6cff)" />
  </svg>
);

// ── Indicateurs chiffrés ──────────────────────────────────────────────────────

/** Valeur formatée en fr-FR et hausse favorable (sens par défaut : « up »). */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 3, name: "Courses réalisées" })).toBeInTheDocument();
    await expect(canvas.getByText("12 430")).toBeInTheDocument();
    await expect(canvas.getByText("en hausse de 1,8 % vs semaine dernière, favorable")).toBeInTheDocument();
    // Carte informative : pas d'effet de survol
    await expect(canvasElement.querySelector(".card")).not.toHaveClass("card--interactive");
  },
};

/** Retard moyen : une baisse est favorable (`goodDirection="down"`). */
export const BaisseFavorable: Story = {
  name: "Baisse favorable",
  args: {
    title: "Retard moyen",
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
    title: "Perturbations actives",
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
    title: "Ponctualité",
    value: 94.2,
    unit: "%",
    delta: { value: -0.6, unit: "pt", label: "vs hier" },
    trend: [95.1, 94.8, 95.4, 95.0, 94.6, 94.8, 94.2],
  },
};

const onOpen = fn();

/**
 * Toute la carte est cliquable (`onClick`) : elle se soulève au survol. Le
 * bouton visible (`actionLabel`, obligatoire) signale l'interactivité ; sa
 * zone est étirée sur toute la carte.
 */
export const Cliquable: Story = {
  args: {
    title: "Courses supprimées",
    value: 42,
    goodDirection: "down",
    delta: { value: -8, label: "vs hier" },
    onClick: onOpen,
    actionLabel: "Voir les courses",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onOpen.mockClear();
    await expect(canvasElement.querySelector(".card")).toHaveClass("card--interactive");
    // Un seul bouton visible, seule cible au clavier
    const button = canvas.getByRole("button", { name: "Voir les courses" });
    await expect(canvas.getAllByRole("button")).toHaveLength(1);
    // Au-dessus de la valeur, c'est la zone étirée du bouton qui reçoit le
    // pointeur : toute la carte est cliquable
    const rect = canvas.getByText("42").getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await expect(hit?.closest("button")).toBe(button);
    await userEvent.click(hit as Element);
    await expect(onOpen).toHaveBeenCalledTimes(1);
  },
};

/** Chargement : squelettes à la place de la valeur et de la variation. */
export const Chargement: Story = {
  args: { loading: true },
};

// ── Cartes d'action ───────────────────────────────────────────────────────────

const onImport = fn();

/** Titre, description et bouton : seul le bouton est cliquable. */
export const Action: Story = {
  args: {
    title: "Importer un réseau GTFS",
    value: undefined,
    delta: undefined,
    description: "Chargez les horaires théoriques d'un réseau pour préparer vos scénarios de perturbation.",
    actionLabel: "Importer",
    actionIcon: "download-02",
    onAction: onImport,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onImport.mockClear();
    await expect(canvasElement.querySelector(".card")).toHaveClass("card--interactive");
    // Un clic sur le texte ne fait rien : seul le bouton déclenche l'action
    await userEvent.click(canvas.getByText(/Chargez les horaires/));
    await expect(onImport).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Importer" }));
    await expect(onImport).toHaveBeenCalledTimes(1);
  },
};

/** Illustration décorative en bas à droite, collée au coin. */
export const AvecIllustration: Story = {
  name: "Avec illustration",
  args: { ...Action.args, illustration: <Illustration /> },
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector(".card__illustration");
    await expect(wrapper).toHaveAttribute("aria-hidden", "true");
  },
};

/** Indicateur et action dans la même carte. */
export const IndicateurEtAction: Story = {
  name: "Indicateur et action",
  args: {
    title: "Jeux de données publiés",
    value: 4,
    delta: { value: 1, unit: "", label: "vs semaine précédente" },
    actionLabel: "Publier",
    actionIcon: "upload-02",
  },
};

// ── Grille ────────────────────────────────────────────────────────────────────

/** Grille de tableau de bord : indicateurs et actions, même hauteur par ligne. */
export const Grille: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 1080 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      <Card title="Courses réalisées" value={12430} delta={{ value: 1.8, label: "vs semaine dernière" }} />
      <Card
        title="Ponctualité"
        value={94.2}
        unit="%"
        delta={{ value: -0.6, unit: "pt", label: "vs hier" }}
        trend={[95.1, 94.8, 95.4, 95.0, 94.6, 94.8, 94.2]}
      />
      <Card
        title="Perturbations actives"
        value={27}
        status="critical"
        statusLabel="Seuil dépassé"
        goodDirection="down"
        delta={{ value: 35, label: "vs hier" }}
        onClick={() => {}}
        actionLabel="Voir les perturbations"
      />
      <Card
        title="Importer un réseau GTFS"
        description="Chargez les horaires théoriques d'un réseau."
        actionLabel="Importer"
        actionIcon="download-02"
        illustration={<Illustration />}
      />
    </div>
  ),
};
