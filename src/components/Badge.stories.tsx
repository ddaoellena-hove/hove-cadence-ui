import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    label:      { control: "text" },
    draggable:  { control: "boolean" },
    dismissible:{ control: "boolean" },
    mono:       { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/* ── Stories ── */

/** Badge par défaut — affichage indicatif simple. */
export const Default: Story = {
  args: {
    label: "Transilien",
  },
};

/**
 * Badge glissable — affiche un handle 6-points à gauche.
 * Wirer `onDragStart` / `onDragEnd` pour gérer le réordonnancement.
 */
export const Draggable: Story = {
  args: {
    label: "Transilien",
    draggable: true,
  },
};

/** Badge supprimable — une croix × à droite retire le badge de la liste. */
export const Dismissible: Story = {
  render: () => {
    const initial = ["Transilien", "RER A", "Ligne 13", "Bus 91"];
    const [badges, setBadges] = useState(initial);

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {badges.map((label) => (
          <Badge
            key={label}
            label={label}
            dismissible
            onDismiss={() => setBadges((prev) => prev.filter((b) => b !== label))}
          />
        ))}
        {badges.length === 0 && (
          <span style={{ fontFamily: "Inter, Helvetica", fontSize: 12, color: "#809397" }}>
            Tous les badges ont été supprimés.
          </span>
        )}
      </div>
    );
  },
};

/**
 * Badge Mono — police Spline Sans Mono pour les valeurs techniques
 * (identifiants d'arrêts, codes, clés…).
 */
export const Mono: Story = {
  args: {
    label: "stop_area:IDFM:47026",
    mono: true,
  },
};

/** Toutes les variantes côte à côte. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Badge label="Default" />
      <Badge label="Draggable" draggable />
      <Badge label="Supprimable" dismissible onDismiss={() => {}} />
      <Badge label="stop_area:IDFM:47026" mono />
      <Badge label="Code + ×" mono dismissible onDismiss={() => {}} />
    </div>
  ),
};
