import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertToast } from "./AlertToast";

const meta: Meta<typeof AlertToast> = {
  title: "Components/AlertToast",
  component: AlertToast,
  tags: ["autodocs"],
  argTypes: {
    type: {
      options: ["information", "success", "warning", "error"],
      control: { type: "select" },
    },
    title: { control: { type: "text" } },
    description: { control: { type: "text" } },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    dismissible: { control: { type: "boolean" } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", background: "#f5f5f5", minHeight: "120px", display: "flex", alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AlertToast>;

export const Information: Story = {
  args: {
    type: "information",
    description: "Les horaires de la ligne A ont été mis à jour.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    description: "Vos modifications ont été enregistrées.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    description: "Votre session va bientôt expirer. Pensez à enregistrer votre travail.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    description: "Une erreur est survenue. Réessayez ou contactez le support.",
  },
};

export const WithProgress: Story = {
  args: {
    type: "information",
    description: "Import du fichier en cours…",
    progress: 45,
  },
};

export const ProgressComplete: Story = {
  args: {
    type: "success",
    title: "Import terminé",
    description: "Votre fichier a bien été importé.",
    progress: 100,
  },
};

export const Dismissible: Story = {
  args: {
    type: "warning",
    description: "Cette notification peut être fermée par l'utilisateur.",
    dismissible: true,
  },
};

export const WithActions: Story = {
  args: {
    type: "information",
    description: "Une nouvelle version de l'application est disponible.",
    actions: [
      { label: "Ignorer", outline: true },
      { label: "Mettre à jour", outline: false },
    ],
  },
};

export const ErrorWithActions: Story = {
  args: {
    type: "error",
    title: "Action requise",
    description: "Le flux GTFS a expiré. Mettez-le à jour pour continuer.",
    actions: [
      { label: "Annuler", outline: true },
      { label: "Mettre à jour le flux", outline: false },
    ],
  },
};

export const CustomTitle: Story = {
  args: {
    type: "success",
    title: "Scénario publié",
    description: "Le scénario « Travaux ligne 13 » est maintenant visible des voyageurs.",
    dismissible: true,
  },
};

/** Sans `description` : seul le titre est rendu. */
export const TitleOnly: Story = {
  args: {
    type: "success",
    title: "Scénario créé",
    dismissible: true,
  },
};
