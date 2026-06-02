import type { Meta, StoryObj } from "@storybook/react";
import { AlertToast } from "./AlertToast";

const meta: Meta<typeof AlertToast> = {
  title: "Components/AlertToast",
  component: AlertToast,
  tags: ["autodocs"],
  argTypes: {
    type: {
      options: ["information", "success", "warning", "error"],
      control: { type: "select" },
    },
    title: { control: { type: "text" } },
    description: { control: { type: "text" } },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    dismissible: { control: { type: "boolean" } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "32px", background: "#f5f5f5", minHeight: "120px", display: "flex", alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AlertToast>;

export const Information: Story = {
  args: {
    type: "information",
    description: "Lorem ipsum dolor sit amet consectetur. Enim mauris pretium est est ut aliquam dolor egestas non.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    description: "Your changes have been saved successfully.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    description: "Your session is about to expire. Please save your work.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    description: "Something went wrong. Please try again or contact support.",
  },
};

export const WithProgress: Story = {
  args: {
    type: "information",
    description: "Uploading file, please wait\u2026",
    progress: 45,
  },
};

export const ProgressComplete: Story = {
  args: {
    type: "success",
    title: "Upload complete",
    description: "Your file has been uploaded successfully.",
    progress: 100,
  },
};

export const Dismissible: Story = {
  args: {
    type: "warning",
    description: "This banner can be dismissed by the user.",
    dismissible: true,
  },
};

export const WithActions: Story = {
  args: {
    type: "information",
    description: "A new version of the application is available.",
    actions: [
      { label: "DISMISS", outline: true },
      { label: "UPDATE NOW", outline: false },
    ],
  },
};

export const ErrorWithActions: Story = {
  args: {
    type: "error",
    title: "Action required",
    description: "Your payment method has expired. Update it to continue.",
    actions: [
      { label: "CANCEL", outline: true },
      { label: "UPDATE CARD", outline: false },
    ],
  },
};

export const CustomTitle: Story = {
  args: {
    type: "success",
    title: "Payment received",
    description: "We&#39;ve received your payment of $99.00.",
    dismissible: true,
  },
};
