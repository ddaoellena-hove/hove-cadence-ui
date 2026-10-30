# Relais de développement — 25 octobre 2026

## Mise à jour — 28 octobre 2026 (fin de journée) : PageHero V2, non commité

- **État de `main`** (`6314a54`) : PR #66 (clic `BarChart`), #67 (corrections visuelles du lot 6), #68 (Drawer : glissement avec onglets, navigation dans l'en-tête) et #69 (retours Datapilot : infobulle des boutons icône seule, libellés d'annotation, `PageSection surface="card"`, `PageHero` `valueType`/`valueCaption`/`valueTone`/`icon`, focus de `SecretField`) fusionnées. #69 a été fusionnée **sans attendre sa CI**, sur demande de l'utilisateur ; la suite complète sur `main` fusionné n'a pas été relancée : vérifier la CI de `main`.
- **En cours** : branche locale `feat/page-hero-v2`, depuis `main`, **non commitée** (l'utilisateur a refusé le commit pour l'instant). Fichiers : `PageHero.tsx`, `page-hero.css`, `PageHero.stories.tsx`, `GUIDELINES.md` (fiche PageHero), `CHANGELOG.md`.
- **Source** : `~/Downloads/hero-kpi-v2-specification.md` (spec UX « non validée métier »). Décisions de l'utilisateur : faire évoluer `PageHero` (props optionnelles, rétrocompatibles) plutôt qu'un nouveau composant ; couleurs = tokens existants, pas les hex de la spec.
- **Ajouts** : `tone` (filet de 4px + bordure du panneau), `valueLabel`, `actionPanel` (`title`, `description`, `action` ; bouton clair 44px), `actionLabel` par KPI, `state` `"loading" | "error"` + `errorMessage` / `onRetry` (`loading` conservé), `freshness.updatedAt: null` → « Heure d'actualisation inconnue ». Fraîcheur déplacée dans l'en-tête. En chargement/erreur : ni fraîcheur, ni accent, ni icône teintée. Grille des KPI en container queries : 1 colonne < 480px, 2 jusqu'à 880px, puis `auto-fit` (jusqu'à 4).
- **Stories** : *V2 — Alerte / Nominal / Données périmées / Fraîcheur inconnue / Chargement / Indisponible / Largeurs*.
- **Validé** : `tsc`, ESLint des fichiers touchés, `build:lib`, `check:types`, suite complète 1 026 tests / 171 fichiers ; rendu contrôlé à 390, 768 et 1 100 px.
- **Tests de stories** : Chromium 1217 absent ; utiliser la config temporaire `node_modules/.cache/mode-filter-vitest.config.mts` (Chromium 1248) : `npx vitest run --config node_modules/.cache/mode-filter-vitest.config.mts`.
- **Instabilité connue** : la story `SecretField` *Defaut* échouait par intermittence (focus) ; corrigé dans #69, à surveiller en CI React 18.
- **Prochaine étape** : commit + PR de `feat/page-hero-v2` quand l'utilisateur le demande. Questions métier ouvertes de la spec (seuils d'anomalie, sens des « points » qualité, SLA de fraîcheur) : hors DS, l'app fournit ton, statut et nombre de sujets.
- **Pas publié** : npm reste en 1.0.0 (antérieure au lot 6 et à toutes les PR ci-dessus).

## Mise à jour — 28 octobre 2026 : Datapilot lot 6

- Branche locale `feat/datapilot-lot6`, depuis `feat/bar-chart-datum-click` (`6bc4fb7`). Livraison directe sur `main` demandée par l’utilisateur le 28 octobre 2026 ; base synchronisée avec `origin/main` (`1af7bae`, fusion du clic BarChart). Fichiers locaux préexistants préservés. Aucune publication npm.
- Sept composants publics ajoutés : ScopePicker, SummaryList, PageHero, SecretField, ValueComparison, LogViewer et PresenceStrip. Évolutions A1–A8 et B du brief intégrées aux composants existants, fondations C ajoutées ; clic et sélection contrôlée étendus à LineChart/Histogram.
- API, CSS, exports, stories, GUIDELINES et CHANGELOG mis à jour. Décisions et preuves : [rapport du lot 6](proposals/datapilot-lot6.md).
- Validation : suite complète 1 009 tests / 171 fichiers, puis 24 tests ciblés après correction TreeView (enfants désactivés exclus de l'agrégation). TypeScript, ESLint touché (0 erreur, 4 avertissements), build:lib, check:types, build-storybook et smoke dist React 19 réussis. Chromium 1248 via configuration temporaire ignorée. Captures à 390/1 100 px sans débordement horizontal.
- Non exécutés : matrice React 18 et session manuelle avec lecteur d'écran. Migration Datapilot et publication npm hors périmètre. Le clic BarChart a déjà été fusionné sur main via la PR #66.
- Prochaine étape : migration des écrans Datapilot lorsque demandée. Le reste du document décrit les chantiers antérieurs.

## Mise à jour — 27 octobre 2026 : pieds de surcouches

- Branche `feat/overlay-footers`, depuis main (fichiers locaux non suivis préservés). Demande Datapilot : corriger le pied d'export et harmoniser les modales. Aucun commit/push/publication.
- Drawer.tsx / Modal.tsx : slot footer ReactNode prioritaire sur les actions standard. DrawerAction.disabled ; ModalAction.disabled/loading. Pied hors du corps, flex-wrap sur petit écran. Corps Drawer tabulable pour les contenus défilants sans contrôle interactif.
- CSS et stories de chaque composant, GUIDELINES.md mis à jour. Stories ajoutées : actions désactivées et pieds composés stables pendant le défilement. Les tests ciblés ont révélé puis corrigé l'accès clavier au corps Drawer et un sélecteur géométrique de Modal (le rôle dialog est sur le voile).
- Validations réussies : `npx tsc -b --noEmit`, ESLint des quatre TSX touchés, build:lib, check:types et 19 stories Drawer/Modal. Même configuration temporaire Chromium 1248 que décrite ci-dessous.
- Consommateur `../datapilot-idfm`, branche `codex/overlay-footers` : export, trois fiches Catalogue, restauration, imports et confirmations migrés vers les pieds DS. Build, typographie, smoke 16/16, actions groupées et tests Drawer étendus réussis ; pieds mesurés desktop/mobile.
- Prochaine action : retours UX/UI, puis livraison des deux dépôts quand demandée. Les sections ci-dessous décrivent les chantiers précédents.

## Mise à jour — 27 octobre 2026 : ModeFilter par ligne

- Demande explicite de l'utilisateur depuis Datapilot : faire évoluer ModeFilter pour filtrer par ligne avec ses badges, puis l'utiliser dans le Différentiel.
- Branche locale `feat/mode-filter-lines`, depuis main. Changements préexistants package.json/package-lock.json et fichiers non suivis préservés. Aucun commit, push ou publication.
- Fichiers touchés : `src/components/ModeFilter.tsx`, `mode-filter.css`, `ModeFilter.stories.tsx`, `GUIDELINES.md`, ce relais. API `items: ModeFilterItem[]` (`id`, `label`, `badge?`) exclusive avec `modes`, valeurs string[] pour les lignes. `allLabel` facultatif remet la sélection à []. Badges LineBadge sm décoratifs, libellés accessibles sans duplication. Ancienne API modes et callbacks ModeName[] préservés.
- Intégration locale dans `../datapilot-idfm`, branche `codex/mode-filter-lines` : six groupes de lignes des courses, sélection unique et Toutes ; recherche, pagination et groupes agrégés préservés.
- Réussis : `npx tsc -b --noEmit`, `npx eslint src/components/ModeFilter.tsx src/components/ModeFilter.stories.tsx`, `npm run build:lib`, `npm run check:types`, cinq stories ModeFilter, build et smoke Datapilot (16/16), contrôles ciblés des lignes/recherche/clavier et captures à 1600/1100 px.
- Stories : navigateur Chromium 1217 absent et téléchargement bloqué par certificat local. Relance réussie avec une configuration temporaire ignorée dans node_modules/.cache et `playwright({ launchOptions: { executablePath: … } })` vers Chromium 1248 déjà installé. Configuration versionnée inchangée. Pas de suite globale ni de publication exécutées.
- Des changements concurrents de Drawer.tsx, drawer.css et Drawer.stories.tsx sont apparus pendant le chantier ; préservés sans intervention, hors périmètre ModeFilter.
- Prochaine action : poursuivre les retours UX/UI et livrer les changements des deux dépôts lorsque demandé. Le reste du document est l'état historique du 25 octobre.

## Démarrage pour un nouvel agent

1. Lire `CLAUDE.md`, puis `GUIDELINES.md` à la racine : conventions, API et règles visuelles.
2. Lire ce document et vérifier `git status --short` et `git branch --show-current` : l’état ci-dessous est une photographie datée.
3. Consulter les rapports liés avant de refaire un audit ou d’ajouter un composant. Le code et les stories actuels précisent le comportement réel ; les propositions historiques ne remplacent pas les guidelines.

## État au 25 octobre 2026 — 1.0.0 prête, non publiée

- **`main` contient tout** : la 0.9.x (0.9.0 à 0.9.8) puis la préparation de la 1.0 (PR #49 à #56). Manifeste en **`1.0.0`** (`npm version 1.0.0 --no-git-tag-version`), **non publié** : la dernière version sur npm est la **0.1.6**. La publication se fait uniquement sur demande explicite de l'utilisateur.
- Fichiers locaux jamais commités : `.claude/settings.local.json` (désormais ignoré par Git), `.claude/launch.json`, `.mcp.json`, `story-ui-*`, `public/fonts/ABCDiatype-*`.
- Branches : une par sujet, partie de `main`, fusionnée par PR (merge commit) une fois la CI verte ; les branches locales fusionnées sont supprimées.

### Ce que contient la 1.0.0

| Sujet | PR | Détail |
|---|---|---|
| Infobulles des graphiques | #49 | Valeur longue sous son libellé, sans débordement |
| Ménage du dépôt | #50 | `.claude/settings.local.json` hors suivi + `.gitignore` |
| Retrait des API dépréciées | #51 | `SecondaryButton`, `DataVisualization` (+ alias `--CAI-dv-series-*`), anciennes props de `PrimaryButton`, `Link variant="secondary"`, `Sidebar user.email`, shim `button-compat` → module interne `dev-warnings` ; garde-fou `removed-api-usage.test.ts` ; guide de migration 0.x → 1.0 dans le CHANGELOG |
| Nettoyage des stories | #52 | `DashboardMultimodal` et `Recettes/*` retirées ; page de redirection conservée |
| Contraste AA | #53 | `text-secondary` → `#607075` ; textes en `icon-muted` → `text-secondary` ; garde-fou `icon-muted-text-usage.test.ts` ; checklist `docs/audits/0.8.5/contraste-aa.md` close |
| Types publics sans d3 | #54 | `BarLayout` et `ScatterPointInput` dans `chart-types.ts` : les déclarations publiées n'exposent plus de types `d3-scale` |
| Préparation 1.0 | #55 | GUIDELINES relu (sommaire, recettes 3/6/7 à jour de l'API, `aria-label` documentés, largeur de Sidebar), feuille de route, ce relais, version 1.0.0 |
| Types regroupés | #56 | `dist/index.d.ts` + `index.d.cts` générés par `dts-bundle-generator` ; `exports` typés par condition ; contrôle `check:types` en CI |

### Décisions à préserver

- `--cadence-color-icon-muted` est réservé aux icônes, chevrons et poignées ; tout texte secondaire (états estompés compris : onglets inactifs, série masquée, jour hors mois) prend `--cadence-color-text-secondary`.
- `warnOnce` / `errorOnce` / `checkButtonContent` vivent dans `src/components/dev-warnings.ts` (interne). Plus aucun avertissement de dépréciation.
- Déclarations publiées : un seul fichier par condition (`build:types`, `dts-bundle-generator`). Dans `src/components`, pas d'`import React from "react"` par défaut et pas de type React importé sous le nom d'un type DOM global (`MouseEvent`, `DragEvent`…) s'il apparaît dans une API publique : aliaser (`ReactMouseEvent`). `npm run check:types` détecte ces régressions.
- Le codemod `scripts/codemods/buttons-v2.mjs` reste livré dans le paquet : il sert au guide de migration.
- Les recettes de code de GUIDELINES restent, en complément des Page patterns (qui priment).
- `Icons iconMap` (prop ignorée, marquée `@deprecated`) n'a pas été retirée : elle ne figurait pas dans la liste de la 1.0. À trancher pour une 1.x ou une 2.0.

### Validation

- Avant chaque PR : `npx tsc -b --noEmit`, `npm run lint` (0 erreur, 8 avertissements historiques), `npm test`, `npm run test:react18`, `npm run build:lib`, `npm run smoke:dist`, `npm run check:types` ; CI GitHub (React 18 et 19) verte avant fusion.
- Suite au 25 octobre 2026 : **899 tests** dans 157 fichiers (contre 1022 avant la 1.0 : les matrices du shim `button-compat` et les stories retirées ne comptent plus ; +3 pour le garde-fou `icon-muted`). `dist/` de la 1.0.0 contrôlé : `hove-cadence-ui.js` (464 Ko), `.cjs` (360 Ko), `index.d.ts` et `index.d.cts` regroupés, `style.css` (178 Ko), 95 exports identiques en ESM et CJS.
- **Applications consommatrices** (hors dépôt, paquet issu de `npm pack`) : React 18.3 et React 19.3, TypeScript 5.9 en `strict` et `skipLibCheck: false`.
  - ✅ Types en `moduleResolution: "bundler"` (Vite, Next, webpack) : imports nommés, types publics, `@ts-expect-error` sur une prop supprimée.
  - ✅ Rendu serveur depuis le bundle ESM (esbuild) et depuis `require()` (CJS) ; exports retirés absents à l'exécution.
  - ✅ `style.css` importé par le bundler (210 Ko) et résolu par `require.resolve`. Les `url(/fonts/…)` du `@font-face` sont laissées à l'application : un bundler qui résout les URL absolues (esbuild) doit les déclarer externes (`--external:/fonts/*`).
  - Corrigé en cours de route (#54) : les déclarations exposaient des types `d3-scale` (dépendance de développement) → échec en `skipLibCheck: false`.
  - Corrigé ensuite (#56) : types non chargés en `moduleResolution` `node16` / `nodenext` (imports relatifs sans extension, pas de `.d.cts`) et sous TypeScript 6 (`import "./x.css"` dans les déclarations). Les déclarations sont désormais regroupées en `dist/index.d.ts` + `dist/index.d.cts` ; `npm run check:types` (node16, nodenext, bundler) tourne en CI.
  - ℹ️ Sous React 18, le rendu serveur émet l'avertissement « useLayoutEffect does nothing on the server » (positionnement des popovers et graphiques) ; React 19 ne l'émet plus.
- **Externes** : `dist/hove-cadence-ui.js` et `.cjs` importent `react`, `react-dom`, `@untitledui/icons`, `@tanstack/*` et les quatre `d3-*` sans les embarquer.

### Reste à faire

1. **Test au lecteur d'écran** (manuel, par l'utilisateur) — VoiceOver + Safari (macOS) et NVDA + Firefox ou Chrome (Windows). Composants clés, par ordre de risque :
   - **Surcouches** : `Modal` (piège à focus, retour du focus, Échap, superposition avec un `Drawer`), `Drawer`, `Popover` (sortie au clavier), `Toaster` (annonce unique de chaque toast, `error` immédiat, `success` poli).
   - **Champs composites** : `DatePicker` (cases JJ / MM / AAAA, calendrier, jours annoncés en toutes lettres), `DateRangePicker`, `TimePicker` (`spinbutton` Heures / Minutes), `Autocomplete` (simple et `multiple` : options, groupes, retrait des chips), `Dropdown` (groupes nommés), `CounterInput`, `ColorField`.
   - **Sélection hiérarchique** : `TreeView` (niveaux, position, `aria-checked` mixte, chargement à la demande), `DisruptionScopePicker` (résumé de la sélection).
   - **Navigation** : `Sidebar` (repli, périmètre), `TabList` / `Tab` / `SecondaryTab`, `SegmentedControl` (`radiogroup`), `Breadcrumbs` avec sélecteur, `Pagination`.
   - **Données** : `DataTable` (tri annoncé, sélection et plage, navigation par lignes), `ActionMenu`, `ColumnManager` (réordonnancement annoncé), `FilterBar` (nombre de résultats).
   - **Formulaires et retours** : `ErrorSummary` (focus et liens vers les champs), `InlineAlert`, `FileUpload` (états écrits), `Stepper`, `Accordion`, `CopyableText` (« Copié »).
   - **Graphiques** : `LineChart` et `BarChart` (parcours au clavier, valeur annoncée, « Voir les données »), `Heatmap` (grille), `DonutChart`, `LineDiagram` (annonces regroupées des incidents), `TimeSpaceDiagram` (le long d'une course).
2. **Publication npm** : sur demande uniquement. `dist/` est à reconstruire juste avant (`npm run build:lib`, car `npm run build` l'écrase) puis à vérifier (`hove-cadence-ui.js`, `.cjs`, `index.d.ts`, `index.d.cts`, `npm run check:types`).

# Historique des lots (avant la 1.0)

> Photographies datées, conservées pour mémoire : branches, versions et comptes de tests y sont ceux de l'époque. L'état courant est dans « État au 25 octobre 2026 » ci-dessus.

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

## Mise à jour — lot 0.8.0 (Page patterns)

Branche `release/0.8.0`, version `0.8.0` non publiée. Commits atomiques, rien poussé.

**Fait**

- *Lot A (dette doc)* : Timeline dans Data visualisation ; ColorField/DisruptionScopePicker au tableau des hauteurs ; Feedback → `useToast()` ; état vide en `text-secondary` ; `--cadence-color-primary` sans « modale » ; colonne d'actions collée `DataTable` documentée.
- *Lot B (primitives)* : **`PageSection`**, **`FieldRow`**, **`FormActions`**, **`CardGrid`** (tsx+css+stories+tests+export+fiche+intention).
- *Lot C (catalogue)* : section Storybook **« Page patterns »** + test de garde ; **11 patterns** livrés (gabarit vérifié `src/patterns/*.tsx`, stories fullscreen + a11y, MDX à structure fixe via `?raw`, fiche GUIDELINES). Tableau *Intention → pattern*, correspondance *recette → pattern*, page **Recettes → Page patterns**, instructions agents IA. Test `patterns-gabarit` (gabarit = doc). Audit responsive `docs/audits/0.8.0/`.

**Décisions** : `Toolbar`/`SplitView` documentés (pas de composant) ; Paramètres = enregistrement **explicite**. Gabarits = option 1 (dans l'app, `src/patterns`, non exportés) ; seules les primitives sont dans la lib.

## Mise à jour — finition du reste ouvert

**Fait**

- **`DataTable` : prop `stickyActions`** — colle la dernière colonne (actions) à droite au défilement, ombre de séparation ; remplace le CSS fourni par l'app (A6). CSS déplacé dans `data-table.css`, stories `Colonne d'actions` migrées sur la prop, fiche + CHANGELOG à jour.
- **Warnings React** : les « champs contrôlés sans `onChange` » signalés dans l'ancien relais **ont disparu** (corrigés aux refontes TimePicker/recettes). Les avertissements de **dépréciation** restants proviennent uniquement des **stories de démonstration** des API dépréciées (`PrimaryButton destructive`/`size`/`withIcon`, `SecondaryButton`, `DataVisualization`) — **intentionnels** (ils documentent la migration), à retirer avec les API en 1.0.0. Aucun usage déprécié dans les recettes.
- **`smoke:dist`** : paquet `dist` monté hors Vite (React 19, ESM/CJS) — vert.
- **Migration Recettes → patterns** : traitée par la **page de redirection** + le mapping *recette → pattern* (choix validé par le prompt : « alias **ou** page redirect »). Les stories `Recettes/*` riches sont **conservées à dessein jusqu'à la 1.0.0** (retrait groupé avec les API dépréciées), pour ne pas perdre les démos à données réelles.
- **Audit responsive** : les 11 patterns vérifiés **par programme** à 1024 px (`scrollWidth === clientWidth`, aucun scroll H) + captures de référence (`docs/audits/0.8.0/`). Les 33 captures image (11 × 3 largeurs) ne sont pas produites : faible valeur face à la vérification programmatique.

**Reste ouvert — humain / décision (non automatisable ici)**

- Tests manuels **lecteur d'écran** et navigateurs cibles.
- Vérification dans des **apps consommatrices dédiées** React 18 / 19 (ESM + CJS) au-delà de `smoke:dist`.
- Tests d'intégration des **menus en portail dans des dialogues**.
- **Décision de publication npm** (rien n'est publié ; `npm version` déjà en 0.8.0).

## Mise à jour — hygiène transversale avant la 0.8.5

**Fait**

- **Avertissements de dépréciation maîtrisés** dans les stories de démo (`PrimaryButton` « Anciennes props », `SecondaryButton` « Correspondance », `DataVisualization` (toutes), `Link` « Dépréciée — secondary ») : `beforeEach` réinitialise la mémoire « une seule fois » (`resetWarningsForTests`) puis espionne `console.warn` ; le `play` **asserte** le message. Plus de bruit dans la suite, et l'avertissement devient une garantie testée.
- `DataVisualization` utilise désormais le `warnOnce` partagé de `button-compat` (avant : un `Set` local non réinitialisable). Le message prend le format commun `[cadence-ui] DataVisualization : composant déprécié … Suppression prévue en 1.0.0.`
- **Garde-fou** `src/components/deprecated-api-usage.test.ts` : refuse `<SecondaryButton`, `<DataVisualization`, `withIcon=` hors des 4 stories de démo, du CHANGELOG et de GUIDELINES. Motifs volontairement non ambigus (pas `destructive` ni `size="large"`).
- **Audit contraste** livré en checklist (non appliqué) : [`docs/audits/0.8.5/contraste-aa.md`](audits/0.8.5/contraste-aa.md). Constat clé : `icon-muted` est à 4,53:1 sur blanc (limite), et `text-secondary` **échoue aussi sur `surface-alt`** (4,24:1). Il faut décider s'il faut l'assombrir (candidat `#607075`).

**Reste ouvert (0.8.5, utilisateur)** : appliquer la checklist contraste et trancher les états estompés ; garde-fou CSS « `icon-muted` interdit en texte » une fois corrigé ; tests lecteur d'écran ; apps consommatrices dédiées ; publication npm.

## Mise à jour — 0.9.0 dataviz (terminée, non publiée)

Feuille de route : [`docs/proposals/0.9.0-dataviz-et-1.0.md`](proposals/0.9.0-dataviz-et-1.0.md). Version du manifeste : `0.9.0`, **non publiée** sur npm.

**Livré** (fusionné dans `main` pour les lots 1 à 4, branche `feat/dataviz-lot5` pour la suite)

- Lots 1 à 4 : `DonutChart`, `Meter`, `BulletChart`, `Histogram`, `ComboChart`, `LineChart curve="step"` ; seuils partagés dans `threshold-utils.ts` (Gauge, Meter, BulletChart).
- Lot 5 : heures de service au-delà de 24:00 (`LineChart serviceTime`, `Histogram serviceTime`) ; mini-graphiques en cellule (`Meter size="sm"`, `target`, `min` ; story *DataTable → Mini-graphiques en cellule*) ; comparaison N vs N-1 (`series[].reference` sur `LineChart` et `BarChart`, écart au survol via `formatGap`).
- Patterns : Analyse (référence N-1, `DonutChart`, `Histogram`) et Supervision (`BulletChart`).
- Hors dataviz, au passage : pictos `ModeIcon` dans `JourneyTimeline` ; la page ne défile plus hors du cadre d'`AppLayout` (`.app-layout__scroll` et `.chart` positionnés) ; CI réparée (runner `ubuntu-24.04`, alias Vite `@ddaoellena/cadence-ui` → sources) ; ref de `DateFields` compatible types React 18.

**Décisions**

- `Meter` est une primitive compacte (comme `Gauge`) : `label` au lieu de `title`, sans états ni tableau.
- `Histogram` dessine chaque classe à largeur égale (classes métier inégales lisibles) ; bornes imposées → classes ouvertes hors bornes.
- Une série de référence ne consomme pas de couleur de palette (ardoise tiretée) ; l'écart n'est rappelé qu'avec une seule référence.

**Reste ouvert**

- **Phrases de statut** de `Gauge` / `Meter` / `BulletChart` (« Objectif atteint — … », « Niveau intermédiaire — Malus sous 97 % » cite la borne basse) : à reformuler avec l'utilisateur, notamment pour un taux de charge.
- Test `PageHeader / Défaut` instable dans la suite complète (position du popover), stable seul.
- Le Storybook lancé avant l'alias Vite résout le paquet vers `dist/` : le redémarrer.
- 0.9.x replanifiée (§ 4 bis de la feuille de route) : lots 0.9.1 à 0.9.7, dont les gros sujets avancés avant la 1.0 (thermomètre de ligne `LineDiagram`, Marey `TimeSpaceDiagram`, `SankeyChart`) ; puis la 1.0 (§ 5). Publication npm uniquement sur demande.

