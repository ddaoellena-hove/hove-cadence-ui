# Audit responsive — Page patterns (0.8.0)

Contrôle du **défilement horizontal non voulu** aux trois largeurs de référence
(1440 / 1280 / 1024 px) et du maintien des **rangées compactes sur une ligne**.

Méthode : chaque pattern est rendu dans sa coque (`AppLayout` + `Sidebar`), la
fenêtre est émulée à chaque largeur et on mesure
`document.documentElement.scrollWidth` vs `clientWidth`. Mesure exécutée à
1024 px (la plus contraignante) ; 1280 et 1440 sont plus larges et fluides par
construction (`CardGrid` en `auto-fill`, `FieldRow` qui se replie, `DataTable`
au défilement interne).

Captures de référence : [`liste-1024.jpg`](liste-1024.jpg) (Liste / index),
[`analyse-1024.jpg`](analyse-1024.jpg) (Analyse).

| Pattern | 1024 px | Observation |
|---|---|---|
| Coque d'application | ✅ | Sidebar repliable ; le `main` défile seul. |
| Liste / index | ✅ | Barre de sélection et filtres sur une ligne ; le `DataTable` défile en interne, pas la page. |
| Liste + détail latéral | ✅ | Le `Drawer` se superpose, pas de débordement. |
| Page de détail | ✅ | Les actions d'en-tête passent sous le titre si besoin. |
| Formulaire | ✅ | `FieldRow` à 2 colonnes à 1024 px ; `max-width: 720px`. |
| Assistant / import | ✅ | `Stepper` et pied `FormActions` sur une ligne. |
| Supervision | ✅ | `CardGrid` fluide ; `DataFreshness` et alerte sur une ligne. |
| Analyse | ✅ | `CardGrid` et grille de graphiques fluides ; axes suivent le conteneur. |
| Planification / temps | ✅ | La `Timeline` défile en interne ; libellés de ligne fixes. |
| Paramètres | ✅ | Contrôle à droite de son libellé, une colonne. |
| États de page | ✅ | `EmptyState size="page"` centré, padding 48px. |

**Résultat** : aucun défilement horizontal de page sur les 11 patterns à 1024 px
(`scrollWidth === clientWidth === 1024`). Les composants à défilement propre
(`DataTable`, `Timeline`) défilent dans leur cadre, jamais la page.
