import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Modal } from "./Modal";
import { GhostButton } from "./GhostButton";
import { TimePicker, type TimePickerProps } from "./TimePicker";

function ControlledTime(args: TimePickerProps) {
  const [value, setValue] = useState(args.value);
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <TimePicker {...args} value={value} onChange={(next) => { setValue(next); args.onChange(next); }} />
    <output aria-label="Heure retenue">{value || "Aucune heure"}</output>
  </div>;
}
const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker", component: TimePicker, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { label: "Heure de départ", value: "09:30", onChange: fn() },
  render: (args) => <ControlledTime {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TimePicker>;

// Les scénarios automatisés tournent sous Vitest, sans piloter le focus
// pendant la consultation manuelle des stories ou de la documentation.
const testOnly = (play: NonNullable<Story["play"]>): Story["play"] =>
  import.meta.env.MODE === "test" ? play : undefined;


export const SaisieEtClavier: Story = {
  name: "Saisie et clavier",
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Heure de départ : 09:30" }));
    const hours = canvas.getByRole("spinbutton", { name: "Heures — Heure de départ" });
    const minutes = canvas.getByRole("spinbutton", { name: "Minutes — Heure de départ" });
    await userEvent.clear(hours);
    await userEvent.type(hours, "9");
    await userEvent.clear(minutes);
    await userEvent.type(minutes, "5{Enter}");
    await expect(hours).toHaveValue("09");
    await expect(minutes).toHaveValue("05");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Heure de départ : 09:05" }));
    await userEvent.click(minutes);
    await userEvent.keyboard("{ArrowUp}");
    await expect(minutes).toHaveValue("06");
    await userEvent.clear(hours);
    await userEvent.type(hours, "25{Enter}");
    await expect(hours).toHaveAttribute("aria-invalid", "true");
    await expect((hours as HTMLInputElement).checkValidity()).toBe(false);
    await expect(canvas.getByRole("alert")).toHaveTextContent("23:59");
    await userEvent.keyboard("{Escape}");
    await expect(hours).toHaveValue("09");
    await expect((hours as HTMLInputElement).checkValidity()).toBe(true);
  }),
};
export const ServiceDeNuit: Story = {
  name: "Service après minuit",
  args: { value: "23:55", allowOvernight: true, minuteStep: 15, helperText: "25:30 désigne 01:30 du jour suivant dans le même jour de service." },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Heure de départ :/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les minutes" }));
    await expect(canvas.getByRole("spinbutton", { name: /^Heures/ })).toHaveValue("24");
    await expect(canvas.getByRole("spinbutton", { name: /^Minutes/ })).toHaveValue("10");
    await expect(canvas.getByText("Jour de service suivant")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Diminuer les minutes" }));
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("23:55");
  }),
};
export const Bornes: Story = {
  args: { value: "17:55", minuteStep: 15, min: "08:00", max: "18:00" },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Heure de départ :/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les minutes" }));
    await expect(canvas.getByRole("button", { name: "Augmenter les heures" })).toBeDisabled();
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("17:55");
    await userEvent.click(canvas.getByRole("button", { name: "Valider" }));
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("18:00");
  }),
};
export const Facultative: Story = {
  args: { value: "" },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Heure de départ :/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les minutes" }));
    await expect(canvas.getByRole("spinbutton", { name: /^Heures/ })).toHaveValue("00");
    await userEvent.clear(canvas.getByRole("spinbutton", { name: /^Heures/ }));
    await userEvent.clear(canvas.getByRole("spinbutton", { name: /^Minutes/ }));
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("Aucune heure");
  }),
};
export const Obligatoire: Story = {
  args: { value: "", required: true },
  play: testOnly(async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Heure de départ :/ }));
    const input = within(canvasElement).getByRole("spinbutton", { name: /^Heures/ });
    await userEvent.click(input);
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveAttribute("aria-invalid", "true");
  }),
};
export const Desactivee: Story = { name: "Désactivée", args: { disabled: true } };
export const ErreurMetier: Story = { name: "Erreur métier", args: { error: "Le départ doit précéder la fin de la perturbation." } };

function ModalTimeDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("09:30");
  return <>
    <GhostButton label="Modifier l’heure" onClick={() => setOpen(true)} />
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Horaire de départ">
      <TimePicker label="Heure de départ" value={value} onChange={setValue} />
    </Modal>
  </>;
}
export const DansUneModale: Story = {
  name: "Annulation dans une modale",
  render: () => <ModalTimeDemo />,
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Modifier l’heure" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Horaire de départ" });
    await userEvent.click(within(dialog).getByRole("button", { name: /^Heure de départ :/ }));
    const input = within(dialog).getByRole("spinbutton", { name: /^Heures/ });
    await userEvent.clear(input);
    await userEvent.type(input, "11");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("09");
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }),
};

export const VarianteBouton: Story = {
  name: "Variante bouton", args: { variant: "button", label: undefined, "aria-label": "Départ" },
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Départ : 09:30" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "Régler départ" });
    const hours = within(dialog).getByRole("spinbutton", { name: /^Heures/ });
    await expect(hours).toHaveFocus();
    await userEvent.clear(hours);
    await userEvent.type(hours, "11");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: "Augmenter les heures" }));
    await userEvent.click(canvas.getByRole("button", { name: "Valider" }));
    await expect(canvas.getByRole("button", { name: "Départ : 10:30" })).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith("10:30");
  }),
};
export const BoutonDesactive: Story = { args: { variant: "button", disabled: true } };

function RequiredButtonDemo() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  return <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
    <TimePicker variant="button" aria-label="Heure requise" required value={value} onChange={setValue} />
    <button type="submit">Enregistrer</button>
    {saved && <p>Horaire enregistré</p>}
  </form>;
}
export const BoutonObligatoire: Story = {
  render: () => <RequiredButtonDemo />,
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer" }));
    await expect(canvas.queryByText("Horaire enregistré")).not.toBeInTheDocument();
    const hours = canvas.getByRole("spinbutton", { name: /^Heures/ });
    await expect(hours).toHaveFocus();
    await userEvent.type(hours, "08");
    await userEvent.type(canvas.getByRole("spinbutton", { name: /^Minutes/ }), "15");
    await userEvent.click(canvas.getByRole("button", { name: "Valider" }));
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer" }));
    await expect(canvas.getByText("Horaire enregistré")).toBeInTheDocument();
  }),
};
export const CollerUneHeure: Story = {
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Heure de départ :/ }));
    await userEvent.click(canvas.getByRole("spinbutton", { name: /^Heures/ }));
    await userEvent.paste("12:45");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Heure retenue")).toHaveTextContent("12:45");
  }),
};
