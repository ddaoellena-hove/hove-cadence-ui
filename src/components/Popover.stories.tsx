import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Popover } from "./Popover";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { CounterInput } from "./CounterInput";
import { DescriptionList } from "./DescriptionList";
import { LineBadge } from "./LineBadge";
import { Link } from "./Link";
import { Modal } from "./Modal";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ minHeight: 320, padding: 16 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Popover>;

/** Aide contextuelle riche, avec un lien : contenu focusable, contrairement à Tooltip. */
export const AideContextuelle: Story = {
  name: "Aide contextuelle",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 13 }}>Taux de ponctualité</span>
      <Popover
        title="Calcul de la ponctualité"
        renderTrigger={({ ref, toggle }) => (
          <GhostButton ref={ref} size="sm" icon="help-circle" aria-label="Aide : calcul de la ponctualité" onClick={toggle} />
        )}
      >
        <p style={{ margin: "0 0 8px" }}>
          Part des passages arrivés avec moins de 5 minutes de retard sur l’horaire théorique, hors courses supprimées.
        </p>
        <Link href="#methodologie">Lire la méthodologie</Link>
      </Popover>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Aide : calcul de la ponctualité" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Calcul de la ponctualité" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    // Focus sur le premier élément focusable du contenu.
    await waitFor(() => expect(body.getByRole("link", { name: "Lire la méthodologie" })).toHaveFocus());
    // Échap : fermeture, focus rendu au déclencheur.
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog")).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

/** Mini-formulaire : valeur en brouillon, appliquée par « Appliquer » qui ferme le panneau. */
export const MiniFormulaire: Story = {
  name: "Mini-formulaire",
  args: { onOpenChange: fn() },
  render: function MiniForm(args) {
    const [threshold, setThreshold] = useState(5);
    const [draft, setDraft] = useState(threshold);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Popover
          title="Seuil d’alerte"
          onOpenChange={(open) => {
            if (open) setDraft(threshold);
            args.onOpenChange?.(open);
          }}
          renderTrigger={({ ref, toggle }) => (
            <PrimaryButton ref={ref} outline size="sm" iconStart="settings-01" label="Seuil d’alerte" onClick={toggle} />
          )}
        >
          {({ close }) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CounterInput label="Retard" min={1} max={30} step={1} unit="min" value={draft} onChange={setDraft} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <GhostButton size="sm" label="Annuler" onClick={close} />
                <PrimaryButton
                  size="sm"
                  label="Appliquer"
                  onClick={() => {
                    setThreshold(draft);
                    close();
                  }}
                />
              </div>
            </div>
          )}
        </Popover>
        <span style={{ fontSize: 13 }}>Alerte au-delà de {threshold} min</span>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, args }) => {
    const trigger = canvas.getByRole("button", { name: "Seuil d’alerte" });
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole("dialog", { name: "Seuil d’alerte" });
    await userEvent.click(body.getByRole("button", { name: "Incrémenter" }));
    await userEvent.click(body.getByRole("button", { name: "Appliquer" }));
    await expect(body.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByText("Alerte au-delà de 6 min")).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/** Clic extérieur et sortie au clavier ferment le panneau. */
export const Fermeture: Story = {
  name: "Clic extérieur et tabulation",
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Popover
        title="Ligne 1"
        renderTrigger={({ ref, toggle }) => <GhostButton ref={ref} size="sm" label="Détail" onClick={toggle} />}
      >
        <DescriptionList
          density="compact"
          items={[
            { id: "line", label: "Ligne", value: <LineBadge code="1" mode="metro" color="#FFCD00" textColor="#000000" /> },
            { id: "status", label: "Trafic", value: "Perturbé entre Châtelet et Nation" },
          ]}
        />
      </Popover>
      <GhostButton size="sm" label="Suivant" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Détail" });
    // Clic extérieur.
    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "Ligne 1" });
    await userEvent.click(canvasElement);
    await expect(body.queryByRole("dialog")).toBeNull();
    // Contenu sans élément focusable : le panneau reçoit le focus.
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Ligne 1" });
    await waitFor(() => expect(dialog).toHaveFocus());
    // Tab vers Fermer, puis Tab après ce dernier élément : fermé, la
    // tabulation reprend après le déclencheur.
    await userEvent.tab();
    await expect(body.getByRole("button", { name: "Fermer" })).toHaveFocus();
    await userEvent.tab();
    await expect(body.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Suivant" })).toHaveFocus();
  },
};

/** Ouverture contrôlée, titre masqué, aligné sur le bord droit du déclencheur. */
export const Controle: Story = {
  name: "Contrôlé, aligné à droite",
  render: function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Popover
          title="Dernière synchronisation"
          hideTitle
          align="end"
          width={240}
          open={open}
          onOpenChange={setOpen}
          renderTrigger={({ ref, toggle }) => (
            <GhostButton ref={ref} size="sm" icon="info-circle" aria-label="Dernière synchronisation" onClick={toggle} />
          )}
        >
          Flux GTFS-RT reçu à 14:32, il y a 2 minutes.
        </Popover>
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Dernière synchronisation" });
    const trigger = canvas.getByRole("button", { name: "Dernière synchronisation" });
    // Aligné sur le bord droit du déclencheur, sans sortir de la fenêtre.
    await waitFor(() => {
      const d = dialog.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      expect(Math.abs(d.right - t.right)).toBeLessThan(2);
    });
    await userEvent.click(trigger);
    await expect(body.queryByRole("dialog")).toBeNull();
  },
};

/** Dans une Modal : Échap ferme le Popover seulement, la Modal reste ouverte. */
export const DansUneModal: Story = {
  name: "Dans une Modal",
  render: function InModal() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <PrimaryButton label="Modifier la perturbation" onClick={() => setOpen(true)} />
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Modifier la perturbation">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>Niveau de sévérité</span>
            <Popover
              title="Niveaux de sévérité"
              renderTrigger={({ ref, toggle }) => (
                <GhostButton ref={ref} size="sm" icon="help-circle" aria-label="Aide : niveaux de sévérité" onClick={toggle} />
              )}
            >
              <p style={{ margin: 0 }}>Bloquant : aucune circulation. Perturbé : retards ou fréquence réduite.</p>
            </Popover>
          </div>
        </Modal>
      </>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Modifier la perturbation" }));
    await body.findByRole("dialog", { name: "Modifier la perturbation" });
    const trigger = body.getByRole("button", { name: "Aide : niveaux de sévérité" });
    await userEvent.click(trigger);
    const popover = await body.findByRole("dialog", { name: "Niveaux de sévérité" });
    await waitFor(() => expect(popover).toHaveFocus());
    // Au-dessus du voile de la Modal : le centre du panneau est bien le panneau.
    const r = popover.getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    await expect(popover.contains(hit)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog", { name: "Niveaux de sévérité" })).toBeNull();
    await expect(body.getByRole("dialog", { name: "Modifier la perturbation" })).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    // Échap suivant : la Modal se ferme.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Modifier la perturbation" })).toBeNull());
  },
};
