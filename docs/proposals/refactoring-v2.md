# Refactoring v2 — liste des projets

Liste de suivi, à mettre à jour au fur et à mesure. Objectif : un design system plus simple à maintenir et à utiliser, sans réduire le nombre de composants pour lui-même.

Créée le 30 octobre 2026, mise à jour avec l'[audit d'usage](../audits/usage-composants-2026-10-30.md). Les décisions proposées restent à valider.

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
| 8 | Paquet métier transport | Oui | À faire | 1 |
| 9 | Paquet graphiques | Oui | À faire | 1 |
| 10 | Préparation de la v2 | Oui | À faire | 7, 8, 9 |
| 11 | Primitive de texte | Non | À faire | — |
| 12 | Densité de PageSection et TableCard | Non | À faire | — |
| 13 | Composants internes exposés | Oui | À faire | — |

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
- [ ] Trancher la hiérarchie des boutons : `GhostButton` est à 600, `PrimaryButton` à 500.

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
- [ ] **À trancher** : déprécier `RichCheckbox`, au prix de la symétrie avec `RichRadioButton`.
- [ ] **À réévaluer** : `TooltipTrigger`, sans usage produit.
- [x] **Conserver** `Sparkline`, `Tooltip`, `SummaryList`, `DescriptionList`, `DataFreshness`.

**Fini quand** : chaque point est tranché. Une fusion ne doit pas créer un composant chargé de variantes.

### 8. Paquet métier transport

Rejoint M1 du [backlog Traffic Report](traffic-report-backlog.md).

- [ ] Décider du périmètre. Candidats : `LineDiagram`, `TimeSpaceDiagram`, `RouteStopList`, `StopLabel`, `ServiceCalendar`, `JourneyTimeline`, `DatasetHealth`, `ValidationIssueInspector`, `DataSourceStatus`.
- [ ] Trancher pour `LineBadge` et `ModeIcon` : utilisés par le noyau, ils y restent, sauf à revoir ces composants.
- [ ] Définir le nom, la dépendance au noyau et le mode de publication.
- [ ] Étudier le schéma de conséquence de Traffic Report.

**Fini quand** : le paquet est publié et les produits y sont migrés.

### 9. Paquet graphiques

Les graphiques représentent 27 % des lignes `.tsx`, pour un usage direct limité à `BarChart` et `Meter`.

- [ ] Mesurer le gain réel sur un paquet construit : poids, dépendances `d3-*`, tree-shaking.
- [ ] Décider : point d'entrée dédié du paquet actuel (piste privilégiée), ou paquet séparé.

**Fini quand** : la décision est prise et, si elle est retenue, appliquée.

### 10. Préparation de la v2

- [ ] Publier d'abord les dépréciations en 1.x, avec avertissements de développement.
- [ ] Rédiger le guide de migration 1.x → 2.0 et les codemods utiles.
- [ ] Vérifier les produits consommateurs sous React 18 et 19.
- [ ] Publier sur demande explicite.

**Fini quand** : Datapilot et Traffic Report tournent sur la v2.

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

## Hors de cette liste

- Datapilot : aligner développement et production, épinglés différemment, et passer au paquet npm une fois publié.
- Avant la v2, à faire quoi qu'il arrive : tests au lecteur d'écran, `RichTextEditor` sous Firefox et Safari, prochaine publication 1.x.
- Suivi des besoins de Traffic Report : [backlog](traffic-report-backlog.md).

## Journal

| Date | Changement |
|---|---|
| 30 octobre 2026 | Création de la liste |
| 30 octobre 2026 | Audit d'usage fait ; projets 7, 8 et 9 précisés ; projets 11 à 13 ajoutés |
