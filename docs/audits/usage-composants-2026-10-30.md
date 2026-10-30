# Audit d'usage des composants — 30 octobre 2026

Projet 1 de la [liste du refactoring v2](../proposals/refactoring-v2.md). Lecture seule : rien n'a été modifié dans les produits.

## Résumé

- Sur **108 composants exportés, 56 sont utilisés** par au moins un produit, et 34 par les deux.
- **52 ne sont utilisés par aucun des deux produits.** Ils ne sont pas à supprimer pour autant : 13 servent à d'autres composants, 15 à des gabarits, et plusieurs sont récents.
- **Une seule fusion est clairement justifiée** : `DisruptionScopePicker` dans `ScopePicker`. Le reste des paires candidates a de bonnes raisons d'exister, ou attend une décision.
- **Le problème n'est pas l'excès de composants.** Les produits révèlent plutôt des manques : 588 styles inline de présentation dans Datapilot, et des surcharges de classes internes dans Traffic Report.

## Méthode et limites

Analyse de l'arbre syntaxique (TypeScript) de chaque fichier, hors stories et tests : imports nommés depuis `@ddaoellena/cadence-ui`, usages JSX, attributs.

| Source | État analysé |
|---|---|
| Cadence | `origin/main` à `cb11f6e` |
| Datapilot | Branche `feat/lot-6-migration`, `6f3da88`, 2 fichiers modifiés localement, 37 fichiers consommateurs |
| Traffic Report | `main`, `691a373`, 11 fichiers consommateurs |

- **Deux produits seulement** : un composant à zéro ici peut servir ailleurs. Vérifier tout autre consommateur avant une suppression.
- **Compte des props indicatif seulement** : les props passées par `{...spread}` et les `children` ne sont pas comptés. `Meter value` ressort à tort comme inutilisée. Aucune suppression de prop ne doit s'appuyer sur ce compte.
- **Rendus indirects non comptés** : un composant passé en valeur, sans JSX, compte pour ses imports uniquement.
- `Traffic Report` représente un prototype à données fictives, et un périmètre fonctionnel étroit.

## Composants les plus utilisés

Occurrences JSX par produit, et nombre de fichiers de la bibliothèque qui l'importent.

| Composant | Datapilot | Traffic Report | Interne |
|---|---|---|---|
| `PrimaryButton` | 49 | 8 | 14 |
| `GhostButton` | 19 | 36 | 27 |
| `PageSection` | 29 | 19 | 1 |
| `InlineAlert` | 26 | 10 | 3 |
| `Indicator` | 23 | 8 | 9 |
| `Dropdown` | 13 | 16 | 2 |
| `Icons` | 24 | 3 | 22 |
| `Link` | 27 | 0 | 2 |
| `Drawer` | 16 | 3 | 0 |
| `TextInput` | 10 | 7 | 3 |
| `Badge` | 12 | 3 | 5 |
| `SegmentedControl` | 12 | 3 | 3 |
| `EmptyState` | 9 | 5 | 4 |
| `DescriptionList` | 6 | 6 | 4 |

## Composants sans usage produit

| Situation | Nb | Composants | Lecture |
|---|---|---|---|
| Utilisés en interne | 13 | `AlertToast`, `Avatar`, `ChartSyncGroup`, `CopyableText`, `DataFreshness`, `DateRangePicker`, `LineChart`, `ModeIcon`, `Popover`, `Sparkline`, `StopLabel`, `Tooltip`, `TreeView` | À garder. Certains ont leur place publique (`Popover`, `DateRangePicker`, `LineChart`), d'autres moins : voir le projet 13 |
| Utilisés seulement par des gabarits | 15 | `ActivityFeed`, `BarList`, `BulletChart`, `CounterInput`, `DatasetHealth`, `DonutChart`, `ErrorSummary`, `FormField`, `Heatmap`, `Histogram`, `LineDiagram`, `RepeatableFieldGroup`, `RichTextEditor`, `Timeline`, `ValidationIssueInspector` | Catalogue et composants récents, à réévaluer après adoption |
| Aucun usage repéré | 24 | `ActionMenu`, `BoxPlot`, `CalendarHeatmap`, `ColumnManager`, `ComboChart`, `DataSourceStatus`, `DisruptionScopePicker`, `ExportMenu`, `Gauge`, `JourneyTimeline`, `LogViewer`, `PresenceStrip`, `RichCheckbox`, `RichTextContent`, `RouteStopList`, `SankeyChart`, `ScatterChart`, `SecretField`, `ServiceCalendar`, `SmallMultiples`, `TimeSpaceDiagram`, `TooltipTrigger`, `Treemap`, `ValueComparison` | À examiner un par un |

Dans ces listes, `FormField`, `RepeatableFieldGroup`, `RichTextEditor` et `RichTextContent` datent du 30 octobre : leur absence ne dit rien. Le lot 6 Datapilot a aussi livré `SecretField`, `ValueComparison`, `LogViewer` et `PresenceStrip`, encore non consommés sur la branche analysée : à confirmer avec la migration du lot 6.

## Paires candidates à la fusion

| Paire | Constat | Décision proposée |
|---|---|---|
| `ScopePicker`, `DisruptionScopePicker` | Mêmes briques (`TreeView`, `Popover`, recherche, `Badge`) ; 3 usages contre 0 | **Fusionner** dans `ScopePicker`, seul utilisé |
| `Gauge`, `Meter` | `Meter` : 6 usages ; `Gauge` : aucun | **À trancher** : déprécier `Gauge` si aucun autre produit ne l'utilise |
| `Sparkline` | Utilisée par `Card` et promue dans les guidelines | **Conserver** |
| `Tooltip`, `TooltipTrigger` | `Tooltip` est une primitive de `BaseButton` et `Stepper` ; `TooltipTrigger` l'emploie, 0 usage produit | **Conserver** `Tooltip` ; `TooltipTrigger` à réévaluer |
| `Checkbox label`, `RichCheckbox` | `RichCheckbox` : 0 ; `RichRadioButton` : 5 usages | **À trancher** : déprécier `RichCheckbox` casserait la symétrie avec `RichRadioButton` |
| `SummaryList`, `DescriptionList` | 7 et 12 usages, deux rôles distincts : liste d'éléments, propriétés d'un objet | **Conserver** les deux |
| `DataFreshness`, `DataSourceStatus` | `DataFreshness` sert à `ChartFrame`, `PageHero`, `DatasetHealth` ; `DataSourceStatus` le compose | **Conserver** ; `DataSourceStatus` relève du métier |

## Besoins révélés par les produits

**Datapilot : 994 `style={{…}}` dans 34 fichiers**, dont 588 touchent à la présentation. Sur ces 588, 362 portent une couleur de texte par token (`text-secondary`, `primary`). Pas de couleur hexadécimale dans les `.tsx`. Ce n'est donc pas du contournement de tokens, mais l'absence d'une primitive de texte, et cela contredit la règle des guidelines limitant le CSS inline au layout.

**Traffic Report : surcharges de classes internes** de `page-section` (15), `table-card` (9), `accordion` (3) et `progress-bar` (2). Trois besoins reviennent :

- `PageSection surface="card"` : `overflow: visible` forcé à trois endroits pour ne pas couper des menus ;
- en-tête de section compact : icône de 24 px, padding réduit ;
- `TableCard` responsive : réorganisation des colonnes en largeur étroite.

## Dépendance à la version

- **Datapilot** déclare `^1.0.0`, mais lit les sources de Cadence par alias Vite : la copie locale courante en développement, et le commit épinglé `355bbb3` sur Vercel (`scripts/fetch-cadence-ui.sh`). ⚠️ Développement et production n'utilisent donc pas la même version : une évolution de Cadence visible en local n'atteint la production qu'après mise à jour de ce commit.
- En mode npm, 5 composants qu'il importe manqueraient au paquet publié : `BulkActionBar`, `CategoryFilter`, `PageHero`, `ScopePicker`, `SummaryList`.
- **Traffic Report** embarque une copie de `cb11f6e` et a adopté les nouvelles API dans `691a373`. Il conserve par choix son sélecteur mobile et ses `TextArea`.
- La version publiée sur npm n'est donc consommée telle quelle par aucun des deux produits.

## Poids

| Ensemble | Lignes `.tsx` | Part | Usage produit direct |
|---|---|---|---|
| Graphiques | 4 846 | 27 % | `BarChart` (3), `Meter` (6) |
| Métier transport et données | 2 560 | 14 % | `LineBadge`, `ModeFilter` |

Mesure en lignes de source, sans les utilitaires ni le CSS. `mode-icons.tsx` pèse à lui seul 60 Ko. Le gain réel du découpage reste à mesurer sur un paquet construit.

`LineBadge` et `ModeIcon` sont utilisés par des composants du noyau (`LineBadge` : 6 fichiers, `ModeIcon` : 4) : les sortir vers un paquet métier imposerait une dépendance inverse. Ils ont leur place dans le noyau, ou demandent de revoir ces composants.

## Conclusion

Ne pas viser une réduction du catalogue. Priorités, dans l'ordre : combler les manques révélés, fusionner `ScopePicker`, puis traiter graphiques et métier par points d'entrée, selon le gain mesuré.
