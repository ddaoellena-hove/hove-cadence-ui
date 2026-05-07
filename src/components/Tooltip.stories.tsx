import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    theme: {
      options: ["light", "dark"],
      control: { type: "select" },
    },
    arrow: {
      options: ["top", "bottom", "right", "left"],
      control: { type: "select" },
    },
    label: {
      control: { type: "text" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

/* ── Padding helper so arrows aren&#39;t clipped in canvas ──────── */
const pad = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "24px 32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  ...extra,
});

export const Default: Story = {
  args: {
    label: "Label",
    theme: "light",
    arrow: "bottom",
  },
  decorators: [
    (Story) => (
      <div style={pad()}>
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = {
  args: {
    label: "Label",
    theme: "dark",
    arrow: "bottom",
  },
  decorators: [
    (Story) => (
      <div style={pad({ background: "#f0f0f0" })}>
        <Story />
      </div>
    ),
  ],
};

export const ArrowTop: Story = {
  args: {
    label: "Label",
    theme: "light",
    arrow: "top",
  },
  decorators: [
    (Story) => (
      <div style={pad({ paddingTop: "32px" })}>
        <Story />
      </div>
    ),
  ],
};

export const ArrowBottom: Story = {
  args: {
    label: "Label",
    theme: "light",
    arrow: "bottom",
  },
  decorators: [
    (Story) => (
      <div style={pad()}>
        <Story />
      </div>
    ),
  ],
};

export const ArrowRight: Story = {
  args: {
    label: "Label",
    theme: "light",
    arrow: "right",
  },
  decorators: [
    (Story) => (
      <div style={pad()}>
        <Story />
      </div>
    ),
  ],
};

export const ArrowLeft: Story = {
  args: {
    label: "Label",
    theme: "light",
    arrow: "left",
  },
  decorators: [
    (Story) => (
      <div style={pad()}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, auto)",
        gap: "32px 40px",
        padding: "28px 32px",
        background: "#f0f2f2",
        borderRadius: "12px",
        alignItems: "center",
        justifyItems: "center",
      }}
    >
      {/* Light row */}
      <Tooltip theme="light" arrow="top" label="Label" />
      <Tooltip theme="light" arrow="bottom" label="Label" />
      <Tooltip theme="light" arrow="right" label="Label" />
      <Tooltip theme="light" arrow="left" label="Label" />

      {/* Dark row */}
      <Tooltip theme="dark" arrow="top" label="Label" />
      <Tooltip theme="dark" arrow="bottom" label="Label" />
      <Tooltip theme="dark" arrow="right" label="Label" />
      <Tooltip theme="dark" arrow="left" label="Label" />
    </div>
  ),
};
