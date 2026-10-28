# Datapilot — lot 6 (28 octobre 2026)

Source : `datapilot-idfm/docs/demandes-ds/SESSION-DS-LOT-6.md` et les fiches associées. Périmètre : les API A, les composants DS B et les fondations C. Les migrations applicatives, la fusion de #65 et la publication ne font pas partie de cette implémentation.

## Décisions

- PageSection : trois tons de tuile, conservée sur mobile ; disponible à tous les niveaux mais recommandée en h2. Les actions passent à la ligne lorsque nécessaire.
- BarChart : `maxTicks` opt-in, espacement tenant compte de la largeur et de la longueur des libellés. Toutes les données restent navigables.
- DescriptionList : `labelWidth` partagé entre lignes, et `appearance="tiles"` pour les faits courts.
- Indicator : point avec label obligatoire ; bouton de statut via `onClick`, jamais de bouton pour un point seul.
- ScopePicker : arbre chargé par l'app, présentation inline ou popover ; sélection de feuilles ou parents regroupés, LineBadge décoratifs, recherche conservant la sélection hors filtre. L'ancien DisruptionScopePicker conserve son API.
- SummaryList : liste de synthèse dédiée aux éléments sans date obligatoire ; une action principale et une action secondaire distinctes. ActivityFeed garde son rôle chronologique.
- PageHero : bandeau sombre avec KPI intégrés, actions de tuile natives, statuts textuels et fraîcheur inverse. Aucun mouvement nécessaire au statut.
- SecretField : aucune valeur existante transmise ; saisie du nouveau secret en password, confirmation et annulation explicites. L'application assure la persistance.
- ValueComparison : valeurs avant/après avec labels explicites, présentation champs ou deux versions ; changements fournis par l'app pour les ReactNode complexes.
- PresenceStrip : valeurs ternaires (présent, absent, inconnu), repères courants et résumé ; chaque observation disponible au focus.
- LogViewer : lignes textuelles échappées par React, niveaux textuels, copie et téléchargement délégué à l'app, défilement borné.
- Drawer : largeur `intermediate` 576 px, slot d'en-tête et navigation nommée avec compteur annoncé.
- PageHeader : rangée `tabs` / `tabsActions`. Stepper : état warning.
- DataTable : `rowHeight="auto"` uniquement sans virtualisation.
- Les composants locaux (matrice d'écarts, carte de zones, réordonnancement des zones, train animé) restent hors bibliothèque.

## Livraison locale

Implémentation sur `feat/datapilot-lot6`, issue de `feat/bar-chart-datum-click` (`6bc4fb7`). Livraison par commit et push direct sur `main` demandée par l’utilisateur le 28 octobre 2026. Base synchronisée avec `origin/main` (`1af7bae`, fusion du clic BarChart via la PR #66). Les fichiers locaux préexistants sont préservés ; aucune publication npm.

Les sept nouveaux composants sont exportés : `ScopePicker`, `SummaryList`, `PageHero`, `SecretField`, `ValueComparison`, `LogViewer` et `PresenceStrip`. Les évolutions A1–A8 et B des composants existants sont intégrées, ainsi que les fondations C (typographie, couleurs et pictogrammes). `LineChart` et `Histogram` disposent du contrat de clic, de sélection contrôlée et d'indication accessible ; la sélection de plage de `LineChart` reste prioritaire.

Chaque API est décrite dans `GUIDELINES.md` et accompagnée de stories. Les recherches distantes et la persistance des secrets restent à la charge de l'application.

## Vérifications

- Suite complète Vitest : **1 009 tests réussis dans 171 fichiers**. Après la correction de l'agrégation des enfants désactivés dans TreeView : **24 tests ciblés réussis** (utilitaires, TreeView, ScopePicker, DisruptionScopePicker), dont un nouveau test unitaire.
- TypeScript (`tsc -b --noEmit`) et ESLint des fichiers touchés : aucune erreur ; quatre avertissements (noms de stories redondants et compatibilité React Compiler/TanStack Virtual).
- `build:lib`, `check:types` (node16, nodenext, bundler) et `build-storybook` réussis.
- Smoke du paquet compilé hors Vite : six contrôles réussis avec React 19.2.6.
- Stories et smoke exécutés avec Chromium 1248 installé localement, via des fichiers temporaires ignorés ; configuration versionnée inchangée.
- Contrôle visuel de neuf stories à **390 et 1 100 px** : aucun débordement horizontal ni erreur de rendu. Captures dans [assets/lot6](assets/lot6/), notamment [PageHero mobile](assets/lot6/PageHero-390.png), [ScopePicker mobile](assets/lot6/ScopePicker-390.png) et [BulletChart étroit](assets/lot6/BulletChart-390.png).
- La matrice React 18 et une session manuelle avec lecteur d'écran n'ont pas été exécutées pour ce lot. Les interactions clavier et noms accessibles sont couverts par les stories automatisées.

La migration des écrans Datapilot et la publication npm restent des étapes distinctes.
