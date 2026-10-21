import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ActionCard } from "./ActionCard";

const meta: Meta<typeof ActionCard> = {
  title: "Components/ActionCard",
  component: ActionCard,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Importer un réseau GTFS",
    description: "Chargez les horaires théoriques d'un réseau pour préparer vos scénarios de perturbation.",
    actionLabel: "Importer",
  },
};

export default meta;
type Story = StoryObj<typeof ActionCard>;

const onImport = fn();

/** Illustration de démonstration (SVG inline, couleurs par tokens). */
const Illustration = () => (
  <svg width="112" height="88" viewBox="0 0 112 88" fill="none">
    <circle cx="84" cy="74" r="52" fill="var(--cadence-color-accent-subtle, #f0f6ff)" />
    <rect x="44" y="34" width="52" height="40" rx="6" fill="var(--cadence-color-white, #ffffff)" stroke="var(--cadence-color-border, #e5e5e5)" />
    <path d="M52 62l10-12 8 8 6-6 12 10" stroke="var(--cadence-color-accent, #1b6cff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="80" cy="44" r="4" fill="var(--cadence-color-accent, #1b6cff)" />
  </svg>
);

/** Titre, description et bouton. Ombre portée au survol de la carte. */
export const Defaut: Story = {
  name: "Défaut",
  args: { onAction: onImport },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onImport.mockClear();
    // Seul le bouton déclenche l'action : un clic sur le texte ne fait rien
    await userEvent.click(canvas.getByText(/Chargez les horaires/));
    await expect(onImport).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Importer" }));
    await expect(onImport).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("heading", { level: 3, name: "Importer un réseau GTFS" })).toBeInTheDocument();
  },
};

/** Sans description. */
export const SansDescription: Story = {
  name: "Sans description",
  args: { description: undefined, title: "Inviter un collaborateur", actionLabel: "Inviter" },
};

/** Icône avant le libellé du bouton. */
export const AvecIcone: Story = {
  name: "Avec icône",
  args: { actionIcon: "download-02" },
};

/** Illustration décorative en bas à droite, collée au coin. */
export const AvecIllustration: Story = {
  name: "Avec illustration",
  args: { illustration: <Illustration /> },
  play: async ({ canvasElement }) => {
    // L'illustration est décorative : masquée aux lecteurs d'écran
    const wrapper = canvasElement.querySelector(".action-card__illustration");
    await expect(wrapper).toHaveAttribute("aria-hidden", "true");
  },
};

/** Grille de cartes : même hauteur, boutons alignés en bas. */
export const Grille: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 1000 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      <ActionCard
        title="Importer un réseau GTFS"
        description="Chargez les horaires théoriques d'un réseau pour préparer vos scénarios de perturbation."
        actionLabel="Importer"
        actionIcon="download-02"
        illustration={<Illustration />}
      />
      <ActionCard
        title="Créer un scénario"
        description="Simulez une fermeture de station ou un détournement de ligne."
        actionLabel="Commencer"
        actionIcon="plus"
      />
      <ActionCard title="Inviter un collaborateur" actionLabel="Inviter" />
    </div>
  ),
};
