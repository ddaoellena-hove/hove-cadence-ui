import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ServiceCalendar, type ServiceCalendarProps } from "./ServiceCalendar";
function Demo(args: ServiceCalendarProps) {
  const [value, setValue] = useState(args.value);
  return <ServiceCalendar {...args} value={value} onChange={(next) => { setValue(next); args.onChange(next); }} />;
}
const meta: Meta<typeof ServiceCalendar> = {
  title: "Composants/Transport/ServiceCalendar", component: ServiceCalendar, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } }, render: (args) => <Demo {...args} />,
  args: { label: "Service de novembre", onChange: fn(), value: {
    startDate: "2026-11-01", endDate: "2026-11-30", weekdays: [1, 2, 3, 4, 5], exceptions: [{ date: "2026-11-11", type: "removed" }],
  } },
};
export default meta;
type Story = StoryObj<typeof ServiceCalendar>;
export const Exceptions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Samedi" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ weekdays: [1, 2, 3, 4, 5, 6] }));
    await userEvent.click(canvas.getByRole("button", { name: /Date d’exception/ }));
    await userEvent.click(canvas.getByRole("button", { name: /mercredi 11 novembre 2026/ }));
    await userEvent.click(canvas.getByRole("radio", { name: "Circule" }));
    await userEvent.click(canvas.getByRole("button", { name: "Appliquer l’exception" }));
    const list = canvas.getByRole("list", { name: "Exceptions de circulation" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    await expect(list).toHaveTextContent("11 novembre 2026 — Circule");
    await userEvent.click(canvas.getByRole("button", { name: "Retirer l’exception du 11 novembre 2026" }));
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};
export const SansPeriode: Story = {
  args: { value: { startDate: "", endDate: "", weekdays: [], exceptions: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Appliquer l’exception" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Choisissez une période valide");
  },
};
export const ExceptionsHorsPeriode: Story = { args: { value: { startDate: "2026-11-01", endDate: "2026-11-10", weekdays: [1], exceptions: [{ date: "2026-11-11", type: "removed" }] } } };
export const Desactive: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "Lundi" }));
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole("button", { name: "Appliquer l’exception" })).toBeDisabled();
  },
};
