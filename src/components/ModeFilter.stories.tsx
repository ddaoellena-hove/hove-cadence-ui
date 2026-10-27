import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModeFilter, type ModeFilterItem } from "./ModeFilter";
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
    if (args.items !== undefined) throw new Error("Cette story attend des modes");
    return <ModeFilter {...args} modes={TRANSIT} value={value} onChange={(m: ModeName[]) => { setValue(m); args.onChange?.(m); }} />;
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

const LINES: ModeFilterItem[] = [
  { id: "rer-b", label: "RER B", badge: { code: "B", mode: "rer", color: "#5291ce" } },
  { id: "metro-13", label: "Métro 13", badge: { code: "13", mode: "metro", color: "#82c8e6" } },
  { id: "other", label: "Autres lignes" },
];

/** Identifiants de ligne, badges et groupe agrégé sans picto. */
export const Lignes: Story = {
  args: { modes: undefined, items: LINES, "aria-label": "Filtrer par ligne", allLabel: "Toutes", selection: "single", onChange: fn() },
  render: function Demo(args) {
    const [value, setValue] = useState<string[]>([]);
    return <ModeFilter items={LINES} aria-label="Filtrer par ligne" allLabel="Toutes" selection="single" value={value}
      onChange={ids => { setValue(ids); if (args.items !== undefined) args.onChange?.(ids); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("button", { name: "Toutes" });
    const rer = canvas.getByRole("button", { name: "RER B" });
    const metro = canvas.getByRole("button", { name: "Métro 13" });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(rer);
    await expect(args.onChange).toHaveBeenLastCalledWith(["rer-b"]);
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(metro);
    await expect(rer).toHaveAttribute("aria-pressed", "false");
    await expect(metro).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Autres lignes" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(["other"]);
    await userEvent.click(all);
    await expect(args.onChange).toHaveBeenLastCalledWith([]);
  },
};

export const LignesMultiples: Story = {
  args: { modes: undefined, items: LINES, "aria-label": "Filtrer par ligne", allLabel: "Toutes", onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "RER B" }));
    await userEvent.click(canvas.getByRole("button", { name: "Métro 13" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(["rer-b", "metro-13"]);
    await userEvent.click(canvas.getByRole("button", { name: "Toutes" }));
    await expect(args.onChange).toHaveBeenLastCalledWith([]);
  },
};
