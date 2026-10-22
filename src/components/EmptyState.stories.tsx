import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  argTypes: {
    variant: { options: ["empty", "no-results", "error"], control: { type: "select" } },
    size: { options: ["page", "inline"], control: { type: "inline-radio" } },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--cadence-color-white, #fff)", minWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/* ── Variante "empty" ── */

export const Vide: Story = {
  name: "Vide (page)",
  args: {
    variant: "empty",
    size: "page",
    title: "Aucun scénario créé pour ce réseau",
    description: "Créez un premier scénario pour commencer à planifier les perturbations.",
    action: { label: "Créer le premier scénario" },
  },
};

export const VideInline: Story = {
  name: "Vide (inline)",
  args: {
    variant: "empty",
    size: "inline",
    title: "Aucun scénario",
    action: { label: "Créer" },
  },
};

/* ── Variante "no-results" ── */

export const SansResultat: Story = {
  name: "Sans résultat (page)",
  args: {
    variant: "no-results",
    size: "page",
    title: "Aucune course ne correspond à ces filtres",
    description: "Élargissez la période ou retirez certains filtres.",
    action: { label: "Réinitialiser les filtres" },
  },
  play: async ({ canvasElement }) => {
    // no-results doit être annoncé (role="status").
    await expect(within(canvasElement).getByRole("status")).toBeInTheDocument();
  },
};

export const SansResultatInline: Story = {
  name: "Sans résultat (inline)",
  args: {
    variant: "no-results",
    size: "inline",
    title: "Aucun résultat",
    action: { label: "Réinitialiser les filtres" },
  },
};

/* ── Variante "error" ── */

export const Erreur: Story = {
  name: "Erreur (page)",
  args: {
    variant: "error",
    size: "page",
    title: "Impossible de charger les données",
    description: "Une erreur est survenue. Vérifiez votre connexion puis réessayez.",
    action: { label: "Réessayer" },
    secondaryAction: { label: "Annuler" },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toBeInTheDocument();
  },
};

export const ErreurInline: Story = {
  name: "Erreur (inline)",
  args: {
    variant: "error",
    size: "inline",
    title: "Échec du chargement",
    action: { label: "Réessayer" },
  },
};
