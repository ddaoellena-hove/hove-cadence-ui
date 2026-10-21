// Test de typage (vérifié par `tsc -b`, jamais exécuté ni publié) : clic sur
// toute la carte et bouton d'action sont exclusifs.
// Si une ligne @ts-expect-error devient valide, tsc échoue.

import { Card } from "./Card";

export const TypeTests = () => (
  <>
    {/* ✅ Informative, cliquable, ou avec bouton d'action */}
    <Card title="Courses" value={12} />
    <Card title="Courses" value={12} onClick={() => {}} />
    <Card title="Importer" actionLabel="Importer" onAction={() => {}} actionIcon="download-02" />

    {/* ❌ Clic sur toute la carte et bouton d'action à la fois */}
    {/* @ts-expect-error onClick et actionLabel sont exclusifs */}
    <Card title="Importer" actionLabel="Importer" onClick={() => {}} />

    {/* ❌ Props du bouton sans son libellé */}
    {/* @ts-expect-error onAction exige actionLabel */}
    <Card title="Importer" onAction={() => {}} />
  </>
);
