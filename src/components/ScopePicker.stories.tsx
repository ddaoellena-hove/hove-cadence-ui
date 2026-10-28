import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { useState } from "react";
import { ScopePicker } from "./ScopePicker";
const meta: Meta<typeof ScopePicker> = { title: "Composants/Transport/ScopePicker", component: ScopePicker, tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof ScopePicker>;
const nodes = [{ id: "network", label: "Métro", children: [{ id: "a", label: "Ligne 1", badge: { code: "1" } }, { id: "b", label: "Ligne 2", badge: { code: "2" } }] }];
const change = fn();
function Controlled(props: { presentation?: "inline" | "popover" }) { const [value, setValue] = useState<string[]>([]); return <ScopePicker label="Périmètre d’export" nodes={nodes} value={value} onChange={ids => { setValue(ids); change(ids); }} selectionStrategy="parents" {...props} />; }
export const Defaut: Story = { render: () => <Controlled />, play: async ({ canvasElement }) => { change.mockClear(); const c = within(canvasElement); const tree = c.getByRole("treeitem", { name: /Métro/ }); tree.focus(); await userEvent.keyboard(" "); await expect(change).toHaveBeenLastCalledWith(["network"]); await expect(c.getByText("2 lignes sélectionnées")).toBeVisible(); await userEvent.keyboard("{ArrowRight}{ArrowDown} "); await expect(change).toHaveBeenLastCalledWith(["b"]); await userEvent.type(c.getByRole("searchbox"), "Ligne 1"); await userEvent.click(c.getByRole("treeitem", { name: /Ligne 1/ })); await expect(change).toHaveBeenLastCalledWith(["network"]); } };
export const Popover: Story = { render: () => <Controlled presentation="popover" /> };
export const Erreur: Story = { args: { label: "Périmètre", nodes, value: [], onChange: change, error: "Choisissez au moins une ligne." } };
export const Charge: Story = { args: { ...Erreur.args, error: undefined, loading: true } };
export const Vide: Story = { args: { ...Erreur.args, nodes: [], error: undefined } };
export const Desactive: Story = { args: { ...Erreur.args, error: undefined, value: ["a"], disabled: true } };
