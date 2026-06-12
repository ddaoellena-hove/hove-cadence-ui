import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextArea } from "./TextArea";

const meta: Meta<typeof TextArea> = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["enabled", "hover", "focus", "disabled", "error", "success"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    helperText: { control: "text" },
    rows: { control: "number" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Enabled: Story = {
  args: {
    state: "enabled",
    label: "Exclure un objet",
    placeholder: "stop_area:IDFM:482835",
  },
};

export const Hover: Story = {
  args: {
    state: "hover",
    label: "Exclure un objet",
    placeholder: "stop_area:IDFM:482835",
  },
};

export const Focus: Story = {
  args: {
    state: "focus",
    label: "Exclure un objet",
    placeholder: "stop_area:IDFM:482835",
  },
};

export const Disabled: Story = {
  args: {
    state: "disabled",
    label: "Exclure un objet",
    value: "stop_area:IDFM:482835",
  },
};

export const Error: Story = {
  args: {
    state: "error",
    label: "Exclure un objet",
    value: "stop_area:invalid",
    helperText: "Format invalide. Attendu : stop_area:IDFM:XXXXXX",
  },
};

export const Success: Story = {
  args: {
    state: "success",
    label: "Exclure un objet",
    value: "stop_area:IDFM:482835",
    helperText: "Objet reconnu.",
  },
};

export const WithHelperText: Story = {
  args: {
    state: "enabled",
    label: "Exclure un objet",
    placeholder: "stop_area:IDFM:482835",
    helperText: "Un identifiant par ligne.",
  },
};

export const NoLabel: Story = {
  args: {
    label: "",
    placeholder: "stop_area:IDFM:482835",
  },
};
