import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof GhostButton> = {
  title: "Components/GhostButton",
  component: GhostButton,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: { label: "Annuler" },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof GhostButton>;

/** Action secondaire : sans fond ni bordure au repos, voile au survol. */
export const Defaut: Story = { name: "Défaut" };

/** Action destructive secondaire. */
export const Danger: Story = { args: { label: "Retirer", tone: "danger" } };

/** Icône de début ou de fin. */
export const AvecIcones: Story = {
  name: "Avec icônes",
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <GhostButton tone={args.tone} size={args.size} label="Exporter" iconStart="download-02" />
      <GhostButton tone={args.tone} size={args.size} label="Suivant" iconEnd="chevron-right" />
    </div>
  ),
};

/** Icône seule : `aria-label` obligatoire (typé). */
export const IconeSeule: Story = {
  name: "Icône seule",
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <GhostButton size={args.size} icon="edit-02" aria-label="Modifier" />
      <GhostButton size={args.size} icon="trash" aria-label="Supprimer" tone="danger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Modifier" });
    // Carré : largeur = hauteur
    const { width, height } = button.getBoundingClientRect();
    await expect(Math.round(width)).toBe(Math.round(height));
  },
};

/** Tailles : sm (tableau, popover), md (défaut), lg (fin de formulaire). */
export const Tailles: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <GhostButton tone={args.tone} size="sm" label="Petit" />
      <GhostButton tone={args.tone} size="md" label="Moyen" />
      <GhostButton tone={args.tone} size="lg" label="Grand" />
    </div>
  ),
};

const onSave = fn();

/** Chargement : clics ignorés, `aria-busy`, largeur conservée. */
export const Chargement: Story = {
  args: { label: "Enregistrer", loading: true, onClick: onSave },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Enregistrer" });
    onSave.mockClear();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(onSave).not.toHaveBeenCalled();
  },
};

/** Désactivé : texte grisé, sans fond. */
export const Desactive: Story = { name: "Désactivé", args: { disabled: true } };
