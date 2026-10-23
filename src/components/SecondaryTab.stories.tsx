import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SecondaryTab } from "./SecondaryTab";
import { SegmentedControl } from "./SegmentedControl";
import { TabList } from "./TabList";

const meta: Meta<typeof SecondaryTab> = {
  title: "Composants/Navigation/SecondaryTab",
  component: SecondaryTab,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  // Un onglet vit toujours dans un TabList (role="tab" exige role="tablist")
  render: (args) => (
    <TabList aria-label="Exemple" level="secondary">
      <SecondaryTab {...args} />
    </TabList>
  ),
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
      <TabList aria-label="Statut de publication" level="secondary">
        {items.map((it) => (
          <SecondaryTab
            key={it.id}
            label={it.label}
            count={it.count}
            variant={active === it.id ? "active" : "default"}
            onClick={() => setActive(it.id)}
          />
        ))}
      </TabList>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Parcours au clavier, sans souris
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: /^Publiés/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: /^Planifiés/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("tab", { name: /^Publiés/ })).toHaveAttribute("aria-selected", "true");
  },
};

/**
 * Hiérarchie à deux niveaux : `SegmentedControl` (vue principale) + rangée de
 * `SecondaryTab` (sous-filtres de la vue sélectionnée).
 */
export const TwoLevels: Story = {
  name: "Deux niveaux (SegmentedControl + SecondaryTab)",
  render: () => {
    const [primary, setPrimary] = useState("datasets");
    const [secondary, setSecondary] = useState("published");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}>
        <SegmentedControl aria-label="Section" value={primary} onChange={setPrimary}
          options={[{ value: "datasets", label: "Jeux de données" }, { value: "stops", label: "Arrêts" }]} />

        {/* Niveau 2 — SecondaryTab */}
        <TabList aria-label="Statut de publication" level="secondary">
          {[
            { id: "published", label: "Publiés", count: 4 },
            { id: "planned", label: "Planifiés", count: 1 },
            { id: "drafts", label: "Brouillons", count: 1 },
          ].map((s) => (
            <SecondaryTab
              key={s.id}
              id={`section-${s.id}`}
              controls="section-content"
              label={s.label}
              count={s.count}
              variant={secondary === s.id ? "active" : "default"}
              onClick={() => setSecondary(s.id)}
            />
          ))}
        </TabList>
        <div role="tabpanel" id="section-content" aria-labelledby={`section-${secondary}`} tabIndex={0}>
          {primary === "datasets" ? "Jeux de données" : "Arrêts"} — {secondary === "published" ? "Publiés" : secondary === "planned" ? "Planifiés" : "Brouillons"}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Arrêts" }));
    await userEvent.click(canvas.getByRole("tab", { name: /^Planifiés/ }));
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Arrêts — Planifiés");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Arrêts — Brouillons");
    await expect(canvas.getByRole("radio", { name: "Arrêts" })).toBeChecked();
  },
};
