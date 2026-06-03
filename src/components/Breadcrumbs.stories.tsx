import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./Breadcrumbs";

// ── Sample data ────────────────────────────────────────────────────────────────

const basicItems: BreadcrumbItem[] = [
  { id: "home", label: "Accueil", href: "#" },
  { id: "reports", label: "Rapports", href: "#" },
  { id: "current", label: "Rapport du 03/06/2026" },
];

const shortItems: BreadcrumbItem[] = [
  { id: "home", label: "Accueil", href: "#" },
  { id: "current", label: "Tableau de bord" },
];

const longItems: BreadcrumbItem[] = [
  { id: "home", label: "Accueil", href: "#" },
  { id: "datahub", label: "Datahub", href: "#" },
  { id: "transport", label: "Transport", href: "#" },
  { id: "lignes", label: "Lignes", href: "#" },
  { id: "current", label: "Ligne 12 — Détail" },
];

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1.5 6.5L7 1.5l5.5 5M3 5.5v6a.5.5 0 00.5.5h2.75V9h1.5v3H10.5a.5.5 0 00.5-.5v-6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const itemsWithIcons: BreadcrumbItem[] = [
  { id: "home", label: "Accueil", href: "#", icon: <HomeIcon /> },
  { id: "rapports", label: "Rapports", href: "#" },
  { id: "current", label: "Perturbations non planifiées" },
];

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  args: {
    items: basicItems,
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: "24px" }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Short: Story = {
  args: {
    items: shortItems,
  },
};

export const Long: Story = {
  args: {
    items: longItems,
  },
};

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
  },
};

export const CustomSeparator: Story = {
  args: {
    items: basicItems,
    separator: <span style={{ fontSize: 12, color: "#d1d5db", padding: "0 2px" }}>/</span>,
  },
};
