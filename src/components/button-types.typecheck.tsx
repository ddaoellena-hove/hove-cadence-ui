// Test de typage (vérifié par `tsc -b`, jamais exécuté ni publié) : l'icône
// seule exige un aria-label, et libellé / icône seule sont exclusifs.
// Si une ligne @ts-expect-error devient valide, tsc échoue.

import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";

export const TypeTests = () => (
  <>
    {/* ✅ Libellé seul, ou libellé + icônes */}
    <GhostButton label="Annuler" />
    <PrimaryButton label="Ajouter" iconStart="plus" size="sm" tone="danger" />

    {/* ✅ Icône seule avec aria-label */}
    <GhostButton icon="trash" aria-label="Supprimer" />
    <PrimaryButton icon="plus" aria-label="Ajouter" />

    {/* ❌ Icône seule sans aria-label */}
    {/* @ts-expect-error aria-label obligatoire sur une icône seule */}
    <GhostButton icon="trash" />
    {/* @ts-expect-error aria-label obligatoire sur une icône seule */}
    <PrimaryButton icon="plus" />

    {/* ❌ Libellé et icône seule à la fois */}
    {/* @ts-expect-error label et icon sont exclusifs */}
    <GhostButton label="Supprimer" icon="trash" aria-label="Supprimer" />

    {/* ❌ Anciennes props refusées par GhostButton (API v2 uniquement) */}
    {/* @ts-expect-error GhostButton n'accepte pas outline */}
    <GhostButton label="Annuler" outline />
    {/* @ts-expect-error GhostButton n'accepte pas size="medium" */}
    <GhostButton label="Annuler" size="medium" />

    {/* ❌ Plus de grande taille */}
    {/* @ts-expect-error size="lg" n'existe plus */}
    <PrimaryButton label="Créer" size="lg" />

    {/* ✅ Variante contour de PrimaryButton (API v2, non dépréciée) */}
    <PrimaryButton label="Exporter" outline size="sm" iconStart="download-02" />

    {/* ❌ Anciennes props de la 0.2, supprimées en 1.0.0 */}
    {/* @ts-expect-error withIcon n'existe plus : iconStart / iconEnd / icon */}
    <PrimaryButton withIcon="left" iconStart="plus" label="Ajouter" />
    {/* @ts-expect-error destructive n'existe plus : tone="danger" */}
    <PrimaryButton label="Supprimer" destructive />
    {/* @ts-expect-error size="large" n'existe plus : "md" */}
    <PrimaryButton label="Créer" size="large" />
    {/* @ts-expect-error state n'existe plus : disabled */}
    <PrimaryButton label="Créer" state="disabled" />
  </>
);
