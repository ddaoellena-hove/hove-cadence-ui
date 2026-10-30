# Refactoring v2 — liste des projets

Liste de suivi, à mettre à jour au fur et à mesure. Objectif : un design system plus simple à maintenir et à utiliser, sans réduire le nombre de composants pour lui-même.

Créée le 30 octobre 2026, mise à jour avec l'[audit d'usage](../audits/usage-composants-2026-10-30.md). Les décisions proposées restent à valider.

**Périmètre stratégique (30 octobre 2026)** : Cadence sert **trois produits actuellement** et doit pouvoir accueillir d'autres produits aux usages hétérogènes. L'audit chiffré ci-dessus ne couvre que **Datapilot et Traffic Report** : il ne constitue ni une mesure d'adoption globale ni une preuve d'inutilité des composants absents de ces deux produits.

**Principe directeur** : simplifier l'expérience des équipes consommatrices sans appauvrir la couverture fonctionnelle. Ne pas prendre le nombre de composants de Polaris App Home comme objectif chiffré : il s'agit d'une API publique destinée à une surface Shopify, non de l'inventaire complet de toutes ses interfaces internes.

**Statuts** : À faire · En cours · Fait · Abandonné. **Rupture** : Non = possible en 1.x ; Oui = réservé à la v2, après dépréciation.

## Vue d'ensemble

| N° | Projet | Rupture | Statut | Dépend de |
|---|---|---|---|---|
| 1 | Audit d'usage dans les produits | Non | Fait | — |
| 2 | Tokens de graisse | Non | À faire | — |
| 3 | Socle commun des champs | Non | À faire | — |
| 4 | Contrat de validation complet | Non | À faire | 3 |
| 5 | Placement unique des surcouches | Non | À faire | — |
| 6 | Découpage de GUIDELINES.md | Non | À faire | — |
| 7 | Fusion des doublons | Oui | À faire | 1 |
| 8 | Point d'entrée métier transport | Non, retrait de la racine en v2 | À faire | 15 |
| 9 | Point d'entrée graphiques | Non, retrait de la racine en v2 | À faire | 15 |
| 10 | Préparation de la v2 | Oui | À faire | 7, 8, 9, 15 |
| 11 | Primitive de texte | Non | À faire | — |
| 12 | Densité de PageSection et TableCard | Non | À faire | — |
| 13 | Composants internes exposés | Oui | À faire | — |
| 14 | Cartographie multi-produits et matrice de couverture | Non | À faire | 1 |
| 15 | Architecture logique Core / DataViz / Domain et catalogue | Non pour les frontières ; Oui pour les fuites | En cours | 14 |
| 16 | Catalogue de compositions et contrats de patterns | Non | À faire | 14, 15 |
| 17 | Benchmark UX et validation de la cohérence interproduits | Non | À faire | 14, 16 |
| 18 | Paquet réductible à l'usage | Non | En cours | — |

## Architecture cible proposée — à valider

**Trois couches de code et un catalogue de compositions**, dans un seul paquet npm tant qu'une mesure ne justifie pas mieux. Une frontière se décide selon les dépendances, la fréquence de réutilisation et les coûts réels de maintenance et de livraison. Le sens des dépendances est imposé par `src/components/couches.test.ts`.

| Niveau | Rôle | Contenu indicatif | Règle de dépendance |
|---|---|---|---|
| **Cadence Core** | Socle transversal stable | Foundations, tokens, typographie, champs, boutons, overlays, tableaux, primitives de layout, utilitaires de format et de palette, micro-visualisations sans d3 (`Sparkline`, `Meter`) | Ne dépend ni de la mobilité, ni des produits, ni de d3 ; API publique volontairement lisible |
| **Cadence DataViz** | Représentation et exploration des données | `BarChart`, `LineChart`, `SankeyChart` et les graphiques d3 | Peut dépendre de Core ; jamais de Domain |
| **Cadence Domain** | Langage métier réutilisable | `LineBadge`, `ModeIcon`, `LineDiagram`, `TimeSpaceDiagram`, `RouteStopList`, `ServiceCalendar`, états de qualité | Peut dépendre de Core et DataViz ; aucune dépendance inverse |
| **Catalogue de compositions** | Assemblages et modèles de parcours | `src/patterns/`, documentation, recettes : KPI overview, filtres + tableau, supervision, formulaires à étapes | N'est pas une couche d'exécution : non exporté, peut utiliser toutes les couches ; un composite n'est extrait que si la duplication est démontrée |

### Règles de classement

1. **Core** si la responsabilité est valable dans des produits de domaines différents, sans vocabulaire métier imposé.
2. **DataViz** si le contrat principal est la représentation ou l'interaction avec des données ; une visualisation spécialisée peut être légitime même si peu utilisée aujourd'hui. Une micro-visualisation sans d3, utilisée par le socle, reste dans Core.
3. **Domain** si les données, libellés ou interactions supposent un modèle de transport ou de qualité de données particulier, avec potentiel de réutilisation entre produits. Ce critère prime sur DataViz : un graphique qui parle de lignes est dans Domain.
4. **Catalogue** pour un assemblage récurrent répondant à une intention utilisateur ou à un parcours ; documenter la composition avant de créer une nouvelle abstraction.
5. **Interne** pour les détails d'implémentation qui n'ont pas besoin d'un contrat public stable. Une absence d'usage JSX direct ne suffit pas à justifier leur retrait.

### Critères de réussite multi-produits

- Un quatrième produit peut adopter Core sans dépendance métier : importer un bouton ajoute au plus 95 Ko minifiés et aucun module d3 ou TanStack, mesuré à chaque publication. Le registre d'icônes reste à traiter pour descendre sous ce seuil (projet 18).
- Les trois produits actuels sont représentés dans la matrice d'usage, avec les versions de Cadence effectivement consommées.
- Les patterns récurrents sont documentés avec leurs états, responsive, clavier et cas limites, même sans composant React dédié.
- Les composants publics offrent un contrat homogène ; les produits ne ciblent plus des classes CSS internes pour obtenir des comportements standards.
- Toute fusion ou dépréciation est justifiée par l'usage, les contrats fonctionnels et une migration testée, non par un quota de composants.
- Les décisions sur les packages s'appuient sur les imports réels, le tree-shaking, les bundles et la maintenance, pas uniquement sur les lignes de code.

## Projets

### 1. Audit d'usage dans les produits

Mesurer quels composants, props et variantes sont réellement utilisés dans Datapilot et Traffic Report.

- [x] Compter les imports et les usages par produit.
- [x] Classer les composants sans usage et les paires candidates.
- [x] Mettre à jour les projets 7, 8 et 9.
- [ ] Vérifier qu'aucun autre produit ne consomme Cadence avant toute suppression.

Résultat : [audit du 30 octobre 2026](../audits/usage-composants-2026-10-30.md). 52 composants sur 108 ne sont utilisés par aucun des deux produits, mais une seule fusion est clairement justifiée.

### 2. Tokens de graisse

Aucun token de graisse n'existe ; `font-weight` est écrit en dur dans les CSS (400, 500, 600, 700).

- [ ] Définir les tokens et leurs rôles.
- [ ] Remplacer les valeurs en dur et ajouter un garde-fou, sur le modèle de `font-tokens.test.ts`.
- [x] Hiérarchie des boutons tranchée : `GhostButton` reste à 600 pour ressortir, `PrimaryButton` à 500, distingué par son fond plein.

**Fini quand** : aucune graisse en dur ne subsiste hors de `@font-face`.

### 3. Socle commun des champs

Le bloc libellé, message et texte masqué est recopié dans `Dropdown`, `Autocomplete`, `DatePicker`, `RichTextEditor` et `FormField`.

- [ ] Extraire un module interne partagé.
- [ ] Regrouper les classes `__sr-only` et `__message`.

**Fini quand** : ces blocs n'existent plus qu'à un seul endroit, sans changement visuel.

### 4. Contrat de validation complet

- [ ] Ajouter `error` à `TextInput` et `TextArea`, en gardant `state` + `helperText`.
- [ ] Ajouter `error`, `helperText` et `required` à `DateRangePicker`, `CounterInput` et `ColorField`, si l'audit le justifie.
- [ ] Harmoniser les couleurs de message : `danger` et `danger-text` coexistent.
- [ ] Déprécier en v2 `state="error"` si `error` suffit.

**Fini quand** : tous les champs exposent le même contrat, documenté une seule fois.

### 5. Placement unique des surcouches

Deux mécaniques coexistent : `usePopoverFit` (dans le flux) et `useAnchoredPanel` (portail).

- [ ] Évaluer le passage des champs en portail : clic extérieur, ARIA, focus, surcouches imbriquées.
- [ ] Traiter le cas des conteneurs trop petits, où le retournement ne suffit pas.
- [ ] Revoir `overflow: hidden` de `PageSection surface="card"` : Traffic Report le force à `visible` à trois endroits.

**Fini quand** : une seule primitive reste, ou le maintien des deux est justifié ici.

### 6. Découpage de GUIDELINES.md

Le fichier dépasse 4 400 lignes, ce qui pèse sur la lecture humaine comme sur les agents IA.

- [ ] Garder un index et les règles transverses.
- [ ] Séparer les fiches API par domaine.
- [ ] Adapter les tests qui lisent ce fichier (`tokens-doc`, `patterns-gabarit`) et `CLAUDE.md`.

**Fini quand** : l'index suffit à trouver une fiche, et les garde-fous passent.

### 7. Fusion des doublons

Décisions proposées par l'audit :

- [ ] **Fusionner** `DisruptionScopePicker` dans `ScopePicker`.
- [ ] **À trancher** : déprécier `Gauge` au profit de `Meter`.
- [ ] **Décidé : retirer `RichCheckbox` et `RichRadioButton` en v2.** Remplacement : `RadioGroup appearance="card"` et `Checkbox appearance="card"`, avec `size`, `icon` et `iconElement`.
- [ ] Migrer les 5 usages de Datapilot, puis supprimer les composants et étendre `removed-api-usage.test.ts`.
- [x] Déprécier ces deux composants en 1.x (`@deprecated`).
- [ ] **À réévaluer** : `TooltipTrigger`, sans usage produit.
- [x] **Conserver** `Sparkline`, `Tooltip`, `SummaryList`, `DescriptionList`, `DataFreshness`.

**Fini quand** : chaque point est tranché. Une fusion ne doit pas créer un composant chargé de variantes.

### 8. Point d'entrée métier transport

Rejoint M1 du [backlog Traffic Report](traffic-report-backlog.md).

- [ ] Décider du périmètre. Candidats : `LineDiagram`, `TimeSpaceDiagram`, `RouteStopList`, `StopLabel`, `ServiceCalendar`, `JourneyTimeline`, `DatasetHealth`, `ValidationIssueInspector`, `DataSourceStatus`.
- [x] `LineBadge` et `ModeIcon` sont classés dans Domain. Leurs trois usages par Core sont des fuites à retirer (projet 15).
- [ ] Vérifier si un point d'entrée apporte encore quelque chose aux produits maintenant que la racine se réduit à l'usage (projet 18).
- [ ] Étudier le schéma de conséquence de Traffic Report.

**Fini quand** : le besoin est tranché par la mesure. Un paquet séparé n'est créé que si une entrée dédiée ne suffit pas.

### 9. Point d'entrée graphiques

Les graphiques représentent 27 % des lignes `.tsx`, pour un usage direct limité à `BarChart` et `Meter`.

- [ ] Mesurer le gain réel sur un paquet construit : poids, dépendances `d3-*`, tree-shaking.
- [x] Gain mesuré à la racine : voir le projet 18. Un `BarChart` seul coûte 134 Ko minifiés.
- [ ] Décider si une entrée dédiée reste utile ; le CSS est le principal argument restant.

**Fini quand** : la décision est prise et, si elle est retenue, appliquée.

### 10. Préparation de la v2

- [ ] Publier d'abord les dépréciations en 1.x, avec avertissements de développement.
- [ ] Rédiger le guide de migration 1.x → 2.0 et les codemods utiles.
- [ ] Vérifier les produits consommateurs sous React 18 et 19.
- [ ] Publier sur demande explicite.

**Fini quand** : les trois produits actuellement consommateurs ont une stratégie de migration validée et leurs parcours critiques sont vérifiés sur la v2 ; les produits migrés utilisent effectivement la version publiée prévue.

### 11. Primitive de texte

Datapilot compte 588 styles inline de présentation, dont 362 couleurs de texte par token.

- [ ] Concevoir une primitive de texte (rôle, taille, couleur), avec le projet 2.
- [ ] Décider si une primitive d'empilement est utile aussi.
- [ ] Migrer Datapilot par lots.

**Fini quand** : les styles inline de Datapilot se limitent au layout.

### 12. Densité de PageSection et TableCard

Traffic Report surcharge `page-section` (15 fois) et `table-card` (9 fois).

- [ ] Proposer un en-tête de section compact (icône 24 px, padding réduit).
- [ ] Proposer un `TableCard` responsive, ou documenter la composition.
- [ ] Retirer ces surcharges de Traffic Report.

**Fini quand** : Traffic Report ne cible plus ces classes internes.

### 13. Composants internes exposés

Plusieurs exports ne servent aujourd'hui qu'à d'autres composants de la bibliothèque (`ChartSyncGroup`, `AlertToast`, `Tooltip`…) : certains restent légitimes en public.

- [ ] Décider lesquels restent publics.
- [ ] Déprécier les autres en 1.x, puis les retirer en v2.

**Fini quand** : l'API publique ne contient que des composants destinés aux produits.

### 14. Cartographie multi-produits et matrice de couverture

L'audit existant porte sur deux produits, alors que Cadence en couvre trois. Compléter l'inventaire avant toute suppression.

- [ ] Identifier le troisième produit, son dépôt, ses parcours et la version ou copie de Cadence utilisée ; inventorier les autres consommateurs éventuels.
- [ ] Mesurer imports directs, usages indirects, patterns, composants spécifiques, overrides CSS et contrats manquants par produit.
- [ ] Pour chacun des 108 exports, classer : **Core / DataViz / Domain / Pattern / Interne**, puis **conserver / fusion proposée / internaliser proposé / déprécier proposé / à instruire**.
- [ ] Distinguer absence d'usage, usage indirect, besoin prévu et investissement exploratoire ; indiquer le niveau de confiance et les preuves.
- [ ] Vérifier les parcours critiques des trois produits et leur couverture en états, responsive et accessibilité.

**Fini quand** : les trois produits sont analysés et toute proposition de retrait indique les consommateurs, les impacts et une alternative vérifiée.

### 15. Architecture logique Core / DataViz / Domain et catalogue

Appliquer les frontières proposées ci-dessus sans imposer prématurément une séparation physique des packages.

- [x] Dépendances relevées et sens imposé par `couches.test.ts`. Trois fuites connues restent : `ColorField → LineBadge`, `ScopePicker → LineBadge`, `TreeView → ModeIcon`.
- [ ] Retirer ces fuites par des emplacements génériques en 1.x, puis supprimer `TreeNode.mode` et `ScopeNode.badge` en v2. `ColorField` peut aussi rejoindre Domain : sa raison d'être est la couleur de ligne.
- [ ] Définir les critères d'une API publique stable, d'un module interne et d'une composition documentée.
- [ ] Comparer points d'entrée dédiés et option multi-packages sur les bundles réels des produits, après le projet 18.
- [ ] Publier une proposition d'arborescence cible, de dépendances autorisées et de stratégie de migration progressive.
- [ ] Faire valider les frontières avant tout déplacement ou changement cassant.

**Fini quand** : chaque famille a une responsabilité, une politique d'export et une stratégie de migration explicites ; aucun découpage physique n'est décidé sans mesure.

### 16. Catalogue de compositions et contrats de patterns

Les quinze **Page patterns** de Storybook constituent le point de départ ; les auditer et les enrichir avant d'en inventer d'autres.

- [ ] Cartographier les patterns existants aux besoins des trois produits et identifier leurs variantes réelles.
- [ ] Documenter en priorité : **KPI Overview**, **Data Explorer** (recherche, filtres, tableau), **Status Overview**, **Multi-step Form** et **Route Comparison**, seulement si leur récurrence est démontrée.
- [ ] Décrire pour chacun : intention, composants assemblés, structure, données attendues, interactions, états vide/chargement/erreur, responsive, accessibilité, limites et anti-patterns.
- [ ] Distinguer une **recette Storybook** d'un **composant composite exporté** ; extraire une API seulement si cela réduit effectivement la duplication sans figer un parcours métier.

**Fini quand** : une équipe peut reconstruire les parcours transversaux à partir des patterns documentés, sans CSS de contournement ni nouvelle abstraction par écran.

### 17. Benchmark UX et validation de la cohérence interproduits

Comparer la qualité de l'expérience et des contrats, pas le seul nombre de composants.

- [ ] Sélectionner des interfaces représentatives des trois produits et leurs équivalents documentés dans **Shopify Polaris**, **IBM Carbon** et **Atlassian Design System** ; noter les différences de périmètre.
- [ ] Évaluer six dimensions sur des preuves explicites : **couverture**, **réutilisabilité**, **composition**, **comportements**, **qualité technique** et **adoption**.
- [ ] Examiner notamment densité, hiérarchie, navigation, états, erreurs, affichages de données complexes et cohérence visuelle entre produits.
- [ ] Tester desktop/mobile, clavier et lecteur d'écran sur un échantillon de parcours critiques ; distinguer tests automatisés et validation humaine.
- [ ] Constituer un backlog priorisé avec captures ou stories, impacts, hypothèses, coût et critères d'acceptation.

**Fini quand** : les écarts observés sont traçables à une interface et à un comportement, avec une priorité et une correction proposée ; aucun score esthétique global non étayé.

### 18. Paquet réductible à l'usage

Le fichier ESM unique empêchait les produits de n'embarquer que ce qu'ils importent. C'est le gain le plus fort du refactoring, et il ne casse aucune API.

Mesures esbuild, sans React, minifié / gzip :

| Import | Avant | Après |
|---|---|---|
| `PrimaryButton` seul | 260 / 85 Ko | 89 / 24 Ko |
| 5 composants de formulaire | 264 / 86 Ko | 117 / 33 Ko |
| `DataTable` | 299 / 98 Ko | 163 / 47 Ko |
| `BarChart` | — | 134 / 41 Ko |
| Tout le paquet | 614 / 203 Ko | 629 / 209 Ko |

- [x] Sortie ESM en un fichier par module et `sideEffects` déclaré. CommonJS reste en un seul fichier.
- [ ] Publier, puis mesurer sur les bundles réels de Datapilot et Traffic Report.
- [ ] Ajouter un contrôle de poids en CI, avec le seuil des critères de réussite.
- [ ] Réduire le registre d'icônes : `icon="…"` charge les 118 icônes dès le premier bouton (environ 85 Ko minifiés, dont 25 Ko d'icônes mobilité). Une prop acceptant un composant d'icône permettrait de déprécier le registre en v2.
- [ ] Rendre `style.css` (229 Ko) réductible : feuilles par couche, ou CSS importé par composant.

**Fini quand** : un produit ne paie que ce qu'il importe, en JS comme en CSS, et la CI le vérifie.

## Hors de cette liste

- `RadioButton` : l'état `disabled` affiche un point qui se lit comme « sélectionné » ; prévoir un état `disabled-selected`, comme `Checkbox` (1.2).
- Datapilot : aligner développement et production, épinglés différemment, et passer au paquet npm une fois publié.
- Avant la v2, à faire quoi qu'il arrive : tests au lecteur d'écran, `RichTextEditor` sous Firefox et Safari, prochaine publication 1.x.
- Suivi des besoins de Traffic Report : [backlog](traffic-report-backlog.md).

## Journal

| Date | Changement |
|---|---|
| 30 octobre 2026 | Création de la liste |
| 30 octobre 2026 | Audit d'usage fait ; projets 7, 8 et 9 précisés ; projets 11 à 13 ajoutés |
| 30 octobre 2026 | Décision : retrait de `RichCheckbox` et `RichRadioButton` en v2 ; `RadioButton label` ajouté |
| 30 octobre 2026 | `appearance="card"` et `RadioGroup` livrés, cartes de choix dépréciées |
| 30 octobre 2026 | Proposition ajoutée : architecture logique à quatre couches, périmètre de trois produits et projets 14 à 17. Aucune séparation de paquet ni dépréciation supplémentaire validée par cet ajout. |
| 30 octobre 2026 | Architecture revue sur mesures : trois couches de code et un catalogue, dépendances réordonnées, projets 8 et 9 en points d'entrée, projet 18 ajouté, sortie ESM par module et `couches.test.ts` livrés |
