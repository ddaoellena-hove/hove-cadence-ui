import { EmptyState, PageHeader, PageSection, Skeleton } from "@ddaoellena/cadence-ui";

// Pattern — États de page (P11).
// Le vocabulaire des états pleine page : chargement initial, erreur bloquante,
// accès refusé, page introuvable, aucune donnée encore créée. Chaque état
// occupe la zone de contenu sous (ou à la place de) l'en-tête.
export type PageState = "loading" | "error" | "denied" | "not-found" | "empty";

export const EtatsPattern = ({ state = "empty" }: { state?: PageState } = {}) => {
  if (state === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <PageHeader title="Perturbations" subtitle="Chargement…" />
        <PageSection bodyPadding="all" title="Perturbations en cours">
          <Skeleton variant="rect" height={48} />
          <Skeleton variant="rect" height={48} />
          <Skeleton variant="rect" height={48} />
        </PageSection>
      </div>
    );
  }
  if (state === "error") {
    return (
      <EmptyState variant="error" size="page"
        title="Impossible de charger les perturbations"
        description="Une erreur est survenue. Réessayez dans un instant."
        action={{ label: "Réessayer", onClick: () => {} }} />
    );
  }
  if (state === "denied") {
    return (
      <EmptyState variant="error" size="page"
        title="Accès refusé"
        description="Vous n'avez pas les droits pour consulter cette page. Contactez un administrateur."
        action={{ label: "Retour à l'accueil", onClick: () => {} }} />
    );
  }
  if (state === "not-found") {
    return (
      <EmptyState variant="error" size="page"
        title="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée."
        action={{ label: "Retour à l'accueil", onClick: () => {} }} />
    );
  }
  return (
    <EmptyState variant="empty" size="page"
      title="Aucun scénario créé pour ce réseau"
      description="Créez un premier scénario pour commencer à planifier."
      action={{ label: "Créer le premier scénario", onClick: () => {} }} />
  );
};
