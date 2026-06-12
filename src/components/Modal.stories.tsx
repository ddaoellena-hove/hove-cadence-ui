import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./Modal";
import { PrimaryButton } from "./PrimaryButton";
import { TextInput } from "./TextInput";
import { TextArea } from "./TextArea";
import { Dropdown } from "./Dropdown";
import { CounterInput } from "./CounterInput";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
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

export const Destructive: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    title: "Supprimer le scénario",
    size: "small",
    children:
      "Cette action est définitive. Le scénario et toutes ses données associées seront supprimés.",
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
  name: "Without Footer",
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
