import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster } from "./Toaster";
import { useToast } from "./useToast";
import type { ToastOptions } from "./useToast";
import { PrimaryButton } from "./PrimaryButton";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster",
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
