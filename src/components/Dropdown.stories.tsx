import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
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
  title: "Composants/Formulaires/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
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

export const WithLabel: Story = {
  args: {
    label: "Réseau de transport",
    placeholder: "Sélectionner un réseau…",
    options: basicOptions,
  },
};

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

/** Variante bouton (PrimaryButton outline sm) : pour l'en-tête d'un dashboard. */
export const VarianteBouton: Story = {
  name: "Variante bouton",
  args: { variant: "button", "aria-label": "Vue", options: optionsWithIcons, value: "map" },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <Dropdown {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /^Vue : / });
    await expect(trigger).toHaveClass("primary-button", "primary-button--outline", "base-button--sm");
    await userEvent.click(trigger);
    await expect(canvas.getByRole("listbox")).toBeInTheDocument();
  },
};

/**
 * Options groupées : `groupLabel` (en-tête de section) + `divider`.
 * Couvre le sélecteur de contexte du fil d'Ariane (`Breadcrumbs` item `content`).
 */
/**
 * Groupes : chaque `groupLabel` ouvre un `role="group"` nommé par son en-tête.
 * La liste porte le nom du champ. Au clavier, Tab parcourt les seules options.
 */
export const WithGroups: Story = {
  name: "With groups (groupLabel + divider)",
  render: () => {
    const [value, setValue] = useState("traffic");
    const options: DropdownOption[] = [
      { id: "datahub", label: "Datahub", groupLabel: "Produits" },
      { id: "traffic", label: "Traffic Report" },
      { id: "insights", label: "Insights" },
      { id: "settings", label: "Paramètres", groupLabel: "Autre", divider: true },
    ];
    return (
      <div style={{ minHeight: 280 }}>
        <Dropdown variant="button" aria-label="Produit" options={options} value={value} onChange={setValue} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Ouverture au clavier, sans souris
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Produit : Traffic Report" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const listbox = canvas.getByRole("listbox", { name: "Produit" });
    const products = within(listbox).getByRole("group", { name: "Produits" });
    await expect(within(products).getAllByRole("option")).toHaveLength(3);
    const other = within(listbox).getByRole("group", { name: "Autre" });
    await expect(within(other).getByRole("option", { name: "Paramètres" })).toBeInTheDocument();
    // L'en-tête de groupe n'est plus masqué aux lecteurs d'écran
    await expect(canvas.getByText("Produits")).not.toHaveAttribute("aria-hidden");

    // Tab parcourt les options et saute en-têtes et séparateur
    const visited: string[] = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      visited.push(document.activeElement?.textContent ?? "");
    }
    await expect(visited).toEqual(["Datahub", "Traffic Report", "Insights", "Paramètres"]);
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Produit : Paramètres" })).toBeInTheDocument();
  },
};

/** Avec un label visible : la liste prend le nom du label (aria-labelledby). */
export const ListeNommeeParLeLabel: Story = {
  name: "Liste nommée par le label",
  args: { label: "Réseau", options: basicOptions },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Réseau/ }));
    await expect(canvas.getByRole("listbox", { name: "Réseau" })).toBeInTheDocument();
  },
};

const ClipBox = ({ children, height }: { children: ReactNode; height: number }) => (
  <div data-testid="clip" style={{ height, width: 360, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16, boxSizing: "border-box" }}>
    {children}
  </div>
);

const CAUSES = [{ id: "a", label: "Travaux" }, { id: "b", label: "Météo" }, { id: "c", label: "Incident technique" }];

/** Près du bas d'un conteneur qui coupe : le menu passe au-dessus du champ. */
export const RetourneAuDessus: Story = {
  name: "Retourné au-dessus",
  render: () => <ClipBox height={260}><Dropdown label="Cause" options={CAUSES} /></ClipBox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Cause/ }));
    const panel = canvas.getByRole("listbox");
    await expect(panel).toHaveAttribute("data-placement", "top");
    await expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(canvas.getByTestId("clip").getBoundingClientRect().bottom);
    await expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(canvas.getByTestId("clip").getBoundingClientRect().top);
  },
};

/** `placement="top"` force l'ouverture au-dessus ; le menu ne se retourne pas s'il tient en dessous. */
export const PlacementForce: Story = {
  name: "Placement forcé",
  render: () => <div style={{ padding: "180px 16px", width: 320 }}><Dropdown label="Cause" options={CAUSES} placement="top" /><Dropdown label="Motif" options={CAUSES} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Cause/ }));
    await expect(canvas.getByRole("listbox")).toHaveAttribute("data-placement", "top");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: /Motif/ }));
    await expect(canvas.getByRole("listbox")).not.toHaveAttribute("data-placement");
  },
};
