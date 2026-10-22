import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Popover } from "./Popover";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { CounterInput } from "./CounterInput";
import { DescriptionList } from "./DescriptionList";
import { Link } from "./Link";
import { Modal } from "./Modal";
import { ExportMenu } from "./ExportMenu";

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
      <span style={{ fontSize: 13 }}>Hauteur des contrôles</span>
      <Popover
        title="Hauteurs de contrôle"
        renderTrigger={({ ref, toggle }) => (
          <GhostButton ref={ref} size="sm" icon="help-circle" aria-label="Aide : hauteurs de contrôle" onClick={toggle} />
        )}
      >
        <p style={{ margin: "0 0 8px" }}>
          Deux tokens fixent la hauteur des contrôles : 29 px pour le gabarit compact, 40 px pour les champs. Une rangée
          n’utilise qu’un seul gabarit.
        </p>
        <Link href="#hauteurs-de-controle">Lire les guidelines</Link>
      </Popover>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // Nom accessible conservé, sans infobulle (ni intégrée, ni title natif).
    const trigger = canvas.getByRole("button", { name: "Aide : hauteurs de contrôle" });
    await expect(trigger).not.toHaveAttribute("title");
    await userEvent.hover(trigger);
    const bubble = canvasElement.querySelector(".popover-trigger .base-button-tip__bubble");
    await expect(bubble).not.toBeNull();
    await expect(bubble).not.toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Hauteurs de contrôle" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    // Focus sur le premier élément focusable du contenu.
    await waitFor(() => expect(body.getByRole("link", { name: "Lire les guidelines" })).toHaveFocus());
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
    const [gap, setGap] = useState(16);
    const [draft, setDraft] = useState(gap);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Popover
          title="Espacement de la grille"
          onOpenChange={(open) => {
            if (open) setDraft(gap);
            args.onOpenChange?.(open);
          }}
          renderTrigger={({ ref, toggle }) => (
            <PrimaryButton ref={ref} outline size="sm" iconStart="settings-01" label="Espacement de la grille" onClick={toggle} />
          )}
        >
          {({ close }) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CounterInput label="Gap" min={4} max={48} step={4} unit="px" value={draft} onChange={setDraft} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <GhostButton size="sm" label="Annuler" onClick={close} />
                <PrimaryButton
                  size="sm"
                  label="Appliquer"
                  onClick={() => {
                    setGap(draft);
                    close();
                  }}
                />
              </div>
            </div>
          )}
        </Popover>
        <span style={{ fontSize: 13 }}>Gap appliqué : {gap} px</span>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, args }) => {
    const trigger = canvas.getByRole("button", { name: "Espacement de la grille" });
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole("dialog", { name: "Espacement de la grille" });
    await userEvent.click(body.getByRole("button", { name: "Incrémenter" }));
    await userEvent.click(body.getByRole("button", { name: "Appliquer" }));
    await expect(body.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByText("Gap appliqué : 20 px")).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/** Clic extérieur et sortie au clavier ferment le panneau. */
export const Fermeture: Story = {
  name: "Clic extérieur et tabulation",
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Popover
        title="Token d’accent"
        renderTrigger={({ ref, toggle }) => <GhostButton ref={ref} size="sm" label="Détail" onClick={toggle} />}
      >
        <DescriptionList
          density="compact"
          items={[
            { id: "token", label: "Token", value: "--cadence-color-accent" },
            { id: "usage", label: "Usage", value: "Élément actif ou sélectionné, jamais une action" },
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
    await body.findByRole("dialog", { name: "Token d’accent" });
    await userEvent.click(canvasElement);
    await expect(body.queryByRole("dialog")).toBeNull();
    // Contenu sans élément focusable : le panneau reçoit le focus.
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Token d’accent" });
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
          title="Version du Design System"
          hideTitle
          align="end"
          width={240}
          open={open}
          onOpenChange={setOpen}
          renderTrigger={({ ref, toggle }) => (
            <GhostButton ref={ref} size="sm" icon="info-circle" aria-label="Version du Design System" onClick={toggle} />
          )}
        >
          Version 0.6.0, en relecture : rien n’est publié sur npm.
        </Popover>
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Version du Design System" });
    const trigger = canvas.getByRole("button", { name: "Version du Design System" });
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
        <PrimaryButton label="Modifier le composant" onClick={() => setOpen(true)} />
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Modifier le composant">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>Variante du bouton</span>
            <Popover
              title="Variantes de bouton"
              renderTrigger={({ ref, toggle }) => (
                <GhostButton ref={ref} size="sm" icon="help-circle" aria-label="Aide : variantes de bouton" onClick={toggle} />
              )}
            >
              <p style={{ margin: 0 }}>Plein : action principale, une seule par vue. Outline : action secondaire d’un dashboard.</p>
            </Popover>
          </div>
        </Modal>
      </>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Modifier le composant" }));
    await body.findByRole("dialog", { name: "Modifier le composant" });
    const trigger = body.getByRole("button", { name: "Aide : variantes de bouton" });
    await userEvent.click(trigger);
    const popover = await body.findByRole("dialog", { name: "Variantes de bouton" });
    await waitFor(() => expect(popover).toHaveFocus());
    // Au-dessus du voile de la Modal : le centre du panneau est bien le panneau.
    const r = popover.getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    await expect(popover.contains(hit)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("dialog", { name: "Variantes de bouton" })).toBeNull();
    await expect(body.getByRole("dialog", { name: "Modifier le composant" })).toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    // Échap suivant : la Modal se ferme.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Modifier le composant" })).toBeNull());
  },
};

/**
 * Contrôlé : le parent refuse une fermeture (clic extérieur) tant que la
 * saisie n'est pas confirmée, puis ferme lui-même ; le focus revient au
 * déclencheur.
 */
export const FermetureRefusee: Story = {
  name: "Contrôlé : fermeture refusée puis fermeture par le parent",
  args: { onOpenChange: fn() },
  render: function Refusal(args) {
    const [open, setOpen] = useState(false);
    return (
      <Popover
        title="Note de version"
        open={open}
        onOpenChange={(next) => {
          args.onOpenChange?.(next);
          if (next) setOpen(true); // fermeture ignorée : il faut confirmer
        }}
        renderTrigger={({ ref, toggle }) => <GhostButton ref={ref} size="sm" label="Ajouter une note" onClick={toggle} />}
      >
        <PrimaryButton size="sm" label="Confirmer" onClick={() => setOpen(false)} />
      </Popover>
    );
  },
  play: async ({ canvas, canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Ajouter une note" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Note de version" });
    await userEvent.click(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    // Refusée : le panneau reste affiché.
    await expect(dialog).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "Confirmer" }));
    await expect(body.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * Menu en portail dans le contenu, dernier contrôle masqué : choisir une
 * option ne ferme pas le Popover ; le défilement le replace sans le fermer ;
 * Tab depuis le dernier contrôle visible ferme.
 */
export const AvecUnMenu: Story = {
  name: "Avec un menu, défilement et contrôle masqué",
  args: { onOpenChange: fn() },
  render: function WithMenu(args) {
    const [last, setLast] = useState("aucun");
    return (
      <div style={{ display: "flex", gap: 12 }}>
        <Popover
          title="Inventaire des composants"
          onOpenChange={args.onOpenChange}
          renderTrigger={({ ref, toggle }) => <GhostButton ref={ref} size="sm" label="Inventaire" onClick={toggle} />}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Dernier export : {last}</span>
            <ExportMenu counts={{ page: 25, total: 412 }} onExport={({ scope, format }) => setLast(`${scope} ${format}`)} />
            <button type="button" hidden>Réessayer</button>
          </div>
        </Popover>
        <GhostButton size="sm" label="Après" />
      </div>
    );
  },
  play: async ({ canvas, canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Inventaire" }));
    const dialog = await body.findByRole("dialog", { name: "Inventaire des composants" });
    await userEvent.click(body.getByRole("button", { name: "Exporter" }));
    await userEvent.click(body.getAllByRole("menuitem", { name: "CSV" })[0]);
    await expect(body.getByText(/^Dernier export : /)).not.toHaveTextContent("aucun");
    await expect(dialog).toBeInTheDocument();
    // Défilement de la page : replacé, pas fermé.
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    await expect(body.getByRole("dialog", { name: "Inventaire des composants" })).toBeVisible();
    // Le bouton masqué n'est pas un bord : Tab depuis « Exporter » ferme.
    body.getByRole("button", { name: "Exporter" }).focus();
    await userEvent.tab();
    await expect(body.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Après" })).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

/** État ouvert au repos (defaultOpen), pour la revue visuelle. */
export const Ouvert: Story = {
  render: () => (
    <Popover
      title="Hauteurs de contrôle"
      defaultOpen
      renderTrigger={({ ref, toggle }) => (
        <GhostButton ref={ref} size="sm" icon="help-circle" aria-label="Aide : hauteurs de contrôle" onClick={toggle} />
      )}
    >
      Deux tokens fixent la hauteur des contrôles : 29 px pour le gabarit compact, 40 px pour les champs.
    </Popover>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog", { name: "Hauteurs de contrôle" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Aide : hauteurs de contrôle" })).toHaveAttribute("aria-expanded", "true");
  },
};

/** Déclencheur en bas de la fenêtre : le panneau se retourne au-dessus. */
export const RetourneAuDessus: Story = {
  name: "Retourné au-dessus",
  decorators: [(Story) => <div style={{ height: "calc(100vh - 32px)", display: "flex", alignItems: "flex-end" }}><Story /></div>],
  render: () => (
    <Popover
      title="Statut de la release"
      defaultOpen
      renderTrigger={({ ref, toggle }) => <GhostButton ref={ref} size="sm" label="Release" onClick={toggle} />}
    >
      Release 0.6.0 en relecture : rien n’est publié sur npm.
    </Popover>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Statut de la release" });
    const trigger = canvas.getByRole("button", { name: "Release" });
    await waitFor(() => expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top));
  },
};
