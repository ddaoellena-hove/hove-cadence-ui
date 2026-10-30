import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Stepper, type StepperStep } from "./Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Composants/Navigation/Stepper",
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

import * as lot6Test from "storybook/test";
export const AvertissementLot6: Story = { args: { steps: [{ id: "a", label: "Import", state: "completed" }, { id: "b", label: "Qualité", state: "warning" }, { id: "c", label: "Export", state: "upcoming" }] }, play: async ({ canvasElement }) => { await lot6Test.expect(lot6Test.within(canvasElement).getByText("À vérifier")).toBeVisible(); } };

const JOURNEY: StepperStep[] = [
  { id: "general", label: "Informations générales", icon: "info-circle", state: "completed", available: true },
  { id: "objects", label: "Objets impactés", icon: "map-01", state: "warning", available: true },
  { id: "severity", label: "Sévérité", icon: "alert-triangle", state: "current" },
  { id: "periods", label: "Périodes / créneaux", icon: "calendar", state: "upcoming" },
  { id: "messages", label: "Messages", icon: "edit-02", state: "upcoming" },
  { id: "summary", label: "Résumé", icon: "file-05", state: "upcoming" },
];

/** Six étapes à icônes pour un pied d'actions ; les étapes futures restent indisponibles. */
export const Compact: Story = {
  args: { steps: JOURNEY, density: "compact", context: "Impact n° 2", onStepClick: fn() },
  decorators: [(Story) => <div style={{ paddingTop: 48 }}><Story /></div>],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Impact n° 2/)).toHaveTextContent("Impact n° 2 · 3/6 · Sévérité");
    const current = canvas.getByRole("button", { name: "3/6 · Sévérité — En cours" });
    await expect(current.closest("li")).toHaveAttribute("aria-current", "step");

    // Étape future : atteignable au clavier, nom lisible, sans effet au clic
    const future = canvas.getByRole("button", { name: "6/6 · Résumé — À venir" });
    await expect(future).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(future);
    await expect(args.onStepClick).not.toHaveBeenCalled();

    // Clavier : retour à une étape terminée
    canvas.getByRole("button", { name: "1/6 · Informations générales — Terminée" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onStepClick).toHaveBeenCalledWith("general");

    // `available` ouvre une étape non terminée (à vérifier)
    await userEvent.click(canvas.getByRole("button", { name: "2/6 · Objets impactés — À vérifier" }));
    await expect(args.onStepClick).toHaveBeenCalledWith("objects");
  },
};

/** Libellés longs : le contexte passe à la ligne, les icônes restent entières. */
export const CompactEtroit: Story = {
  name: "Compact, largeur mobile",
  args: { steps: JOURNEY, density: "compact", context: "Informations communes à tous les impacts" },
  decorators: [(Story) => <div style={{ width: 280, paddingTop: 48 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

/** `available` et `icon` s'appliquent aussi à la densité par défaut. */
export const IconesEtEtapeDisponible: Story = {
  name: "Icônes et étape disponible",
  args: { steps: JOURNEY.slice(0, 4), onStepClick: fn() },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Objets impactés/ }));
    await expect(args.onStepClick).toHaveBeenCalledWith("objects");
  },
};
