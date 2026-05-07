import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RichRadioButton, type RichRadioButtonProps } from "./RichRadioButton";

const meta: Meta<typeof RichRadioButton> = {
  title: "Components/RichRadioButton",
  component: RichRadioButton,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "hover", "selected", "disabled"],
      control: { type: "select" },
    },
    size: {
      options: ["medium", "large"],
      control: { type: "select" },
    },
    label: {
      control: { type: "text" },
    },
    description: {
      control: { type: "text" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RichRadioButton>;

export const Default: Story = {
  render: (args: RichRadioButtonProps) => {
    const [selected, setSelected] = useState(false);
    const [hovered, setHovered] = useState(false);
    const state = selected ? "selected" : hovered ? "hover" : "default";
    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RichRadioButton
          {...args}
          state={state}
          onChange={() => setSelected((s) => !s)}
        />
      </div>
    );
  },
  args: { label: "Choice" },
};

export const Hover: Story = {
  args: { state: "hover", label: "Choice" },
};

export const Selected: Story = {
  args: { state: "selected", label: "Choice" },
};

export const Disabled: Story = {
  args: { state: "disabled", label: "Choice" },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "16px",
      }}
    >
      <RichRadioButton state="default" label="Choice" />
      <RichRadioButton state="disabled" label="Choice" />
      <RichRadioButton state="hover" label="Choice" />
      <RichRadioButton state="selected" label="Choice" />
    </div>
  ),
};

export const SizeMedium: Story = {
  args: { size: "medium", label: "Choice", state: "default" },
};

export const SizeLarge: Story = {
  render: (args: RichRadioButtonProps) => {
    const [selected, setSelected] = useState(false);
    const [hovered, setHovered] = useState(false);
    const state = selected ? "selected" : hovered ? "hover" : "default";
    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RichRadioButton
          {...args}
          state={state}
          size="large"
          onChange={() => setSelected((s) => !s)}
        />
      </div>
    );
  },
  args: { label: "Choice" },
};

export const WithDescription: Story = {
  render: (args: RichRadioButtonProps) => {
    const [selected, setSelected] = useState(false);
    const [hovered, setHovered] = useState(false);
    const state = selected ? "selected" : hovered ? "hover" : "default";
    return (
      <div
        style={{ display: "inline-flex" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RichRadioButton
          {...args}
          state={state}
          onChange={() => setSelected((s) => !s)}
        />
      </div>
    );
  },
  args: {
    label: "Standard",
    description: "Équilibré pour un usage général",
  },
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    const options = ["Choice A", "Choice B", "Choice C"];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "16px",
        }}
      >
        {options.map((opt) => (
          <RichRadioButton
            key={opt}
            label={opt}
            state={selected === opt ? "selected" : "default"}
            onChange={() => setSelected(opt)}
          />
        ))}
      </div>
    );
  },
};
