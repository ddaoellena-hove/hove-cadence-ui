import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ErrorSummary, type SummaryError } from "./ErrorSummary";
import { TextInput } from "./TextInput";
import { PrimaryButton } from "./PrimaryButton";
import { inertProps } from "./inert-props";

const meta: Meta<typeof ErrorSummary> = {
  title: "Components/ErrorSummary", component: ErrorSummary, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 600 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ErrorSummary>;
function FormDemo() {
  const field = useRef<HTMLInputElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<SummaryError[]>([]);
  return <form noValidate style={{ display: "flex", flexDirection: "column", gap: 24 }} onSubmit={(event) => {
    event.preventDefault();
    setErrors(value.trim() ? [] : [{ id: "name", message: "Renseignez le nom du réseau.", target: field }]);
    if (!value.trim()) summary.current?.focus();
  }}>
    <ErrorSummary ref={summary} errors={errors} />
    <TextInput ref={field} label="Nom du réseau" value={value} onChange={(event) => setValue(event.target.value)} state={errors.length ? "error" : "enabled"} />
    <PrimaryButton type="submit" label="Enregistrer" />
  </form>;
}
export const Formulaire: Story = {
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole("button", { name: "Enregistrer" });
    await userEvent.click(submit);
    const summary = canvas.getByRole("region", { name: "Corrigez les champs suivants" });
    await expect(summary).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Renseignez le nom du réseau." }));
    const input = canvas.getByRole("textbox", { name: "Nom du réseau" });
    await expect(input).toHaveFocus();
    await userEvent.click(submit);
    await expect(summary).toHaveFocus();
    await userEvent.click(input);
    await userEvent.type(input, "Bordeaux Métropole");
    await userEvent.click(submit);
    await expect(canvas.queryByRole("region")).not.toBeInTheDocument();
  },
};
export const SansCible: Story = { args: { errors: [{ id: "global", message: "La période chevauche un scénario existant." }], focusOnMount: false } };
export const Vide: Story = { args: { errors: [] } };

export const CibleParIdEtConteneur: Story = {
  render: () => <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <ErrorSummary focusOnMount={false} errors={[{ id: "source", message: "Choisissez une source.", target: "error-summary-demo-source" }]} />
    <div id="error-summary-demo-source">
      <input type="hidden" value="source" readOnly />
      <button type="button" hidden>Source masquée</button>
      <fieldset disabled><button type="button">Source indisponible</button></fieldset>
      <div {...inertProps(true)}><button type="button">Source inactive</button></div>
      <PrimaryButton label="Parcourir les sources" />
    </div>
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Choisissez une source." }));
    await expect(canvas.getByRole("button", { name: "Parcourir les sources" })).toHaveFocus();
  },
};
