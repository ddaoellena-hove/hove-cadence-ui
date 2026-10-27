import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ValidationIssueInspector } from "./ValidationIssueInspector";
import { Drawer } from "./Drawer";
import { GhostButton } from "./GhostButton";
import { FEED_INFO, LONG_TEXTS, STOP_UNKNOWN } from "../stories/fixtures/validation";

const meta: Meta<typeof ValidationIssueInspector> = {
  title: "Composants/Retours et statuts/ValidationIssueInspector",
  component: ValidationIssueInspector,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ValidationIssueInspector>;

/** Constat complet : localisation, règle, correction et accès à la source. */
export const Complet: Story = {
  args: { issue: STOP_UNKNOWN, onOpenSource: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Erreur")).toBeInTheDocument();
    await expect(canvas.getByText("stop_times.txt")).toBeInTheDocument();
    await expect(canvas.getByText("42")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Copier l’identifiant gare_404" })).toBeInTheDocument();
    await expect(canvas.getByText("Correction attendue")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Ouvrir dans la source" }));
    await expect(args.onOpenSource).toHaveBeenCalledWith(STOP_UNKNOWN);
  },
};

/** Constat partiel : ligne et champ « Non renseigné », pas de règle, de correction ni de bouton. */
export const Partiel: Story = {
  args: { issue: FEED_INFO },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Information")).toBeInTheDocument();
    await expect(canvas.getAllByText("Non renseigné")).toHaveLength(2);
    await expect(canvas.queryByText("Règle")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Correction attendue")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Ouvrir dans la source" })).not.toBeInTheDocument();
  },
};

/** Message et identifiants longs : repli sans débordement. */
export const TextesLongs: Story = {
  name: "Textes longs",
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
  args: { issue: LONG_TEXTS },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".validation-issue-inspector")!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  },
};

/** Aucun constat sélectionné. */
export const Vide: Story = {
  args: { issue: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucun constat sélectionné")).toBeInTheDocument();
  },
};

const InDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <GhostButton iconStart="file-05" label="Voir le constat" onClick={() => setOpen(true)} />
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Détail du constat">
        <ValidationIssueInspector issue={STOP_UNKNOWN} onOpenSource={() => {}} />
      </Drawer>
    </>
  );
};

/** Dans un `Drawer` fourni par l'application : Échap referme et rend le focus au déclencheur. */
export const DansUnDrawer: Story = {
  name: "Dans un Drawer",
  render: () => <InDrawer />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Voir le constat" });
    await userEvent.click(trigger);
    const drawer = await within(document.body).findByRole("dialog", { name: "Détail du constat" });
    await expect(within(drawer).getByText(/Arrêt inconnu/)).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};
