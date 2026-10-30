import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof PrimaryButton> = {
  title: "Composants/Actions/PrimaryButton",
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

/** Spinner à gauche du libellé, qui reste lisible : pendant l'action, puis retour à l'état normal. */
export const SpinnerAGauche: Story = {
  name: "Spinner à gauche",
  args: { label: "Enregistrer", onClick: fn() },
  render: function Render(args) {
    const [loading, setLoading] = useState(false);
    return <PrimaryButton {...args} loading={loading} loadingPlacement="start" onClick={(event) => { args.onClick?.(event); setLoading(true); }} />;
  },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Enregistrer" });
    const before = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-busy", "true");
    const spinner = button.querySelector<HTMLElement>(".base-button__spinner")!;
    const text = button.querySelector<HTMLElement>(".base-button__label")!;
    await expect(spinner.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left);
    await expect(getComputedStyle(text).opacity).toBe("1");
    await expect(button.querySelector(".base-button__spinner-overlay")).toBeNull();
    await expect(button.getBoundingClientRect().width).toBeGreaterThan(before);
    // Second appui ignoré pendant l'action
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
