import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioGroup, type RadioGroupOption } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Composants/Formulaires/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 620 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

const OPTIONS: RadioGroupOption[] = [
  { value: "auto", label: "Automatique", description: "Le fichier est récupéré chaque nuit." },
  { value: "manual", label: "Manuel", description: "Vous déposez le fichier vous-même." },
  { value: "off", label: "Indisponible", description: "Option réservée.", disabled: true },
  { value: "api", label: "Par API", description: "Le système source pousse les données." },
];

const Demo = (props: Partial<Parameters<typeof RadioGroup>[0]>) => {
  const [value, setValue] = useState<string | undefined>(props.value);
  return <RadioGroup label="Mode de réception" options={OPTIONS} {...props} value={value} onChange={(next) => { setValue(next); props.onChange?.(next); }} />;
};

/** Une seule tabulation ; les flèches changent d'option, en sautant celles désactivées. */
export const Clavier: Story = {
  args: { onChange: fn() },
  render: (args) => <Demo value="manual" onChange={args.onChange} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const stops = canvas.getAllByRole("radio").filter((radio) => radio.tabIndex === 0);
    await expect(stops).toHaveLength(1);
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Manuel" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenLastCalledWith("api");
    await expect(canvas.getByRole("radio", { name: "Par API" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Par API" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Automatique" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: "Par API" })).toHaveFocus();
  },
};

/** Remplace `RichRadioButton size="large"` : cartes de choix sur deux colonnes, avec icône. */
export const Cartes: Story = {
  render: () => (
    <Demo
      appearance="card"
      size="lg"
      columns={2}
      value="auto"
      options={[
        { value: "auto", label: "Automatique", description: "Le fichier est récupéré chaque nuit.", icon: "clock" },
        { value: "manual", label: "Manuel", description: "Vous déposez le fichier vous-même, quand vous le souhaitez, depuis votre poste de travail.", icon: "upload-02" },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = canvas.getAllByRole("radio");
    // Deux colonnes égales, cartes de même hauteur
    await expect(first.getBoundingClientRect().top).toBe(second.getBoundingClientRect().top);
    await expect(first.getBoundingClientRect().width).toBe(second.getBoundingClientRect().width);
    await expect(first.getBoundingClientRect().height).toBe(second.getBoundingClientRect().height);
    await expect(canvas.getAllByRole("radio")).toHaveLength(2);
    await userEvent.click(canvas.getByText("Manuel"));
    await expect(second).toHaveAttribute("aria-checked", "true");
    await expect(second).toHaveClass("choice-card--active");
  },
};

/** Erreur et obligation portées par le groupe. */
export const Erreur: Story = {
  render: () => <Demo required error="Choisissez un mode de réception." appearance="card" />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("radiogroup", { name: /Mode de réception/ });
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(group).toHaveAccessibleDescription("Choisissez un mode de réception.");
  },
};
