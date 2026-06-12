import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrimaryButton } from "./PrimaryButton";

const meta: Meta<typeof PrimaryButton> = {
  title: "Components/PrimaryButton",
  component: PrimaryButton,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["clicked", "disabled", "enabled", "hover"],
      control: { type: "select" },
    },
    withIcon: {
      options: ["left", "no", "only", "right"],
      control: { type: "select" },
    },
    size: {
      options: ["medium", "large"],
      control: { type: "select" },
    },
    outline: { control: { type: "boolean" } },
    destructive: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
};

export default meta;

type Story = StoryObj<typeof PrimaryButton>;

export const Default: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: false,
    destructive: false,
    label: "Label",
  },
};

export const Outline: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: true,
    destructive: false,
    label: "Label",
  },
};

export const Destructive: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: false,
    destructive: true,
    label: "Delete",
  },
};

export const Disabled: Story = {
  args: {
    state: "disabled",
    withIcon: "no",
    outline: false,
    destructive: false,
    label: "Label",
  },
};

export const WithIconLeft: Story = {
  args: {
    state: "enabled",
    withIcon: "left",
    outline: false,
    destructive: false,
    label: "Label",
  },
};

export const WithIconRight: Story = {
  args: {
    state: "enabled",
    withIcon: "right",
    outline: false,
    destructive: false,
    label: "Label",
  },
};

export const IconOnly: Story = {
  args: {
    state: "enabled",
    withIcon: "only",
    outline: false,
    destructive: false,
  },
};

export const DestructiveOutline: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: true,
    destructive: true,
    label: "Delete",
  },
};

export const Large: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: false,
    destructive: false,
    size: "large",
    label: "Label",
  },
};

export const LargeOutline: Story = {
  args: {
    state: "enabled",
    withIcon: "no",
    outline: true,
    destructive: false,
    size: "large",
    label: "Label",
  },
};

export const LargeWithIconLeft: Story = {
  args: {
    state: "enabled",
    withIcon: "left",
    outline: false,
    destructive: false,
    size: "large",
    label: "Label",
  },
};
