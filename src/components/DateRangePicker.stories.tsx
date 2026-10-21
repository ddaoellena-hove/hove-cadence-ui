import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DateRangePicker, type DateRange, type DateRangePickerProps } from "./DateRangePicker";
import { FilterBar } from "./FilterBar";
import { Dropdown } from "./Dropdown";
import { PrimaryButton } from "./PrimaryButton";
import { formatRange } from "./date-range-utils";

// Date de référence fixe : les stories et leurs tests ne dépendent pas du jour d'exécution
const REFERENCE = new Date(2026, 9, 19, 14, 30);

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: {
    label: "Période",
    referenceDate: REFERENCE,
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

/* ── Wrapper contrôlé ── */

const Controlled = (args: DateRangePickerProps) => {
  const [range, setRange] = useState<DateRange>(args.value ?? { start: null, end: null });
  return (
    <div style={{ padding: 24, minHeight: 480 }}>
      <DateRangePicker {...args} value={range} onChange={setRange} />
      <p style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)", marginTop: 16 }}>
        Période appliquée : {range.start && range.end ? formatRange(range.start, range.end) : "—"}
      </p>
    </div>
  );
};

const render: Story["render"] = (args) => <Controlled {...args} />;

/** Sélection en deux clics, validée par « Appliquer ». La fin peut précéder le début. */
export const Defaut: Story = {
  name: "Défaut",
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const trigger = canvas.getByRole("button", { name: /Période/ });

    await user.click(trigger);
    const apply = canvas.getByRole("button", { name: "Appliquer" });
    await expect(apply).toBeDisabled();

    // Fin avant le début : les dates sont inversées
    await user.click(canvas.getByRole("button", { name: /^vendredi 9 octobre 2026/ }));
    await user.click(canvas.getByRole("button", { name: /^lundi 5 octobre 2026/ }));
    await expect(canvas.getByRole("button", { name: /^mercredi 7 octobre 2026, dans la période/ })).toBeInTheDocument();
    await expect(apply).toBeEnabled();

    await user.click(apply);
    await expect(trigger).toHaveTextContent("05/10/2026 – 09/10/2026");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

/** Un clic sur un préréglage applique et ferme ; le déclencheur affiche son libellé. */
export const Prereglages: Story = {
  name: "Préréglages",
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    await user.click(canvas.getByRole("button", { name: /Période/ }));
    await user.click(canvas.getByRole("button", { name: "7 derniers jours" }));
    await expect(canvas.getByRole("button", { name: /Période/ })).toHaveTextContent("7 derniers jours");
    await expect(canvas.getByText("Période appliquée : 13/10/2026 – 19/10/2026")).toBeInTheDocument();
  },
};

/** Préréglages métier fournis par l'app (journée de service à cheval sur minuit, etc.). */
export const PreregagesMetier: Story = {
  name: "Préréglages métier",
  render,
  args: {
    presets: [
      { id: "service", label: "Journée de service", getRange: (ref) => ({ start: ref, end: ref }) },
      {
        id: "week",
        label: "Semaine en cours",
        getRange: (ref) => {
          const monday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - ((ref.getDay() + 6) % 7));
          return { start: monday, end: ref };
        },
      },
    ],
  },
};

/** Bornes et durée maximale : au-delà de 7 jours après le début, les jours sont désactivés. */
export const BornesEtDureeMax: Story = {
  name: "Bornes et durée maximale",
  render,
  args: { maxDate: REFERENCE, maxDays: 7 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    await user.click(canvas.getByRole("button", { name: /Période/ }));
    await expect(canvas.getByText("7 jours maximum")).toBeInTheDocument();
    // Après la date max : désactivé
    await expect(canvas.getByRole("button", { name: /^mardi 20 octobre 2026/ })).toHaveAttribute("aria-disabled", "true");

    await user.click(canvas.getByRole("button", { name: /^samedi 10 octobre 2026/ }));
    await expect(canvas.getByRole("button", { name: /^vendredi 16 octobre 2026/ })).not.toHaveAttribute("aria-disabled");
    await expect(canvas.getByRole("button", { name: /^samedi 17 octobre 2026/ })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("button", { name: /^samedi 3 octobre 2026/ })).toHaveAttribute("aria-disabled", "true");
  },
};

/** Un seul mois : version compacte, pour une FilterBar ou un panneau étroit. */
export const UnSeulMois: Story = {
  name: "Un seul mois",
  render,
  args: { months: 1 },
};

/** Navigation au clavier, sélection à la touche Entrée, Échap pour fermer. */
export const Clavier: Story = {
  render,
  args: { value: { start: new Date(2026, 9, 5), end: new Date(2026, 9, 9, 23, 59, 59, 999) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const trigger = canvas.getByRole("button", { name: /Période/ });

    await user.click(trigger);
    const start = canvas.getByRole("button", { name: /^lundi 5 octobre 2026, début de période/ });
    await expect(start).toHaveAttribute("tabindex", "0");
    start.focus();

    // Entrée : nouveau début le 5 ; ↓ ↓ : 19 octobre ; Entrée : fin
    await user.keyboard("{Enter}{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("button", { name: /^lundi 19 octobre 2026/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.click(canvas.getByRole("button", { name: "Appliquer" }));
    await expect(trigger).toHaveTextContent("05/10/2026 – 19/10/2026");

    // Échap ferme sans appliquer et rend le focus au déclencheur
    await user.click(trigger);
    await user.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/* ── Dans une FilterBar ── */

const LINE_OPTIONS = [
  { id: "all", label: "Toutes les lignes" },
  { id: "l13", label: "Ligne 13" },
  { id: "rer-a", label: "RER A" },
];

const InFilterBar = () => {
  const [period, setPeriod] = useState<DateRange>({ start: null, end: null });
  const [line, setLine] = useState("all");
  const [query, setQuery] = useState("");
  return (
    <div style={{ minHeight: 480 }}>
      <FilterBar
        search={{ value: query, onChange: setQuery, placeholder: "Rechercher une perturbation…" }}
        quickFilters={
          <>
            <Dropdown options={LINE_OPTIONS} value={line} onChange={setLine} />
            <DateRangePicker aria-label="Période" value={period} onChange={setPeriod} months={1} referenceDate={REFERENCE} />
          </>
        }
        activeFilters={period.start && period.end ? [{ id: "period", label: formatRange(period.start, period.end) }] : []}
        onRemoveFilter={() => setPeriod({ start: null, end: null })}
        resultCount={1240}
      />
    </div>
  );
};

/** Filtre rapide d'une FilterBar (un seul mois, `aria-label` à la place du label). */
export const DansUneFilterBar: Story = {
  name: "Dans une FilterBar",
  render: () => <InFilterBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Période : aucune période" })).toBeInTheDocument();
  },
};

/** Variante bouton (PrimaryButton outline sm) : pour l'en-tête d'un dashboard. */
export const VarianteBouton: Story = {
  name: "Variante bouton",
  args: { label: undefined, "aria-label": "Période", variant: "button" },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /^Période : / });
    await expect(trigger).toHaveClass("primary-button", "primary-button--outline", "base-button--sm");
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("button", { name: "Aujourd'hui" }));
    // Le préréglage s'applique : le libellé du bouton le reprend
    await expect(canvas.getByRole("button", { name: "Période : Aujourd'hui" })).toBeInTheDocument();
  },
};

const DEVISES = [
  { id: "eur", label: "EUR €" },
  { id: "usd", label: "USD $" },
];

/** En-tête de dashboard : période, devise et action principale, tous en sm. */
export const EnTeteDeDashboard: Story = {
  name: "En-tête de dashboard",
  render: () => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    const [devise, setDevise] = useState("eur");
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 24, minHeight: 480, alignContent: "flex-start", flexWrap: "wrap" }}>
        <DateRangePicker
          variant="button"
          aria-label="Période"
          referenceDate={REFERENCE}
          placeholder="Choisir une période"
          value={range}
          onChange={setRange}
        />
        <Dropdown variant="button" aria-label="Devise" options={DEVISES} value={devise} onChange={setDevise} />
        <PrimaryButton size="sm" outline iconStart="download-02" label="Exporter" />
      </div>
    );
  },
};

/**
 * Déclencheur au bord droit d'un conteneur qui défile : le popover se décale
 * vers la gauche et reste dans la zone visible, bordures et barre de
 * défilement permanente exclues.
 */
export const AuBordDroit: Story = {
  name: "Au bord droit",
  render: () => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    return (
      <div
        className="story-scroll-box"
        style={{
          width: 380,
          height: 420,
          overflow: "auto",
          border: "1px solid var(--cadence-color-border)",
          // Bordure épaisse : simule une barre de défilement permanente, que le
          // navigateur de test (headless) masque toujours
          borderRight: "16px solid var(--cadence-color-surface-alt)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 8, height: 800 }}>
          <DateRangePicker
            variant="button"
            aria-label="Période"
            referenceDate={REFERENCE}
            presets={[]}
            months={1}
            value={range}
            onChange={setRange}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvasElement.querySelector(".story-scroll-box") as HTMLElement;
    await userEvent.click(canvas.getByRole("button", { name: /^Période : / }));
    const popover = canvas.getByRole("dialog", { name: "Choisir une période" });
    const boxRect = box.getBoundingClientRect();
    const visibleLeft = boxRect.left + box.clientLeft;
    const visibleRight = visibleLeft + box.clientWidth;
    const rect = popover.getBoundingClientRect();
    await expect(rect.right).toBeLessThanOrEqual(visibleRight);
    await expect(rect.left).toBeGreaterThanOrEqual(visibleLeft);
  },
};
