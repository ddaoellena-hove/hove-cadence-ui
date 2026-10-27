import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CategoryFilter, type CategoryFilterItem } from "./CategoryFilter";
import { Icons } from "./Icons";
import { ModeIcon } from "./ModeIcon";

// Catalogue d'un référentiel transport : sept catégories, données d'exemple.
const CATALOGUE: CategoryFilterItem[] = [
  { id: "reseaux", label: "Réseaux", count: 42, icon: <ModeIcon mode="network" size={20} /> },
  { id: "modes-physiques", label: "Modes physiques", count: 9, icon: <Icons icon="train" size={20} /> },
  { id: "modes-commerciaux", label: "Modes commerciaux", count: 14, icon: <Icons icon="tram" size={20} /> },
  { id: "lignes", label: "Lignes", count: 1984, icon: <Icons icon="route" size={20} /> },
  { id: "parcours", label: "Parcours", count: 7316, icon: <Icons icon="switch-horizontal-01" size={20} /> },
  { id: "zones-arret", label: "Zones d’arrêt", count: 38412, icon: <Icons icon="map-01" size={20} /> },
  { id: "points-arret", label: "Points d’arrêt", count: 61207, icon: <Icons icon="marker-pin-01" size={20} /> },
];

const meta: Meta<typeof CategoryFilter> = {
  title: "Composants/Données et tableaux/CategoryFilter",
  component: CategoryFilter,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { "aria-label": "Catégories du catalogue", items: CATALOGUE, value: "lignes", onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof CategoryFilter>;

/** Sélection contrôlée : l'app tient `value` et met à jour la liste dessous. */
const Controlled = (args: Story["args"] & { items: CategoryFilterItem[] }) => {
  const [value, setValue] = useState(args.value ?? args.items[0].id);
  const current = args.items.find((item) => item.id === value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CategoryFilter
        aria-label={args["aria-label"] ?? "Catégories"}
        items={args.items}
        className={args.className}
        value={value}
        onChange={(id) => { setValue(id); args.onChange?.(id); }}
      />
      <p style={{ margin: 0, fontFamily: "var(--cadence-font-sans)", color: "var(--cadence-color-primary, #002830)" }}>Tableau affiché : {current?.label}</p>
    </div>
  );
};

/** Catalogue à sept catégories. Recliquer la catégorie active la conserve. */
export const Catalogue: Story = {
  render: (args) => <Controlled {...args} items={args.items ?? CATALOGUE} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Catégories du catalogue" });
    await expect(within(group).getAllByRole("radio")).toHaveLength(7);
    // Nom accessible : libellé puis effectif formaté.
    const lignes = canvas.getByRole("radio", { name: /^Lignes, 1\s984$/ });
    await expect(lignes).toHaveAttribute("aria-checked", "true");

    const parcours = canvas.getByRole("radio", { name: /^Parcours/ });
    await userEvent.click(parcours);
    await expect(parcours).toHaveAttribute("aria-checked", "true");
    await expect(lignes).toHaveAttribute("aria-checked", "false");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith("parcours");
    await expect(canvas.getByText("Tableau affiché : Parcours")).toBeInTheDocument();

    // Second clic sur l'active : pas de désélection, pas d'appel.
    await userEvent.click(parcours);
    await expect(parcours).toHaveAttribute("aria-checked", "true");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Clavier : une seule tuile tabulable ; flèches, Home et End déplacent le
 * focus et sélectionnent, en sautant les catégories désactivées.
 */
export const NavigationClavier: Story = {
  name: "Navigation clavier",
  args: {
    items: CATALOGUE.map((item) => (item.id === "modes-commerciaux" || item.id === "points-arret" ? { ...item, disabled: true } : item)),
    value: "reseaux",
  },
  render: (args) => (
    <>
      <button type="button">Avant</button>
      <Controlled {...args} items={args.items ?? CATALOGUE} />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radio = (name: RegExp) => canvas.getByRole("radio", { name });
    canvas.getByRole("button", { name: "Avant" }).focus();

    await userEvent.tab();
    await expect(radio(/^Réseaux/)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(radio(/^Modes physiques/)).toHaveFocus();
    await expect(radio(/^Modes physiques/)).toHaveAttribute("aria-checked", "true");
    // « Modes commerciaux » est désactivé : sauté.
    await userEvent.keyboard("{ArrowRight}");
    await expect(radio(/^Lignes/)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(radio(/^Modes physiques/)).toHaveFocus();
    // End : dernière catégorie disponible (« Points d’arrêt » est désactivé).
    await userEvent.keyboard("{End}");
    await expect(radio(/^Zones d’arrêt/)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(radio(/^Réseaux/)).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(radio(/^Zones d’arrêt/)).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(radio(/^Réseaux/)).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith("reseaux");

    // Une seule entrée dans l'ordre de tabulation : Tab sort du groupe.
    const tabbable = canvas.getAllByRole("radio").filter((el) => el.tabIndex === 0);
    await expect(tabbable).toHaveLength(1);
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole("button", { name: "Avant" })).toHaveFocus();
  },
};

/** Effectifs nuls affichés : 0 reste sélectionnable, distinct de désactivé. */
export const ZeroResultat: Story = {
  name: "Zéro résultat",
  args: {
    items: CATALOGUE.map((item, i) => (i >= 4 ? { ...item, count: 0 } : item)),
    value: "reseaux",
  },
  render: (args) => <Controlled {...args} items={args.items ?? CATALOGUE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parcours = canvas.getByRole("radio", { name: "Parcours, 0" });
    await expect(parcours).toBeEnabled();
    await userEvent.click(parcours);
    await expect(parcours).toHaveAttribute("aria-checked", "true");
  },
};

/** Grands effectifs, formatés en français (espace fine insécable des milliers). */
export const GrandsEffectifs: Story = {
  name: "Grands effectifs",
  args: {
    items: CATALOGUE.map((item, i) => ({ ...item, count: [128, 2_450, 18_903, 241_576, 1_204_388, 9_876_543, 12_345_678][i] })),
    value: "points-arret",
  },
  render: (args) => <Controlled {...args} items={args.items ?? CATALOGUE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/^12\s345\s678$/)).toBeInTheDocument();
    await expect(canvas.getByRole("radio", { name: /^Réseaux, 128$/ })).toBeInTheDocument();
  },
};

/** Libellés longs : deux lignes réservées, au-delà le texte continue sans troncature. */
export const LibellesLongs: Story = {
  name: "Libellés longs",
  args: {
    items: [
      { id: "a", label: "Zones d’arrêt multimodales", count: 312, icon: <Icons icon="map-01" size={20} /> },
      { id: "b", label: "Points d’arrêt accessibles aux fauteuils roulants", count: 4_870, icon: <Icons icon="marker-pin-01" size={20} /> },
      { id: "c", label: "Correspondances", count: 96, icon: <Icons icon="switch-horizontal-01" size={20} /> },
      { id: "d", label: "Lignes", count: 18 },
    ],
    value: "b",
  },
  render: (args) => <Controlled {...args} items={args.items ?? CATALOGUE} />,
};

/** Catégories désactivées : grisées, hors clic et hors clavier. */
export const Desactives: Story = {
  name: "Éléments désactivés",
  args: {
    items: CATALOGUE.map((item, i) => (i === 1 || i === 2 ? { ...item, disabled: true } : item)),
    value: "reseaux",
  },
  render: (args) => <Controlled {...args} items={args.items ?? CATALOGUE} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole("radio", { name: /^Modes physiques/ });
    await expect(disabled).toBeDisabled();
    await userEvent.click(disabled, { pointerEventsCheck: 0 });
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(disabled).toHaveAttribute("aria-checked", "false");
  },
};

/** Conteneur étroit : les tuiles passent sur moins de colonnes, sans débordement. */
export const ConteneurEtroit: Story = {
  name: "Conteneur étroit",
  args: {
    items: CATALOGUE.map((item, i) => (i === 6 ? { ...item, count: 1_204_388 } : item)),
  },
  render: (args) => (
    <div data-testid="etroit" style={{ width: 280, border: "1px dashed var(--cadence-color-border, #e5e5e5)", padding: 8 }}>
      <Controlled {...args} items={args.items ?? CATALOGUE} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup");
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
    for (const tile of canvas.getAllByRole("radio")) {
      await expect(tile.scrollWidth).toBeLessThanOrEqual(tile.clientWidth);
    }
  },
};

/**
 * Effectifs rechargés après chaque sélection (données asynchrones) : le
 * changement de compteur ne déplace pas le focus.
 */
export const EffectifsRecharges: Story = {
  name: "Effectifs rechargés",
  render: function Demo(args) {
    const [value, setValue] = useState("lignes");
    const [reloads, setReloads] = useState(0);
    const items = CATALOGUE.map((item) => ({ ...item, count: item.count + reloads }));
    return (
      <CategoryFilter
        aria-label={args["aria-label"]}
        items={items}
        value={value}
        onChange={(id) => {
          setValue(id);
          // Rechargement simulé des effectifs après la sélection.
          window.setTimeout(() => setReloads((n) => n + 1), 50);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("radio", { name: /^Lignes/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    const parcours = canvas.getByRole("radio", { name: /^Parcours/ });
    await expect(parcours).toHaveFocus();
    // Le compteur change après le rechargement ; le focus reste sur la tuile.
    await waitFor(() => expect(canvas.getByRole("radio", { name: /^Parcours, 7\s317$/ })).toBeInTheDocument());
    await expect(parcours).toHaveFocus();
  },
};
