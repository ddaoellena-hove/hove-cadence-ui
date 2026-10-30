import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FormField } from "./FormField";
import { Checkbox } from "./Checkbox";
import { Dropdown } from "./Dropdown";
import { Autocomplete } from "./Autocomplete";
import { DatePicker } from "./DatePicker";
import { TextInput } from "./TextInput";
import { ErrorSummary } from "./ErrorSummary";
import { PrimaryButton } from "./PrimaryButton";

const meta: Meta<typeof FormField> = {
  title: "Composants/Formulaires/FormField",
  component: FormField,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FormField>;

/** Contrôle métier sans libellé : la fonction reçoit l'id et les attributs ARIA. */
export const ControleUnique: Story = {
  name: "Contrôle unique",
  args: {
    label: "Code réseau",
    required: true,
    error: "Saisissez un code à trois lettres.",
    children: (control) => <input {...control} defaultValue="AB" />,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /Code réseau/ });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-required", "true");
    await expect(input).toHaveAccessibleDescription("Saisissez un code à trois lettres.");
    // Le libellé atteint le contrôle
    await userEvent.click(within(canvasElement).getByText("Code réseau"));
    await expect(input).toHaveFocus();
  },
};

/** Groupe de cases : l'ensemble est nommé par le libellé et décrit par l'erreur. */
export const Groupe: Story = {
  args: {
    label: "Jours d'application",
    helperText: "Au moins un jour.",
    children: (
      <div style={{ display: "flex", gap: 12 }}>
        <Checkbox aria-label="Lundi" />
        <Checkbox aria-label="Mardi" />
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("group", { name: "Jours d'application" });
    await expect(group).toHaveAccessibleDescription("Au moins un jour.");
  },
};

/** Formulaire mixte : mêmes erreurs, mêmes annonces, focus demandé depuis le résumé, sans sélecteur DOM. */
export const FormulaireMixte: Story = {
  name: "Formulaire mixte",
  render: function Render() {
    const [submitted, setSubmitted] = useState(false);
    const causeRef = useRef<HTMLButtonElement>(null);
    const lineRef = useRef<HTMLInputElement>(null);
    const startRef = useRef<HTMLElement>(null);
    const error = (message: string) => (submitted ? message : undefined);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {submitted && (
          <ErrorSummary
            focusOnMount={false}
            errors={[
              { id: "cause", message: "Choisissez une cause.", target: causeRef },
              { id: "line", message: "Choisissez une ligne.", target: lineRef },
              { id: "start", message: "Renseignez le début.", target: startRef },
            ]}
          />
        )}
        <TextInput label="Nom" required />
        <Dropdown ref={causeRef} label="Cause" required error={error("Choisissez une cause.")} options={[{ id: "a", label: "Travaux" }]} />
        <Autocomplete ref={lineRef} label="Ligne" required error={error("Choisissez une ligne.")} options={[{ id: "a", label: "Ligne 1" }]} />
        <DatePicker ref={startRef} label="Début" required error={error("Renseignez le début.")} />
        <PrimaryButton label="Vérifier" onClick={() => setSubmitted(true)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier" }));
    await expect(canvas.getByRole("button", { name: /Cause/ })).toHaveAccessibleDescription("Choisissez une cause.");
    await expect(canvas.getByRole("combobox", { name: /Ligne/ })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("combobox", { name: /Ligne/ })).toHaveAttribute("aria-required", "true");
    await expect(canvas.getByRole("textbox", { name: /Jour/ })).toHaveAttribute("aria-invalid", "true");

    await userEvent.click(canvas.getByRole("button", { name: "Choisissez une cause." }));
    await expect(canvas.getByRole("button", { name: /Cause/ })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Renseignez le début." }));
    await expect(canvas.getByRole("textbox", { name: /Jour/ })).toHaveFocus();
  },
};
