import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof PrimaryButton> = {
  title: "Components/PrimaryButton",
  component: PrimaryButton,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: { label: "Enregistrer" },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    outline: { control: "boolean" },
    // Anciennes props (0.2), encore acceptées en 0.3.0 : masquées des contrôles
    withIcon: { table: { disable: true } },
    destructive: { table: { disable: true } },
    state: { table: { disable: true } },
    iconMap: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof PrimaryButton>;

/** Action principale de la vue : un seul par vue. */
export const Defaut: Story = { name: "Défaut" };

/** Action destructive principale (avec une `Modal` de confirmation). */
export const Danger: Story = { args: { label: "Supprimer", tone: "danger" } };

/**
 * Variante contour : action secondaire **visible**, pour les dashboards
 * (barre d'en-tête chargée, actions à repérer d'un coup d'œil). Ailleurs,
 * préférer `GhostButton`.
 */
export const Outline: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <PrimaryButton size={args.size} outline iconStart="download-02" label="Exporter" />
      <PrimaryButton size={args.size} outline label="Filtres" iconEnd="chevron-down" />
      <PrimaryButton size={args.size} outline tone="danger" label="Clôturer" />
      <PrimaryButton size={args.size} outline label="Désactivé" disabled />
      <PrimaryButton size={args.size} iconStart="plus" label="Créer un scénario" />
    </div>
  ),
};

/** Icône de début ou de fin. */
export const AvecIcones: Story = {
  name: "Avec icônes",
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <PrimaryButton tone={args.tone} size={args.size} label="Ajouter" iconStart="plus" />
      <PrimaryButton tone={args.tone} size={args.size} label="Suivant" iconEnd="chevron-right" />
    </div>
  ),
};

/** Icône seule : carré, `aria-label` obligatoire (typé). */
export const IconeSeule: Story = {
  name: "Icône seule",
  render: (args) => <PrimaryButton size={args.size} tone={args.tone} icon="plus" aria-label="Ajouter" />,
};

/** Tailles : sm (tableau, barre d'outils, popover, toast) et md (défaut). */
export const Tailles: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <PrimaryButton tone={args.tone} size="sm" label="Petit" />
      <PrimaryButton tone={args.tone} size="md" label="Moyen" />
    </div>
  ),
};

const onSubmit = fn();

/** Chargement : clics ignorés, `aria-busy`, spinner, largeur conservée. */
export const Chargement: Story = {
  args: { label: "Enregistrer", loading: true, onClick: onSubmit },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Enregistrer" });
    onSubmit.mockClear();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(onSubmit).not.toHaveBeenCalled();
  },
};

/** Désactivé : à accompagner d'un `TooltipTrigger` qui explique pourquoi. */
export const Desactive: Story = { name: "Désactivé", args: { disabled: true } };

/** Pleine largeur (pied de popover, formulaire étroit). */
export const PleineLargeur: Story = {
  name: "Pleine largeur",
  render: (args) => (
    <div style={{ width: 280 }}>
      <PrimaryButton size={args.size} tone={args.tone} label="Valider" fullWidth />
    </div>
  ),
};

/** Groupe : Ghost à gauche, Primary à droite. */
export const Groupe: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <GhostButton label="Annuler" />
      <PrimaryButton label="Enregistrer" />
    </div>
  ),
};

/**
 * Compatibilité 0.3.0 : les anciennes props sont traduites (avertissement en
 * développement, une fois). `outline` reste une variante à part entière.
 */
export const AnciennesProps: Story = {
  name: "Anciennes props (dépréciées)",
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <PrimaryButton outline label="outline (variante contour)" />
      <PrimaryButton destructive label="destructive → danger" />
      <PrimaryButton withIcon="left" icon="plus" size="large" label="withIcon + large" />
      <PrimaryButton withIcon="only" icon="trash" label="Supprimer" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "outline (variante contour)" })).toHaveClass("primary-button--outline");
    await expect(canvas.getByRole("button", { name: "destructive → danger" })).toHaveClass("primary-button--danger");
    await expect(canvas.getByRole("button", { name: "withIcon + large" })).toHaveClass("base-button--md", "base-button--icon-start");
    await expect(canvas.getByRole("button", { name: "Supprimer" })).toHaveClass("base-button--icon-only");
  },
};
