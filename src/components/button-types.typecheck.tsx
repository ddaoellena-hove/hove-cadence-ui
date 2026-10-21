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

    {/* ✅ Compatibilité 0.3.0 : anciennes props encore acceptées par PrimaryButton */}
    <PrimaryButton label="Annuler" outline />
    <PrimaryButton withIcon="only" icon="plus" />
    <PrimaryButton withIcon="left" icon="plus" label="Ajouter" destructive size="large" />
  </>
);
