import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Toaster } from "./Toaster";
import { useToast } from "./useToast";
import type { ToastOptions } from "./useToast";
import { PrimaryButton } from "./PrimaryButton";

const meta: Meta<typeof Toaster> = {
  title: "Composants/Retours et statuts/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

const SAMPLES: ToastOptions[] = [
  { type: "success", title: "Scénario créé", description: "« Tronçon Melun – Montereau » est publié." },
  { type: "information", title: "Nouvelle version", description: "Une mise à jour de l'application est disponible." },
  { type: "warning", title: "Retard détecté", description: "La ligne 13 accuse un retard de 12 min." },
  { type: "error", title: "Échec de l'envoi", description: "Impossible de contacter le serveur. Réessayez." },
];

function ToasterDemo() {
  const { toast } = useToast();
  const seq = useRef(0);
  const add = () => {
    toast(SAMPLES[seq.current % SAMPLES.length]);
    seq.current += 1;
  };
  return (
    <div style={{ padding: 24, minHeight: 520 }}>
      <PrimaryButton label="Ajouter un toast" onClick={add} />
      <Toaster />
    </div>
  );
}

/**
 * Pile à effet de profondeur en bas à droite (façon app desktop) : la plus
 * récente au premier plan, les précédentes réduites derrière. Cliquer plusieurs
 * fois pour empiler, puis survoler la pile pour la déployer.
 */
export const Defaut: Story = {
  name: "Défaut",
  render: () => <ToasterDemo />,
};

/**
 * Annonces : les régions live existent avant le premier toast. Succès et
 * information dans la région polie, avertissement et erreur dans la région
 * immédiate ; les cartes visibles n'ont pas de rôle live (pas de double annonce).
 */
export const Annonces: Story = {
  render: () => <ToasterDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    const alert = canvas.getByRole("alert");
    await expect(status).toBeEmptyDOMElement();
    await expect(alert).toBeEmptyDOMElement();
    const add = canvas.getByRole("button", { name: "Ajouter un toast" });
    await userEvent.click(add);
    await expect(status).toHaveTextContent("Scénario créé. « Tronçon Melun – Montereau » est publié.");
    await userEvent.click(add);
    await userEvent.click(add);
    await expect(alert).toHaveTextContent("Retard détecté. La ligne 13 accuse un retard de 12 min.");
    // Une seule région de chaque type : les cartes n'en ajoutent pas.
    await expect(canvas.getAllByRole("status")).toHaveLength(1);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
  },
};
