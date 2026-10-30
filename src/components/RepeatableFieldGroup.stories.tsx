import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RepeatableFieldGroup } from "./RepeatableFieldGroup";
import { TextInput } from "./TextInput";
import { Dropdown } from "./Dropdown";

const meta: Meta = {
  title: "Composants/Formulaires/RepeatableFieldGroup",
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj;

interface Period { id: string; name: string }

const Demo = ({ initial, min, max, invalidId }: { initial: Period[]; min?: number; max?: number; invalidId?: string }) => {
  const [periods, setPeriods] = useState(initial);
  const [nextId, setNextId] = useState(100);
  return (
    <RepeatableFieldGroup
      label="Périodes d'application"
      items={periods}
      getId={(period) => period.id}
      getTitle={(_, index) => `Période ${index + 1}`}
      getError={(period) => (period.id === invalidId ? "La fin précède le début." : undefined)}
      min={min}
      max={max}
      addLabel="Ajouter une période"
      onAdd={() => {
        setPeriods((list) => [...list, { id: String(nextId), name: "" }]);
        setNextId(nextId + 1);
      }}
      onRemove={(id) => setPeriods((list) => list.filter((period) => period.id !== id))}
      renderItem={(period, index) => (
        <TextInput
          label={`Nom de la période ${index + 1}`}
          value={period.name}
          onChange={(e) => setPeriods((list) => list.map((p) => (p.id === period.id ? { ...p, name: e.target.value } : p)))}
        />
      )}
    />
  );
};

const THREE = [{ id: "a", name: "Matin" }, { id: "b", name: "Midi" }, { id: "c", name: "Soir" }];

/** Retirer le deuxième bloc ne transfère rien au troisième, renuméroté mais identique. */
export const RetraitSansTransfert: Story = {
  name: "Retrait sans transfert de valeur",
  render: () => <Demo initial={THREE} invalidId="c" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const third = canvas.getByLabelText("Nom de la période 3");
    await userEvent.click(canvas.getByRole("button", { name: "Retirer Période 2" }));

    await expect(canvas.queryByDisplayValue("Midi")).toBeNull();
    await expect(canvas.getByLabelText("Nom de la période 2")).toHaveValue("Soir");
    // Même champ DOM : le bloc a gardé son identité, et son erreur
    await expect(canvas.getByLabelText("Nom de la période 2")).toBe(third);
    await expect(canvas.getByText("La fin précède le début.")).toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("Période 2 retiré.");
    // Le focus reprend sur le bloc qui a pris la place
    await expect(third).toHaveFocus();
  },
};

/** Au clavier : l'ajout place le focus dans le nouveau bloc ; la limite est annoncée et respectée. */
export const Limites: Story = {
  render: () => <Demo initial={THREE.slice(0, 2)} min={1} max={3} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Périodes d'application" });
    await expect(group).toHaveAccessibleDescription("2 sur 3");

    canvas.getByRole("button", { name: "Ajouter une période" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Nom de la période 3")).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Ajouter une période" })).toBeDisabled();
    await expect(group).toHaveAccessibleDescription("3 sur 3 (maximum atteint)");

    await userEvent.click(canvas.getByRole("button", { name: "Retirer Période 3" }));
    await userEvent.click(canvas.getByRole("button", { name: "Retirer Période 2" }));
    // Minimum atteint : le dernier bloc ne se retire pas
    await expect(canvas.getByRole("button", { name: "Retirer Période 1" })).toBeDisabled();
  },
};

/** Liste vide : le retrait du dernier bloc ramène le focus sur l'ajout. */
export const Vide: Story = {
  render: () => <Demo initial={THREE.slice(0, 1)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Retirer Période 1" }));
    await expect(canvas.getByRole("button", { name: "Ajouter une période" })).toHaveFocus();
  },
};

/** Un menu ouvert dans un bloc n'est pas coupé. */
export const AvecMenu: Story = {
  name: "Avec menu",
  render: () => (
    <div style={{ paddingBottom: 160 }}>
      <RepeatableFieldGroup
        label="Canaux"
        items={[{ id: "a" }]}
        getId={(item) => item.id}
        getTitle={() => "Canal 1"}
        onAdd={() => {}}
        onRemove={() => {}}
        renderItem={() => <Dropdown label="Type" options={[{ id: "mail", label: "E-mail" }, { id: "app", label: "Application" }]} />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Type/ }));
    const option = await canvas.findByRole("option", { name: "Application" });
    const box = option.getBoundingClientRect();
    await expect(option.contains(document.elementFromPoint(box.left + 8, box.bottom - 4))).toBe(true);
  },
};
