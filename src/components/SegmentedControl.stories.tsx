import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "./SegmentedControl";

const twoOptions = [
  { value: "section-1", label: "Section 1" },
  { value: "section-2", label: "Section 2" },
];

const threeOptions = [
  { value: "section-1", label: "Section 1" },
  { value: "section-2", label: "Section 2" },
  { value: "section-3", label: "Section 3" },
];

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: { type: "boolean" } },
    "aria-label": { control: { type: "text" } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const TwoSegments: Story = {
  args: {
    options: twoOptions,
    defaultValue: "section-1",
  },
};

export const ThreeSegments: Story = {
  args: {
    options: threeOptions,
    defaultValue: "section-1",
  },
};

export const SecondActive: Story = {
  args: {
    options: threeOptions,
    defaultValue: "section-2",
  },
};

export const ThirdActive: Story = {
  args: {
    options: threeOptions,
    defaultValue: "section-3",
  },
};

export const Disabled: Story = {
  args: {
    options: twoOptions,
    defaultValue: "section-1",
    disabled: true,
  },
};

