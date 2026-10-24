// Test de typage (vérifié par `tsc -b`, jamais exécuté ni publié) : une carte
// cliquable a toujours un bouton visible ; son clic et `onAction` sont exclusifs.
// Si une ligne @ts-expect-error devient valide, tsc échoue.

import { Card } from "./Card";

export const TypeTests = () => (
  <>
    {/* ✅ Informative, cliquable (avec son bouton), ou avec bouton d'action */}
    <Card title="Courses" value={12} />
    <Card title="Courses" value={12} onClick={() => {}} actionLabel="Voir les courses" />
    <Card title="Importer" actionLabel="Importer" onAction={() => {}} actionIcon="download-02" />

    {/* ❌ Carte cliquable sans bouton visible */}
    {/* @ts-expect-error onClick exige actionLabel */}
    <Card title="Courses" value={12} onClick={() => {}} />

    {/* ❌ Clic de carte et clic de bouton distincts */}
    {/* @ts-expect-error onClick et onAction sont exclusifs */}
    <Card title="Importer" actionLabel="Importer" onClick={() => {}} onAction={() => {}} />

    {/* ❌ Props du bouton sans son libellé */}
    {/* @ts-expect-error onAction exige actionLabel */}
    <Card title="Importer" onAction={() => {}} />
  </>
);
