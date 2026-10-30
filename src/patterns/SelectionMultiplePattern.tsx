import { useState } from "react";
import {
  PageHeader, PageSection, Drawer, Autocomplete, TableCard, GhostButton, PrimaryButton,
  EmptyState, InlineAlert, type AutocompleteOption,
} from "@ddaoellena/cadence-ui";

// Pattern — Sélection transactionnelle multiple (R1).
// Rechercher → ajouter à une sélection temporaire → modifier ou retirer →
// confirmer en une fois. La donnée initiale n'est touchée qu'à la confirmation.
// Le produit fournit l'identité de déduplication (ici `id`).
const CATALOGUE: AutocompleteOption[] = [
  { id: "l1", label: "Ligne 1", group: "Lignes" },
  { id: "l2", label: "Ligne 2", group: "Lignes" },
  { id: "s1", label: "Bastille", group: "Arrêts" },
  { id: "s2", label: "Nation", group: "Arrêts" },
];

const labelOf = (id: string) => CATALOGUE.find((option) => option.id === id)?.label ?? id;

export const SelectionMultiplePattern = ({ error = false, loading = false }: { error?: boolean; loading?: boolean } = {}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  // Copie de travail : annuler la jette sans toucher à `selected`
  const [draft, setDraft] = useState<string[]>([]);

  const start = () => {
    setDraft(selected);
    setOpen(true);
  };
  const confirm = () => {
    setSelected(draft);
    setOpen(false);
  };
  const count = draft.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
      <PageHeader title="Objets impactés" subtitle="Ajoutez plusieurs objets en une seule fois." />

      <PageSection bodyPadding="all" title="Sélection" actions={<GhostButton size="sm" iconStart="plus" label="Ajouter des objets" onClick={start} />}>
        {selected.length === 0 ? (
          <EmptyState size="inline" title="Aucun objet" description="Ajoutez une ou plusieurs lignes ou arrêts." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selected.map((id) => <TableCard key={id} title={labelOf(id)} />)}
          </div>
        )}
      </PageSection>

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Ajouter des objets"
        subtitle="Vous pouvez en sélectionner plusieurs avant de confirmer."
        primaryAction={{ label: count > 0 ? `Confirmer (${count})` : "Confirmer", onClick: confirm, disabled: count === 0 }}
        secondaryAction={{ label: "Annuler", onClick: () => setOpen(false) }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {error && <InlineAlert type="error" title="Recherche indisponible">Réessayez dans un instant ; votre sélection est conservée.</InlineAlert>}
          <Autocomplete
            label="Rechercher"
            multiple
            options={CATALOGUE}
            loading={loading}
            disabled={error}
            noResultsLabel="Aucun objet ne correspond."
            value={draft}
            onChange={(next) => setDraft(Array.isArray(next) ? next : [])}
          />
          {count === 0 ? (
            <EmptyState size="inline" title="Sélection vide" description="Les objets choisis apparaîtront ici." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {draft.map((id) => (
                <TableCard
                  key={id}
                  title={labelOf(id)}
                  actions={<GhostButton size="sm" tone="danger" icon="trash" aria-label={`Retirer ${labelOf(id)}`} onClick={() => setDraft((list) => list.filter((item) => item !== id))} />}
                />
              ))}
            </div>
          )}
        </div>
      </Drawer>

      <PrimaryButton label="Enregistrer" disabled={selected.length === 0} />
    </div>
  );
};
