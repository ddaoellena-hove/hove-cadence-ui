import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SearchInput, type SearchInputProps } from "./SearchInput";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof SearchInput> = {
  title: "Composants/Formulaires/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: {
    value: "",
    placeholder: "Rechercher une perturbation, une référence…",
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

/** Champ contrôlé : la story garde la valeur et relaie onChange. */
const Controlled = (args: SearchInputProps) => {
  const [value, setValue] = useState(args.value);
  return (
    <SearchInput
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
    />
  );
};

/** Vide : loupe et placeholder, pas de bouton « effacer ». */
export const Defaut: Story = {
  name: "Défaut",
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("searchbox", { name: "Rechercher" });
    await expect(canvas.queryByRole("button", { name: "Effacer la recherche" })).toBeNull();

    // La saisie appelle onChange ; le bouton « effacer » apparaît
    await userEvent.type(input, "ligne 13");
    await expect(args.onChange).toHaveBeenLastCalledWith("ligne 13");
    const clear = canvas.getByRole("button", { name: "Effacer la recherche" });

    // « Effacer » vide le champ et rend le focus à la saisie
    await userEvent.click(clear);
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Effacer la recherche" })).toBeNull();
  },
};

/** Avec une valeur : Échap vide le champ. */
export const AvecValeur: Story = {
  name: "Avec valeur",
  args: { value: "Châtillon" },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("searchbox", { name: "Rechercher" });
    await expect(input).toHaveValue("Châtillon");
    await userEvent.click(input);
    await userEvent.keyboard("{Escape}");
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(input).toHaveValue("");
  },
};

/** Désactivé : grisé comme un bouton outline désactivé, sans bouton « effacer ». */
export const Desactive: Story = {
  name: "Désactivé",
  args: { value: "ligne 13", disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("searchbox")).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Effacer la recherche" })).toBeNull();
  },
};

/** À côté de filtres en variante bouton : même hauteur, mais une forme de champ (coins de 8px) qui le distingue des pilules. */
export const ACoteDeFiltres: Story = {
  name: "À côté de filtres",
  decorators: [
    (Story) => (
      <div style={{ width: 760, padding: 8, minHeight: 220 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [line, setLine] = useState("all");
    const [severity, setSeverity] = useState("all");
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: "0 1 320px", minWidth: 200 }}>
          <Controlled {...args} />
        </div>
        <Dropdown
          variant="button"
          aria-label="Ligne"
          options={[
            { id: "all", label: "Toutes les lignes" },
            { id: "l13", label: "Ligne 13" },
          ]}
          value={line}
          onChange={setLine}
        />
        <Dropdown
          variant="button"
          aria-label="Sévérité"
          options={[
            { id: "all", label: "Toutes les sévérités" },
            { id: "critical", label: "Critique" },
          ]}
          value={severity}
          onChange={setSeverity}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvasElement.querySelector(".search-input") as HTMLElement;
    const filter = canvas.getByRole("button", { name: "Ligne : Toutes les lignes" });
    // Même hauteur que les filtres voisins (29px)
    await expect(Math.round(field.getBoundingClientRect().height)).toBe(Math.round(filter.getBoundingClientRect().height));
    await expect(Math.round(field.getBoundingClientRect().height)).toBe(29);
    // … mais une forme de champ (coins de 8px), distincte des pilules des filtres
    await expect(getComputedStyle(field).borderRadius).toBe("8px");
    await expect(getComputedStyle(filter).borderRadius).not.toBe("8px");
  },
};
