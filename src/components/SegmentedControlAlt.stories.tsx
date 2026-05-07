import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControlAlt } from "./SegmentedControlAlt";

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

const meta: Meta<typeof SegmentedControlAlt> = {
  title: "Components/SegmentedControlAlt",
  component: SegmentedControlAlt,
  tags: ["autodocs"],
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

type Story = StoryObj<typeof SegmentedControlAlt>;

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

export const ThirdActive: Story = {
  args: {
    options: threeTabs,
    defaultValue: "tab-3",
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
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ],
    defaultValue: "week",
  },
};
