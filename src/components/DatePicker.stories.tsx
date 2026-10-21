import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    onChange: { action: "onChange" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    minDate: { control: false },
    maxDate: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const ControlledTemplate = (args: ComponentProps<typeof DatePicker>) => {
  const [value, setValue] = useState<Date | null>(args.value ?? null);
  return (
    <div style={{ padding: "24px", minHeight: "360px" }}>
      <DatePicker
        {...args}
        value={value}
        onChange={(d) => {
          setValue(d);
          args.onChange?.(d);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    placeholder: "JJ/MM/AAAA",
    disabled: false,
  },
};

export const WithValue: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    value: new Date(2026, 4, 6),
    placeholder: "JJ/MM/AAAA",
    disabled: false,
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ padding: "24px" }}>
      <DatePicker {...args} />
    </div>
  ),
  args: {
    value: new Date(2026, 4, 6),
    placeholder: "JJ/MM/AAAA",
    disabled: true,
  },
};

export const WithMinMax: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    placeholder: "JJ/MM/AAAA",
    disabled: false,
    minDate: new Date(2026, 4, 5),
    maxDate: new Date(2026, 4, 20),
  },
};

export const WithDateAndTime: Story = {
  name: "With Date & Time",
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "540px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "fit-content",
          }}
        >
          <label
            style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Date et heure de programmation
          </label>
          <DatePicker
            value={value}
            onChange={setValue}
            placeholder="JJ/MM/AAAA HH:mm"
            withTime
            labelConfirm="Valider"
          />
          {value && (
            <p
              style={{
                fontSize: "13px",
                color: "#1B6CFF",
                fontFamily: "Inter, sans-serif",
                margin: "8px 0 0",
              }}
            >
              ✓ Programmé le{" "}
              {value.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              à {String(value.getHours()).padStart(2, "0")}:
              {String(value.getMinutes()).padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    );
  },
  args: {},
};

export const WithSegmentedControl: Story = {
  name: "With Segmented Control",
  render: () => {
    const [tab, setTab] = useState("depart");
    const [depart, setDepart] = useState<Date | null>(null);
    const [arrival, setArrival] = useState<Date | null>(null);

    const handleChange = (date: Date) => {
      if (tab === "depart") setDepart(date);
      else setArrival(date);
    };

    return (
      <div
        style={{
          padding: "24px",
          minHeight: "560px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <DatePicker
          value={tab === "depart" ? depart : arrival}
          onChange={handleChange}
          placeholder="JJ/MM/AAAA HH:mm"
          withTime
          labelConfirm="Valider"
          segmentedOptions={[
            { value: "depart", label: "Partir à" },
            { value: "arrival", label: "Arrivée à" },
          ]}
          segmentedValue={tab}
          onSegmentChange={setTab}
        />
        {(depart || arrival) && (
          <p style={{ fontSize: "13px", color: "#1B6CFF", margin: "16px 0 0" }}>
            {depart &&
              `✓ Départ : ${depart.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${String(depart.getHours()).padStart(2, "0")}:${String(depart.getMinutes()).padStart(2, "0")}`}
            {depart && arrival && <br />}
            {arrival &&
              `✓ Arrivée : ${arrival.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${String(arrival.getHours()).padStart(2, "0")}:${String(arrival.getMinutes()).padStart(2, "0")}`}
          </p>
        )}
      </div>
    );
  },
  args: {},
};

export const WithLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ padding: "24px", minHeight: "360px" }}>
        <DatePicker
          {...args}
          value={value}
          onChange={(d) => {
            setValue(d);
            args.onChange?.(d);
          }}
        />
      </div>
    );
  },
  args: {
    label: "Date de début",
    placeholder: "JJ/MM/AAAA",
    disabled: false,
  },
};

/**
 * Navigation au clavier : flèches (jour / semaine), Début / Fin (semaine),
 * Page préc. / suiv. (mois), Entrée pour choisir, Échap pour fermer.
 */
export const Clavier: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    label: "Date de début",
    value: new Date(2026, 9, 19),
  },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const trigger = canvas.getByRole("button", { name: /Date de début/ });

    await user.click(trigger);
    // Un seul jour dans l'ordre de tabulation : le jour sélectionné
    const selected = canvas.getByRole("button", { name: /lundi 19 octobre 2026/ });
    await expect(selected).toHaveAttribute("tabindex", "0");
    selected.focus();

    // → puis ↓ : mardi 20, puis mardi 27
    await user.keyboard("{ArrowRight}{ArrowDown}");
    await expect(canvas.getByRole("button", { name: /mardi 27 octobre 2026/ })).toHaveFocus();

    // Page suiv. : même jour du mois suivant
    await user.keyboard("{PageDown}");
    await expect(canvas.getByRole("button", { name: /vendredi 27 novembre 2026/ })).toHaveFocus();

    await user.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("27/11/2026");

    // Échap ferme sans valider et rend le focus au déclencheur
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/** Variante bouton (PrimaryButton outline sm) : pour l'en-tête d'un dashboard. */
export const VarianteBouton: Story = {
  name: "Variante bouton",
  args: { variant: "button", "aria-label": "Date", value: new Date(2026, 9, 20) },
  render: (args) => (
    <div style={{ padding: 24, minHeight: 420 }}>
      <ControlledTemplate {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /^Date : / });
    // Mêmes classes que PrimaryButton outline sm
    await expect(trigger).toHaveClass("primary-button", "primary-button--outline", "base-button--sm");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("dialog", { name: "Calendrier" })).toBeInTheDocument();
  },
};
