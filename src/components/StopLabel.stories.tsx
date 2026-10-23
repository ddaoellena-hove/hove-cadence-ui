import type { Meta, StoryObj } from "@storybook/react-vite";
import { StopLabel } from "./StopLabel";
import { LineBadge } from "./LineBadge";
import { STOPS, lineByCode } from "../stories/data/network";

const meta: Meta<typeof StopLabel> = {
  title: "Composants/Transport/StopLabel",
  component: StopLabel,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof StopLabel>;

export const Defaut: Story = {
  name: "Défaut",
  args: { name: "Châtelet", id: "stop_area:IDFM:474151", city: "Paris 1er" },
};

/** Avec les lignes desservies (LineBadge). */
export const AvecLignes: Story = {
  name: "Avec lignes",
  render: () => {
    const stop = STOPS[0];
    return (
      <StopLabel
        name={stop.name}
        id={stop.id}
        city={stop.city}
        lines={stop.lineCodes.slice(0, 4).map((code) => {
          const l = lineByCode(code);
          return <LineBadge key={code} code={l.code} mode={l.mode} color={l.color} textColor={l.textColor} size="sm" />;
        })}
      />
    );
  },
};

export const SansId: Story = {
  name: "Sans identifiant",
  args: { name: "Gare de Lyon", city: "Paris 12e" },
};
