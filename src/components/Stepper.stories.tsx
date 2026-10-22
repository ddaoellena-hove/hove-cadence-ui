import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Stepper, type StepperStep } from "./Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

const STEPS: StepperStep[] = [
  { id: "src", label: "Source", description: "Fichier GTFS", state: "completed" },
  { id: "map", label: "Correspondances", description: "Arrêts et lignes", state: "current" },
  { id: "check", label: "Vérification", state: "upcoming" },
  { id: "pub", label: "Publication", state: "upcoming" },
];

export const Horizontal: Story = {
  args: { steps: STEPS, orientation: "horizontal" },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    // L'étape courante est annoncée.
    const current = within(canvasElement).getByText("Correspondances").closest("li");
    await expect(current).toHaveAttribute("aria-current", "step");
  },
};

export const Vertical: Story = {
  args: { steps: STEPS, orientation: "vertical" },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};

export const AvecErreur: Story = {
  name: "Avec erreur",
  args: {
    steps: [
      { id: "src", label: "Source", state: "completed" },
      { id: "map", label: "Correspondances", description: "2 arrêts introuvables", state: "error" },
      { id: "pub", label: "Publication", state: "upcoming" },
    ],
    orientation: "horizontal",
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};

/** Les étapes complétées sont cliquables pour y revenir. */
export const Navigable: Story = {
  render: () => {
    const [last, setLast] = useState("—");
    return (
      <div style={{ width: 560, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13 }}>Retour vers : {last}</span>
        <Stepper steps={STEPS} onStepClick={setLast} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Seule l'étape complétée est un bouton activable.
    const completed = canvas.getByRole("button", { name: /Source/ });
    await userEvent.click(completed);
    await expect(canvas.getByText("Retour vers : src")).toBeInTheDocument();
  },
};
