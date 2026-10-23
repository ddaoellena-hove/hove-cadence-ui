import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FieldRow } from "./FieldRow";
import { TextInput } from "./TextInput";
import { Dropdown } from "./Dropdown";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof FieldRow> = {
  title: "Composants/Structure et mise en page/FieldRow",
  component: FieldRow,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FieldRow>;

/** Deux champs à largeurs égales, alignés par le bas (gap 12). */
export const Defaut: Story = {
  name: "Défaut",
  render: () => (
    <FieldRow>
      <Dropdown label="Type" options={[{ id: "works", label: "Travaux" }, { id: "incident", label: "Incident" }]} placeholder="Sélectionner" />
      <Dropdown label="Cause" options={[{ id: "weather", label: "Météo" }, { id: "tech", label: "Technique" }]} placeholder="Sélectionner" />
    </FieldRow>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Type")).toBeInTheDocument();
    await expect(canvas.getByText("Cause")).toBeInTheDocument();
  },
};

/** Un champ avec libellé et un `DatePicker` restent alignés par le bas. */
export const ChampsMixtes: Story = {
  name: "Champs mixtes",
  render: () => (
    <FieldRow>
      <TextInput label="Identifiant" placeholder="SCN-000" />
      <DatePicker label="Début" />
    </FieldRow>
  ),
};
