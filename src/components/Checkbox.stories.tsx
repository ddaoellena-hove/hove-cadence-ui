import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";
import { Badge } from "./Badge";

const meta: Meta<typeof Checkbox> = {
  title: "Composants/Formulaires/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  argTypes: {
    state: {
      options: ["unchecked", "hover", "checked", "indeterminate", "disabled", "disabled-checked"],
      control: { type: "select" },
    },
  },
  // Nom accessible par défaut (les cases de démo n'ont pas de label visible).
  args: { "aria-label": "Accepter les conditions" },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [hovered, setHovered] = useState(false);

    const state = checked ? "checked" : hovered ? "hover" : "unchecked";

    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Checkbox state={state} aria-label="Accepter les conditions" onChange={(next) => setChecked(next)} />
      </div>
    );
  },
};

export const Hover: Story = {
  args: { state: "hover" },
};

export const Checked: Story = {
  args: { state: "checked" },
};

export const Indeterminate: Story = {
  args: { state: "indeterminate" },
};

export const Disabled: Story = {
  args: { state: "disabled" },
};

export const DisabledChecked: Story = {
  args: { state: "disabled-checked" },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "16px",
      }}
    >
      <Checkbox state="unchecked" aria-label="Non cochée" />
      <Checkbox state="hover" aria-label="Survolée" />
      <Checkbox state="checked" aria-label="Cochée" />
      <Checkbox state="indeterminate" aria-label="Indéterminée" />
      <Checkbox state="disabled" aria-label="Désactivée" />
      <Checkbox state="disabled-checked" aria-label="Désactivée cochée" />
    </div>
  ),
};

/** Liste dense : cliquer le texte coche la case, avec une seule annonce et un complément décoratif. */
export const AvecLibelle: Story = {
  name: "Avec libellé",
  args: { label: "Direction Nation", description: "12 arrêts desservis", aside: <Badge label="Ligne 1" />, onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox", { name: "Direction Nation" });
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(1);
    await expect(box).toHaveAccessibleDescription("12 arrêts desservis");
    await userEvent.click(canvas.getByText("Direction Nation"));
    await expect(args.onChange).toHaveBeenCalledWith(true);
    box.focus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

/** États conservés avec libellé : indéterminé annoncé, désactivé sans effet. */
export const LibelleEtats: Story = {
  name: "Libellé et états",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Checkbox label="Toutes les directions" state="indeterminate" />
      <Checkbox label="Lundi" state="checked" />
      <Checkbox label="Dimanche" state="disabled" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: "Toutes les directions" })).toHaveAttribute("aria-checked", "mixed");
    await expect(canvas.getByRole("checkbox", { name: "Dimanche" })).toHaveAttribute("aria-disabled", "true");
  },
};

/** Remplace `RichCheckbox` : carte de choix avec icône, sélection multiple. */
export const Carte: Story = {
  args: { appearance: "card", size: "lg", label: "Application mobile", description: "Notification aux voyageurs abonnés.", icon: "bell-01", onChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(1);
    await userEvent.click(canvas.getByText("Application mobile"));
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};
