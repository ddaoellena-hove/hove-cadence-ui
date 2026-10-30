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

// ── V2 : supervision de la publication (spécification Hero KPI V2) ──
const examine = fn();
const goTo = fn();
const secondary = (onClick: () => void): StoryObj<typeof PageHero>["args"] => ({
  kpis: [
    { id: "theoretical", label: "Données théoriques", value: "Intégrées · à vérifier", status: "warning", statusLabel: "Validation non établie", onClick, actionLabel: "Contrôler les données" },
    { id: "quality", label: "Qualité", value: "12 points · +6", onClick, actionLabel: "Examiner les points" },
    { id: "realtime", label: "Temps réel", value: "2/2 flux reçus", status: "nominal", statusLabel: "Réception complète", onClick, actionLabel: "Consulter les flux" },
    { id: "exports", label: "Exports", value: "3/3 publiés", status: "nominal", statusLabel: "Publication complète", onClick, actionLabel: "Consulter les exports" },
  ],
});

/** Alerte : variation dominante avec sa référence et son volume absolu, panneau d'action, une action propre à chaque carte. */
export const Alerte: Story = {
  name: "V2 — Alerte",
  args: {
    title: "Version du 27 août à vérifier",
    description: "Version intégrée à 15:47",
    icon: "alert-triangle",
    tone: "warning",
    status: "warning",
    statusLabel: "À investiguer",
    valueLabel: "Variation des courses",
    value: "−5,1 %",
    valueType: "number",
    valueCaption: "vs 26 août · −16 227 courses",
    valueTone: "warning",
    actionPanel: {
      title: "2 sujets à traiter",
      description: "Impact possible dès le 1er septembre",
      action: { label: "Examiner les anomalies", onClick: examine },
    },
    freshness: { updatedAt: "2026-10-28T08:00:00Z", now: "2026-10-28T08:03:00Z", timeZone: "Europe/Paris" },
    ...secondary(goTo),
  },
  play: async ({ canvasElement }) => {
    examine.mockClear();
    goTo.mockClear();
    const c = within(canvasElement);
    // KPI principal : libellé, valeur signée, référence et volume absolu
    await expect(c.getByText("Variation des courses")).toBeVisible();
    await expect(c.getByText("−5,1 %")).toHaveClass("page-hero__value--number");
    await expect(c.getByText("vs 26 août · −16 227 courses")).toBeVisible();
    // Accent ambre doublé d'un statut textuel
    await expect(canvasElement.querySelector(".page-hero")).toHaveClass("page-hero--warning");
    await expect(c.getByText("À investiguer")).toBeVisible();
    // Panneau d'action : cible de 44px, action principale
    const action = c.getByRole("button", { name: "Examiner les anomalies" });
    await expect(action.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.click(action);
    await expect(examine).toHaveBeenCalledOnce();
    // Cartes : actions distinctes, pas quatre « Voir le détail »
    await expect(c.queryByText("Voir le détail")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: /^Temps réel, 2\/2 flux reçus.*Consulter les flux$/ }));
    await expect(goTo).toHaveBeenCalledOnce();
  },
};

/** Nominal : même architecture, accent vert, le bandeau reste une vraie vue de pilotage. */
export const Nominal: Story = {
  name: "V2 — Nominal",
  args: {
    ...Alerte.args,
    title: "Publication sous contrôle",
    icon: "check-circle",
    tone: "positive",
    status: "completed",
    statusLabel: "Sous contrôle",
    value: "+0,4 %",
    valueCaption: "vs 26 août · +1 274 courses",
    valueTone: "default",
    actionPanel: { title: "Aucun sujet à traiter", description: "Dernier contrôle à 15:47", action: { label: "Consulter le rapport", onClick: examine } },
    kpis: secondary(goTo)?.kpis?.map((kpi) => (kpi.id === "theoretical" ? { ...kpi, value: "Intégrées · validées", status: "nominal" as const, statusLabel: "Validées" } : kpi)),
  },
};

/** Données périmées : statut écrit, horodatage explicite, action d'actualisation. */
export const Perimees: Story = {
  name: "V2 — Données périmées",
  args: {
    ...Alerte.args,
    status: "critical",
    statusLabel: "Données non actualisées",
    actions: <button type="button" className="page-hero__button">Actualiser</button>,
    freshness: { updatedAt: "2026-10-28T05:00:00Z", now: "2026-10-28T08:03:00Z", freshWithin: 15, staleWithin: 60, timeZone: "Europe/Paris" },
  },
};

/** Heure d'actualisation absente (`updatedAt: null`) : écrite, jamais reconstruite. */
export const FraicheurInconnue: Story = {
  name: "V2 — Fraîcheur inconnue",
  args: { ...Alerte.args, freshness: { updatedAt: null } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Heure d’actualisation inconnue")).toBeVisible();
  },
};

/** Chargement : squelettes seulement, aucune valeur ancienne. */
export const ChargementV2: Story = {
  name: "V2 — Chargement",
  args: { ...Alerte.args, state: "loading" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText("−5,1 %")).toBeNull();
    await expect(c.queryByText(/il y a/)).toBeNull();
    await expect(c.getByRole("status")).toHaveTextContent("Chargement");
  },
};

const retry = fn();
/** Indisponible : message et « Réessayer » ; la fraîcheur n'est plus affichée. */
export const Indisponible: Story = {
  name: "V2 — Indisponible",
  args: { ...Alerte.args, state: "error", errorMessage: "Impossible de récupérer la synthèse de la version du 27 août.", onRetry: retry },
  play: async ({ canvasElement }) => {
    retry.mockClear();
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Impossible de récupérer la synthèse");
    await expect(c.queryByText(/Mis à jour|il y a/)).toBeNull();
    // Ni accent ni icône teintée hérités de l'état précédent
    await expect(canvasElement.querySelector(".page-hero")).not.toHaveClass("page-hero--warning");
    await expect(canvasElement.querySelector(".page-hero__icon--warning")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Réessayer" }));
    await expect(retry).toHaveBeenCalledOnce();
  },
};

/** Largeurs : 1 carte par ligne en mobile, 2 en tablette, 4 en large. */
export const Largeurs: Story = {
  name: "V2 — Largeurs",
  render: (args) => (
    <div style={{ display: "grid", gap: 24 }}>
      {[390, 768, 1100].map((w) => (
        <div key={w} style={{ width: w }}>
          <PageHero {...args} title={`${w} px`} />
        </div>
      ))}
    </div>
  ),
  args: { ...Alerte.args },
  play: async ({ canvasElement }) => {
    const grids = [...canvasElement.querySelectorAll<HTMLElement>(".page-hero__kpis")];
    // auto-fit replie les pistes vides en 0px : ne compter que les colonnes visibles
    const columns = grids.map((g) => getComputedStyle(g).gridTemplateColumns.split(" ").filter((track) => track !== "0px").length);
    await expect(columns).toEqual([1, 2, 4]);
  },
};
