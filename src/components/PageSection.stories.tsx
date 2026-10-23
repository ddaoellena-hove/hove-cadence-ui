import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { PageSection } from "./PageSection";
import { TextInput } from "./TextInput";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof PageSection> = {
  title: "Composants/Structure et mise en page/PageSection",
  component: PageSection,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PageSection>;

/** Titre `h2` + contenu empilé. La section est un repère nommé par son titre. */
export const Defaut: Story = {
  name: "Défaut",
  args: {
    title: "Informations générales",
    children: (
      <>
        <TextInput label="Titre" placeholder="Ex : Tronçon Melun – Montereau" />
        <TextInput label="Référence" placeholder="SCN-000" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Informations générales" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { level: 2, name: "Informations générales" })).toBeInTheDocument();
  },
};

/** Description sous le titre et actions à droite. */
export const AvecActionsEtDescription: Story = {
  name: "Avec actions et description",
  args: {
    title: "Arrêts concernés",
    description: "Sélectionnez les arrêts touchés par la perturbation.",
    actions: <GhostButton size="sm" iconStart="plus" label="Ajouter" />,
    children: <TextInput label="Rechercher un arrêt" placeholder="Nom ou code" />,
  },
};

/** Niveau de titre `h3` (sous-section). */
export const Niveau3: Story = {
  args: {
    title: "Exceptions de circulation",
    headingLevel: 3,
    children: <TextInput label="Date" placeholder="JJ/MM/AAAA" />,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 3, name: "Exceptions de circulation" })).toBeInTheDocument();
  },
};
