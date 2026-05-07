import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioButton } from "./RadioButton";

const meta: Meta<typeof RadioButton> = {
  title: "Components/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "hover", "selected", "disabled"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    const [hovered, setHovered] = useState(false);

    const state = selected ? "selected" : hovered ? "hover" : "default";

    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RadioButton state={state} onChange={() => setSelected((s) => !s)} />
      </div>
    );
  },
};

export const Hover: Story = {
  args: { state: "hover" },
};

export const Selected: Story = {
  args: { state: "selected" },
};

export const Disabled: Story = {
  args: { state: "disabled" },
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
      <RadioButton state="default" />
      <RadioButton state="hover" />
      <RadioButton state="selected" />
      <RadioButton state="disabled" />
    </div>
  ),
};
