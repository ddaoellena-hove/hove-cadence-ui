import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "hover", "active", "disabled"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState(false);
    const [hovered, setHovered] = useState(false);

    const state = active ? "active" : hovered ? "hover" : "default";

    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Toggle state={state} onChange={(next) => setActive(next)} />
      </div>
    );
  },
};

export const Hover: Story = {
  args: { state: "hover" },
};

export const Active: Story = {
  args: { state: "active" },
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
      <Toggle state="default" />
      <Toggle state="hover" />
      <Toggle state="active" />
      <Toggle state="disabled" />
    </div>
  ),
};
