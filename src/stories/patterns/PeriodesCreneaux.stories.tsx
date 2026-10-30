import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PeriodesCreneauxPattern } from "../../patterns/PeriodesCreneauxPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof PeriodesCreneauxPattern> = {
  title: "Page patterns/Périodes et créneaux",
  component: PeriodesCreneauxPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell active="planning"><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof PeriodesCreneauxPattern>;

/** Erreur par bloc, puis saisie conservée au changement de mode. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier" }));
    await expect(canvas.getByText("Renseignez le début et la fin.")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("radio", { name: "Créneaux récurrents" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Lundi" }));
    await expect(canvas.getByText(/^Lundi : /)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("radio", { name: "Périodes continues" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Créneaux récurrents" }));
    await expect(canvas.getByRole("checkbox", { name: "Lundi" })).toHaveAttribute("aria-checked", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Vérifier" }));
    await expect(canvas.getByText("Renseignez les deux heures.")).toBeInTheDocument();
  },
};
