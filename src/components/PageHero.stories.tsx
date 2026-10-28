import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { PageHero } from "./PageHero";
const meta: Meta<typeof PageHero> = { title: "Composants/Structure et mise en page/PageHero", component: PageHero, tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof PageHero>;
const open = fn();
export const Defaut: Story = { args: { title: "Flux temps réel", description: "Réception et qualité du réseau", value: 12456, unit: "courses", status: "active", statusLabel: "En direct", freshness: { updatedAt: "2026-10-28T08:00:00Z", now: "2026-10-28T08:02:00Z", timeZone: "Europe/Paris" }, kpis: [{ id: "a", label: "Réceptions", value: 240, status: "nominal", statusLabel: "À jour", onClick: open }, { id: "b", label: "À vérifier", value: 12, status: "warning", statusLabel: "Avertissement" }, { id: "c", label: "Erreurs", value: 3, status: "critical", statusLabel: "Critique" }] }, play: async ({ canvasElement }) => { open.mockClear(); const c = within(canvasElement); const tile = c.getByRole("button", { name: /Réceptions, 240/ }); tile.focus(); await userEvent.keyboard("{Enter}"); await expect(open).toHaveBeenCalledOnce(); } };
export const Etroit: Story = { ...Defaut, play: undefined, decorators: [Story => <div style={{ width: 280 }}><Story /></div>] };
export const Chargement: Story = { args: { ...Defaut.args, loading: true } };
export const SansKpi: Story = { args: { title: "Catalogue", description: "Données de référence", headingLevel: 2 } };

/** Bandeau à KPI texte : valeurs courtes en sans-serif, légende de la valeur principale, tuile d'icône, valeur en alerte. */
export const KpiTexte: Story = {
  name: "KPI texte et valeur en alerte",
  args: {
    title: "Production de l'offre",
    description: "Exécution du 28 août",
    icon: "alert-triangle",
    value: 412806,
    unit: "courses",
    valueCaption: "vs 26 août · −16 227",
    valueTone: "warning",
    status: "warning",
    statusLabel: "Écart à vérifier",
    kpis: [
      { id: "integration", label: "Intégration", value: "Intégrées · à vérifier", status: "warning", statusLabel: "À vérifier" },
      { id: "date", label: "Dernière exécution", value: "27 août · 15:41" },
      { id: "quality", label: "Qualité", value: "12 points · +6" },
      { id: "flows", label: "Flux", value: "2/2 flux reçus", status: "nominal", statusLabel: "À jour" },
      { id: "trips", label: "Courses commerciales", value: 18240, unit: "courses" },
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Chaîne → texte sans-serif ; nombre → mono
    const text = c.getByText("Intégrées · à vérifier");
    await expect(text).toHaveClass("page-hero__kpi-value--text");
    await expect(getComputedStyle(text).fontFamily).not.toMatch(/Mono/);
    await expect(c.getByText("18 240").closest(".page-hero__kpi-value")).toHaveClass("page-hero__kpi-value--number");
    // Légende distincte de l'unité, en sans-serif
    const caption = c.getByText("vs 26 août · −16 227");
    await expect(caption).toHaveClass("page-hero__caption");
    await expect(getComputedStyle(caption).fontFamily).not.toMatch(/Mono/);
    // Couleur d'alerte doublée d'un statut textuel
    await expect(canvasElement.querySelector(".page-hero__value")).toHaveClass("page-hero__value--warning");
    await expect(c.getByText("Écart à vérifier")).toBeVisible();
    await expect(canvasElement.querySelector(".page-hero__icon--warning")).not.toBeNull();
  },
};
