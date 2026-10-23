import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RouteStopList } from "./RouteStopList";
import { LineBadge } from "./LineBadge";
const meta: Meta<typeof RouteStopList> = {
  title: "Composants/Transport/RouteStopList", component: RouteStopList, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { label: "Course de nuit vers Nation", line: <LineBadge code="38" mode="bus" />, stops: [
    { id: "passage-1", stopId: "gare", name: "Gare de Lyon", departure: "23:50" },
    { id: "passage-2", name: "Bastille", arrival: "24:05", skipped: true, note: "Arrêt reporté pendant les travaux." },
    { id: "passage-3", name: "Nation", arrival: "24:20" },
  ] },
};
export default meta;
type Story = StoryObj<typeof RouteStopList>;
export const ServiceDeNuit: Story = {
  args: { onStopSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("24:20")).toBeInTheDocument();
    await expect(canvas.queryByText("24:05")).not.toBeInTheDocument();
    await expect(canvas.getByText("Non desservi")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Voir l’arrêt Nation, passage 3" }));
    await expect(args.onStopSelect).toHaveBeenCalledWith(args.stops[2]);
  },
};
export const Boucle: Story = { args: { label: "Boucle de centre-ville", stops: [
  { id: "gare-1", stopId: "gare", name: "Gare", departure: "10:00" },
  { id: "mairie", name: "Mairie" },
  { id: "gare-2", stopId: "gare", name: "Gare", arrival: "10:30" },
] } };
export const Vide: Story = { args: { stops: [] } };
export const Chargement: Story = { args: { loading: true } };
