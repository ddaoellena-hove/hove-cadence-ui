import { useState, type ComponentProps, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DatePicker, type DateInputState } from "./DatePicker";

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

const ClipBox = ({ children, height }: { children: ReactNode; height: number }) => (
  <div data-testid="clip" style={{ height, width: 360, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16, boxSizing: "border-box" }}>
    {children}
  </div>
);

/** Dans un pied d'actions ou en bas de page : le calendrier passe au-dessus du champ. */
export const RetourneAuDessus: Story = {
  name: "Retourné au-dessus",
  render: () => <ClipBox height={520}><DatePicker label="Début" value={new Date(2026, 9, 12)} /></ClipBox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    const panel = canvas.getByRole("dialog", { name: "Calendrier" });
    await expect(panel).toHaveAttribute("data-placement", "top");
    await expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(canvas.getByTestId("clip").getBoundingClientRect().bottom);
    await expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(canvas.getByTestId("clip").getBoundingClientRect().top);
  },
};

const DateInputDemo = ({ onState }: { onState: (state: DateInputState) => void }) => {
  const [tick, setTick] = useState(0);
  return (
    <>
      {/* Date recréée à chaque rendu, comme un parent qui ne mémoïse pas */}
      <DatePicker label="Début" value={new Date(2026, 9, 12)} onInputStateChange={onState} />
      <button type="button" onClick={() => setTick(tick + 1)}>Rendu parent {tick}</button>
    </>
  );
};

/** La frappe survit à un rendu du parent ; l'état de saisie permet de bloquer une validation. */
export const EtatDeSaisie: Story = {
  name: "État de saisie",
  args: { onInputStateChange: fn() },
  render: (args) => <DateInputDemo onState={args.onInputStateChange!} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const onState = args.onInputStateChange!;
    const year = canvas.getByRole("textbox", { name: /Année/ });

    await userEvent.clear(year);
    await userEvent.type(year, "20");
    await waitFor(() => expect(onState).toHaveBeenLastCalledWith("editing"));
    await userEvent.click(canvas.getByRole("button", { name: /Rendu parent/ }));
    await expect(year).toHaveValue("20");

    // Saisie refusée au départ du champ
    await waitFor(() => expect(onState).toHaveBeenLastCalledWith("invalid"));

    // Retour à la valeur initiale : le formulaire est débloqué
    await userEvent.clear(year);
    await userEvent.type(year, "2026");
    await waitFor(() => expect(onState).toHaveBeenLastCalledWith("confirmed"));
  },
};

const ClearableDemo = () => {
  const [value, setValue] = useState<Date | null>(new Date(2026, 9, 12));
  return <DatePicker label="Fin" value={value} onChange={setValue} clearable onClear={() => setValue(null)} helperText="Facultative." />;
};

/** Valeur facultative : bouton d'effacement, ou cases vidées puis champ quitté. */
export const Effacable: Story = {
  name: "Effaçable",
  render: () => <ClearableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Effacer — fin" }));
    await expect(canvas.getByRole("textbox", { name: /Année/ })).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: "Effacer — fin" })).toBeNull();
    await expect(canvas.getByText("Facultative.")).toBeInTheDocument();
  },
};

/** Erreur fournie par l'app, annoncée sur les cases. */
export const ErreurExterne: Story = {
  name: "Erreur externe",
  args: { label: "Début", required: true, error: "La fin précède le début." },
  play: async ({ canvasElement }) => {
    const day = within(canvasElement).getByRole("textbox", { name: /Jour/ });
    await expect(day).toHaveAttribute("aria-invalid", "true");
    await expect(day).toHaveAccessibleDescription("La fin précède le début.");
  },
};

/** Cases vides, heure et effacement : le gabarit lisible tient dans le champ. */
export const GabaritComplet: Story = {
  name: "Gabarit complet",
  render: () => <DatePicker label="Fin" withTime clearable value={new Date(2026, 9, 12, 8, 30)} />,
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector<HTMLElement>(".date-picker__field")!;
    await expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth);
    const box = within(canvasElement).getByRole("textbox", { name: /Mois/ });
    const style = getComputedStyle(box);
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    await expect(parseFloat(style.width)).toBeGreaterThanOrEqual(context.measureText("MM").width);
  },
};
