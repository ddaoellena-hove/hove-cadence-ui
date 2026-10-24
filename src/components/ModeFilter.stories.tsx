import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModeFilter } from "./ModeFilter";
import type { ModeName } from "./mode-icons";

const TRANSIT: ModeName[] = ["metro", "train", "tram", "coach", "boat", "bike"];

const meta: Meta<typeof ModeFilter> = {
  title: "Composants/Transport/ModeFilter",
  component: ModeFilter,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { "aria-label": "Filtrer par mode", modes: TRANSIT },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ModeFilter>;

/** Multi-sélection : chaque chip bascule indépendamment. */
export const Multiple: Story = {
  args: { onChange: fn() },
  render: function Demo(args) {
    const [value, setValue] = useState<ModeName[]>(["metro"]);
    return <ModeFilter {...args} value={value} onChange={(m) => { setValue(m); args.onChange?.(m); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tram = canvas.getByRole("button", { name: /Tramway/ });
    await expect(tram).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(tram);
    await expect(tram).toHaveAttribute("aria-pressed", "true");
    await expect(args.onChange).toHaveBeenLastCalledWith(["metro", "tram"]);
    // Rebascule → désélection.
    await userEvent.click(tram);
    await expect(tram).toHaveAttribute("aria-pressed", "false");
  },
};

/** Sélection unique : un seul mode à la fois. */
export const Single: Story = {
  name: "Unique",
  render: function Demo() {
    const [value, setValue] = useState<ModeName[]>(["metro"]);
    return <ModeFilter aria-label="Mode" modes={TRANSIT} selection="single" value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Train/ }));
    await expect(canvas.getByRole("button", { name: /Train/ })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: /Métro/ })).toHaveAttribute("aria-pressed", "false");
  },
};

/** Jeu de modes élargi (non contrôlé). */
export const Elargi: Story = {
  name: "Jeu élargi",
  args: {
    modes: ["metro", "train", "tram", "funicular", "coach", "boat", "bike", "carpool", "walk"],
    defaultValue: ["metro", "tram"],
  },
};
