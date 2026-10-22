import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, spyOn, userEvent, waitFor } from "storybook/test";
import { CopyableText } from "./CopyableText";
import { DescriptionList } from "./DescriptionList";
import { DataTable, type DataTableColumn } from "./DataTable";
import { StopLabel } from "./StopLabel";

const meta: Meta<typeof CopyableText> = {
  title: "Components/CopyableText",
  component: CopyableText,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { value: "stop_area:IDFM:482837" },
};
export default meta;
type Story = StoryObj<typeof CopyableText>;

/** Identifiant d'arrêt : valeur mono et bouton de copie. */
export const Defaut: Story = {
  name: "Défaut",
};

/** Copie réussie : presse-papiers appelé, « Copié » affiché et annoncé. */
export const CopieReussie: Story = {
  name: "Copie réussie",
  args: { onCopy: fn() },
  beforeEach: () => {
    const spy = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    return () => spy.mockRestore();
  },
  play: async ({ canvas, canvasElement, args }) => {
    // Aucune infobulle au survol : ni bulle intégrée, ni title natif.
    const button = canvas.getByRole("button", { name: "Copier stop_area:IDFM:482837" });
    await expect(button).not.toHaveAttribute("title");
    await userEvent.hover(button);
    const bubble = canvasElement.querySelector(".copyable-text .base-button-tip__bubble");
    await expect(bubble).not.toBeNull();
    await expect(bubble).not.toBeVisible();
    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith("stop_area:IDFM:482837");
    await expect(args.onCopy).toHaveBeenCalledWith("stop_area:IDFM:482837");
    await expect(canvas.getByRole("status")).toHaveTextContent("Copié");
    // Seconde copie rapprochée : nouveau nœud, donc nouvelle annonce.
    const first = canvas.getByRole("status").firstElementChild;
    await userEvent.click(canvas.getByRole("button", { name: "Copier stop_area:IDFM:482837" }));
    await waitFor(() => expect(canvas.getByRole("status").firstElementChild).not.toBe(first));
    // Le retour s'efface après 2 s.
    await waitFor(() => expect(canvas.getByRole("status")).toBeEmptyDOMElement(), { timeout: 3000 });
  },
};

/** Presse-papiers refusé et repli indisponible : « Copie impossible ». */
export const CopieImpossible: Story = {
  name: "Copie impossible",
  args: { onCopy: fn() },
  beforeEach: () => {
    const clipboard = spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("refusé"));
    const exec = spyOn(document, "execCommand").mockReturnValue(false);
    return () => {
      clipboard.mockRestore();
      exec.mockRestore();
    };
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copier stop_area:IDFM:482837" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Copie impossible");
    await expect(args.onCopy).not.toHaveBeenCalled();
  },
};

/** Sans API Clipboard (contexte non sécurisé) : repli execCommand, focus rendu au bouton. */
export const RepliExecCommand: Story = {
  name: "Repli sans API Clipboard",
  beforeEach: () => {
    const clipboard = spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("non sécurisé"));
    const exec = spyOn(document, "execCommand").mockImplementation(() => {
      // La copie lit la sélection du champ temporaire, qui doit avoir le focus.
      const field = document.activeElement as HTMLTextAreaElement | null;
      return field?.tagName === "TEXTAREA" && field.value === "stop_area:IDFM:482837";
    });
    return () => {
      clipboard.mockRestore();
      exec.mockRestore();
    };
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Copier stop_area:IDFM:482837" });
    await userEvent.click(button);
    await expect(canvas.getByRole("status")).toHaveTextContent("Copié");
    await expect(button).toHaveFocus();
  },
};

/** Affichage abrégé, valeur complète copiée ; nom du bouton personnalisé. */
export const ContenuAbrege: Story = {
  name: "Contenu abrégé",
  args: {
    value: "vehicle_journey:IDFM:RATP:146243-C00001-1452",
    children: "…146243-1452",
    copyLabel: "Copier l’identifiant de la course",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Copier l’identifiant de la course" })).toBeInTheDocument();
  },
};

/** Texte non technique (mono désactivé), sans troncature. */
export const SansMono: Story = {
  name: "Sans police mono, non tronqué",
  args: { value: "Rapport-qualité-octobre-2026.csv", mono: false, truncate: false },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(".copyable-text");
    await expect(root).not.toHaveClass("copyable-text--mono");
    await expect(root).not.toHaveClass("copyable-text--truncate");
  },
};

/** Largeur contrainte : ellipse, sans infobulle native (la valeur complète reste lue et copiée). */
export const Tronque: Story = {
  name: "Tronqué",
  args: { value: "vehicle_journey:IDFM:RATP:146243-C00001-1452" },
  decorators: [(Story) => <div style={{ width: 220 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector(".copyable-text__value") as HTMLElement;
    await expect(text).not.toHaveAttribute("title");
    await expect(text).toHaveTextContent("vehicle_journey:IDFM:RATP:146243-C00001-1452");
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  },
};

/** Dans une DescriptionList : métadonnées d'un arrêt. */
export const DansUneDescriptionList: Story = {
  name: "Dans une DescriptionList",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <DescriptionList
        aria-label="Arrêt Châtelet"
        items={[
          { id: "name", label: "Arrêt", value: "Châtelet" },
          { id: "area", label: "Zone d’arrêt", value: <CopyableText value="stop_area:IDFM:71264" /> },
          { id: "point", label: "Point d’arrêt", value: <CopyableText value="stop_point:IDFM:22087" /> },
        ]}
      />
    </div>
  ),
};

interface TripRow {
  id: string;
  stop: string;
  city: string;
  stopId: string;
}

const TRIPS: TripRow[] = [
  { id: "1", stop: "Châtelet", city: "Paris", stopId: "stop_point:IDFM:22087" },
  { id: "2", stop: "Gare de Lyon", city: "Paris", stopId: "stop_point:IDFM:463158" },
  { id: "3", stop: "Nation", city: "Paris", stopId: "stop_point:IDFM:22093" },
];

const COLUMNS: DataTableColumn<TripRow>[] = [
  { id: "stop", header: "Arrêt", accessor: (r) => r.stop, cell: (r) => <StopLabel name={r.stop} city={r.city} /> },
  { id: "id", header: "Identifiant", accessor: (r) => r.stopId, cell: (r) => <CopyableText value={r.stopId} />, width: 280 },
];

/** Dans une cellule de DataTable. */
export const DansUnDataTable: Story = {
  name: "Dans un DataTable",
  render: () => <DataTable aria-label="Arrêts de la course" data={TRIPS} columns={COLUMNS} getRowId={(r) => r.id} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button", { name: /^Copier stop_point:IDFM:/ })).toHaveLength(3);
  },
};
