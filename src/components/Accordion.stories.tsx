import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Dropdown } from "./Dropdown";
import { Accordion } from "./Accordion";
import { StopLabel } from "./StopLabel";

const meta: Meta<typeof Accordion> = {
  title: "Composants/Structure et mise en page/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const ITEMS = [
  { id: "info", title: "Informations générales", content: <StopLabel name="Châtelet" id="stop_area:IDFM:474151" city="Paris 1er" /> },
  { id: "lignes", title: "Lignes impactées", content: "Lignes 1, 4, RER A et RER B." },
  { id: "mesures", title: "Mesures de substitution", content: "Bus de remplacement entre Châtelet et Nation." },
];

export const Simple: Story = {
  args: { items: ITEMS, mode: "single" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: /Informations générales/ });
    await expect(first).toHaveAttribute("aria-expanded", "false");

    // Ouvre le premier.
    await userEvent.click(first);
    await expect(first).toHaveAttribute("aria-expanded", "true");

    // Mode single : ouvrir le deuxième referme le premier.
    const second = canvas.getByRole("button", { name: /Lignes impactées/ });
    await userEvent.click(second);
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  },
};

export const Multiple: Story = {
  args: { items: ITEMS.map((i, idx) => ({ ...i, defaultOpen: idx === 0 })), mode: "multiple" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: /Informations générales/ });
    const second = canvas.getByRole("button", { name: /Lignes impactées/ });
    // Les deux peuvent rester ouverts.
    await userEvent.click(second);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  },
};

/** Plusieurs valeurs initiales ne doivent pas contourner le mode single. */
export const OuvertureInitialeUnique: Story = {
  args: { items: ITEMS.map((item) => ({ ...item, defaultOpen: true })), mode: "single" },
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons.filter((button) => button.getAttribute("aria-expanded") === "true")).toHaveLength(1);
  },
};

/** Un menu ouvert dans le contenu déborde du panneau sans être coupé. */
export const MenuDansLeContenu: Story = {
  name: "Menu dans le contenu",
  render: () => (
    <div style={{ width: 420, paddingBottom: 220 }}>
      <Accordion items={[{
        id: "details",
        title: "Détails de la perturbation",
        defaultOpen: true,
        content: <Dropdown label="Cause" placeholder="Sélectionner" options={[{ id: "a", label: "Travaux" }, { id: "b", label: "Météo" }, { id: "c", label: "Incident technique" }, { id: "d", label: "Grève" }]} />,
      }]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvasElement.querySelector<HTMLElement>(".accordion__content")!;
    await waitFor(() => expect(getComputedStyle(content).overflowY).toBe("visible"));
    await userEvent.click(canvas.getByRole("button", { name: /Cause/ }));
    const last = await canvas.findByRole("option", { name: "Grève" });
    const box = last.getBoundingClientRect();
    await expect(box.bottom).toBeGreaterThan(content.getBoundingClientRect().bottom);
    // Le point le plus bas du menu est bien l'option, pas ce qui suit le panneau
    await expect(last.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 4))).toBe(true);
  },
};
