import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { Dropdown } from "./Dropdown";

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
  title: "Composants/Navigation/Breadcrumbs",
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

/** Sélecteur de contexte : `content` avec un Dropdown en variante bouton (aucune classe interne). */
export const WithDropdown: Story = {
  name: "With Dropdown (button)",
  render: () => {
    const [product, setProduct] = useState("traffic");
    return (
      <Breadcrumbs
        items={[
          { id: "home", label: "Accueil", href: "#" },
          {
            id: "product",
            label: "Produit",
            content: (
              <Dropdown
                variant="button"
                aria-label="Produit"
                value={product}
                onChange={setProduct}
                options={[
                  { id: "datahub", label: "Datahub" },
                  { id: "traffic", label: "Traffic Report" },
                  { id: "insights", label: "Insights" },
                ]}
              />
            ),
          },
          { id: "current", label: "Perturbations non planifiées" },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Le <li> et les séparateurs sont conservés autour du sélecteur
    const items = canvasElement.querySelectorAll(".breadcrumbs__item");
    await expect(items).toHaveLength(3);
    await expect(items[1].querySelector(".breadcrumbs__separator")).not.toBeNull();
    await expect(canvas.getByRole("group", { name: "Produit" })).toContainElement(
      canvas.getByRole("button", { name: /^Produit : / }),
    );
  },
};
