import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TreeView, type TreeNode } from "./TreeView";

const NETWORK: TreeNode[] = [
  {
    id: "metro",
    label: "Métro",
    icon: "train",
    children: [
      {
        id: "m1",
        label: "Ligne 1",
        children: [
          { id: "m1-a", label: "Château de Vincennes → La Défense" },
          { id: "m1-r", label: "La Défense → Château de Vincennes" },
        ],
      },
      {
        id: "m4",
        label: "Ligne 4",
        children: [
          { id: "m4-a", label: "Porte de Clignancourt → Bagneux" },
          { id: "m4-r", label: "Bagneux → Porte de Clignancourt" },
        ],
      },
    ],
  },
  {
    id: "tram",
    label: "Tramway",
    icon: "tram",
    children: [
      { id: "t3a", label: "T3a", meta: "32 arrêts" },
      { id: "t3b", label: "T3b (hors service)", meta: "26 arrêts", disabled: true },
    ],
  },
  { id: "bus", label: "Bus", icon: "bus", hasChildren: true },
];

const meta: Meta<typeof TreeView> = {
  title: "Composants/Navigation/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { "aria-label": "Réseau de transport", nodes: NETWORK },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TreeView>;

/** Sélection unique. Clavier : flèches, Entrée, saisie de la première lettre. */
export const Defaut: Story = {
  name: "Défaut",
  args: { selection: "single", defaultExpandedIds: ["metro"], onNodeClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole("tree", { name: "Réseau de transport" });
    // Focus sur la 1re ligne, puis descente vers « Ligne 1 ».
    within(tree).getAllByRole("treeitem")[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    const ligne1 = canvas.getByRole("treeitem", { name: /Ligne 1/ });
    await waitFor(() => expect(ligne1).toHaveFocus());
    // → déplie, → entre dans le 1er enfant.
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(ligne1).toHaveAttribute("aria-expanded", "true"));
    await userEvent.keyboard("{ArrowRight}");
    const aller = canvas.getByRole("treeitem", { name: /Château de Vincennes → La Défense/ });
    await waitFor(() => expect(aller).toHaveFocus());
    // Entrée sélectionne et notifie l'app.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(aller).toHaveAttribute("aria-selected", "true"));
    await expect(args.onNodeClick).toHaveBeenCalled();
    // Saisie « t » : saut à « Tramway ».
    await userEvent.keyboard("t");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: /Tramway/ })).toHaveFocus());
  },
};

/** Sélection multiple : cases tri-état qui remontent vers le parent. */
export const SelectionMultiple: Story = {
  name: "Sélection multiple",
  args: { selection: "multiple", defaultExpandedIds: ["metro", "m1"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ligne1 = canvas.getByRole("treeitem", { name: /Ligne 1/ });
    const aller = canvas.getByRole("treeitem", { name: /Château de Vincennes → La Défense/ });
    const retour = canvas.getByRole("treeitem", { name: /La Défense → Château de Vincennes/ });
    await expect(ligne1).toHaveAttribute("aria-checked", "false");

    // Un seul enfant coché → le parent passe en « mixed ».
    await userEvent.click(aller);
    await expect(aller).toHaveAttribute("aria-checked", "true");
    await waitFor(() => expect(ligne1).toHaveAttribute("aria-checked", "mixed"));

    // Les deux enfants cochés → le parent passe en « checked ».
    await userEvent.click(retour);
    await waitFor(() => expect(ligne1).toHaveAttribute("aria-checked", "true"));

    // Décocher le parent décoche tout le sous-arbre.
    await userEvent.click(ligne1);
    await waitFor(() => expect(aller).toHaveAttribute("aria-checked", "false"));
  },
};

/** Chargement à la demande : Skeleton pendant le chargement, reprise sur erreur. */
export const ChargementALaDemande: Story = {
  name: "Chargement à la demande",
  render: function Demo() {
    const attempts = useRef<Record<string, number>>({});
    const loadChildren = (node: TreeNode) =>
      new Promise<TreeNode[]>((resolve, reject) => {
        window.setTimeout(() => {
          // Le nœud « Bus » échoue au 1er essai, réussit ensuite.
          if (node.id === "bus") {
            attempts.current.bus = (attempts.current.bus ?? 0) + 1;
            if (attempts.current.bus < 2) {
              reject(new Error("réseau indisponible"));
              return;
            }
          }
          resolve([
            { id: `${node.id}-1`, label: "38 — Gare du Nord ↔ Porte d'Orléans" },
            { id: `${node.id}-2`, label: "91 — Bastille ↔ Montparnasse" },
          ]);
        }, 60);
      });
    return <TreeView aria-label="Réseau de transport" nodes={NETWORK} loadChildren={loadChildren} selection="single" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bus = canvas.getByRole("treeitem", { name: /Bus/ });
    // Déplier au clavier déclenche le chargement.
    await userEvent.click(bus);
    await userEvent.keyboard("{ArrowRight}");
    // 1er essai en erreur : ligne de reprise.
    const erreur = await canvas.findByRole("treeitem", { name: /Échec du chargement/ });
    // Réessayer : le 2e essai réussit, les enfants apparaissent.
    await userEvent.click(erreur);
    await waitFor(() => expect(canvas.getByText(/Gare du Nord/)).toBeInTheDocument());
  },
};

/** Arbre vide. */
export const Vide: Story = { args: { nodes: [], emptyLabel: "Aucune ligne dans ce périmètre." } };

/** Gros volume : la liste est virtualisée au-delà de 500 lignes visibles. */
export const GrosVolume: Story = {
  name: "Gros volume (virtualisé)",
  render: function Demo() {
    const [nodes] = useState<TreeNode[]>(() =>
      Array.from({ length: 600 }, (_, i) => ({ id: `s${i}`, label: `Arrêt ${String(i + 1).padStart(4, "0")}`, icon: "map-01" as const })),
    );
    return <TreeView aria-label="Arrêts du réseau" nodes={nodes} selection="single" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole("tree");
    // Seul un sous-ensemble est monté dans le DOM.
    await waitFor(() => expect(within(tree).getAllByRole("treeitem").length).toBeLessThan(100));
    await expect(tree.scrollHeight).toBeGreaterThan(tree.clientHeight * 5);
  },
};
