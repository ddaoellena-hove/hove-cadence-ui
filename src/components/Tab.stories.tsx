import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tab } from "./Tab";

const meta: Meta<typeof Tab> = {
  title: "Components/Tab",
  component: Tab,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "active"],
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    label: "Label",
    variant: "default",
  },
};

export const Active: Story = {
  args: {
    label: "Label",
    variant: "active",
  },
};


export const TabBar: Story = {
  name: "Tab bar (interactive)",
  render: () => {
    const tabs = ["Overview", "Analytics", "Reports", "Settings"];
    const [active, setActive] = useState("Overview");
    return (
      <div
        style={{
          display: "inline-flex",
          gap: "24px",
          padding: "0 8px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            label={tab}
            variant={active === tab ? "active" : "default"}
            onClick={() => setActive(tab)}
          />
        ))}
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    label: "Label",
    variant: "default",
    disabled: true,
  },
};
