import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Modal } from "./Modal";
import { Drawer } from "./Drawer";
import { PrimaryButton } from "./PrimaryButton";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { Dropdown } from "./Dropdown";
import { CounterInput } from "./CounterInput";

const meta: Meta<typeof Modal> = {
  title: "Composants/Surcouches/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: "boolean" },
    title: { control: "text" },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    hideCloseButton: { control: "boolean" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const BODY_TEXT =
  "Cette action est irréversible. Veuillez vérifier les informations avant de confirmer.";

const ControlledTemplate = (args: React.ComponentProps<typeof Modal>) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 24, minHeight: 400, background: "#f5f5f5" }}>
      <PrimaryButton label="Ouvrir la modale" onClick={() => setOpen(true)} />
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        primaryAction={
          args.primaryAction ?? {
            label: "Confirmer",
            onClick: () => setOpen(false),
          }
        }
        secondaryAction={
          args.secondaryAction ?? {
            label: "Annuler",
            onClick: () => setOpen(false),
          }
        }
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Confirmer l'action",
    size: "medium",
    hideCloseButton: false,
    children: BODY_TEXT,
  },
};

export const Small: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Supprimer l'élément",
    size: "small",
    children: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    primaryAction: {
      label: "Supprimer",
      onClick: () => {},
      destructive: true,
    },
  },
};

export const Large: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Détails du scénario",
    size: "large",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      </div>
    ),
  },
};

/** Confirmation de suppression : message centré, Annuler en outline, Supprimer en danger. */
export const Destructive: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Confirmez-vous la suppression ?",
    size: "medium",
    children: "Si vous confirmez, votre objet sera définitivement effacé.",
    primaryAction: {
      label: "Supprimer",
      onClick: () => {},
      destructive: true,
    },
    secondaryAction: {
      label: "Annuler",
      onClick: () => {},
    },
  },
  play: async () => {
    const dialog = within(document.body).getByRole("dialog", { name: "Confirmez-vous la suppression ?" });
    const scope = within(dialog);
    await expect(scope.getByRole("button", { name: "Annuler" })).toHaveClass("primary-button--outline");
    await expect(scope.getByRole("button", { name: "Supprimer" })).toHaveClass("primary-button--danger");
    await expect(dialog.querySelector(".modal__body")).toHaveClass("modal__body--message");
    // Croix : GhostButton sans infobulle, en-tête compact.
    const close = scope.getByRole("button", { name: "Fermer" });
    await expect(close).toHaveClass("ghost-button");
    const bubble = close.parentElement?.querySelector(".base-button-tip__bubble");
    await expect(bubble && getComputedStyle(bubble).display).toBe("none");
    await expect(dialog.querySelector(".modal__header")?.getBoundingClientRect().height).toBe(48);
  },
};

export const WithoutTitle: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    size: "medium",
    children: (
      <p>Contenu sans en-tête de titre — le bouton de fermeture reste visible.</p>
    ),
  },
};

export const WithoutFooter: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ padding: 24, minHeight: 400, background: "#f5f5f5" }}>
        <PrimaryButton label="Ouvrir la modale" onClick={() => setOpen(true)} />
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
  args: {
    title: "Information",
    size: "medium",
    children:
      "Cette modale n'a pas de footer — elle est fermée uniquement via le bouton × ou la touche Échap.",
  },
};

/** Modale avec formulaire scrollable — le footer reste fixe pendant que le body défile. */
export const WithForm: Story = {
  name: "With Form (Scrollable)",
  render: () => {
    const [open, setOpen] = useState(true);
    const [title, setTitle]       = useState("");
    const [type, setType]         = useState("");
    const [cause, setCause]       = useState("");
    const [description, setDesc]  = useState("");
    const [start, setStart]       = useState("");
    const [end, setEnd]           = useState("");

    const typeOptions = [
      { id: "travaux",     label: "Travaux"     },
      { id: "incident",    label: "Incident"    },
      { id: "evenement",   label: "Événement"   },
      { id: "intemperies", label: "Intempéries" },
    ];

    const causeOptions = [
      { id: "voie",     label: "Voie ferrée"          },
      { id: "materiel", label: "Matériel roulant"     },
      { id: "social",   label: "Mouvement social"     },
      { id: "accident", label: "Accident de personne" },
      { id: "colis",    label: "Colis suspect"        },
    ];

    return (
      <div style={{ padding: 24, minHeight: 600, background: "#f5f5f5" }}>
        <PrimaryButton label="Ouvrir le formulaire" onClick={() => setOpen(true)} />
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Créer une perturbation"
          size="medium"
          primaryAction={{ label: "Créer", onClick: () => setOpen(false) }}
          secondaryAction={{ label: "Annuler", onClick: () => setOpen(false) }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <TextInput
              label="Titre"
              placeholder="Ex. : Tronçon Melun – Montereau"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Dropdown
                  label="Type"
                  options={typeOptions}
                  value={type}
                  onChange={setType}
                  placeholder="Sélectionner"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Dropdown
                  label="Cause"
                  options={causeOptions}
                  value={cause}
                  onChange={setCause}
                  placeholder="Sélectionner"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <TextInput
                  label="Début"
                  placeholder="JJ/MM/AAAA"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextInput
                  label="Fin"
                  placeholder="JJ/MM/AAAA"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            <TextArea
              label="Description"
              placeholder="Décrivez la perturbation, les impacts attendus et les mesures prises…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
            />

            <CounterInput label="Nombre de lignes impactées" />

            <TextArea
              label="Mesures de substitution"
              placeholder="Bus de remplacement, itinéraires alternatifs…"
              rows={3}
            />

          </div>
        </Modal>
      </div>
    );
  },
};

/**
 * Gestion du focus (primitives de surcouche) : à l'ouverture le focus entre
 * dans le dialogue et y reste piégé (Tab boucle) ; Échap ferme et rend le
 * focus au bouton déclencheur.
 */
export const FocusManagement: Story = {
  name: "Gestion du focus",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24, minHeight: 300 }}>
        <PrimaryButton label="Ouvrir la modale" onClick={() => setOpen(true)} />
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Confirmer l'action"
          size="small"
          primaryAction={{ label: "Confirmer", onClick: () => setOpen(false) }}
          secondaryAction={{ label: "Annuler", onClick: () => setOpen(false) }}
        >
          Cette action est irréversible.
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const opener = canvas.getByRole("button", { name: "Ouvrir la modale" });

    // Ouverture : le focus entre dans le dialogue.
    await userEvent.click(opener);
    const dialog = await body.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Piège à focus : plusieurs Tab restent dans le dialogue.
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    // Échap ferme et rend le focus au déclencheur.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(opener).toHaveFocus();
  },
};

export const LongContent: Story = {
  name: "Long Content (Scrollable)",
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Conditions d'utilisation",
    size: "medium",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Section {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
    primaryAction: { label: "Accepter", onClick: () => {} },
    secondaryAction: { label: "Refuser", onClick: () => {} },
  },
};

export const DialoguesSuperposes: Story = {
  name: "Dialogues superposés",
  parameters: { a11y: { test: "error" } },
  render: () => {
    const [parent, setParent] = useState(false);
    const [child, setChild] = useState(false);
    return <>
      <PrimaryButton label="Ouvrir le dossier" onClick={() => setParent(true)} />
      <Modal isOpen={parent} onClose={() => setParent(false)} title="Dossier">
        <PrimaryButton label="Demander confirmation" onClick={() => setChild(true)} />
      </Modal>
      <Modal isOpen={child} onClose={() => setChild(false)} title="Confirmation">
        <PrimaryButton label="Fermer le dossier en arrière-plan" onClick={() => setParent(false)} />
      </Modal>
    </>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const originalOverflow = document.body.style.overflow;
    const opener = canvas.getByRole("button", { name: "Ouvrir le dossier" });
    await userEvent.click(opener);
    const parent = await body.findByRole("dialog", { name: "Dossier" });
    const confirm = within(parent).getByRole("button", { name: "Demander confirmation" });
    await userEvent.click(confirm);
    const child = await body.findByRole("dialog", { name: "Confirmation" });
    await expect(parent.getAttribute("aria-labelledby")).not.toBe(child.getAttribute("aria-labelledby"));
    for (let i = 0; i < 4; i++) {
      await userEvent.tab({ shift: i % 2 === 0 });
      await expect(child.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog", { name: "Confirmation" })).not.toBeInTheDocument();
    await expect(confirm).toHaveFocus();
    await expect(document.body.style.overflow).toBe("hidden");
    await userEvent.click(confirm);
    await userEvent.click(body.getByRole("button", { name: "Fermer le dossier en arrière-plan" }));
    await expect(body.getByRole("dialog", { name: "Confirmation" }).contains(document.activeElement)).toBe(true);
    await expect(document.body.style.overflow).toBe("hidden");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(document.body.style.overflow).toBe(originalOverflow);
    await expect(canvasElement.closest("[inert]")).toBeNull();
  },
};

export const RestaurationDuFond: Story = {
  name: "Restauration du fond et focus visible",
  parameters: { a11y: { test: "error" } },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>
      <PrimaryButton label="Ouvrir" onClick={() => setOpen(true)} />
      <Modal isOpen={open} onClose={() => setOpen(false)} hideCloseButton aria-label="Informations du service">
        <button type="button" tabIndex={-1}>Hors tabulation</button>
        <button type="button" style={{ visibility: "hidden" }}>Masqué</button>
        <fieldset disabled><button type="button">Indisponible</button></fieldset>
        <button type="button" onClick={() => setOpen(false)}>Terminer</button>
      </Modal>
    </>;
  },
  play: async ({ canvasElement }) => {
    const preserved = document.createElement("div");
    preserved.setAttribute("aria-hidden", "false");
    const hidden = document.createElement("div");
    hidden.setAttribute("aria-hidden", "true");
    hidden.setAttribute("inert", "");
    document.body.append(preserved, hidden);
    try {
      const opener = within(canvasElement).getByRole("button", { name: "Ouvrir" });
      await userEvent.click(opener);
      const dialog = await within(document.body).findByRole("dialog", { name: "Informations du service" });
      const finish = within(dialog).getByRole("button", { name: "Terminer" });
      await expect(finish).toHaveFocus();
      await userEvent.tab();
      await expect(finish).toHaveFocus();
      await expect(preserved).toHaveAttribute("inert");
      await userEvent.keyboard("{Escape}");
      await expect(opener).toHaveFocus();
      await expect(preserved).not.toHaveAttribute("inert");
      await expect(preserved).toHaveAttribute("aria-hidden", "false");
      await expect(hidden).toHaveAttribute("aria-hidden", "true");
      await expect(hidden).toHaveAttribute("inert");
    } finally {
      preserved.remove();
      hidden.remove();
    }
  },
};


export const ConfirmationDansUnDrawer: Story = {
  name: "Confirmation depuis un panneau de détail",
  parameters: { a11y: { test: "error" } },
  render: () => {
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    return <>
      <PrimaryButton label="Consulter le service" onClick={() => setOpen(true)} />
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Service nocturne">
        <PrimaryButton label="Supprimer le service" onClick={() => setConfirm(true)} />
        <Modal isOpen={confirm} onClose={() => setConfirm(false)} title="Confirmer la suppression">
          Cette action est irréversible.
        </Modal>
      </Drawer>
    </>;
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const opener = within(canvasElement).getByRole("button", { name: "Consulter le service" });
    await userEvent.click(opener);
    const drawer = await body.findByRole("dialog", { name: "Service nocturne" });
    const trigger = within(drawer).getByRole("button", { name: "Supprimer le service" });
    await userEvent.click(trigger);
    await expect(body.getByRole("dialog", { name: "Confirmer la suppression" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog", { name: "Confirmer la suppression" })).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await expect(document.body.style.overflow).toBe("hidden");
    await userEvent.keyboard("{Escape}");
    await expect(opener).toHaveFocus();
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
