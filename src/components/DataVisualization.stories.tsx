import type { Meta, StoryObj } from "@storybook/react";
import { DataVisualization } from "./DataVisualization";

const CATEGORIES_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const CATEGORIES_TEAMS = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];

const SERIES_TWO = [
  { label: "Revenue", data: [42, 58, 35, 71, 49, 63] },
  { label: "Expenses", data: [30, 41, 28, 52, 38, 44] },
];

const SERIES_THREE = [
  { label: "Product A", data: [18, 24, 31, 19, 27] },
  { label: "Product B", data: [22, 17, 25, 30, 15] },
  { label: "Product C", data: [12, 20, 14, 18, 22] },
];

const meta = {
  title: "Components/DataVisualization",
  component: DataVisualization,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["stacked-vertical", "grouped-vertical", "horizontal"],
    },
    height: { control: { type: "range", min: 160, max: 500, step: 20 } },
    showLegend: { control: "boolean" },
    showGridLines: { control: "boolean" },
    showValues: { control: "boolean" },
  },
} satisfies Meta<typeof DataVisualization>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StackedVertical: Story = {
  name: "Stacked Vertical",
  args: {
    type: "stacked-vertical",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const StackedVerticalWithValues: Story = {
  name: "Stacked Vertical — Values",
  args: {
    type: "stacked-vertical",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: true,
  },
};

export const StackedVerticalThreeSeries: Story = {
  name: "Stacked Vertical — 3 Series",
  args: {
    type: "stacked-vertical",
    series: SERIES_THREE,
    categories: CATEGORIES_TEAMS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const GroupedVertical: Story = {
  name: "Grouped Vertical",
  args: {
    type: "grouped-vertical",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const GroupedVerticalWithValues: Story = {
  name: "Grouped Vertical — Values",
  args: {
    type: "grouped-vertical",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: true,
  },
};

export const GroupedVerticalThreeSeries: Story = {
  name: "Grouped Vertical — 3 Series",
  args: {
    type: "grouped-vertical",
    series: SERIES_THREE,
    categories: CATEGORIES_TEAMS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const Horizontal: Story = {
  name: "Horizontal",
  args: {
    type: "horizontal",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const HorizontalWithValues: Story = {
  name: "Horizontal — Values",
  args: {
    type: "horizontal",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 260,
    showLegend: true,
    showGridLines: true,
    showValues: true,
  },
};

export const HorizontalThreeSeries: Story = {
  name: "Horizontal — 3 Series",
  args: {
    type: "horizontal",
    series: SERIES_THREE,
    categories: CATEGORIES_TEAMS,
    height: 300,
    showLegend: true,
    showGridLines: true,
    showValues: false,
  },
};

export const NoLegendNoGrid: Story = {
  name: "Minimal (no legend, no grid)",
  args: {
    type: "grouped-vertical",
    series: SERIES_TWO,
    categories: CATEGORIES_MONTHS,
    height: 220,
    showLegend: false,
    showGridLines: false,
    showValues: false,
  },
};
