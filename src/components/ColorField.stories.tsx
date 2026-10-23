import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ColorField } from "./ColorField";

const meta: Meta<typeof ColorField> = {
  title: "Composants/Formulaires/ColorField",
  component: ColorField,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ColorField>;

/** Saisie d'une couleur de ligne : hex validé + aperçu LineBadge en direct. */
export const Defaut: Story = {
  name: "Défaut",
  render: function Demo() {
    const [color, setColor] = useState("#6EC4E8");
    return <ColorField label="Couleur de la ligne" previewCode="13" previewMode="metro" value={color} onChange={setColor} helperText="Code couleur GTFS (route_color)." />;
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /Couleur de la ligne/ });
    await userEvent.clear(input);
    await userEvent.type(input, "B6007A");
    // Accepté sans « # » puis normalisé en #RRGGBB.
    await expect((input as HTMLInputElement).value.toUpperCase()).toMatch(/B6007A$/);
  },
};

/** Sélecteur HEX dans un Popover : zone saturation / luminosité, teinte, champ HEX. */
export const SelecteurHex: Story = {
  name: "Sélecteur HEX",
  render: function Demo() {
    const [color, setColor] = useState("#6EC4E8");
    return <ColorField label="Couleur de la ligne" previewCode="13" previewMode="metro" value={color} onChange={setColor} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "Couleur de la ligne" }) as HTMLInputElement;
    await userEvent.click(canvas.getByRole("button", { name: "Choisir la couleur — Couleur de la ligne" }));
    const body = within(document.body);
    const dialog = await body.findByRole("dialog", { name: "Couleur de la ligne" });
    const panel = within(dialog);

    // Focus initial sur la zone ; flèches : saturation / luminosité.
    const area = panel.getByRole("slider", { name: "Saturation et luminosité" });
    await waitFor(() => expect(area).toHaveFocus());
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await waitFor(() => expect(field.value).not.toBe("#6EC4E8"));

    // Champ HEX : la valeur saisie est reprise par le champ principal.
    const hex = panel.getByRole("textbox", { name: "HEX" });
    await userEvent.clear(hex);
    await userEvent.type(hex, "#E3051B");
    await waitFor(() => expect(field.value.toUpperCase()).toBe("#E3051B"));
    await expect(panel.getByRole("slider", { name: "Teinte" })).toHaveValue("354");

    // Pas d'autre mode que HEX.
    await expect(panel.queryByRole("textbox", { name: /RGB|HSL/i })).toBeNull();
    await userEvent.keyboard("{Escape}");
  },
};

/** Couleur de texte fournie peu contrastée → erreur + « Calculer ». */
export const ContrasteFaible: Story = {
  name: "Contraste faible",
  render: function Demo() {
    const [color, setColor] = useState("#FFCD00");
    const [textColor, setTextColor] = useState<string | undefined>("#FFFFFF");
    return (
      <ColorField
        label="Couleur de la ligne"
        previewCode="7"
        value={color}
        onChange={setColor}
        textColor={textColor}
        onTextColorChange={setTextColor}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Blanc sur jaune : contraste insuffisant annoncé.
    await expect(canvas.getByRole("alert")).toHaveTextContent(/Contraste insuffisant/);
    // « Calculer » propose une couleur lisible : l'erreur disparaît.
    await userEvent.click(canvas.getByRole("button", { name: "Calculer la couleur du texte" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

/** Hex invalide → message d'erreur. */
export const HexInvalide: Story = {
  name: "Hex invalide",
  render: function Demo() {
    const [color, setColor] = useState("#6EC4E8");
    return <ColorField label="Couleur de la ligne" value={color} onChange={setColor} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /Couleur de la ligne/ });
    await userEvent.clear(input);
    await userEvent.type(input, "pas-une-couleur");
    await expect(canvas.getByRole("alert")).toHaveTextContent(/invalide/);
    await expect(input).toHaveAttribute("aria-invalid", "true");
  },
};

export const Desactive: Story = {
  name: "Désactivé",
  render: () => <ColorField label="Couleur de la ligne" value="#008B5B" onChange={() => {}} disabled />,
};
