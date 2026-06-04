import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { useState } from "react";
import { CounterInput } from "./CounterInput";

const meta: Meta<typeof CounterInput> = {
  title: "Components/CounterInput",
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

    await inc.click();
    await expect(args.onChange).toHaveBeenCalledWith(6);

    await dec.click();
    await dec.click();
    await expect(args.onChange).toHaveBeenCalledWith(4);
  },
};
