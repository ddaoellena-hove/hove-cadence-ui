import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof GhostButton> = {
  title: "Composants/Actions/GhostButton",
  component: GhostButton,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: { label: "Annuler" },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
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

/** Icône seule : `aria-label` obligatoire (typé), affiché en infobulle au survol et au focus. */
export const IconeSeule: Story = {
  name: "Icône seule",
  render: (args) => (
    <div style={{ display: "flex", gap: 8, paddingBottom: 48 }}>
      <GhostButton size={args.size} icon="edit-02" aria-label="Modifier" />
      <GhostButton size={args.size} icon="trash" aria-label="Supprimer" tone="danger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Modifier" });
    // Carré : largeur = hauteur
    const { width, height } = button.getBoundingClientRect();
    await expect(Math.round(width)).toBe(Math.round(height));
    // Infobulle : reprend le nom accessible, masquée aux lecteurs d'écran
    const bubble = button.parentElement?.querySelector(".base-button-tip__bubble") as HTMLElement;
    await expect(bubble).toHaveAttribute("aria-hidden", "true");
    await expect(bubble).toHaveTextContent("Modifier");
    // Masquée hors du rendu (display: none) : n'élargit aucune zone défilable
    await expect(getComputedStyle(bubble).display).toBe("none");
    // Focus clavier : affichée sans délai
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(bubble).display).toBe("block"));
  },
};

/** Près du bord droit d'un conteneur défilant : pas de défilement horizontal, infobulle recalée dans la zone visible. */
export const IconeSeuleAuBord: Story = {
  name: "Icône seule au bord d'un conteneur",
  render: () => (
    <div data-testid="scroller" style={{ width: 240, overflow: "auto", border: "1px dashed #bfc9cb", padding: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <GhostButton icon="download-02" aria-label="Télécharger le rapport" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const scroller = within(canvasElement).getByTestId("scroller");
    // Masquée : aucun défilement horizontal ajouté
    await expect(scroller.scrollWidth).toBe(scroller.clientWidth);
    // Affichée : contenue dans le conteneur (marge de 8px), flèche toujours sous le bouton
    const button = within(canvasElement).getByRole("button", { name: "Télécharger le rapport" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const bubble = button.parentElement?.querySelector(".base-button-tip__bubble") as HTMLElement;
    await waitFor(() => expect(getComputedStyle(bubble).display).toBe("block"));
    await waitFor(() => expect(bubble.getBoundingClientRect().right).toBeLessThanOrEqual(scroller.getBoundingClientRect().right - 7));
    await expect(scroller.scrollWidth).toBe(scroller.clientWidth);
  },
};

/** Tailles : sm (tableau, barre d'outils, popover) et md (défaut). */
export const Tailles: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <GhostButton tone={args.tone} size="sm" label="Petit" />
      <GhostButton tone={args.tone} size="md" label="Moyen" />
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

import * as lot6Test from "storybook/test";
export const CompteurLot6: Story = { render: () => <div style={{ display: "flex", gap: 24, padding: 16 }}>{[0, 3, 12].map(count => <GhostButton key={count} icon="bell-01" aria-label="Notifications" count={count} />)}</div>, play: async ({ canvasElement }) => { const c = lot6Test.within(canvasElement); await lot6Test.expect(c.getByRole("button", { name: "Notifications, 12 non lues" })).toBeVisible(); await lot6Test.expect(c.getByText("9+")).toBeVisible(); await lot6Test.expect(c.getByRole("button", { name: "Notifications" })).toBeVisible(); } };
