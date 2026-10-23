import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { useState } from "react";
import { CounterInput } from "./CounterInput";

const meta: Meta<typeof CounterInput> = {
  title: "Composants/Formulaires/CounterInput",
  component: CounterInput,
  tags: ["autodocs"],
  args: {
    defaultValue: 0,
    step: 1,
    onChange: fn(),
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CounterInput>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: "Durée du trajet", unit: "s", defaultValue: 0, min: 0 },
};

export const WithUnit: Story = {
  args: { unit: "s", defaultValue: 0 },
};

export const WithMinMax: Story = {
  args: { unit: "m", defaultValue: 5, min: 0, max: 10, step: 1 },
};

export const WithStep: Story = {
  args: { unit: "km", defaultValue: 0, step: 5, max: 50 },
};

export const Disabled: Story = {
  args: { unit: "s", defaultValue: 3, disabled: true },
};

export const AtMinimum: Story = {
  args: { unit: "s", value: 0, min: 0, max: 10 },
};

export const AtMaximum: Story = {
  args: { unit: "s", value: 10, min: 0, max: 10 },
};

export const Controlled: Story = {
  render: () => {
    const [val, setVal] = useState(0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CounterInput value={val} onChange={setVal} unit="s" min={0} max={60} />
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontFamily: "Inter, sans-serif" }}>
          Valeur : <strong>{val} s</strong>
        </p>
      </div>
    );
  },
};

export const IncrementDecrement: Story = {
  args: { unit: "s", defaultValue: 5, min: 0, max: 10, onChange: fn() },
  play: async ({ canvas, args }) => {
    const inc = canvas.getByLabelText("Incrémenter");
    const dec = canvas.getByLabelText("Décrémenter");

    // Pas d'infobulle sur − et + (nom accessible conservé)
    const bubble = inc.parentElement?.querySelector(".base-button-tip__bubble") as HTMLElement;
    await expect(getComputedStyle(bubble).display).toBe("none");

    await inc.click();
    await expect(args.onChange).toHaveBeenCalledWith(6);

    await dec.click();
    await dec.click();
    await expect(args.onChange).toHaveBeenCalledWith(4);
  },
};

/** Borne non multiple du pas (max 58, pas 5) : « + » va jusqu'à 58, jamais 60. */
export const BorneNonMultiple: Story = {
  name: "Borne non multiple du pas",
  args: { defaultValue: 55, step: 5, max: 58, onChange: fn() },
  play: async ({ canvas, args }) => {
    const inc = canvas.getByRole("button", { name: "Incrémenter" });
    await expect(inc).toBeEnabled();
    await userEvent.click(inc);
    await expect(args.onChange).toHaveBeenLastCalledWith(58);
    await expect(canvas.getByLabelText("Valeur")).toHaveValue(58);
    // Sur la borne : désactivé
    await expect(inc).toBeDisabled();
  },
};

/** Pas plus grand que l'écart à la borne (valeur 5, pas 15, min 0) : « − » va jusqu'à 0. */
export const PasPlusGrandQueLaBorne: Story = {
  name: "Pas plus grand que l'écart à la borne",
  args: { defaultValue: 5, step: 15, min: 0, onChange: fn() },
  play: async ({ canvas, args }) => {
    const dec = canvas.getByRole("button", { name: "Décrémenter" });
    await expect(dec).toBeEnabled();
    await userEvent.click(dec);
    await expect(args.onChange).toHaveBeenLastCalledWith(0);
    await expect(dec).toBeDisabled();
  },
};

/** Saisie au clavier hors bornes : ramenée dans [min, max] à la validation. */
export const SaisieHorsBornes: Story = {
  name: "Saisie hors bornes",
  args: { defaultValue: 10, min: 0, max: 120, step: 5, unit: "min", onChange: fn() },
  play: async ({ canvas, args }) => {
    const input = canvas.getByLabelText("Valeur");
    await userEvent.click(input);
    await userEvent.keyboard("999{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(120);
    await userEvent.click(input);
    await userEvent.keyboard("-40{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(0);
  },
};

/** Pas décimal (0,5). */
export const PasDecimal: Story = {
  name: "Pas décimal",
  args: { defaultValue: 1, min: 0, max: 2, step: 0.5, unit: "km", onChange: fn() },
  play: async ({ canvas, args }) => {
    const inc = canvas.getByRole("button", { name: "Incrémenter" });
    await userEvent.click(inc);
    await expect(args.onChange).toHaveBeenLastCalledWith(1.5);
    await userEvent.click(inc);
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
    await expect(inc).toBeDisabled();
  },
};
