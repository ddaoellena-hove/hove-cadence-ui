import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TimePicker, type TimePickerProps } from "./TimePicker";

function ControlledTime(args: TimePickerProps) {
  const [value, setValue] = useState(args.value);
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <TimePicker {...args} value={value} onChange={(next) => { setValue(next); args.onChange(next); }} />
    <output aria-label="Heure retenue" style={{ fontFamily: "var(--cadence-font-sans, Inter)", fontSize: 11, fontWeight: 500, color: "var(--cadence-color-icon-muted, #69797d)" }}>{value || "Aucune heure"}</output>
  </div>;
}
const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker", component: TimePicker, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { label: "Heure de départ", value: "09:30", onChange: fn() },
  render: (args) => <ControlledTime {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TimePicker>;

// Les scénarios automatisés tournent sous Vitest, sans piloter le focus
// pendant la consultation manuelle des stories ou de la documentation.
const testOnly = (play: NonNullable<Story["play"]>): Story["play"] =>
  import.meta.env.MODE === "test" ? play : undefined;

const hoursOf = (c: ReturnType<typeof within>) => c.getByRole("spinbutton", { name: "Heures — Heure de départ" });
const minutesOf = (c: ReturnType<typeof within>) => c.getByRole("spinbutton", { name: "Minutes — Heure de départ" });

/** Saisie directe au clavier dans le champ (sans ouvrir le panneau). */
export const SaisieEtClavier: Story = {
  name: "Saisie et clavier",
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hours = hoursOf(canvas);
    const minutes = minutesOf(canvas);

    // Taper le champ ne doit pas ouvrir le panneau.
    await userEvent.clear(hours);
    await userEvent.type(hours, "9");
    await userEvent.clear(minutes);
    await userEvent.type(minutes, "5{Enter}");
    await expect(hours).toHaveValue("09");
    await expect(minutes).toHaveValue("05");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();

    // Les flèches ↑/↓ incrémentent la case.
    await userEvent.click(minutes);
    await userEvent.keyboard("{ArrowUp}");
    await expect(minutes).toHaveValue("06");

    // Valeur hors plage : signalée, validité native invalide.
    await userEvent.clear(hours);
    await userEvent.type(hours, "25{Enter}");
    await expect(hours).toHaveAttribute("aria-invalid", "true");
    await expect((hours as HTMLInputElement).checkValidity()).toBe(false);
    await expect(canvas.getByRole("alert")).toHaveTextContent("23:59");

    // Échap annule la saisie en cours.
    await userEvent.keyboard("{Escape}");
    await expect(hours).toHaveValue("09");
    await expect((hours as HTMLInputElement).checkValidity()).toBe(true);
  }),
};

/** L'horloge à droite ouvre le panneau de réglage (flèches). */
export const PanneauFleches: Story = {
  name: "Panneau (horloge)",
  args: { minuteStep: 15 },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Ouvrir le sélecteur/ }));
    const dialog = canvas.getByRole("dialog", { name: "Régler heure de départ" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Augmenter les minutes" }));
    await expect(minutesOf(canvas)).toHaveValue("45");
    // Rien n'est publié avant « Valider ».
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("09:30");
    await userEvent.click(within(dialog).getByRole("button", { name: "Valider" }));
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("09:45");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  }),
};

/** Service après minuit : mode nocturne jusqu'à 47:59. */
export const ServiceDeNuit: Story = {
  name: "Service après minuit",
  args: { value: "23:55", allowOvernight: true, minuteStep: 15, helperText: "25:30 désigne 01:30 du jour suivant dans le même jour de service." },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Ouvrir le sélecteur/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les minutes" }));
    await expect(hoursOf(canvas)).toHaveValue("24");
    await expect(minutesOf(canvas)).toHaveValue("10");
    await expect(canvas.getByText("Jour de service suivant")).toBeInTheDocument();
  }),
};

/** Facultative : vider le champ remonte une valeur vide. */
export const Facultative: Story = {
  args: { value: "" },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(hoursOf(canvas), "08");
    await userEvent.type(minutesOf(canvas), "00{Enter}");
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("08:00");
    await userEvent.clear(hoursOf(canvas));
    await userEvent.clear(minutesOf(canvas));
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("Aucune heure");
  }),
};

export const Desactivee: Story = { name: "Désactivée", args: { disabled: true } };
export const ErreurMetier: Story = { name: "Erreur métier", args: { error: "Le départ doit précéder la fin de la perturbation." } };

/* ── Variante bouton (déclencheur compact, panneau éditable) ── */

export const VarianteBouton: Story = {
  name: "Variante bouton", args: { variant: "button", label: undefined, "aria-label": "Départ" },
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Départ : 09:30" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "Régler départ" });
    const hours = within(dialog).getByRole("spinbutton", { name: /^Heures/ });
    await expect(hours).toHaveFocus();
    await userEvent.clear(hours);
    await userEvent.type(hours, "11");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les heures" }));
    await userEvent.click(canvas.getByRole("button", { name: "Valider" }));
    await expect(canvas.getByRole("button", { name: "Départ : 10:30" })).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith("10:30");
  }),
};
