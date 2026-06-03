import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "destructive", "inverse"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    target: {
      control: "select",
      options: ["_self", "_blank", "_parent", "_top"],
    },
    href: { control: "text" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: "Click here",
    href: "https://example.com",
    variant: "primary",
    size: "md",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete account",
    href: "https://example.com",
    variant: "destructive",
    size: "md",
  },
};

export const Inverse: Story = {
  args: {
    children: "Inverse link",
    href: "https://example.com",
    variant: "inverse",
    size: "md",
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: "#1f2937", padding: "16px", borderRadius: "8px" }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    children: "Disabled link",
    href: "https://example.com",
    disabled: true,
  },
};

export const ExternalLink: Story = {
  args: {
    children: "Open in new tab",
    href: "https://example.com",
    target: "_blank",
  },
};

export const AsButton: Story = {
  args: {
    children: "Button-style link",
    onClick: () => alert("Clicked!"),
  },
};

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M10 13L5 8l5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WithIcon: Story = {
  args: {
    children: "Retour",
    href: "#",
    variant: "secondary",
    size: "md",
    icon: <ArrowLeft />,
  },
};
