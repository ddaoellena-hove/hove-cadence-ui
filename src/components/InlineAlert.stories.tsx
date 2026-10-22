import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { InlineAlert } from "./InlineAlert";

const meta: Meta<typeof InlineAlert> = {
  title: "Components/InlineAlert",
  component: InlineAlert,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const Information: Story = {
  args: { type: "information", title: "Nouvelle version", children: "Une mise à jour de l'application est disponible." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toBeInTheDocument();
  },
};

export const Succes: Story = { name: "Succès", args: { type: "success", children: "Vos modifications ont été enregistrées." } };
export const Avertissement: Story = { args: { type: "warning", title: "Flux GTFS expiré", children: "Mettez-le à jour pour continuer." } };

export const Erreur: Story = {
  args: { type: "error", title: "Échec du chargement", children: "Impossible de contacter le serveur.", action: { label: "Réessayer", onClick: () => {} } },
  play: async ({ canvasElement }) => {
    // error → role="alert".
    await expect(within(canvasElement).getByRole("alert")).toBeInTheDocument();
  },
};

export const Fermable: Story = {
  name: "Fermable",
  args: { type: "information", children: "Cette alerte peut être fermée.", dismissible: true },
};
