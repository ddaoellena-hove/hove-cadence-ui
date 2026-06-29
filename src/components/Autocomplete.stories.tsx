import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete, type AutocompleteOption } from "./Autocomplete";

const meta: Meta<typeof Autocomplete> = {
  title: "Components/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

/* ── Données d'exemple simples ── */

const lignes: AutocompleteOption[] = [
  { id: "rer-a", label: "RER A" },
  { id: "rer-b", label: "RER B" },
  { id: "l13", label: "Ligne 13" },
  { id: "l14", label: "Ligne 14" },
  { id: "t3a", label: "Tramway T3a" },
  { id: "transilien-r", label: "Transilien R" },
  { id: "transilien-n", label: "Transilien N" },
  { id: "bus-91", label: "Bus 91", disabled: true },
];

export const Simple: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 320 }}>
        <Autocomplete {...args} options={lignes} value={value ?? undefined} onChange={(v) => setValue(v as string | null)} />
      </div>
    );
  },
  args: { label: "Ligne concernée", placeholder: "Rechercher une ligne…" },
};

export const Multiple: Story = {
  render: (args) => {
    const [values, setValues] = useState<string[]>(["rer-a", "l13"]);
    return (
      <div style={{ maxWidth: 420 }}>
        <Autocomplete {...args} options={lignes} multiple value={values} onChange={(v) => setValues(v as string[])} />
      </div>
    );
  },
  args: { label: "Lignes impactées", placeholder: "Ajouter une ligne…" },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Autocomplete {...args} options={lignes} value="rer-b" />
    </div>
  ),
  args: { label: "Ligne concernée", disabled: true },
};

/* ════════════════════════════════════════════════════════════════════════
   Recherche de lieux avec catégories (favoris, historique, arrêts…)
   ════════════════════════════════════════════════════════════════════════ */

/* — Petites icônes de lieu — */
const iconStyle = { width: 18, height: 18, display: "block" } as const;
const HomeIcon = () => (
  <svg {...iconStyle} viewBox="0 0 20 20" fill="currentColor"><path d="M10 3l7 6v8h-4v-5H7v5H3V9l7-6z" /></svg>
);
const WorkIcon = () => (
  <svg {...iconStyle} viewBox="0 0 20 20" fill="currentColor"><path d="M7 5V4a2 2 0 012-2h2a2 2 0 012 2v1h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h3zm2 0h2V4H9v1z" /></svg>
);
const PlaceIcon = () => (
  <svg {...iconStyle} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 17s5-4.5 5-9a5 5 0 10-10 0c0 4.5 5 9 5 9z" /><circle cx="10" cy="8" r="1.8" /></svg>
);
const StopIcon = () => (
  <svg {...iconStyle} viewBox="0 0 20 20" fill="currentColor"><rect x="9" y="3" width="2" height="14" rx="1" /><path d="M11 4h5l-1.5 2L16 8h-5V4z" /></svg>
);
const BuildingIcon = () => (
  <svg {...iconStyle} viewBox="0 0 20 20" fill="currentColor"><path d="M4 17V5l6-2v14H4zm7 0V8l5 2v7h-5z" /></svg>
);

/* — Badges de lignes (présentation, propre à la story) — */
const MetroBadge = ({ n, color }: { n: string; color: string }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 18, height: 18, borderRadius: "50%", background: color,
    color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif",
  }}>{n}</span>
);
const BusBadge = ({ n, color, text = "#fff" }: { n: string; color: string; text?: string }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 24, height: 18, padding: "0 4px", borderRadius: 3, background: color,
    color: text, fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif",
  }}>{n}</span>
);

const lieux: AutocompleteOption[] = [
  // Favoris
  { id: "fav-maison", group: "Favoris", icon: <HomeIcon />, label: "Maison", description: "93 Rue Marcadet (Paris)" },
  { id: "fav-travail", group: "Favoris", icon: <WorkIcon />, label: "Travail", description: "20 Rue Hector Malot (Paris)" },
  { id: "fav-azur", group: "Favoris", icon: <BuildingIcon />, label: "Azur Café", description: "63 Rue de Ponthieu (Paris)" },

  // Historiques
  { id: "hist-ramet", group: "Historiques", icon: <PlaceIcon />, label: "Marcadet - Ramet", description: "Paris" },
  { id: "hist-barbes", group: "Historiques", icon: <PlaceIcon />, label: "Marcadet - Barbès", description: "Paris" },

  // Arrêts
  {
    id: "stop-poissonniers", group: "Arrêts", icon: <StopIcon />,
    label: "Marcadet - Poissonniers (Paris)",
    content: (
      <>
        <MetroBadge n="4" color="#a0006e" />
        <MetroBadge n="12" color="#007852" />
        <BusBadge n="31" color="#ffcd00" text="#1a1a1a" />
        <BusBadge n="56" color="#a0006e" />
        <BusBadge n="N14" color="#1a3e6e" />
        <BusBadge n="N44" color="#1a6e5a" />
      </>
    ),
  },
  {
    id: "stop-pont", group: "Arrêts", icon: <StopIcon />,
    label: "Pont Marcadet (Paris)",
    content: (
      <>
        <BusBadge n="60" color="#e2231a" />
        <BusBadge n="302" color="#ffcd00" text="#1a1a1a" />
      </>
    ),
  },
  {
    id: "stop-damremont", group: "Arrêts", icon: <StopIcon />,
    label: "Damrémont - Marcadet (Paris)",
    content: (
      <>
        <MetroBadge n="12" color="#007852" />
        <BusBadge n="95" color="#6e3c8e" />
      </>
    ),
  },
  {
    id: "stop-marcadet", group: "Arrêts", icon: <StopIcon />,
    label: "Marcadet (Paris)",
    content: (
      <>
        <BusBadge n="40" color="#7bc7e8" text="#1a1a1a" />
        <BusBadge n="80" color="#f49ec4" text="#1a1a1a" />
        <BusBadge n="85" color="#6e5a3c" />
      </>
    ),
  },

  // Adresses et lieux
  { id: "addr-12", group: "Adresses et lieux", icon: <BuildingIcon />, label: "12 Rue Marcadet (Paris)" },

  // Points d'intérêt
  { id: "poi-ramey", group: "Points d'intérêt", icon: <PlaceIcon />, label: "Marcadet - Ramey", description: "20 Rue Hector Malot (Paris)" },
  { id: "poi-barbes", group: "Points d'intérêt", icon: <PlaceIcon />, label: "Marcadet - Barbès", description: "20 Rue Hector Malot (Paris)" },
];

/** Recherche de lieux groupée par catégories (menu ouvert au montage). */
export const WithCategories: Story = {
  name: "With Categories (place search)",
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 460, minHeight: 640 }}>
        <Autocomplete
          options={lieux}
          value={value ?? undefined}
          onChange={(v) => setValue(v as string | null)}
          placeholder="Ma position"
          defaultOpen
        />
      </div>
    );
  },
};
