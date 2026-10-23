# Relais de développement — 22 octobre 2026

## Démarrage pour un nouvel agent

1. Lire `CLAUDE.md`, puis `GUIDELINES.md` à la racine : conventions, API et règles visuelles.
2. Lire ce document et vérifier `git status --short` et `git branch --show-current` : l’état ci-dessous est une photographie datée.
3. Consulter les rapports liés avant de refaire un audit ou d’ajouter un composant. Le code et les stories actuels précisent le comportement réel ; les propositions historiques ne remplacent pas les guidelines.

## Objectif et état de livraison

L’utilisateur prépare le design system React `@ddaoellena/cadence-ui` pour la 1.0. Il a demandé l’analyse de l’existant, des composants jugés nécessaires, puis un nouvel audit et des améliorations. Ces lots ont été réalisés localement. Aucune tâche d’implémentation explicitement demandée n’est laissée en cours ; les étapes proposées plus bas sont des recommandations.

- Branche utilisée : `feat/additional-components` ; version du manifeste : `0.5.0`.
- Le travail contient de nombreuses modifications non commitées et des fichiers non suivis, dont les nouveaux composants et rapports. Un clone du dépôt distant seul ne récupère pas ce travail : transmettre le dossier de travail complet ou préparer un commit relu.
- Aucun commit, push, changement de version ou publication npm n’a été effectué pendant ces lots.
- Les fichiers `.claude/settings.local.json`, `.claude/launch.json`, `.mcp.json`, `story-ui-considerations.md` et `story-ui-docs/` étaient déjà présents/modifiés ; leur contenu ne fait pas partie de nos corrections. Ne pas les écraser ni les inclure aveuglément dans un commit.
- Storybook est la vitrine du projet, habituellement sur le port 6006 ; vérifier le serveur existant avant d’en lancer un autre. `App.tsx` reste le squelette Vite.

## Travail effectué et points d’entrée

| Lot | Contenu | Documentation |
|---|---|---|
| Composants additionnels et premier audit | ProgressBar, InlineAlert, LineBadge, StopLabel, Accordion, Stepper, FileUpload, ExportMenu, ColumnManager, Gauge ; corrections de menus, colonnes, validation de fichiers, contraste et clavier | [Rapport initial](audits/additional-components-2026-10-22.md) |
| Compléments avant 1.0 | ErrorSummary, DescriptionList, ActivityFeed, TimePicker ; exports, CSS, stories, API et recettes métier | [Périmètre et captures](proposals/pre-1.0-complements.md) |
| Audit des interactions | Pile Modal/Drawer, Échap, focus, scroll, restauration du fond, nom accessible de Modal et cibles ErrorSummary | [Rapport complémentaire](audits/interactions-2026-10-22.md) |

Fichiers centraux :

- `src/components/index.ts` : API publique ; `GUIDELINES.md` : API documentée ; `CHANGELOG.md` : changements regroupés sous 0.5.0 non publiée.
- `src/components/overlay-primitives.ts` : gestion partagée des surcouches ; `Modal.stories.tsx` : tests de superposition et de confirmation dans un Drawer.
- `src/components/menu-core.tsx` : comportement partagé d’ActionMenu et ExportMenu.
- `src/stories/ListeDePerturbations.stories.tsx` : supervision, colonnes, téléchargement CSV local.
- `src/stories/ParcoursTransport.stories.tsx` : détail et import réseau avec reprise après erreur.
- `src/stories/PlanificationService.stories.tsx` : horaires nocturnes, validation, synthèse et historique.

## Décisions à préserver

- Réutiliser les composants et tokens ; ne pas créer un autre multi-select : `Autocomplete multiple` existe.
- TimePicker conserve une chaîne d’heure de service, sans Date ni conversion de fuseau. Mode ordinaire jusqu’à 23:59, mode nocturne jusqu’à 47:59. Seule une valeur validée remonte par onChange ; vérifier la validité native dans un formulaire noValidate.
- ErrorSummary centralise les erreurs fournies par l’application, sans les calculer. Ses cibles peuvent être un id ou une ref.
- ActivityFeed affiche des événements ponctuels, dans l’ordre fourni ; fuseau UTC par défaut, fuseau métier explicite conseillé. Ce n’est pas un journal d’audit serveur ni une frise de périodes.
- Timeline reste reportée faute de périmètre d’interaction défini.
- Les recettes utilisent des données locales ; l’import simule sa progression, sans transfert réseau ni validation GTFS complète.
- Un contrôle enfant peut consommer Échap avant Modal/Drawer ; seule la surcouche au premier plan traite ensuite le clavier.

## Validation connue

Dernier audit : suite globale **653 tests réussis dans 91 fichiers**, puis ajout d’un scénario Modal dans Drawer validé avec les **12 stories Modal**. Cela couvre 654 tests distincts ; ne pas présenter ce résultat comme une exécution globale unique de 654 tests.

TypeScript, lint ciblé, builds bibliothèque et Storybook réussis. `git diff --check` propre. Les nouvelles stories du dernier audit ont l’accessibilité automatisée bloquante. Les anciennes stories ne bénéficient pas toutes de cette exigence.

Au lot précédent : inspection visuelle bureau/mobile, absence de débordement sur les vues vérifiées, imports ESM/CommonJS et déclarations des quatre composants contrôlés, `npm pack --dry-run` inspecté. Les captures sont dans `docs/proposals/assets/pre-1.0/`. Ces vérifications ne valent pas un test de chaque composant sur chaque navigateur.

Commandes reproductibles depuis la racine :

```sh
npm test
npx tsc -b --noEmit
npx eslint <fichiers-modifiés>
npm run build:lib
npm run build-storybook
git diff --check
```

`<fichiers-modifiés>` est à remplacer par les chemins concernés. Utiliser npm ; une installation requiert `--legacy-peer-deps`. Les tests Storybook utilisent Chromium Playwright. Ne pas lancer `npm run build` pour préparer la bibliothèque : ce build de l’application écrase `dist/`. Le lint global est bruité par des fichiers générés et des avertissements historiques.

## Prochaines étapes conseillées avant 1.0

1. Vérifier le paquet dans des applications consommatrices séparées sous React 18 et React 19, avec imports ESM/CommonJS, styles et typage.
2. Étendre les tests d’intégration aux menus en portail dans des dialogues ; tester manuellement les parcours au lecteur d’écran et sur les navigateurs cibles.
3. Nettoyer les avertissements React des exemples : la suite globale émet encore deux messages de champs contrôlés sans onChange ; les fichiers responsables restent à identifier. Les avertissements de dépréciation sont également encore présents.
4. Préparer la migration des API dépréciées documentées au changelog, relire le diff et constituer des commits cohérents en préservant les fichiers de configuration locaux.
5. Décider explicitement de la version et de la publication avec l’utilisateur. Rien dans le travail réalisé ne constitue une autorisation de publier sur npm.

Ce relais complète les rapports ; il ne certifie pas un audit exhaustif de sécurité, d’accessibilité ou de compatibilité React 18.

## Mise à jour — unification du SegmentedControl

Demande utilisateur suivante réalisée : conserver uniquement l’apparence Alt, sous le nom public `SegmentedControl`. Les fichiers et exports `SegmentedControlAlt` sont supprimés ; migrer les imports/types vers `SegmentedControl`. Props conservées. DatePicker réutilise désormais le composant unique. Pour les parcours à plusieurs niveaux : `SegmentedControl` puis `SecondaryTab` dans `TabList level="secondary"`. La story `SecondaryTab/TwoLevels` illustre cette règle. Les propositions historiques peuvent encore citer les deux anciennes variantes ; les guidelines actuelles priment.

Validation après cette unification : **648 tests réussis dans 90 fichiers** sur une exécution globale (le catalogue perd les stories du composant supprimé), 23 tests ciblés réussis, TypeScript et lint ciblé réussis, builds bibliothèque/Storybook réussis. Exports ESM/CommonJS vérifiés : SegmentedControl présent, Alt absent. Inspection visuelle de la story à deux niveaux effectuée. Ces résultats remplacent les comptes précédents pour l’état courant.

## Mise à jour — premier lot métier transport

À la suite des propositions métier, le premier lot est implémenté : `ServiceCalendar`, `RouteStopList` exportés, et recette `OffreEtQualite.stories.tsx` contenant le rapport qualité. Voir [le périmètre, les limites et les captures](proposals/transport-business.md) et les fiches API ajoutées à `GUIDELINES.md`.

Dernière suite globale : **663 tests réussis dans 94 fichiers** ; 15 tests ciblés couvrent le nouveau lot. Le rapport qualité ne valide aucun fichier et les données restent locales. Les trois autres propositions (DisruptionScopePicker, ScheduleComparison, DataFreshness) restent pour un lot ultérieur. La version reste 0.5.0, sans publication. Les nouveaux fichiers et les captures sont aussi à transmettre dans le dossier local ou à inclure dans un commit relu.

## Mise à jour — refonte du TimePicker

Présentation remplacée à la demande de l’utilisateur : module interne `TimeFields` partagé avec DatePicker, deux cases Heures/Minutes éditables pour TimePicker, flèches verticales et collage HH:mm. Nouvelle variante bouton avec brouillon, validation/annulation, focus et validité native. Ref/id maintenant sur les heures ; recette de planification et sélecteurs des tests adaptés. Voir [le document de refonte](proposals/time-picker-redesign.md), ses captures et la fiche API dans GUIDELINES.md. Les anciennes captures de planification dans les premiers rapports sont historiques.

Validation après refonte horaire : **667 tests réussis dans 94 fichiers**, TypeScript, lint ciblé et les deux builds réussis. Ces résultats remplacent les comptes précédents pour l’état courant.


## Mise à jour — TimePicker dans un champ avec panneau

Correction de présentation demandée après la refonte : la variante champ est désormais un déclencheur compact (heure + horloge), ouvrant le panneau comme DatePicker. Les deux variantes ont maintenant une validation explicite ; aucune flèche ne publie avant Valider/Entrée. Les tests ouvrent le champ avant de saisir, et ErrorSummary cible le conteneur du champ dans la recette de planification. Voir la fiche TimePicker actuelle et l’ajout au document de refonte. Les descriptions plus anciennes de l’éditeur directement visible dans la page sont obsolètes.

Validation du dernier ajustement : **667 tests réussis dans 94 fichiers**, TypeScript, lint ciblé et les deux builds réussis. Captures du champ fermé/ouvert dans `docs/proposals/assets/time-picker/field-closed.png` et `field-open.png`.


## Mise à jour — focus des stories TimePicker

Le changement de champ actif en consultation provenait des fonctions play qui exécutaient automatiquement clics et saisies dans le Canvas. Dans `TimePicker.stories.tsx`, le helper `testOnly` conserve ces fonctions uniquement lorsque `import.meta.env.MODE === "test"`. Les démonstrations restent au repos dans Storybook ; Vitest continue d’exécuter les 12 stories avec leurs scénarios et contrôles d’accessibilité. Aucun changement au composant TimePicker pour cette correction.

Vérification navigateur : aucun déplacement de focus au chargement de la story, saisie manuelle des minutes conservée après attente, validation de 09:45. Pour exécuter les scénarios automatisés : `npx vitest run --project storybook src/components/TimePicker.stories.tsx`.

## Mise à jour — hygiène de release, token AA et dette a11y

Lot d'amélioration (branche `release/0.6.0`, commits locaux, aucun push) :

- **Hygiène de release** : le travail de session (refonte du champ TimePicker en saisie en ligne + horloge, `TimeFields` layout `inline`, `StopLabel` id en `Badge`, élagage des stories TimePicker, fiche GUIDELINES) est désormais découpé en commits cohérents par sujet. Fichiers de config locaux préservés hors index.
- **Token de texte secondaire AA** : `--cadence-color-text-secondary: #64757a` (4,8:1 sur blanc) ajouté dans `tokens.css`. Petits textes migrés depuis `--cadence-color-text-muted` (3,2:1, sous AA) dans `autocomplete.css` (description/empty) et `drawer.css` (sous-titre). `text-muted` reste réservé aux **icônes** et au **grand texte/gras** (3:1 suffit).

### Accessibilité — chantier en cours (vers `a11y: 'error'` global)

Activer `.storybook/preview.ts` `a11y.test = 'error'` révélait au départ **≈166 color-contrast + ≈39 aria-toggle-field-name** sur 13 fichiers de stories. **Déjà corrigé** (commits de ce lot, suite verte) :

- Token AA `--cadence-color-text-secondary` (#64757a) ; petits textes migrés dans `autocomplete.css`, `drawer.css` ; démos inline migrées dans les stories TableCard, TableHeader, Badge, Icons, Drawer. → **color-contrast 166 → 39**.
- `Toggle` et `RadioButton` acceptent désormais `aria-label` (role switch/radio nommables) ; stories Checkbox/Toggle/RadioButton nommées + `a11y: test:error` **activé par fichier** sur ces trois. → **aria-toggle-field-name 39 → 12**.

**Reste** (≈28 stories, global toujours sur `'todo'`) :
- **color-contrast (≈39)** : sources dispersées — placeholder `#737373` sur fond gris, `#bfc9cb` (border-strong) en texte, un hex proche `#809498`, icônes désactivées `#c0c9cb/#c5cfd3`, et quelques couleurs non-tokens (`#2e7d32`, `#1565c0`) dans une story à repérer.
- **aria-toggle-field-name (≈12)** : `RichCheckbox`, `RichRadioButton`, et les cases de `TableCard` dans les stories.
- **divers (4)** : `aria-required-parent` (radios), `scrollable-region-focusable`, `landmark-unique`, `empty-table-header`.
- Méthode : corriger par lots, activer `test:error` par fichier au fur et à mesure, puis basculer le global une fois à zéro.
2. **Deux `console.error` « value prop sans onChange »** persistent dans la suite (champ contrôlé en lecture seule). Non localisés (l'agent précédent non plus) ; bénins (dev uniquement), n'échouent aucun test. La story `Autocomplete/Disabled` a été écartée comme cause (champ désactivé = read-only, pas de warning).
3. **API dépréciées encore appelées dans les démos** (~35 occurrences : `PrimaryButton` `destructive`/`size="medium|large"`/`withIcon`, `Link variant="secondary"`, `SecondaryButton`, `DataVisualization`). Migrer les **sites d'appel** (stories/recettes) avant le retrait prévu en 1.0 ; **garder les shims** dans les composants jusque-là.

Validation de ce lot : suite storybook **73 fichiers / 420 tests verts**, `tsc -b`, `build:lib` et `git diff --check` propres. Aucune publication.

## Mise à jour — lot 0.6.0, relecture et harmonisation

Branches locales, rien poussé ni publié : `release/0.6.0` (lot 0.6.0, relecture, tokens de hauteur, ColumnManager glisser-déposer, InlineAlert outline, infobulles retirées), puis `feat/harmonisation` qui en part.

**Fait sur `feat/harmonisation`** (la dette du lot précédent est résorbée) :

- **Tokens partout** : rayons (`--cadence-radius-*`, nouveaux `2xl` et `pill`) et couleurs de tous les CSS de composants via tokens ; nouveaux tokens de focus de champ, voile, fond sombre (Sidebar), surfaces sélectionnées. Test `css-tokens.test.ts` (aucune couleur en dur dans une propriété de couleur, aucun rayon > 5px en dur). Exceptions assumées : ombres décoratives (`box-shadow` internes) et micro-rayons.
- **A11y** : `.storybook/preview.ts` en `a11y.test: 'error'` pour toute la suite ; les 26 stories en échec sont corrigées dans les composants (TableCard, TableHeader, contrastes, Modal, Sidebar). Les `a11y: { test: "error" }` par fichier sont désormais redondants (inoffensifs).
- **Avertissements** : les deux `console.error` « value sans onChange » venaient des stories `TextArea` (corrigé). Les avertissements de dépréciation restants proviennent uniquement des stories qui démontrent volontairement les shims (`PrimaryButton` compat, `SecondaryButton`, `DataVisualization`, `Link` secondary) : rien à migrer dans les démos. `storybook-package/` est une copie historique non maintenue.
- **Composition** : filtres rapides de `FilterBar` en `variant="button"` dans les recettes (un gabarit par rangée).
- **Factorisation** : `useAnchoredPanel` / `placeAnchored` (overlay-primitives) partagés par Popover, menus et ColumnManager ; les menus ne se ferment plus au défilement.

Validation : 718 tests (103 fichiers) sous React 19 et React 18 (`npm run test:react18`), lint sans erreur, `tsc -b`, `build:lib`, `smoke:dist`, `build-storybook`.

**Reste ouvert** : propositions reportées (TreeView, DisruptionScopePicker, ScheduleComparison, DataFreshness) ; tests manuels lecteur d'écran et navigateurs cibles ; décision de version et de publication avec l'utilisateur.

## Mise à jour — lot 0.7.0 (cohérence + composants métier)

Branche `release/0.7.0`, version `0.7.0` non publiée. Commits atomiques, rien poussé.

**Fait**

- *Lot A (cohérence/dette)* : A1 règle des boutons `md` à côté d'un champ (exception documentée) ; A2 commentaires `tokens.css` (focus appliqué, z-index réels) + JSDoc `CopyableText` sans infobulle ; A3 nom de token `--cadence-color-field-focus-subtle` dans le CHANGELOG ; A4 tokens `text-secondary`/`skeleton` ajoutés au tableau + **test `tokens-doc`** (tokens.css ↔ GUIDELINES) ; A5 doc `StopLabel` alignée (id en `Badge`, pas de `title`) ; A6 exemples MDX passés aux tokens + **test `mdx-tokens`** ; A7 colonne d'actions `DataTable` (ombre de séparation + story 800px).
- *Lot B* : **`ColorField`** (couleur GTFS, hex validé, aperçu `LineBadge`, contraste) et **`Timeline`** (plages sur axe temps, clavier, tooltip, « Voir les données », états) livrés avec stories, tests, exports et GUIDELINES. **B4 `Tag`** : non créé (doublon) — `Badge dismissible` / `FilterBar activeFilters` documentés.

**Reporté (validé par l'utilisateur)** : **`TreeView`** (le plus lourd — depuis livré, voir plus bas) ; propositions B5 **`DisruptionScopePicker`** (assemblage `Autocomplete multiple` + `TreeView`), **`ScheduleComparison`** (`DataTable` + `BarChart`/`Timeline`, plutôt une recette), **`DataFreshness`** (`Indicator` + temps relatif) — toutes jugées couvrables par assemblage.

## Mise à jour — Timeline horaires et itinéraires

Branche `feat/timeline-itineraires` (depuis `docs/prompt-timeline` ← `feat/modal-design`), rien poussé. Cadrage : `docs/prompts/prompt-timeline-itineraires.md` (+ maquette `.webp`).

**Décisions de la phase 0**

- Deux composants publics : `Timeline` (plages par entité, API conservée) et **`JourneyTimeline`** (itinéraires). Cadre interne commun **`TimelineShell`** (bandeau « Fenêtre », échelle, axe en haut, grille, défilement, aide) : pas de props mortes selon l'usage.
- Rendu **HTML** (positions en %), plus de SVG pour les lignes : pictos, `LineBadge`, texte et défilement. Les motifs de `tone` restent des `<pattern>` SVG (défs cachées référencées par chaque barre).
- **Échelle** = durée visible dans la largeur ; « Ajuster » = toute la fenêtre. Échelle ≥ fenêtre → option désactivée (`SegmentedControl` gagne `options[].disabled`). Pas de zoom libre.
- Résumé d'itinéraire **calculé** (durée, correspondances = transports − 1, marche) ; « Recommandé » en texte (`--cadence-color-link`, AA).
- Teinte des étapes transport : `color-mix()` de la couleur GTFS dans le style en ligne (exception GTFS, comme `LineBadge`).

**Écarts assumés face à la maquette** : titre de graphique et « Voir les données » au-dessus de la carte (cadre commun des graphiques) ; sélecteur d'échelle en casse normale (`SegmentedControl`) ; picto métro = train (pas d'icône métro chez Untitled UI).

## Mise à jour — B3 `TreeView` (reporté → livré)

Composant **`TreeView`** livré : `TreeView.tsx`, `tree-view.css`, `tree-view-utils.ts` (+ tests), `TreeView.stories.tsx`, export dans `index.ts`, fiche GUIDELINES (table « Intention → composant » sous Navigation, règles ✅/❌, API) et mention dans la recette 8 (volet de navigation réseau).

**Décisions**

- Motif ARIA `tree` **aplati** (chaque `treeitem` porte `aria-level` / `aria-setsize` / `aria-posinset`, pas de `group` imbriqué) : indispensable pour cohabiter avec la virtualisation `@tanstack/react-virtual` (réutilise le schéma focus-roving de `DataTable`). Clavier via le conteneur, `focusedRowId` resynchronisé sur le focus réel (`onFocusCapture`).
- Sélection `multiple` : état porté par le `treeitem` (`aria-checked` true/false/mixed) ; la case tri-état est un **visuel** `aria-hidden` (classes `.checkbox` de `checkbox.css`), jamais une case focusable séparée. L'indéterminé est **dérivé** des feuilles (`getCheckState`).
- Chargement à la demande : `hasChildren` sans `children` → `loadChildren` au 1ᵉʳ dépliage ; lignes synthétiques `loading` (Skeleton, `aria-busy`) et `error` (ligne de reprise activable, pas de bouton focusable imbriqué dans un `treeitem`).
- Arbre **vide** : on retire le rôle `tree` (il exigerait un `treeitem`) au profit d'une `region` étiquetée — sinon axe `aria-required-children`.

**Limite connue** : la sélection d'un parent non encore chargé retient l'id du parent (l'app résout son sous-arbre au chargement).

## Mise à jour — tokens de police + B5 (clôture 0.7.0)

**Police** : l'architecture est bonne — un seul token `--cadence-font-sans` (`tokens.css`), référencé avec repli dans ~59 CSS de composants ; changer Inter = une ligne. Corrigé : `TreeView` ne fixait aucune `font-family` → serif en isolation. Ajouté : garde-fou `font-tokens.test.ts` (toute `font-family` de composant via un token `--cadence-font-*` ou `inherit`) ; stories `TableHeader`/`Icons` passées au token. Observation (non traité, hors périmètre Inter) : `--cadence-font-display` a un repli serif `Georgia` — à revoir si les polices display ne sont pas chargées.

**B5 — décisions**

- **`DataFreshness`** : *livré*. Primitive claire (temps relatif + ton de péremption), non couverte par l'existant. `data-freshness-utils` (+ tests), stories, fiche GUIDELINES (« Retours et statuts »).
- **`DisruptionScopePicker`** : *livré*. Composite hiérarchique au-dessus de `TreeView` (champ + `Popover` recherche + `TreeView` multiple + chips `Badge`). Pas un doublon d'`Autocomplete multiple` (liste plate). Nommage du champ par `label` + résumé (`aria-labelledby`) pour annoncer la valeur. `scope-picker-utils` (filtre + table de libellés, + tests), stories, fiche GUIDELINES + compositions transport.
- **`ScheduleComparison`** : *non retenu comme composant*. Comparaison d'horaires/offres = assemblage `DataTable` + `BarChart`/`Timeline`, trop spécifique à l'app → à faire en recette au besoin. Consigné au CHANGELOG.

**Reste ouvert** : tests manuels lecteur d'écran et navigateurs cibles ; décision de version et publication avec l'utilisateur (rien n'est poussé ni publié).
