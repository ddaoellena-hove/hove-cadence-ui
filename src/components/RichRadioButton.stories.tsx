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

/**
 * Plusieurs options alignées avec des descriptions longues :
 * le texte passe à la ligne et reste entièrement lisible,
 * la carte grandit en hauteur.
 */
export const LongDescriptions: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>("lab");
    const options = [
      {
        id: "studio",
        label: "Studio immersif",
        description: "Petit groupe, forte qualité d'échange et accompagnement personnalisé",
      },
      {
        id: "forum",
        label: "Forum central",
        description: "Grand volume, parcours ouvert et programmation continue toute la journée",
      },
      {
        id: "lab",
        label: "Lab modulaire",
        description: "Configuration flexible pour démos, ateliers pratiques et sessions de co-création",
      },
    ];
    return (
      <div style={{ display: "flex", gap: 12, padding: 16 }}>
        {options.map((opt) => (
          <div key={opt.id} style={{ flex: 1, minWidth: 0, display: "flex" }}>
            <RichRadioButton
              label={opt.label}
              description={opt.description}
              state={selected === opt.id ? "selected" : "default"}
              onChange={() => setSelected(opt.id)}
              className="rich-radio-button--fluid"
            />
          </div>
        ))}
      </div>
    );
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
