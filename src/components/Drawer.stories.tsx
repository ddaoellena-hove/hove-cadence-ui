import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Drawer } from "./Drawer";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Indicator } from "./Indicator";
import { Badge } from "./Badge";
import { PrimaryButton } from "./PrimaryButton";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { FieldRow } from "./FieldRow";
import { TabList } from "./TabList";
import { Tab } from "./Tab";
import { SEVERITY_LABELS, generateDisruptions, type Disruption } from "../stories/data/transport";
import { DISRUPTION_COLUMNS } from "../stories/data/columns";

const meta: Meta<typeof Drawer> = {
  title: "Composants/Surcouches/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const ActionDesactivee: Story = {
  args: { isOpen: true, onClose: fn(), title: "Export à configurer", children: "Sélectionnez un réseau.",
    primaryAction: { label: "Enregistrer", disabled: true, onClick: fn() } },
  play: async ({ args }) => {
    const dialog = within(document.body).getByRole("dialog", { name: "Export à configurer" });
    const save = within(dialog).getByRole("button", { name: "Enregistrer" });
    await expect(save).toBeDisabled();
    await userEvent.click(save);
    await expect(args.primaryAction?.onClick).not.toHaveBeenCalled();
    await expect(dialog.querySelector(".drawer__body .drawer__footer")).toBeNull();
  },
};

export const PiedCompose: Story = {
  args: { isOpen: true, onClose: fn(), title: "Modifications du catalogue",
    children: <div style={{ height: 1400 }}>Contenu long</div>,
    footer: <><span>Deux modifications</span><PrimaryButton label="Valider les modifications" /></> },
  play: async () => {
    const dialog = within(document.body).getByRole("dialog", { name: "Modifications du catalogue" });
    const body = dialog.querySelector<HTMLElement>(".drawer__body")!;
    const footer = dialog.querySelector<HTMLElement>(".drawer__footer")!;
    const before = footer.getBoundingClientRect();
    body.scrollTop = body.scrollHeight;
    await expect(footer.getBoundingClientRect().bottom).toBe(before.bottom);
    await expect(footer.getBoundingClientRect().width).toBe(dialog.getBoundingClientRect().width);
    await waitFor(() => expect(within(footer).getByRole("button", { name: "Valider les modifications" })).toBeVisible());
  },
};

const DISRUPTIONS = generateDisruptions(20);

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

/** Détail d'une perturbation ouvert depuis une ligne de DataTable. */
function DrawerDemo() {
  const [selected, setSelected] = useState<Disruption | null>(null);
  const columns = useMemo<DataTableColumn<Disruption>[]>(() => DISRUPTION_COLUMNS, []);

  return (
    <div style={{ padding: 24, minHeight: 480 }}>
      <DataTable<Disruption>
        aria-label="Perturbations"
        columns={columns}
        getRowId={(d) => d.id}
        data={DISRUPTIONS}
        maxHeight={400}
        onRowClick={setSelected}
      />

      <Drawer
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        subtitle={selected ? `Ligne ${selected.line}` : undefined}
        primaryAction={{ label: "Modifier la perturbation", onClick: () => setSelected(null) }}
        secondaryAction={{ label: "Fermer", onClick: () => setSelected(null) }}
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Indicator variant={selected.severity} label={SEVERITY_LABELS[selected.severity]} />
              <Badge label={selected.cause} />
            </div>
            <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", margin: 0, fontSize: 13 }}>
              <dt style={{ color: "var(--cadence-color-text-secondary)" }}>Ligne</dt>
              <dd style={{ margin: 0 }}>{selected.line}</dd>
              <dt style={{ color: "var(--cadence-color-text-secondary)" }}>Arrêts impactés</dt>
              <dd style={{ margin: 0 }}>{selected.impactedStops}</dd>
              <dt style={{ color: "var(--cadence-color-text-secondary)" }}>Début</dt>
              <dd style={{ margin: 0 }}>{dateFormat.format(selected.start)}</dd>
            </dl>
            <p style={{ color: "var(--cadence-color-text-secondary)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Consultez le détail de la perturbation sans quitter la liste. Les actions de modification restent
              accessibles dans le pied du panneau.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/**
 * Cliquer une ligne ouvre le panneau de détail à droite ; Échap, le voile, le
 * bouton fermer ou « Fermer » le referment. Le focus est piégé dans le panneau
 * et revient à la liste à la fermeture.
 */
export const Defaut: Story = {
  name: "Détail depuis un DataTable",
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Ouvre le détail de la première ligne au clavier.
    const firstRow = canvas.getAllByRole("row")[1];
    firstRow.focus();
    await expect(firstRow).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const dialog = await body.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    // Le focus est entré dans le panneau.
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Piège à focus : plusieurs Tab restent dans le panneau.
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    // Échap ferme le panneau.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** Panneau large (720px) en lecture seule, sans pied. */
function WideDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24, minHeight: 320 }}>
      <PrimaryButton label="Ouvrir le journal" onClick={() => setOpen(true)} />
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Journal des modifications" width="lg">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
          <li>09:12 — Perturbation créée par M. Dupont</li>
          <li>09:40 — Sévérité passée de « Information » à « Ralenti »</li>
          <li>10:05 — 3 arrêts supplémentaires impactés</li>
        </ul>
      </Drawer>
    </div>
  );
}

export const Large: Story = {
  name: "Large (lg, sans pied)",
  render: () => <WideDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const opener = canvas.getByRole("button", { name: "Ouvrir le journal" });

    // Ouverture : le focus entre dans le panneau.
    await userEvent.click(opener);
    const dialog = await body.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Échap rend le focus au bouton déclencheur (dès la fermeture).
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

/** Panneau large (720px) contenant un formulaire : en-tête et pied fixes, corps défilant. */
function FormDemo() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setTitleError(false);
  };

  return (
    <div style={{ padding: 24, minHeight: 320, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <PrimaryButton label="Créer une perturbation" iconStart="plus" onClick={() => setOpen(true)} />
      {created && <p role="status" style={{ margin: 0, fontSize: 13 }}>Perturbation « {created} » créée.</p>}

      <Drawer
        isOpen={open}
        onClose={close}
        title="Nouvelle perturbation"
        subtitle="Les champs marqués d’un astérisque sont obligatoires."
        width="lg"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) {
            setTitleError(true);
            return;
          }
          setCreated(title.trim());
          setTitle("");
          close();
        }}
        primaryAction={{ label: "Créer" }}
        secondaryAction={{ label: "Annuler", onClick: close }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <TextInput
            label="Titre *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(false);
            }}
            state={titleError ? "error" : "enabled"}
            helperText={titleError ? "Le titre est obligatoire." : undefined}
          />
          <FieldRow>
            <TextInput label="Ligne" placeholder="Ex. 13" />
            <TextInput label="Arrêts impactés" placeholder="Ex. 4" />
          </FieldRow>
          <FieldRow>
            <TextInput label="Début" type="datetime-local" />
            <TextInput label="Fin" type="datetime-local" />
          </FieldRow>
          <TextInput label="Cause" placeholder="Ex. Travaux" />
          <TextArea label="Description interne" rows={6} placeholder="Contexte pour les équipes d’exploitation" />
          <TextArea label="Message voyageurs" rows={6} placeholder="Texte affiché aux voyageurs" />
        </div>
      </Drawer>
    </div>
  );
}

/**
 * `width="lg"` + `onSubmit` : le corps et le pied sont dans un `<form>`.
 * « Créer » soumet (comme Entrée dans un champ) ; « Annuler » ne soumet pas.
 * L’en-tête et le pied restent fixes, seul le corps défile.
 */
export const Formulaire: Story = {
  name: "Large avec formulaire",
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: "Créer une perturbation" }));
    const dialog = await body.findByRole("dialog");
    const submit = within(dialog).getByRole("button", { name: "Créer" });
    await expect(submit).toHaveAttribute("type", "submit");
    await expect(within(dialog).getByRole("button", { name: "Annuler" })).toHaveAttribute("type", "button");

    // Soumission vide : erreur sur le titre, le panneau reste ouvert.
    await userEvent.click(submit);
    const titleInput = within(dialog).getByLabelText("Titre *");
    await expect(titleInput).toHaveAttribute("aria-invalid", "true");
    await expect(dialog).toBeInTheDocument();

    // Entrée dans un champ soumet le formulaire.
    await userEvent.type(titleInput, "Travaux station Bastille{Enter}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status")).toHaveTextContent("Travaux station Bastille");
  },
};

/** Navigation sous la ligne titre/fermeture ; navigation à droite et statut à gauche dans l’en-tête. */
function NavigationDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <Drawer
      isOpen
      onClose={() => {}}
      title={`Objet ${current}`}
      width="intermediate"
      navigation={{ current, total: 3, onPrevious: () => setCurrent((n) => n - 1), onNext: () => setCurrent((n) => n + 1) }}
      headerContent={<Indicator variant="warning" label="Modification en attente" />}
    >
      Contenu de la fiche
    </Drawer>
  );
}

export const Navigation: Story = {
  name: "Navigation entre éléments",
  render: () => <NavigationDemo />,
  play: async () => {
    const c = within(document.body);
    const dialog = c.getByRole("dialog", { name: "Objet 1" });
    const nav = within(dialog).getByRole("navigation", { name: "Navigation entre les éléments" });
    // Dans l'en-tête, sous la ligne titre/fermeture ; flèches sans infobulle
    await expect(nav.closest(".drawer__header")).not.toBeNull();
    const bubble = nav.querySelector(".base-button-tip__bubble") as HTMLElement;
    await expect(getComputedStyle(bubble).display).toBe("none");

    await expect(c.getByRole("button", { name: "Élément précédent" })).toBeDisabled();
    await userEvent.click(c.getByRole("button", { name: "Élément suivant" }));
    await waitFor(() => expect(c.getByRole("dialog", { name: "Objet 2" })).toBeVisible());
    await expect(c.getByRole("status")).toHaveTextContent("2 sur 3");
  },
};

/** Onglets dans le panneau : le panneau glisse depuis la droite, le soulignement est posé sans animation. */
function TabsDemo() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("detail");
  const tabs = [
    { id: "detail", label: "Détail" },
    { id: "historique", label: "Historique" },
    { id: "impacts", label: "Impacts" },
  ];
  return (
    <div style={{ padding: 24, minHeight: 320 }}>
      <PrimaryButton label="Ouvrir le détail" onClick={() => setOpen(true)} />
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Perturbation P-1042">
        <TabList aria-label="Sections du détail">
          {tabs.map((tab) => (
            <Tab key={tab.id} id={`drawer-tab-${tab.id}`} label={tab.label} variant={tab.id === active ? "active" : "default"} onClick={() => setActive(tab.id)} />
          ))}
        </TabList>
        <p style={{ fontSize: 13 }}>Contenu de l’onglet « {tabs.find((t) => t.id === active)?.label} ».</p>
      </Drawer>
    </div>
  );
}

export const AvecOnglets: Story = {
  name: "Avec onglets",
  render: () => <TabsDemo />,
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Ouvrir le détail" }));
    const dialog = await body.findByRole("dialog");
    const indicator = dialog.querySelector(".tab-list__indicator") as HTMLElement;
    const active = within(dialog).getByRole("tab", { name: "Détail" });

    // Le panneau glisse depuis la droite…
    await waitFor(() => expect(dialog.getAnimations().some((a) => (a as CSSTransition).transitionProperty === "transform")).toBe(true));
    // …et le soulignement est posé d'emblée à la largeur de l'onglet, sans glissement.
    await waitFor(() => expect(indicator.style.width).toBe(`${active.offsetWidth}px`));
    // (au plus un réajustement de 1-2px au chargement de la police, jamais depuis 0)
    const from = indicator.getAnimations().map((a) => (a.effect as KeyframeEffect).getKeyframes()[0][(a as CSSTransition).transitionProperty]);
    await expect(from).not.toContain("0px");

    // Changer d'onglet fait toujours glisser le soulignement jusqu'au nouvel onglet.
    const next = within(dialog).getByRole("tab", { name: "Historique" });
    await userEvent.click(next);
    await waitFor(() => expect(indicator).toHaveClass("tab-list__indicator--ready"));
    await waitFor(() => expect(indicator.style.left).toBe(`${next.offsetLeft}px`));
  },
};

// Relève, au commit du premier rendu, si le panneau démarre fermé.
const FirstCommitProbe = ({ onCommit }: { onCommit: (startsClosed: boolean) => void }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const panel = ref.current?.closest(".drawer__panel");
    onCommit(Boolean(panel) && !panel?.classList.contains("drawer__panel--open"));
  }, [onCommit]);
  return <span ref={ref} />;
};

/** Monté directement avec `isOpen` (chargement différé, changement de clé) : le panneau glisse quand même. */
export const OuvertAuMontage: Story = {
  name: "Ouvert au premier montage",
  args: { isOpen: true, onClose: fn(), title: "Objet impacté", children: null },
  render: function Render(args) {
    const [key, setKey] = useState(0);
    const [commits, setCommits] = useState<boolean[]>([]);
    const [onCommit] = useState(() => (startsClosed: boolean) => setCommits((list) => [...list, startsClosed]));
    return (
      <Drawer key={key} {...args} primaryAction={{ label: "Objet suivant", onClick: () => setKey((value) => value + 1) }}>
        <FirstCommitProbe onCommit={onCommit} />
        <p data-testid="commits">{commits.join(",")}</p>
      </Drawer>
    );
  },
  play: async () => {
    const page = within(document.body);
    await waitFor(() => expect(page.getByTestId("commits")).toHaveTextContent(/^true/));
    await waitFor(() => expect(document.querySelector(".drawer__panel")).toHaveClass("drawer__panel--open"));
    // Changement de clé : nouvelle entrée animée
    await userEvent.click(page.getByRole("button", { name: "Objet suivant" }));
    await waitFor(() => expect(page.getByTestId("commits")).toHaveTextContent(/^true/));
    await waitFor(() => expect(document.querySelector(".drawer__panel")).toHaveClass("drawer__panel--open"));
  },
};

/** Fermeture pendant l'entrée : aucun panneau orphelin. */
export const FermeturePendantEntree: Story = {
  name: "Fermeture pendant l'entrée",
  args: { isOpen: true, onClose: fn(), title: "Objet impacté", children: "Contenu" },
  render: function Render(args) {
    const [open, setOpen] = useState(args.isOpen);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Ouvrir</button>
        <Drawer {...args} isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async () => {
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector(".drawer__panel")).toBeNull(), { timeout: 1000 });
  },
};
