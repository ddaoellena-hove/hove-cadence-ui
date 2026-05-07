import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["unchecked", "hover", "checked", "indeterminate", "disabled", "disabled-checked"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [hovered, setHovered] = useState(false);

    const state = checked ? "checked" : hovered ? "hover" : "unchecked";

    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Checkbox state={state} onChange={(next) => setChecked(next)} />
      </div>
    );
  },
};

export const Hover: Story = {
  args: { state: "hover" },
};

export const Checked: Story = {
  args: { state: "checked" },
};

export const Indeterminate: Story = {
  args: { state: "indeterminate" },
};

export const Disabled: Story = {
  args: { state: "disabled" },
};

export const DisabledChecked: Story = {
  args: { state: "disabled-checked" },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "16px",
      }}
    >
      <Checkbox state="unchecked" />
      <Checkbox state="hover" />
      <Checkbox state="checked" />
      <Checkbox state="indeterminate" />
      <Checkbox state="disabled" />
      <Checkbox state="disabled-checked" />
    </div>
  ),
};
