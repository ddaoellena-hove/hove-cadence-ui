import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Composants/Formulaires/DatePicker",
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
 * Saisie directe (défaut) : on tape la date dans les cases JJ / MM / AAAA, les
 * « / » sont fixes et le curseur passe seul à la case suivante. Seule l'icône
 * calendrier ouvre le panneau. Une date inexistante affiche un message.
 */
export const SaisieDirecte: Story = {
  name: "Saisie directe",
  render: (args) => <ControlledTemplate {...args} />,
  args: { label: "Date de début", onChange: fn() },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const day = canvas.getByRole("textbox", { name: "Jour — Date de début" });

    // Le label cible la case du jour ; la saisie avance seule de case en case
    await user.click(canvas.getByText("Date de début"));
    await expect(day).toHaveFocus();
    await user.keyboard("31022026");
    // Quitter le composant (case → icône → hors du champ) valide la saisie
    await user.tab();
    await user.tab();
    await expect(canvas.getByRole("alert")).toHaveTextContent("Saisissez une date valide");

    // Correction : 27/11/2026, validée en quittant le champ
    await user.click(day);
    await user.keyboard("27112026{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(new Date(2026, 10, 27));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();

    // Cliquer dans les cases n'ouvre pas le calendrier ; l'icône, si
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    const icon = canvas.getByRole("button", { name: "Ouvrir le calendrier — date de début" });
    await user.click(icon);
    await expect(canvas.getByRole("dialog", { name: "Calendrier" })).toBeInTheDocument();
    // Le jour saisi porte le focus ; Échap ferme et rend le focus à l'icône
    await expect(canvas.getByRole("button", { name: /vendredi 27 novembre 2026/ })).toHaveFocus();
    await user.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(icon).toHaveFocus();
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
