import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DescriptionList } from "./DescriptionList";
import { LineBadge } from "./LineBadge";
import { Indicator } from "./Indicator";

const meta: Meta<typeof DescriptionList> = {
  title: "Components/DescriptionList", component: DescriptionList, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 600 }}><Story /></div>],
  args: { "aria-label": "Détails du réseau", items: [
    { id: "name", label: "Réseau", value: "Bordeaux Métropole" },
    { id: "line", label: "Ligne", value: <LineBadge code="A" mode="tram" color="00704A" /> },
    { id: "status", label: "État", value: <Indicator variant="active" /> },
    { id: "owner", label: "Responsable" },
    { id: "count", label: "Anomalies", value: 0 },
    { id: "published", label: "Publié", value: false },
  ] },
};
export default meta;
type Story = StoryObj<typeof DescriptionList>;
export const Horizontale: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Non renseigné")).toBeInTheDocument();
    await expect(canvas.getByText("0")).toBeInTheDocument();
    await expect(canvas.getByText("Non", { exact: true })).toBeInTheDocument();
    await expect(canvas.getAllByRole("term")).toHaveLength(6);
    await expect(canvas.getAllByRole("definition")).toHaveLength(6);
  },
};
export const Empilee: Story = { name: "Empilée", args: { layout: "stacked" } };
export const Compacte: Story = { args: { density: "compact" } };
export const TexteLong: Story = { name: "Valeurs longues", args: { items: [{ id: "id", label: "Identifiant", value: `stop_area:DEMO:${"identifiant-sans-espace-".repeat(10)}` }] } };
