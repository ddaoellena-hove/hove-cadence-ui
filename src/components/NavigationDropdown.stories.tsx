import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationDropdown } from "./NavigationDropdown";

const sampleItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

const richItems = [
  { id: "profile", label: "My Profile" },
  { id: "settings", label: "Settings" },
  { id: "billing", label: "Billing", dividerAbove: true },
  { id: "help", label: "Help & Support" },
  { id: "logout", label: "Log out", dividerAbove: true },
];

const groupedItems = [
  { id: "new", label: "New File", groupLabel: "Actions" },
  { id: "open", label: "Open…" },
  { id: "save", label: "Save", active: true },
  { id: "export", label: "Export", dividerAbove: true, groupLabel: "Share" },
  { id: "archive", label: "Archive", disabled: true },
];

const meta: Meta<typeof NavigationDropdown> = {
  title: "Components/NavigationDropdown",
  component: NavigationDropdown,
  tags: ["autodocs"],
  args: {
    label: "Navigation",
    items: sampleItems,
  },
  argTypes: {
    align: {
      options: ["left", "right"],
      control: { type: "select" },
    },
    disabled: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof NavigationDropdown>;

export const Default: Story = {};

export const RightAligned: Story = {
  args: {
    label: "Account",
    align: "right",
    items: richItems,
  },
  decorators: [
    (StoryFn: React.ComponentType) => (
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px" }}>
        <StoryFn />
      </div>
    ),
  ],
};

export const WithGroupsAndDividers: Story = {
  args: {
    label: "File",
    items: groupedItems,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
    items: sampleItems,
  },
};

export const WithActiveItem: Story = {
  args: {
    label: "Pages",
    items: [
      { id: "home", label: "Home", active: true },
      { id: "about", label: "About" },
      { id: "blog", label: "Blog" },
      { id: "contact", label: "Contact" },
    ],
  },
};
