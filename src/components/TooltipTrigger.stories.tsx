import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipTrigger } from "./TooltipTrigger";

const meta: Meta<typeof TooltipTrigger> = {
  title: "Components/TooltipTrigger",
  component: TooltipTrigger,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Wraps any child element and shows a Tooltip bubble on hover. " +
          "The `position` prop controls which side the bubble appears on; " +
          "the arrow automatically points back toward the trigger.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    theme: { control: "select", options: ["light", "dark"] },
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "80px 120px", display: "inline-flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TooltipTrigger>;

/* ── Default ────────────────────────────────────────────────────── */
export const Default: Story = {
  args: {
    label: "This is a tooltip",
    theme: "light",
    position: "top",
  },
};

/* ── Direction: Bottom ──────────────────────────────────────────── */
export const DirectionBottom: Story = {
  args: {
    label: "Tooltip below",
    theme: "light",
    position: "bottom",
  },
};

/* ── Direction: Left ────────────────────────────────────────────── */
export const DirectionLeft: Story = {
  args: {
    label: "Tooltip on the left",
    theme: "light",
    position: "left",
  },
};

/* ── Direction: Right ───────────────────────────────────────────── */
export const DirectionRight: Story = {
  args: {
    label: "Tooltip on the right",
    theme: "light",
    position: "right",
  },
};

/* ── Dark theme ─────────────────────────────────────────────────── */
export const DarkTheme: Story = {
  args: {
    label: "Dark tooltip",
    theme: "dark",
    position: "top",
  },
};

/* ── All Directions grid ────────────────────────────────────────── */
export const AllDirections: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px 120px",
        alignItems: "center",
        justifyItems: "center",
      }}
    >
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <div
          key={position}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              color: "#667085",
              textTransform: "capitalize",
            }}
          >
            {position}
          </span>
          <TooltipTrigger
            label={`Arrow points ${position}`}
            position={position}
            theme="light"
          />
        </div>
      ))}
    </div>
  ),
};
