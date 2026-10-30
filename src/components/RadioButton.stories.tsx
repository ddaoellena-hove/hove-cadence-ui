import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioButton } from "./RadioButton";
import { Badge } from "./Badge";

const meta: Meta<typeof RadioButton> = {
  title: "Composants/Formulaires/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  argTypes: {
    state: {
      options: ["default", "hover", "selected", "disabled"],
      control: { type: "select" },
    },
  },
  args: { "aria-label": "Option" },
};

export default meta;

type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    const [hovered, setHovered] = useState(false);

    const state = selected ? "selected" : hovered ? "hover" : "default";

    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RadioButton state={state} aria-label="Option" onChange={() => setSelected((s) => !s)} />
      </div>
    );
  },
};

export const Hover: Story = {
  args: { state: "hover" },
};

export const Selected: Story = {
  args: { state: "selected" },
};

export const Disabled: Story = {
  args: { state: "disabled" },
};

export const AllStates: Story = {
  render: () => (
    <div
      role="radiogroup"
      aria-label="États du bouton radio"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "16px",
      }}
    >
      <RadioButton state="default" aria-label="Par défaut" />
      <RadioButton state="hover" aria-label="Survolé" />
      <RadioButton state="selected" aria-label="Sélectionné" />
      <RadioButton state="disabled" aria-label="Désactivé" />
    </div>
  ),
};

const LabelGroup = () => {
  const [value, setValue] = useState("auto");
  return (
    <div role="radiogroup" aria-label="Mode d'import" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <RadioButton label="Automatique" description="Le fichier est récupéré chaque nuit." aside={<Badge label="Conseillé" />} state={value === "auto" ? "selected" : "default"} onChange={() => setValue("auto")} />
      <RadioButton label="Manuel" description="Vous déposez le fichier vous-même." state={value === "manual" ? "selected" : "default"} onChange={() => setValue("manual")} />
      <RadioButton label="Indisponible" state="disabled" />
    </div>
  );
};

/** Choix exclusif dans un groupe nommé : cliquer le texte sélectionne, avec une seule annonce. */
export const AvecLibelle: Story = {
  name: "Avec libellé",
  args: { "aria-label": undefined },
  render: () => <LabelGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("radio")).toHaveLength(3);
    const manual = canvas.getByRole("radio", { name: "Manuel" });
    await expect(manual).toHaveAccessibleDescription("Vous déposez le fichier vous-même.");
    await userEvent.click(canvas.getByText("Manuel"));
    await expect(manual).toHaveAttribute("aria-checked", "true");
    await expect(canvas.getByRole("radio", { name: "Automatique" })).toHaveAttribute("aria-checked", "false");
    // Clavier
    canvas.getByRole("radio", { name: "Automatique" }).focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("radio", { name: "Automatique" })).toHaveAttribute("aria-checked", "true");
  },
};

/** Désactivé : sans effet, ni à la souris ni au clavier. */
export const LibelleDesactive: Story = {
  name: "Libellé désactivé",
  args: { "aria-label": undefined, label: "Indisponible", state: "disabled", onChange: fn() },
  decorators: [(Story) => <div role="radiogroup" aria-label="Choix"><Story /></div>],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByText("Indisponible"));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
