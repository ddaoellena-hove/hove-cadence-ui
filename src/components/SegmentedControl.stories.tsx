import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "./SegmentedControl";

const twoTabs = [
  { value: "tab-1", label: "Tab 1" },
  { value: "tab-2", label: "Tab 2" },
];

const threeTabs = [
  { value: "tab-1", label: "Tab 1" },
  { value: "tab-2", label: "Tab 2" },
  { value: "tab-3", label: "Tab 3" },
];

const fourTabs = [
  { value: "tab-1", label: "Tab 1" },
  { value: "tab-2", label: "Tab 2" },
  { value: "tab-3", label: "Tab 3" },
  { value: "tab-4", label: "Tab 4" },
];

const meta: Meta<typeof SegmentedControl> = {
  title: "Composants/Formulaires/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  argTypes: {
    disabled: { control: { type: "boolean" } },
    "aria-label": { control: { type: "text" } },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const TwoTabs: Story = {
  args: {
    options: twoTabs,
    defaultValue: "tab-1",
  },
};

export const ThreeTabs: Story = {
  args: {
    options: threeTabs,
    defaultValue: "tab-1",
  },
};

export const SecondActive: Story = {
  args: {
    options: threeTabs,
    defaultValue: "tab-2",
  },
};

/** Dernier choix actif : la pastille garde 4px de marge à droite, comme ailleurs. */
export const ThirdActive: Story = {
  args: {
    options: threeTabs,
    defaultValue: "tab-3",
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(".segmented-control")!;
    const pill = canvasElement.querySelector<HTMLElement>(".segmented-control__pill")!;
    pill.style.transition = "none";
    await waitFor(() => {
      const r = root.getBoundingClientRect();
      const p = pill.getBoundingClientRect();
      expect(r.right - p.right).toBe(4);
      expect(p.top - r.top).toBe(4);
    });
  },
};

export const FourTabs: Story = {
  args: {
    options: fourTabs,
    defaultValue: "tab-1",
  },
};

export const Disabled: Story = {
  args: {
    options: threeTabs,
    defaultValue: "tab-1",
    disabled: true,
  },
};

export const CustomLabels: Story = {
  args: {
    options: [
      { value: "day", label: "Jour" },
      { value: "week", label: "Semaine" },
      { value: "month", label: "Mois" },
    ],
    defaultValue: "week",
  },
};

export const Clavier: Story = {
  args: { options: threeTabs, "aria-label": "Vue" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await userEvent.click(radios[0]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(radios[2]).toHaveFocus();
    await expect(radios[2]).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    await expect(radios[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(radios[2]).toBeChecked();
    await userEvent.keyboard("{Home}");
    await expect(radios[0]).toBeChecked();
  },
};

/** Option désactivée : grisée, ni cliquable ni atteinte aux flèches. */
export const OptionDesactivee: Story = {
  name: "Option désactivée",
  args: {
    "aria-label": "Échelle",
    options: [
      { value: "fit", label: "Ajuster" },
      { value: "60", label: "1 h", disabled: true },
      { value: "30", label: "30 min" },
      { value: "15", label: "15 min" },
    ],
    defaultValue: "fit",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "1 h" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("radio", { name: "Ajuster" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "30 min" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "30 min" })).toBeChecked();
  },
};
