import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RichCheckbox, type RichCheckboxProps } from "./RichCheckbox";

const meta: Meta<typeof RichCheckbox> = {
  title: "Components/RichCheckbox",
  component: RichCheckbox,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["unchecked", "hover", "checked", "disabled"],
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

type Story = StoryObj<typeof RichCheckbox>;

export const Default: Story = {
  render: (args: RichCheckboxProps) => {
    const [checked, setChecked] = useState(false);
    return (
      <RichCheckbox
        {...args}
        state={checked ? "checked" : "unchecked"}
        onChange={setChecked}
      />
    );
  },
  args: { label: "Choice" },
};

export const Hover: Story = {
  args: { state: "hover", label: "Choice" },
};

export const Checked: Story = {
  args: { state: "checked", label: "Choice" },
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
      <RichCheckbox state="unchecked" label="Choice" />
      <RichCheckbox state="disabled" label="Choice" />
      <RichCheckbox state="hover" label="Choice" />
      <RichCheckbox state="checked" label="Choice" />
    </div>
  ),
};

export const SizeLarge: Story = {
  render: (args: RichCheckboxProps) => {
    const [checked, setChecked] = useState(false);
    return (
      <RichCheckbox
        {...args}
        state={checked ? "checked" : "unchecked"}
        size="large"
        onChange={setChecked}
      />
    );
  },
  args: { label: "Choice" },
};

export const WithDescription: Story = {
  render: (args: RichCheckboxProps) => {
    const [checked, setChecked] = useState(false);
    return (
      <RichCheckbox
        {...args}
        state={checked ? "checked" : "unchecked"}
        onChange={setChecked}
      />
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
 * la carte grandit en hauteur. Sélection multiple.
 */
export const LongDescriptions: Story = {
  render: () => {
    const [checked, setChecked] = useState<Set<string>>(new Set(["lab"]));
    const toggle = (id: string, next: boolean) =>
      setChecked((prev) => {
        const set = new Set(prev);
        next ? set.add(id) : set.delete(id);
        return set;
      });
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
            <RichCheckbox
              label={opt.label}
              description={opt.description}
              state={checked.has(opt.id) ? "checked" : "unchecked"}
              onChange={(next) => toggle(opt.id, next)}
              className="rich-checkbox--fluid"
            />
          </div>
        ))}
      </div>
    );
  },
};

/** Sélection multiple — plusieurs options peuvent être cochées en même temps. */
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const toggle = (id: string, next: boolean) =>
      setChecked((prev) => {
        const set = new Set(prev);
        next ? set.add(id) : set.delete(id);
        return set;
      });
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
          <RichCheckbox
            key={opt}
            label={opt}
            state={checked.has(opt) ? "checked" : "unchecked"}
            onChange={(next) => toggle(opt, next)}
          />
        ))}
      </div>
    );
  },
};
