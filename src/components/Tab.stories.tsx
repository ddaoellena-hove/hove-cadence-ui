import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tab } from "./Tab";
import { TabList } from "./TabList";

const meta: Meta<typeof Tab> = {
  title: "Composants/Navigation/Tab",
  component: Tab,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  // Un onglet vit toujours dans un TabList (role="tab" exige role="tablist")
  render: (args) => (
    <TabList aria-label="Exemple">
      <Tab {...args} />
    </TabList>
  ),
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "active"],
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    label: "Label",
    variant: "default",
  },
};

export const Active: Story = {
  args: {
    label: "Label",
    variant: "active",
  },
};


/** Rangée d'onglets dans un TabList : ←/→, Début / Fin, seul l'actif est tabulable. */
export const TabBar: Story = {
  name: "Tab bar (interactive)",
  render: () => {
    const tabs = ["En cours", "À venir", "Passées", "Brouillons"];
    const [active, setActive] = useState("En cours");
    return (
      <div style={{ borderBottom: "1px solid var(--cadence-color-border, #e5e5e5)", padding: "0 8px" }}>
        <TabList aria-label="État des scénarios">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              label={tab}
              variant={active === tab ? "active" : "default"}
              onClick={() => setActive(tab)}
            />
          ))}
        </TabList>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Parcours au clavier, sans souris
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "À venir" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: "Brouillons" })).toHaveAttribute("aria-selected", "true");
  },
};

export const Disabled: Story = {
  args: {
    label: "Label",
    variant: "default",
    disabled: true,
  },
};
