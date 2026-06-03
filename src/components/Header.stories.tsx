import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./Header";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

const breadcrumbs = [
  { id: "home", label: "Accueil", href: "#" },
  { id: "scenarios", label: "Scénarios", href: "#" },
  { id: "current", label: "IV Multicritère" },
];

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    title: "IV Multicritère",
    breadcrumbs,
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: "32px", background: "#f9fafb", minHeight: 120 }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: {
    subtitle: "Analyse comparative des scénarios de mobilité sur le réseau métropolitain.",
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <SecondaryButton label="Exporter" />
        <PrimaryButton label="Nouveau scénario" />
      </>
    ),
  },
};

export const WithActionsAndSubtitle: Story = {
  args: {
    subtitle: "Analyse comparative des scénarios de mobilité sur le réseau métropolitain.",
    actions: (
      <>
        <SecondaryButton label="Exporter" />
        <PrimaryButton label="Nouveau scénario" />
      </>
    ),
  },
};

export const NoBreadcrumbs: Story = {
  args: {
    breadcrumbs: undefined,
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de l'activité du réseau.",
  },
};

export const LongTitle: Story = {
  args: {
    title: "Scénarios de mobilité — Perturbations non planifiées Q2 2026",
    breadcrumbs: [
      { id: "home", label: "Accueil", href: "#" },
      { id: "traffic", label: "Traffic Report", href: "#" },
      { id: "current", label: "Perturbations non planifiées" },
    ],
  },
};
