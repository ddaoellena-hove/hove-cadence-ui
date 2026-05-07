import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "./TextInput";

const meta: Meta<typeof TextInput> = {
  title: "Components/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["enabled", "hover", "focus", "disabled", "error", "success"],
      control: { type: "select" },
    },
    label: { control: { type: "text" } },
    placeholder: { control: { type: "text" } },
    helperText: { control: { type: "text" } },
    disabled: { control: { type: "boolean" } },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ maxWidth: 400, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Enabled: Story = {
  args: {
    state: "enabled",
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const Hover: Story = {
  args: {
    state: "hover",
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const Focus: Story = {
  args: {
    state: "focus",
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const Disabled: Story = {
  args: {
    state: "disabled",
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const Error: Story = {
  args: {
    state: "error",
    label: "Email address",
    placeholder: "you@example.com",
    helperText: "Please enter a valid email address.",
  },
};

export const Success: Story = {
  args: {
    state: "success",
    label: "Username",
    placeholder: "your-handle",
    helperText: "Username is available.",
  },
};

export const WithHelperText: Story = {
  args: {
    state: "enabled",
    label: "Password",
    placeholder: "••••••••",
    type: "password",
    helperText: "Must be at least 8 characters.",
  },
};

export const NoLabel: Story = {
  args: {
    state: "enabled",
    label: "",
    placeholder: "Search…",
    "aria-label": "Search",
  },
};
