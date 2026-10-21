import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SecondaryTab } from "./SecondaryTab";
import { Tab } from "./Tab";

const meta: Meta<typeof SecondaryTab> = {
  title: "Components/SecondaryTab",
  component: SecondaryTab,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["default", "active"] },
    count: { control: "number" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SecondaryTab>;

export const Default: Story = {
  args: { label: "Publiés", count: 4, variant: "default" },
};

export const Active: Story = {
  args: { label: "Publiés", count: 4, variant: "active" },
};

export const WithoutCount: Story = {
  args: { label: "Tous", variant: "active" },
};

export const Disabled: Story = {
  args: { label: "Brouillons", count: 0, variant: "default", disabled: true },
};

/** Rangée de sous-onglets interactive. */
export const SubTabBar: Story = {
  name: "Sub-tab bar (interactive)",
  render: () => {
    const items = [
      { id: "published", label: "Publiés", count: 4 },
      { id: "planned", label: "Planifiés", count: 1 },
      { id: "drafts", label: "Brouillons", count: 1 },
    ];
    const [active, setActive] = useState("published");
    return (
      <div style={{ display: "inline-flex", gap: 4 }}>
        {items.map((it) => (
          <SecondaryTab
            key={it.id}
            label={it.label}
            count={it.count}
            variant={active === it.id ? "active" : "default"}
            onClick={() => setActive(it.id)}
          />
        ))}
      </div>
    );
  },
};

/**
 * Hiérarchie à deux niveaux : rangée de `Tab` (niveau page) + rangée de
 * `SecondaryTab` (sous-filtres de la vue sélectionnée).
 */
export const TwoLevels: Story = {
  name: "Two levels (Tab + SecondaryTab)",
  render: () => {
    const [primary, setPrimary] = useState("datasets");
    const [secondary, setSecondary] = useState("published");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}>
        {/* Niveau 1 — Tab, avec séparateur pleine largeur */}
        <div style={{ display: "inline-flex", gap: 24, borderBottom: "1px solid var(--cadence-color-border, #e5e5e5)" }}>
          {[
            { id: "datasets", label: "Jeux de données" },
            { id: "stops", label: "Arrêts" },
          ].map((t) => (
            <Tab
              key={t.id}
              label={t.label}
              variant={primary === t.id ? "active" : "default"}
              onClick={() => setPrimary(t.id)}
            />
          ))}
        </div>

        {/* Niveau 2 — SecondaryTab */}
        <div style={{ display: "inline-flex", gap: 4 }}>
          {[
            { id: "published", label: "Publiés", count: 4 },
            { id: "planned", label: "Planifiés", count: 1 },
            { id: "drafts", label: "Brouillons", count: 1 },
          ].map((s) => (
            <SecondaryTab
              key={s.id}
              label={s.label}
              count={s.count}
              variant={secondary === s.id ? "active" : "default"}
              onClick={() => setSecondary(s.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};
