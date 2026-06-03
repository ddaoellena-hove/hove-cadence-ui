import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Dropdown } from "./Dropdown";
import type { DropdownOption } from "./Dropdown";

// ── Sample data ────────────────────────────────────────────────────────────────

const basicOptions: DropdownOption[] = [
  { id: "paris", label: "Paris" },
  { id: "lyon", label: "Lyon" },
  { id: "marseille", label: "Marseille" },
  { id: "bordeaux", label: "Bordeaux" },
  { id: "nantes", label: "Nantes" },
];

const optionsWithDivider: DropdownOption[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "yesterday", label: "Hier" },
  { id: "last7", label: "7 derniers jours" },
  { id: "last30", label: "30 derniers jours", divider: true },
  { id: "custom", label: "Période personnalisée" },
];

const optionsWithIcons: DropdownOption[] = [
  {
    id: "map",
    label: "Vue carte",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2V4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 2v10M10 4v10" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "list",
    label: "Vue liste",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "chart",
    label: "Vue graphique",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const optionsWithDisabled: DropdownOption[] = [
  { id: "active", label: "Actif" },
  { id: "pending", label: "En attente" },
  { id: "archived", label: "Archivé", disabled: true },
  { id: "deleted", label: "Supprimé", disabled: true },
];

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    options: basicOptions,
    placeholder: "Sélectionner…",
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: "24px", minHeight: "200px" }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: "lyon",
  },
};

export const WithIcons: Story = {
  args: {
    options: optionsWithIcons,
    value: "map",
  },
};

export const WithDivider: Story = {
  args: {
    options: optionsWithDivider,
    placeholder: "Sélectionner une période",
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: optionsWithDisabled,
    value: "active",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "paris",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("paris");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Dropdown options={basicOptions} value={value} onChange={setValue} />
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Sélection : <strong>{value ?? "—"}</strong>
        </p>
      </div>
    );
  },
};
