# Guidelines — Hove Cadence UI

Design system React pour les produits Hove (transport public). Ce document est la **source de vérité unique** pour construire des interfaces avec `@ddaoellena/cadence-ui` — il est conçu pour être lu aussi bien par des développeurs que par des agents IA.

## Sommaire

1. [Instructions pour agents IA](#instructions-pour-agents-ia)
2. [Installation & setup](#installation--setup)
3. [Design tokens](#design-tokens)
4. [Typographie](#typographie)
5. [Intention → composant](#intention--composant)
6. [Layout & spacing](#layout--spacing)
7. [Boutons](#boutons)
8. [Formulaires](#formulaires)
9. [Navigation](#navigation)
10. [Listes & tableaux](#listes--tableaux)
11. [Statuts & étiquettes](#statuts--étiquettes)
12. [Data visualisation](#data-visualisation)
13. [Feedback](#feedback)
14. [Page patterns](#page-patterns)
15. [Recettes de pages complètes](#recettes-de-pages-complètes)
16. [Référence API des composants](#référence-api-des-composants)
17. [Compositions métier transport](#compositions-métier-transport)

---

## Instructions pour agents IA

Règles impératives pour générer du code avec ce design system :

1. **Ne jamais inventer de prop.** Si une prop n'apparaît pas dans la [Référence API](#référence-api-des-composants), elle n'existe pas. En cas de doute, consulter la fiche du composant avant de l'utiliser.
2. **Ne jamais recréer un composant qui existe.** Avant de coder un bouton, un champ, une carte ou un badge custom, vérifier la table [Intention → composant](#intention--composant).
3. **Couleurs : uniquement les tokens.** Écrire `var(--cadence-color-primary)`, jamais de hex en dur. Les couleurs absentes des tokens (bleus, violets…) sont réservées aux composants internes — ne pas les réutiliser.
4. **Les règles ❌ sont bloquantes.** Ce ne sont pas des suggestions : un code qui viole un ❌ est incorrect.
5. **`Checkbox`, `Toggle`, `RadioButton`, `RichCheckbox` et `RichRadioButton` se pilotent par la prop `state`**, pas par une prop `checked` — elle n'existe pas. Exemple : `<Checkbox state={isChecked ? "checked" : "unchecked"} onChange={setIsChecked} />`.
6. **Le CSS custom est limité au layout.** `display: flex`, `gap`, `padding`, `margin`, largeurs : OK en style inline. Couleurs, polices, bordures, ombres custom : interdit — les composants et tokens couvrent ces besoins.
7. **Choisir d'abord un pattern** dans le tableau [Intention → pattern](#intention--pattern) pour toute page nouvelle, partir de son gabarit, puis composer. **Une page qui ne correspond à aucun pattern est signalée, pas inventée.** Les recettes de code servent d'exemples complémentaires.
8. **Un seul `PrimaryButton` plein par vue.** Plusieurs `GhostButton` sont autorisés. 3e action d'un groupe : `Link hideArrow`.
9. **Toujours passer `label`** sur les champs de formulaire (`TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker`, `CounterInput`, `TimePicker`). Exception, qui prend `aria-label` à la place : la variante bouton (`variant="button"` de `DatePicker`, `DateRangePicker`, `Dropdown`, `TimePicker`), notamment pour les filtres rapides d'une `FilterBar`.
10. **Imports** : composants depuis `@ddaoellena/cadence-ui`, styles via un unique `import "@ddaoellena/cadence-ui/style.css"`, polices via les `<link>` de la section [Installation](#installation--setup).
11. **Libellés en français correct, accents UTF-8 obligatoires.** Tout texte visible (labels, titres, boutons, placeholders, messages) s'écrit avec ses accents — jamais de français « aplati » en ASCII. Les fichiers source sont en UTF-8 : `é è ê à ç û É À` s'écrivent tels quels, sans entité HTML ni échappement unicode.

### Rédaction des libellés français

| ❌ Incorrect (ASCII aplati) | ✅ Correct |
|---|---|
| `Creer un scenario` | `Créer un scénario` |
| `Severite` | `Sévérité` |
| `A venir` | `À venir` |
| `Passees` | `Passées` |
| `Tout deselectionner` | `Tout désélectionner` |
| `Reinitialiser` | `Réinitialiser` |
| `Derniere mise a jour` | `Dernière mise à jour` |
| `Evenement` | `Événement` |

- ✅ Les majuscules prennent aussi leurs accents : `À venir`, `Événement`, `État`.
- ✅ Apostrophe typographique `'` dans les libellés (`Points d'intérêt`) ; l'apostrophe droite `'` reste acceptable dans le code.
- ✅ En JSX, l'apostrophe dans un texte se met dans une expression si besoin : `{"Points d'intérêt"}` ou via guillemets doubles.
- ❌ Jamais d'entités HTML (`&eacute;`) ni d'échappements (`é`) — écrire le caractère directement.
- ❌ Ne pas mélanger français et anglais dans une même interface (`Delete` à côté de « Supprimer »).

---

## Installation & setup

```bash
npm install @ddaoellena/cadence-ui
```

Prérequis : `react` et `react-dom` 18 ou 19 (dépendances paires). Les icônes (`@untitledui/icons`), `@tanstack/react-table`, `@tanstack/react-virtual` et les modules `d3-*` sont des dépendances du paquet, installées avec lui et laissées hors du bundle. Migration depuis une 0.x : guide en tête du `CHANGELOG.md`.

### 1. Importer les styles (une seule fois, à la racine)

```tsx
// main.tsx ou App.tsx
import "@ddaoellena/cadence-ui/style.css";
```

### 2. Charger les polices (dans le `<head>` du HTML)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Le lien Google Fonts ci-dessus charge **Inter** (repli d'interface), **Space Grotesk** (repli display) et **Spline Sans Mono**. Les deux polices commerciales, **ABC Diatype** (interface) et **Uxum Grotesque** (titres), sont déclarées via `@font-face` dans `tokens.css`, leurs `woff2` servis depuis `/fonts` (dossier `public`) : elles prennent automatiquement le pas sur leurs replis (`--cadence-font-sans`, `--cadence-font-display`). Une app qui consomme la lib doit héberger ces `woff2` sous `/fonts/` (la lib ne distribue que les règles `@font-face`, pas les fichiers) ; sinon Inter (interface) et Space Grotesk (display) servent de repli sans configuration. Pour revenir à Inter en interface, remettre `"Inter"` en tête de `--cadence-font-sans`.

### 3. Importer les composants

```tsx
import { PrimaryButton, GhostButton, TextInput, TableCard, Modal } from "@ddaoellena/cadence-ui";
```

### 4. Squelette d'application minimal

Voir la [recette Layout d'application](#recette-1--layout-dapplication) — toute app commence par ce squelette : `AppLayout`, avec la `Sidebar` repliable (220 px dépliée, 80 px repliée) à gauche et le contenu de la page dans un conteneur blanc arrondi qui suit sa largeur.

---

## Design tokens

Les couleurs, polices, rayons, ombres et couches (z-index) sont centralisés dans des variables CSS (`tokens.css`, chargé automatiquement avec la lib). Chaque usage interne garde un fallback en dur : le rendu reste correct même sans le fichier de tokens.

| Token | Valeur | Usage |
|---|---|---|
| `--cadence-color-primary` | `#002830` | Encre principale — texte fort, titres, boutons |
| `--cadence-color-label` | `#1a3e45` | Labels de formulaire, badges ; fond de `PrimaryButton` au repos |
| `--cadence-color-primary-hover` | `#10353d` | Survol d'un `PrimaryButton` : un cran plus foncé que le repos |
| `--cadence-color-text-muted` | `#809397` | Icônes et grand texte secondaire (3,2:1 — pas pour du petit texte) |
| `--cadence-color-text-secondary` | `#607075` | Texte secondaire AA sur tous les fonds clairs (5,2:1 sur blanc, 4,55:1 sur `surface-alt`) : descriptions, aides, petits libellés, onglets inactifs, en-têtes de colonnes, libellés d'axes |
| `--cadence-color-text-disabled` | `#808080` | Texte des états désactivés |
| `--cadence-color-placeholder` | `#737373` | Placeholders des champs |
| `--cadence-color-icon-muted` | `#69797d` | Icônes, chevrons et poignées discrets. ⚠️ Jamais pour du texte (un test le vérifie) : `text-secondary` |
| `--cadence-color-icon-neutral` | `#737373` | Icônes neutres (pictos métier) |
| `--cadence-color-icon-disabled` | `#c5cfd3` | Pictos inactifs : flèches de tri non actives (`TableHeader`, `DataTable`) |
| `--cadence-color-danger` | `#da1e28` | Actions destructives (fond de `PrimaryButton tone="danger"`), erreurs |
| `--cadence-color-danger-hover` | `#c91720` | Survol d'un `PrimaryButton tone="danger"` |
| `--cadence-color-danger-active` | `#b91c1c` | Appui d'un `PrimaryButton tone="danger"` |
| `--cadence-color-danger-text` | `#b91c1c` | Texte danger sur fond clair (`GhostButton tone="danger"`, `PrimaryButton outline tone="danger"`, `Link variant="destructive"`) — AA sur blanc et `surface-alt` |
| `--cadence-color-danger-border` | `#ed8e93` | Bordure d'un `PrimaryButton outline tone="danger"` |
| `--cadence-color-link` | `#1d4ed8` | Texte de `Link` — AA sur blanc (6,7:1) et `surface-alt` (5,9:1) |
| `--cadence-color-success` | `#24a148` | Confirmations, états valides |
| `--cadence-color-info` | `#0f62fe` | Accent « information » d'`AlertToast` |
| `--cadence-color-warning` | `#f1c21b` | Accent « avertissement » d'`AlertToast`. ⚠️ 1,7:1 sur blanc : jamais en couleur de texte |
| `--cadence-color-accent` | `#1b6cff` | Élément actif / sélectionné (Sidebar, options de menu, compteur de `BulkActionBar`), remplissage d'une `ProgressBar` en cours. ⚠️ Réservé aux états : jamais pour une action |
| `--cadence-color-accent-subtle` | `#f0f6ff` | Survol d'un élément actif (Sidebar), ligne sélectionnée (`DataTable`) |
| `--cadence-color-white` | `#ffffff` | Surfaces de premier plan |
| `--cadence-color-segmented-track` / `-disabled` | `#e6f0fa` / `#dde8f0` | Piste du SegmentedControl unique |
| `--cadence-color-segmented-hover` | `rgba(255, 255, 255, 0.45)` | Survol d'un segment inactif |
| `--cadence-color-field-focus` | `#2d5f6b` | Bordure (1,5px) d'un champ focalisé : `TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `TimePicker`, `Autocomplete` |
| `--cadence-field-focus-ring` | halo 4px `rgba(45, 95, 107, 0.12)` | Halo d'un champ focalisé (`box-shadow`) |
| `--cadence-color-field-focus-subtle` | `rgba(45, 95, 107, 0.1)` | Jour sélectionné d'un calendrier |
| `--cadence-color-control-border-active` | `#405e64` | Bordure d'une carte de choix survolée ou cochée (`RichCheckbox`, `RichRadioButton`) |
| `--cadence-color-selected-surface` | `#c8d6e4` | Fond d'une carte sélectionnée (`TableCard`) |
| `--cadence-color-scrim` | `rgba(0, 0, 0, 0.5)` | Voile de `Modal` et `Drawer` |
| `--cadence-color-on-dark` / `-muted` / `-subtle` | blanc à 90 / 60 / 40 % | Texte et icônes sur fond sombre (`Sidebar`) : actif, secondaire, chevron et contour de focus |
| `--cadence-color-on-dark-hover` / `-active` / `-divider` | blanc à 7 / 15 / 10 % | Survol, élément actif, séparateur sur fond sombre |
| `--cadence-color-accent-on-dark` | `#3b8eff` | Pastille de notification sur fond sombre (`Sidebar`) |
| `--cadence-color-surface-alt` | `#eef1f4` | Fonds de wrapper (TableCard, Badge), jours d'une période (`DateRangePicker`) |
| `--cadence-color-surface-subtle` | `#fafafa` | Fond de carte discret sur fond blanc (fichiers de `FileUpload`) |
| `--cadence-color-border` | `#e5e5e5` | Bordures par défaut |
| `--cadence-color-border-strong` | `#bfc9cb` | Bordures appuyées, états disabled |
| `--cadence-color-scrollbar-thumb` | `rgba(0, 40, 48, 0.2)` | Curseur des barres de défilement (`cadence-scrollbar`) ; `-hover` : `rgba(0, 40, 48, 0.36)` |
| `--cadence-color-divider` | `#f0f0f0` | Séparateurs internes |
| `--cadence-color-skeleton` | `var(--cadence-color-surface-alt)` | Fond des squelettes de chargement (`Skeleton`, `DataTable`, `Card`) |
| `--cadence-dataviz-series-1..8` | violet, bleu, teal, ambre `#b36b00`, magenta, corail, violet foncé, ardoise | Séries des graphiques, dans cet ordre ; toutes ≥ 3:1 sur blanc |
| `--cadence-dataviz-seq-1..7` | `#eaf4f5` → `#004650` | Rampe séquentielle (`Heatmap`), teinte pétrole à clarté croissante |
| `--cadence-dataviz-threshold` / `-threshold-breach` | `#1a3e45` / `#b91c1c` | Ligne de seuil / côté défavorable d'un seuil |
| `--cadence-dataviz-annotation` / `-annotation-band` | `#55606e` / `rgba(85, 96, 110, 0.08)` | Trait ou bord d'annotation / remplissage d'une bande annotée |
| `--cadence-font-sans` | ABC Diatype → Inter | Texte d'interface |
| `--cadence-font-display` | Uxum Grotesque → Space Grotesk | Titres |
| `--cadence-font-mono` | Spline Sans Mono | Valeurs numériques |
| `--cadence-font-size-caption` | `11px` | Petits textes : aide sous un champ (`TextInput`, `TextArea`, `TimePicker`), fil d'Ariane (`Breadcrumbs`) |
| `--cadence-radius-sm` | `6px` | Petits éléments : badges, boutons d'icône |
| `--cadence-radius-md` | `8px` | Contenus internes |
| `--cadence-radius-lg` | `10px` | Champs et cards |
| `--cadence-radius-xl` | `12px` | Conteneurs : `AppLayout`, `CounterInput` |
| `--cadence-radius-2xl` | `16px` | `Modal`, grandes cartes riches (`RichCheckbox` / `RichRadioButton` large) |
| `--cadence-radius-pill` | `999px` | Pilules et cercles : boutons, `SearchInput`, `Toggle`, halos ronds |
| `--cadence-control-height-compact` | `29px` | Hauteur des contrôles compacts : boutons `size="sm"`, `SearchInput`, déclencheurs `variant="button"`, `SegmentedControl size="sm"` — voir [Hauteurs de contrôle](#hauteurs-de-contrôle-et-alignement-sur-une-rangée) |
| `--cadence-control-height-field` | `40px` | Hauteur des champs d'une ligne (`TextInput`, `Dropdown`, `DatePicker`, `ColorField`…) et du `SegmentedControl` (`size="md"`) |


**Compléments lot 6 — tailles et fond sombre** :

| Token | Valeur | Rôle |
|---|---|---|
| `--cadence-font-size-small` | 12px | Métadonnées |
| `--cadence-font-size-body` | 13px | Corps courant |
| `--cadence-font-size-emphasis` | 14px | Texte mis en avant |
| `--cadence-font-size-section` | 16px | Titre de section |
| `--cadence-font-size-heading` | 22px | Titre de page |
| `--cadence-font-size-kpi` | 28px | Compteur |
| `--cadence-font-size-kpi-large` | 44px | Valeur principale |
| `--cadence-status-active-on-dark` | #40c2da | En cours |
| `--cadence-status-upcoming-on-dark` | #c4b5fd | À venir |
| `--cadence-status-completed-on-dark` | #86efac | Terminé |
| `--cadence-status-draft-on-dark` | #cbd5e1 | Neutre |
| `--cadence-status-warning-on-dark` | #fdba74 | Avertissement |
| `--cadence-status-info-on-dark` | #93c5fd | Information |
| `--cadence-status-critical-on-dark` | #fca5a5 | Critique |
| `--cadence-status-nominal-on-dark` | #86efac | Nominal |
| `--cadence-dataviz-neutral` | #69797d | Segment « Autres » de Meter |

✅ Les statuts `on-dark` s'utilisent sur `--cadence-color-primary` ; les statuts clairs conservent leurs paires `fg/bg`. Les tailles sont disponibles pour les compositions, sans surcharge des composants existants.

**Statuts** — les 8 variantes d'`Indicator`, une paire texte (`-fg`) / fond (`-bg`) par variante :

| Token | fg | bg | Sens |
|---|---|---|---|
| `--cadence-status-active-*` | `#007a65` | `#e0f4f1` | En cours |
| `--cadence-status-upcoming-*` | `#6d28d9` | `#ede9fe` | À venir |
| `--cadence-status-completed-*` | `#15803d` | `#dcfce7` | Passée / terminée |
| `--cadence-status-draft-*` | `#475569` | `#eef1f4` (= `surface-alt`) | Brouillon |
| `--cadence-status-warning-*` | `#c2410c` | `#fff7ed` | Ralenti / avertissement |
| `--cadence-status-info-*` | `#1d4ed8` | `#eff6ff` | Information |
| `--cadence-status-critical-*` | `#b91c1c` | `#fee2e2` | Critique |
| `--cadence-status-nominal-*` | `#166534` | `#f0fdf4` | Normal / RAS |

**Thèmes produits, élévation, focus et couches :**

| Token | Valeur | Usage |
|---|---|---|
| `--cadence-product-datahub` | `#004650` | Fond de `Sidebar product="datahub"` |
| `--cadence-product-traffic-report` | `#2f2f3b` | Fond de `Sidebar product="traffic-report"` |
| `--cadence-product-insights` | `#3b2f2f` | Fond de `Sidebar product="insights"` |
| `--cadence-color-hover-overlay` | `rgba(0, 40, 48, 0.06)` | Survol d'un élément sans fond (`GhostButton`) — visible sur tout fond |
| `--cadence-color-active-overlay` | `rgba(0, 40, 48, 0.12)` | Appui d'un élément sans fond |
| `--cadence-color-danger-hover-overlay` | `rgba(218, 30, 40, 0.06)` | Survol d'un `GhostButton tone="danger"` |
| `--cadence-color-danger-active-overlay` | `rgba(218, 30, 40, 0.12)` | Appui d'un `GhostButton tone="danger"` |
| `--cadence-page-padding-inline` | 32px | Padding latéral du contenu de page sur grand écran |
| `--cadence-page-padding-inline-compact` | 16px | Padding latéral du contenu de page sur petit écran |
| `--cadence-section-inset-inline` | 8px | Retrait latéral supplémentaire des sections dans le contenu de page |
| `--cadence-section-padding-inline` | 8px | Padding latéral de l’en-tête extérieur et du corps de section |
| `--cadence-section-heading-gap` | 12px | Espace entre l’en-tête extérieur et la surface de section |
| `--cadence-section-gap` | 32px | Espace entre deux sections principales ; appliquer une seule fois |
| `--cadence-shadow-section` | `0 0 2px 0 rgba(0, 0, 0, 0.10), 0 2px 10px 0 rgba(0, 0, 0, 0.05)` | Ombre au repos des sections de page, commune à tous les produits Cadence |
| `--cadence-shadow-sm` | ombre 1–3px | Champs au repos |
| `--cadence-shadow-md` | ombre diffuse 12px | Champs au survol |
| `--cadence-shadow-lg` | ombre portée 10–15px | Menus déroulants |
| `--cadence-shadow-raised` | ombre portée 16–32px, vers le bas | Carte interactive soulevée au survol (`Card`) |
| `--cadence-shadow-overlay` | ombre 20–60px | Modale |
| `--cadence-focus-color` | `#1a3e45` | Couleur de l'anneau de focus (appliqué aux boutons, `Link`, `DataTable`, calendriers) |
| `--cadence-focus-ring` | liseré blanc 2px + anneau 2px | Anneau de focus `box-shadow` (`:focus-visible`) — appliqué aux nouveaux composants et aux boutons |
| `--cadence-z-sticky` | `100` | Éléments collants (`position: sticky`) dans le contenu |
| `--cadence-z-popover` | `100` | Popovers et bulles ancrés (DatePicker, TimePicker, `Popover`, infobulles, tooltips des graphiques) |
| `--cadence-z-dropdown` | `200` | Menus déroulants et menus en portail (Dropdown, Autocomplete, ActionMenu, ExportMenu, ColumnManager) |
| `--cadence-z-modal` | `1000` | Modale, `Drawer` et leur voile |
| `--cadence-z-toast` | `1100` | Pile du `Toaster`, au-dessus des modales |

La story **Foundation/Tokens** affiche tous ces tokens à partir des variables CSS.

### Règles

- ✅ Dans du code applicatif, référencer les tokens (`color: var(--cadence-color-primary)`) plutôt que les hex en dur.
- ✅ Statut dans du code applicatif → `--cadence-status-*` ; jamais un hex.
- ✅ Couches : `zIndex: "var(--cadence-z-toast)"` pour un toast, `var(--cadence-z-sticky)` pour un élément collant — pas de valeur inventée.
- ✅ Échelle des couches, de bas en haut : contenu → `sticky` = `popover` (100) → `dropdown` (200) → `modal` (1000) → `toast` (1100). Un `z-index` de 0 à 2 reste permis pour l'empilement interne d'un composant (pastille, flèche) ; toute couche de page passe par un token (un test le vérifie). Un menu ou un `Popover` en portail ouvert depuis une `Modal` ou un `Drawer` passe automatiquement juste au-dessus de la surcouche.
- ✅ Toute zone qui défile (composant ou app) prend la classe **`cadence-scrollbar`** : barre fine sans fond, curseur arrondi en retrait qui fonce au survol (déjà posée sur `AppLayout`, `DataTable`, le corps de `Modal` et le menu d'`Autocomplete`). La `Sidebar` garde sa barre claire sur fond sombre.
- ✅ Pour créer un nouveau composant, piocher dans `tokens.css` ; n'ajouter un token que si la valeur a vocation à être partagée.
- ✅ Texte secondaire (description, aide, onglet inactif, libellé d'axe) : `--cadence-color-text-secondary`, AA sur tous les fonds clairs. `--cadence-color-icon-muted` est réservé aux icônes (`icon-muted-text-usage.test.ts`).
- ✅ Dans le CSS d'un composant, couleurs et rayons passent **toujours** par un token (`var(--cadence-…, repli)`). Seules exceptions : les ombres décoratives propres à un composant (reliefs `box-shadow` internes) et les micro-rayons de 5px ou moins. Un test (`css-tokens.test.ts`) le vérifie.
- ❌ Ne pas redéfinir les `--cadence-*` au niveau d'un composant — ce sont des valeurs globales du thème.

---

## Typographie

Trois polices, chacune réservée à un rôle précis. Ne pas les substituer.

| Police | Token | Rôle |
|---|---|---|
| **ABC Diatype** (repli Inter) | `--cadence-font-sans` | Texte d'interface : labels, valeurs, boutons, navigation, messages |
| **Uxum Grotesque** (fallback Space Grotesk) | `--cadence-font-display` | Titres de page (`<h1>`) et nom produit |
| **Spline Sans Mono** | `--cadence-font-mono` | Valeurs numériques et données chiffrées |

**ABC Diatype** (commerciale) est chargée via `@font-face` (`tokens.css`), ses `woff2` servis depuis `/fonts`. **Inter** reste chargée (Google Fonts) et en tête de repli : revenir à Inter ne demande que de la remettre en premier dans `--cadence-font-sans`.

### Règles

- ✅ Utiliser le token `--cadence-font-sans` (ABC Diatype) pour tout texte d'interface — c'est déjà la police par défaut de tous les composants.
- ✅ Utiliser le token `--cadence-font-display` pour les `<h1>` de page.
- ✅ Utiliser `--cadence-font-mono` uniquement pour les valeurs numériques affichées (codes, identifiants, axes de graphiques).
- ❌ Ne jamais utiliser une police système ou une autre police web.
- ❌ Ne pas utiliser la display pour du texte courant — réservée aux titres.
- ❌ Ne pas utiliser la mono pour des labels ou du texte d'interface.

```tsx
// ✅ Titre de page : PageHeader (h1 en display 22px, sous-titre, actions, sticky)
<PageHeader title="Titre de page" subtitle="Dernière mise à jour le 21/10/2026" actions={…} />
```

---

## Intention → composant

Table de correspondance : ce que l'interface doit faire → le composant à utiliser. **Toujours consulter cette table avant d'écrire du code custom.**

| Intention | Composant | Ne pas confondre avec |
|---|---|---|
| Période, jours habituels et exceptions de circulation | `ServiceCalendar` | `DateRangePicker` (période seule) |
| Succession des arrêts et horaires d’une course | `RouteStopList` | `Stepper` (étapes d’un processus) |
| Horaires et exploitation d'une ligne sur une journée (fréquence, croisements, théorique / réalisé) | `TimeSpaceDiagram` | `Timeline` (plages par entité) ; `RouteStopList` (une seule course) |
| Positions temps réel des véhicules sur une ligne (supervision) | `LineDiagram` | `RouteStopList` (une course, horaires) ; une carte (géographie) |
| Examiner les erreurs d’un import (rapport qualité) | Pattern **Rapport qualité** (`DatasetHealth`, `FilterBar`, `DataTable`, `ValidationIssueInspector` en `Drawer`) | `ErrorSummary` (erreurs des champs d’un formulaire) |
| Bilan de validation d'un jeu de données (verdict, erreurs, avertissements, date) | `DatasetHealth` | `Card` (KPI chiffré) ; `InlineAlert` (message sans compteurs) ; `DataFreshness` (âge d'une donnée, pas un verdict) |
| Détail d'un constat de validation (localisation, règle, correction) | `ValidationIssueInspector` (dans un `Drawer` ou une section) | `DescriptionList` assemblée à la main |
| Action principale de la vue (une seule) | `PrimaryButton` | `GhostButton` (secondaire) |
| Action secondaire, action inline de formulaire | `GhostButton` | `Link` (3e action) |
| 3e action d'un groupe, action dans une phrase | `Link hideArrow` | `GhostButton` (action secondaire) |
| Navigation inline, action tertiaire discrète | `Link` | — |
| Petite action par ligne de liste (icône) | `GhostButton size="sm"` icône seule (`icon` + `aria-label`, infobulle intégrée) | `PrimaryButton` (trop appuyé dans une ligne) |
| Action avec libellé dans une ligne de `DataTable` (« Consulter ») | `PrimaryButton outline size="sm"` | `GhostButton` avec libellé (se lit comme du texte dans la ligne) |
| Saisie de texte libre (1 ligne) | `TextInput` | — |
| Saisie de texte long (multi-lignes) | `TextArea` | — |
| Valeur numérique avec +/− | `CounterInput` | `TextInput type="number"` (interdit) |
| Couleur d'une ligne (GTFS `route_color`) | `ColorField` | `input type="color"` nu (pas de validation ni de contraste) |
| Choix dans une liste courte (≥ 3 options, sans recherche) | `Dropdown` | `Autocomplete` (longue liste à filtrer) |
| Période, date ou choix dans un dashboard | `DateRangePicker` / `DatePicker` / `Dropdown` avec `variant="button"` (à privilégier) | Variante champ (formulaire) ; dans une `FilterBar`, toujours la variante bouton ; `PrimaryButton outline` (action, pas de valeur) |
| Choix dans une longue liste avec recherche au clavier | `Autocomplete` | `Dropdown` (liste courte) |
| Choix exclusif 2-4 options **dans un formulaire** | `SegmentedControl` | — |
| Bascule entre vues / modes d'affichage | `SegmentedControl` | `Tab` (navigation de page) |
| Navigation entre vues d'une même page (niveau page) | `Tab` | `SegmentedControl`, `SecondaryTab` (sous-niveau) |
| Sous-navigation dans un parcours à plusieurs niveaux | `SecondaryTab` sous `SegmentedControl` | Toujours dans `TabList level="secondary"` |
| Date (avec ou sans heure) | `DatePicker` | — |
| Période (début → fin), avec préréglages | `DateRangePicker` | deux `DatePicker` côte à côte |
| Option booléenne dans un formulaire (validée à la soumission) | `Checkbox` | `Toggle` |
| Activation/désactivation à effet immédiat | `Toggle` | `Checkbox` |
| Choix exclusif 2-5 options courtes | `RadioButton` | — |
| Choix exclusif avec icône + description | `RichRadioButton` | `RichCheckbox` (sélection multiple) |
| Sélection multiple avec icône + description | `RichCheckbox` | `RichRadioButton` (choix exclusif) |
| Étiquette d'information neutre (catégorie, tag, code) | `Badge` | `Indicator` (qui porte un état) |
| Chip amovible (filtre actif « Ligne 38 × », « Tout effacer ») | `Badge dismissible` ; sous une liste, `FilterBar` (`activeFilters` + `onRemoveFilter`) | un composant `Tag` dédié (doublon inutile) |
| État ou statut avec picto + couleur sémantique | `Indicator` | `Badge` (purement informatif) |
| État d'une source de données (disponibilité, dernière observation, dernière réussite, erreur, fraîcheur) | `DataSourceStatus` | `Indicator` seul (disponibilité sans dates) ; `DataFreshness` seul (âge d'une donnée) |
| Fraîcheur d'une donnée (dernière mise à jour, péremption) | `DataFreshness` | `Indicator` (statut métier, pas temporel) ; `ActivityFeed` (journal d'événements horodatés) |
| En-tête de page (titre, sous-titre, actions), collé en haut au défilement | `PageHeader` | `<h1>` à la main |
| Section de page (titre `h2`, description, actions) | `PageSection` | un `<section>` + `<h2>` en style inline |
| Section d'écran en carte (filet sous l'en-tête, liste ou tableau bord à bord) | `PageSection surface="card"` | un padding et un filet ajoutés à `.page-section__head` depuis l'app ; une `Card` (pas de titre `h2` ni d'actions d'en-tête) |
| Rangée de champs à largeurs égales, alignés par le bas | `FieldRow` | `<div style="display:flex;gap:12">` + `flex:1` à la main |
| Barre d'actions de formulaire (à droite, ordre `Link` → `Ghost` → `Primary`) | `FormActions` | un `<div>` `justify-content:flex-end` à la main |
| Grille fluide de cartes / graphiques | `CardGrid` | un `<div style="display:grid;…auto-fill">` à la main |
| Indicateur chiffré + évolution (haut de tableau de bord) | `Card` (`value`, `delta`, `trend`) | `Indicator` (statut sans valeur) |
| Proposer une action dans une carte (titre + description + bouton) | `Card` (`actionLabel`, `onAction`) | `TableCard` (élément de liste) |
| Liste de gros volume (> 50 lignes, colonnes de données) | `DataTable` | `TableCard` (liste de cartes riches, peu nombreuses) |
| Élément de liste riche, peu nombreux (header + colonnes) | `TableCard` | `DataTable` (gros volumes) ; un `<table>` HTML custom |
| Ligne d'en-têtes de colonnes avec tri (au-dessus de `TableCard`) | `TableHeader` | en-têtes de `DataTable` (intégrés) |
| Actions groupées sur une sélection multiple (`DataTable selectable`, liste de `TableCard`) | `BulkActionBar` | une `<div>` de boutons au-dessus de la liste, assemblée à la main |
| Navigation dans un résultat paginé | `Pagination` | — |
| Choisir la catégorie affichée par une liste ou un tableau (tuiles picto + libellé + effectif, une seule active) | `CategoryFilter` | `Card` (KPI ou action, trop lourde) ; `SegmentedControl` (2-4 options sans effectif) ; `ModeFilter` (modes de transport, multi-sélection) ; `TabList` (navigation entre vues) |
| Recherche + filtres rapides + filtres actifs au-dessus d'une liste | `FilterBar` | un `TextInput` + `Badge` assemblés à la main |
| Recherche seule (en-tête de dashboard, barre d'outils) | `SearchInput` | `TextInput` (champ de formulaire, 40px) |
| Dialogue bloquant (confirmation, formulaire court) | `Modal` | `AlertToast` (non bloquant) ; `Drawer` (non bloquant, détail) |
| Détail d'un élément sans quitter la liste | `Drawer` | `Modal` (dialogue bloquant) |
| Formulaire long (création, édition) sans quitter la liste | `Drawer width="lg"` + `onSubmit` | `Modal` (formulaire court, bloquant) |
| Regrouper plus de 4 actions d'une ligne | `ActionMenu` | `GhostButton` icône seule (≤ 4 actions inline) |
| Chargement : réserver la place du contenu | `Skeleton` | spinner plein écran |
| Liste vide, sans résultat, ou erreur de chargement | `EmptyState` | état vide bricolé à la main |
| Notification temporaire non bloquante | `useToast()` + `Toaster` | `Modal` (bloquant) ; `AlertToast` seul (carte brute, hors pile) |
| Info contextuelle au survol ou au focus | `Tooltip` / `TooltipTrigger` | `Modal` ; `Popover` (contenu interactif) |
| Aide riche, mini-formulaire ou détail ancré à un bouton | `Popover` | `Tooltip` (lecture seule, sans focus) ; `Modal` (bloquant) ; `Drawer` (détail long) |
| Squelette d'application (navigation + contenu de page) | `AppLayout` | — |
| Navigation principale (sections de l'app) | `Sidebar` | — |
| Sélecteur de périmètre + profil utilisateur | `Sidebar` (`scope`, `user`) | — |
| Fil d'Ariane | `Breadcrumbs` | — |
| Arborescence dépliable (réseau → ligne → parcours, dépôt → véhicules) | `TreeView` | `Sidebar` (navigation fixe de l'app) ; `Accordion` (sections de contenu, sans hiérarchie profonde) ; `DataTable` (grand volume plat) |
| Sélecteur de contexte dans le breadcrumb (produit/module) | `Dropdown` `variant="button"` | `Dropdown` `variant="field"` (formulaires) |
| Identité utilisateur (initiales / photo) | `Avatar` | — |
| Évolution dans le temps (retards, ponctualité, volumes) | `LineChart` | `BarChart` (comparaison de catégories) |
| Motif jour × heure, ligne × jour | `Heatmap` | `LineChart` (une seule dimension temporelle) |
| Flux entre arrêts, zones ou lignes (matrice origine-destination) | `Heatmap showTotals sort="desc"` | `SankeyChart` (chemin des volumes) |
| Chemin des volumes entre étapes (origine → destination, correspondances) | `SankeyChart` | `Heatmap showTotals` (valeurs croisées) ; `Treemap` (hiérarchie, pas des flux) |
| Une valeur par jour sur une année (ponctualité quotidienne, jours de grève, jours de circulation) | `CalendarHeatmap` | `ServiceCalendar` (saisie des jours de circulation) ; `LineChart` (tendance, pas le motif hebdomadaire) |
| Classement (lignes les plus impactées) | `BarList` | `BarChart orientation="horizontal"` (plusieurs séries) |
| Comparaison de catégories (barres empilées / groupées) | `BarChart` | `BarList` (classement à une valeur) |
| Histogramme de navigation : clic sur une barre pour ouvrir le détail ou filtrer une liste | `BarChart onDatumClick` (+ `selectedCategory` pour le filtre actif) | des `<button>` ou `Link` par barre faits main (pas de tooltip, pas de graphique accessible) |
| Plages sur un axe temps (perturbations, amplitudes, travaux) | `Timeline` | `LineChart` (séries continues) ; `ActivityFeed` (événements ponctuels) ; `ServiceCalendar` (jours) ; `JourneyTimeline` (trajets) |
| Comparer des itinéraires sur une fenêtre de départ (marche, transport, correspondances) | `JourneyTimeline` | `Timeline` (plages par entité) ; `RouteStopList` (arrêts d'une seule ligne) |
| Mini-courbe dans une carte d'indicateur | `Card trend` (ou `LineChart compact`) | — |
| Valeur vs capacité ou vs objectif dans une cellule de `DataTable` (charge, réalisation de l'offre, km) | `Meter size="sm"` (`thresholds`, `target`, `segments`) | `BulletChart` (graphique complet, une ligne par indicateur) |
| Tendance dans une cellule de `DataTable` ou une ligne de liste | `Sparkline` | `LineChart compact` (axe, tooltip, seuils) ; `Card trend` (déjà intégré à la carte) |
| Identité de ligne (code et couleur GTFS) | `LineBadge` | `Badge` (étiquette générique) |
| Nom, commune et identifiant d'arrêt | `StopLabel` | — |
| Pictogramme d'un mode de transport (rempli : métro, vélo, marche, voiture…) | `ModeIcon` | `Icons` (icônes d'interface en trait) ; `LineBadge` (code + couleur d'une ligne) |
| Filtrer un tableau de bord / une liste par mode de transport ou par ligne avec son badge | `ModeFilter` (`modes` ou `items`) | `SegmentedControl` (choix exclusif 2-4, sans picto) ; `Dropdown` (menu, 1 valeur) ; `FilterBar` (recherche + filtres génériques) |
| Choisir le périmètre réseau d'une perturbation (réseaux, lignes) | `DisruptionScopePicker` | `Autocomplete multiple` (liste plate, sans hiérarchie) ; `TreeView` seul (sans champ, résumé ni chips) |
| Identifiant technique à copier (arrêt, course, véhicule) | `CopyableText` | `StopLabel` (nom d'arrêt, identifiant en simple mention) ; `TextInput readOnly` |
| Message persistant dans la page | `InlineAlert` | `Toaster` (notification éphémère) |
| Sections dépliables | `Accordion` | `TabList` (navigation) |
| Étapes d'un import ou formulaire | `Stepper` | `ProgressBar` (avancement d'un traitement) |
| Déposer/sélectionner des fichiers | `FileUpload` | L'app assure l'envoi et la validation métier |
| Progression déterminée ou indéterminée | `ProgressBar` | `Gauge`, `Meter` (mesure, pas un traitement) |
| Proportion unique, objectif | `Gauge` | `Card` (KPI chiffré) |
| Valeur vs capacité en barre (taux de charge, parking relais, quota) | `Meter` | `ProgressBar` (avancement d'un traitement) ; `Gauge` (KPI mis en avant) |
| Décomposition d'un total en barre (km commerciaux / haut-le-pied / annulés) | `Meter segments` | `BarChart` empilé (plusieurs catégories) ; `DonutChart` (parts sans capacité) |
| Performance vs objectif contractuel, plages malus / bonus (ponctualité, régularité, réalisation de l'offre) | `BulletChart` | `Gauge` (un seul KPI mis en avant) ; `Meter` (valeur vs capacité, sans plages) |
| Dispersion d'une mesure par groupe (temps de parcours par ligne ou par créneau) | `BoxPlot` | `Histogram` (une seule distribution, détaillée) |
| Corrélation entre deux mesures, anomalies (charge vs retard) | `ScatterChart` | `ComboChart` (deux mesures dans le temps) |
| Poids de chaque élément dans une hiérarchie (réseau → mode → ligne) | `Treemap` | `DonutChart` (un niveau, ≤ 6 parts) ; `BarList` (valeurs proches à comparer) |
| Distribution d'une mesure (retards, temps de parcours, intervalles entre passages) | `Histogram` | `BarChart` (catégories nommées, pas des classes de valeurs) |
| Volume et taux sur une même période (fréquentation + ponctualité, offre + charge) | `ComboChart` | deux graphiques séparés ; `LineChart` (une seule unité) |
| Comparer à la période précédente (N vs N-1, semaine type) | `LineChart` / `BarChart` avec une série `reference: true` | deux couleurs de palette (la référence se lirait comme une série de plus) |
| Évolution sur un service de nuit, au-delà de minuit (heures de service jusqu'à 47:59) | `LineChart serviceTime` ; `Histogram serviceTime` (distribution d'heures) ; `BarChart` avec des catégories « 24 h », « 25 h » | des `Date` coupées à minuit (deux jours calendaires pour un seul jour de service) |
| Plusieurs graphiques d'une page à lire ensemble au même instant | `ChartSyncGroup` autour des `LineChart` / `BarChart` | des tooltips ouverts en parallèle |
| Même mesure pour de nombreux éléments, formes à comparer (ponctualité de chaque ligne) | `SmallMultiples` | un `LineChart` à 10 séries (illisible) ; `Sparkline` en tableau (sans échelle commune visible) |
| Choisir une période en la traçant sur le graphique (zoom) | `LineChart onRangeSelect` + `DateRangePicker` | — |
| Valeur par paliers (offre par tranche horaire, capacité, tarifs) | `LineChart curve="step"` | `LineChart` lissé (suggère une variation continue) |
| Parts d'un total (≤ 6 : parts modales, état du parc, causes) | `DonutChart` | `BarList` (classement, plus de 6 éléments) ; un camembert (non fourni) |
| Choisir portée et format d'export | `ExportMenu` | L'app fabrique le fichier |
| Masquer/réordonner les colonnes | `ColumnManager` | `DataTable` applique l'état |
| Heure seule, y compris service après minuit | `TimePicker` | `DatePicker withTime` (date calendaire + heure) |
| Résumé d'erreurs avec accès aux champs | `ErrorSummary` | `InlineAlert` (message sans navigation de formulaire) |
| Métadonnées label/valeur d'un détail ou d'une synthèse | `DescriptionList` | `DataTable` (plusieurs lignes d'un même type) |
| Historique d'événements datés et attribués | `ActivityFeed` | `Timeline` (périodes sur une échelle de temps) |
| Périmètre d'export réseau/lignes, inline ou popover, parents regroupés | `ScopePicker` | `DisruptionScopePicker` reste compatible pour les anciens écrans |
| Synthèse de quelques éléments cliquables, notifications non lues | `SummaryList` | `ActivityFeed` pour l'historique chronologique sans interaction |
| Bandeau sombre avec état, fraîcheur et KPI | `PageHero` | Partir du pattern Analyse ou Supervision ; `headingLevel={2}` sous un PageHeader |
| Remplacement d'un secret existant sans le révéler | `SecretField` | Ne jamais passer le secret existant au navigateur |
| Comparaison de valeurs ou de versions | `ValueComparison` | `DescriptionList` pour une seule version |
| Présence binaire par exécution | `PresenceStrip` | `Sparkline` pour une mesure continue |
| Journal technique ou extrait de fichier | `LogViewer` | `ValidationIssueInspector` pour expliquer un constat métier |
| Icône seule | `Icons` | — |

---

## Layout & spacing

### Échelle d'espacement

Toutes les distances utilisent cette échelle (px) : **4, 8, 12, 16, 20, 24, 32, 48**.

| Contexte | Valeur |
|---|---|
| Gap entre boutons d'un groupe | `8` |
| Gap entre actions d'icône (`GhostButton` icône seule) | `8` |
| Gap entre cards d'une liste | `8` |
| Gap entre champs d'un formulaire | `20` |
| Gap entre champs côte à côte (même ligne) | `12` |
| Gap entre sections d'un formulaire | `32` |
| Padding de page (zone de contenu) | `24px 32px` (appliqué par `AppLayout`) |
| Padding interne des cellules de colonnes | `16` |

### Constantes de layout

```tsx
const SIDEBAR_WIDTH = 220;            // largeur de la Sidebar dépliée (fixée par sidebar.css)
const SIDEBAR_WIDTH_COLLAPSED = 80;   // largeur de la Sidebar repliée (fixée par sidebar.css)
```

Ces valeurs ne sont pas des tokens CSS : ce sont les largeurs fixées par `sidebar.css`. `AppLayout` en tient compte tout seul (Sidebar et contenu dans la même ligne flex) : aucun décalage à calculer côté app.

### Règles

- ✅ Le layout (flex, grid, gap, margins) se fait en style inline ou CSS applicatif — c'est le seul CSS custom autorisé.
- ✅ La zone de contenu n'a pas de `max-width` : elle occupe toute la largeur du conteneur d'`AppLayout`.
- ✅ Largeurs de contenu : les formulaires sont limités à `max-width: 720px` (à l'intérieur de la zone de contenu) ; les listes, tableaux et tableaux de bord prennent toute la largeur.
- ❌ Pas de largeur fixe en px sur les conteneurs de page (grille de `Card`, graphiques, `TableCard`, `DataTable`) : ils doivent s'étendre quand la Sidebar se replie.
- ❌ Ne pas inventer de valeurs d'espacement hors échelle (pas de `gap: 7px` ou `padding: 13px`).

### Hauteurs de contrôle et alignement sur une rangée

Deux tokens fixent la hauteur extérieure (bordure comprise) des contrôles, pour qu'ils s'alignent au pixel sur une même rangée. Les composants les appliquent eux-mêmes : ne jamais redéfinir leur hauteur.

| Token | Valeur | Groupe | Composants |
|---|---|---|---|
| `--cadence-control-height-compact` | `29px` | **Compact** : en-tête de dashboard, barre d'outils, `FilterBar`, barre de sélection | `PrimaryButton` / `GhostButton` `size="sm"` (plein, `outline`, icône seule), `SearchInput`, `Dropdown` / `DatePicker` / `DateRangePicker` / `TimePicker` en `variant="button"`, déclencheurs d'`ActionMenu`, `ExportMenu`, `ColumnManager`, `Popover` (boutons `sm`), `SegmentedControl size="sm"` (échelle de `Timeline`, bascule de vue d'un dashboard) |
| `--cadence-control-height-field` | `40px` | **Champ** : formulaire, rangée de critères détaillés | `TextInput`, `Dropdown`, `DatePicker`, `DateRangePicker`, `TimePicker` et `CounterInput` en variante champ, `ColorField`, `DisruptionScopePicker`, `Autocomplete` (hauteur minimale), `SegmentedControl` (`size="md"`, défaut) |

Principe de composition :

- ✅ Une rangée ne mélange pas les groupes : que du compact (`SearchInput` + boutons `sm` + filtres `variant="button"`), ou que des champs (`TextInput` + `SegmentedControl` + `Dropdown`…).
- ✅ Rangée compacte : `alignItems: "center"`, `gap: 8`.
- ✅ Rangée de champs : `alignItems: "flex-end"`, `gap: 12`. Les champs portent leur libellé au-dessus ; le `SegmentedControl` n'en a pas et s'aligne ainsi sur le bas des champs. Un message d'aide (`helperText`) sous un champ décale cet alignement : le réserver à une rangée verticale ou le placer sous la rangée.
- ❌ Pas de `SearchInput` (29px) à côté d'un `TextInput` (40px), ni de bouton `sm` à côté d'un champ libellé : choisir le gabarit de la rangée.
- ❌ Pas de `height` ou de `padding` vertical en style inline sur ces composants pour « rattraper » un alignement.

Exceptions, hors de ces deux gabarits :

- `TextArea` et `Autocomplete multiple` avec plusieurs valeurs : hauteur variable (l'`Autocomplete` part de 40px et s'agrandit).
- `PrimaryButton` / `GhostButton` `size="md"` (34px) : action de début de page ou de fin de formulaire, posée sur sa propre rangée. **Exception** — une **action inline à côté d'un seul champ** (ex. « Vérifier » après un identifiant) est permise : la rangée aligne le champ et le bouton par le bas (`align-items: flex-end`). Ne pas aligner un bouton `md` sur une **grille de plusieurs champs**.
- Contrôles de formulaire sans boîte (`Checkbox`, `Toggle`, `RadioButton`) et cartes riches (`RichCheckbox`, `RichRadioButton`) : hauteur de leur contenu.

```tsx
// Rangée compacte — en-tête de dashboard : SearchInput + PrimaryButton (29px)
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <SearchInput value={query} onChange={setQuery} aria-label="Rechercher un token" placeholder="Rechercher un token…" />
  <Dropdown variant="button" aria-label="Catégorie" options={categories} value={category} onChange={setCategory} />
  <PrimaryButton size="sm" iconStart="plus" label="Ajouter un token" />
</div>

// Rangée de champs — formulaire : TextInput + SegmentedControl (40px), alignés par le bas
<div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
  <TextInput label="Nom de la vue" value={name} onChange={(e) => setName(e.target.value)} />
  <SegmentedControl
    aria-label="Densité"
    options={[{ value: "comfortable", label: "Confortable" }, { value: "compact", label: "Compacte" }]}
    value={density}
    onChange={setDensity}
  />
</div>
```

La story **Foundation/Hauteurs de contrôle** montre ces rangées et vérifie les hauteurs mesurées.

### Composition des panneaux sur une page formulaire

Une page de saisie se lit et se remplit en **largeur pleine et lecture descendante**. Placer un panneau de synthèse à droite du formulaire réduit mécaniquement la largeur des champs, casse l'alignement des lignes à 2 colonnes et dégrade la lisibilité des libellés longs — l'espace gagné par la synthèse est pris au cœur de la tâche principale.

La règle sépare deux niveaux de mise en page :

1. **Niveau page** — les grands panneaux fonctionnels (panneau de formulaire, panneau de synthèse / preview / vérification) s'empilent verticalement. Le formulaire occupe sa largeur de lecture optimale ; la synthèse vient en dessous, une fois la saisie posée.
2. **Niveau section** — à l'intérieur d'une section de formulaire, le multi-colonnes est non seulement permis mais recommandé pour les champs courts et liés (dates début/fin, type/cause, compteurs, sélecteurs).

Le multi-colonnes est un outil de **densité locale**, pas un outil de **découpage de page**.

**Panneaux de page — empilement vertical**

- ✅ Sur une page orientée formulaire, les **panneaux de premier niveau** (formulaire, synthèse / preview / vérification) s'empilent **verticalement**, sur une seule colonne.
- ✅ Le **multi-colonnes reste autorisé à l'intérieur** d'une section de formulaire : lignes de champs sur 2 colonnes, groupes de cards, compteurs, sélecteurs.
- ❌ Ne jamais placer deux panneaux de premier niveau **côte à côte** (formulaire à gauche, synthèse à droite) — cela ampute la largeur utile du formulaire.
- ❌ Ne pas transformer un panneau de synthèse en colonne latérale (`sidebar` de droite) sur une page de saisie.

**Test pour distinguer panneau et sous-bloc :** un bloc qui possède son propre titre de niveau page/section **et** sa propre finalité (saisir / vérifier) est un *panneau de premier niveau* → il s'empile. Un bloc qui n'est qu'un regroupement de champs *à l'intérieur* d'une section est un *sous-bloc* → il peut passer en colonnes. Critère mécanique : le conteneur de page est `flexDirection: "column"` ; le seul `flexDirection: "row"` autorisé est **à l'intérieur** d'une `<section>`.

---

## Boutons

### Trois niveaux d'action

| Niveau | Composant | Quand l'utiliser | Exemple |
|---|---|---|---|
| 1 — principal | `PrimaryButton` | L'action principale de la vue. **Un seul par vue** (une modale, un popover ou un toast comptent comme une vue). | « Créer », « Enregistrer », « Appliquer » |
| 2 — secondaire | `GhostButton` | Les actions secondaires : sans fond ni bordure au repos, voile au survol. Plusieurs autorisés. | « Annuler », « Exporter », « Réinitialiser » |
| 2 — secondaire (dashboard) | `PrimaryButton outline` | Les actions secondaires d'un **dashboard** (en-tête de page, barre au-dessus d'une liste) : contour visible, repérable d'un coup d'œil sur une page chargée. | « Exporter », « Filtres », « Paramètres » |
| 3 — tertiaire | `Link hideArrow` | La 3e action d'un groupe, ou une action dans une phrase. | « Enregistrer comme brouillon » |
| Par ligne | `GhostButton size="sm"` icône seule | Petite action icône dans une ligne de liste (`TableCard`), infobulle au survol. | Dupliquer, modifier, supprimer |
| Par ligne, avec libellé | `PrimaryButton outline size="sm"` | Action textuelle dans une cellule de `DataTable` : le contour la détache des valeurs de la ligne. | « Consulter », « Ouvrir » |

`PrimaryButton` (plein ou `outline`) et `GhostButton` ont **la même API et les mêmes dimensions** (voir la [Référence API](#primarybutton--ghostbutton)) : seul le rendu change, ce qui les aligne au pixel dans un groupe.

**Ghost ou Outline ?** `GhostButton` par défaut (formulaires, popovers, barres d'outils, barres de sélection). `PrimaryButton outline` dans un dashboard, quand les actions secondaires doivent rester visibles au repos à côté de l'action de création, et pour l'action secondaire du pied d'une `Modal` (« Annuler » face à la décision).

### Règles

- ✅ Un seul `PrimaryButton` par vue.
- ✅ Croix de fermeture d'une surcouche ou d'un bandeau (`Modal`, `Drawer`, `Popover`, `InlineAlert`, `AlertToast`) : toujours la même, un `GhostButton size="sm"` icône `x-close` **sans infobulle** (le pictogramme suffit), nommé « Fermer » par `aria-label`. Les composants la fournissent : ne pas en recréer une dans `children`. Même croix sans infobulle pour retirer un fichier de `FileUpload` (nom précis : « Retirer rapport.pdf ») et pour effacer un `SearchInput` (ramenée à 21px dans le champ) ; la petite croix de `Badge dismissible` n'a pas d'infobulle non plus.
- ✅ Dans un groupe, l'engagement croît de gauche à droite : `Link` → `GhostButton` → `PrimaryButton`. **Ghost à gauche, Primary à droite.**
- ✅ Plusieurs `GhostButton` (ou `PrimaryButton outline` en dashboard) sont autorisés.
- ✅ Ne pas mélanger Ghost et Outline dans un même groupe : un dashboard prend Outline, le reste Ghost.
- ✅ Les boutons d'un même groupe ont la même `size`.
- ✅ Un `GhostButton` isolé porte une icône (`iconStart`) ou se trouve à côté d'un `PrimaryButton` : seul et sans icône, il se lit comme un simple texte.
- ✅ Icône seule : `icon` + `aria-label` (obligatoire, le typage le vérifie).
- ✅ Action en cours (soumission, export) : `loading` — clics ignorés, spinner, largeur conservée.
- ❌ Jamais deux `PrimaryButton` côte à côte.
- ❌ Pas de `Link` pour une action secondaire hors de la 3e position d'un groupe ou d'une phrase : utiliser `GhostButton`.
- ❌ Ne pas utiliser `PrimaryButton` pour de la navigation : `Link href`.
- ❌ Ne pas désactiver un bouton sans `TooltipTrigger` explicatif.
- ❌ `PrimaryButton outline` n'est pas une action principale : la vue garde un seul `PrimaryButton` plein.
- ❌ Pas de bouton bleu plein : `--cadence-color-accent` est réservé aux états (sélection, élément actif), jamais à une action.

### Taille selon le contexte

La taille ne porte **pas de sens** : elle suit le contexte, pas l'importance de l'action (l'importance, c'est le niveau).

| `size` | Hauteur | Texte | Contextes |
|---|---|---|---|
| `md` (défaut) | 34px | 13px | **Actions principales** : en début de page (page liste, page de détail) et en fin de formulaire. Aussi : modale, empty state, action inline de formulaire |
| `sm` | 29px | 11px | **Actions plus discrètes** : **tout l'en-tête de dashboard**, action principale comprise (`PrimaryButton size="sm"` et `PrimaryButton outline size="sm"`) ; tableau, barre d'outils, barre de sélection, popover (`DatePicker`, `DateRangePicker`), toast, `FilterBar` |

Il n'y a pas de grande taille : une action importante se distingue par son niveau (`PrimaryButton`), pas par sa taille. Les textes d'action restent entre **11 et 13px** (`Link` : 11 / 12 / 13px).

### Exemples

**Fin de formulaire — les trois niveaux**

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
  <Link hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
  <GhostButton label="Réinitialiser" onClick={onReset} />
  <PrimaryButton label="Créer le scénario" onClick={onSubmit} loading={isSaving} />
</div>
```

**Dashboard — tout l'en-tête en `sm` : actions en `outline`, action principale pleine**

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <TabList aria-label="État des scénarios">
    <Tab label="En cours" variant="active" onClick={…} />
    <Tab label="À venir" onClick={…} />
  </TabList>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {/* En-tête de dashboard : tous les boutons en sm, action principale comprise */}
    <PrimaryButton size="sm" outline iconStart="download-02" label="Exporter" onClick={onExport} />
    <PrimaryButton size="sm" outline iconEnd="chevron-down" label="Filtres" onClick={onOpenFilters} />
    <PrimaryButton size="sm" iconStart="plus" label="Créer un scénario" onClick={onCreate} />
  </div>
</div>
```

**Dashboard — sélecteurs de valeur en variante bouton**

Une période, une date ou un choix dans une liste se placent dans l'en-tête avec `variant="button"` : même gabarit que `PrimaryButton outline size="sm"`, nom accessible donné par `aria-label`.

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <DateRangePicker variant="button" aria-label="Période" value={range} onChange={setRange} />
  <Dropdown variant="button" aria-label="Devise" options={devises} value={devise} onChange={setDevise} />
  <PrimaryButton size="sm" outline iconStart="download-02" label="Exporter" onClick={onExport} />
</div>
```

- ✅ **Dans un dashboard, privilégier la variante bouton** pour tout sélecteur de valeur (période, date, choix dans une liste) : il s'aligne sur les boutons `sm` de l'en-tête et se lit comme une commande de la vue, pas comme un champ à remplir.
- ✅ Variante bouton : sans `label` visible, toujours un `aria-label` (« Période », « Devise ») ; le nom annoncé devient « Période : 7 derniers jours ».
- ❌ Pas de variante bouton dans un formulaire : le champ (`variant="field"`, défaut) avec son `label` reste la règle.

**Formulaire — action inline à côté d'un champ (`GhostButton`)**

```tsx
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  <TextInput label="Identifiant d'arrêt" placeholder="stop_area:IDFM:…" />
  <GhostButton iconStart="search-md" label="Vérifier" onClick={onCheck} />
</div>

<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  <Dropdown label="Type d'objet" options={types} value={type} onChange={setType} />
  <GhostButton iconStart="plus" label="Ajouter" onClick={onAdd} />
</div>
```

**Liste — barre d'actions groupées (`BulkActionBar`), `size="sm"`**

```tsx
// Juste après la liste ; masquée tant que rien n'est sélectionné
<BulkActionBar count={selectedIds.length}>
  <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" onClick={onDuplicate} />
  <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Supprimer" onClick={onDelete} />
</BulkActionBar>
```

**Actions par ligne** — `GhostButton size="sm"` icône seule, dans le header de chaque `TableCard`. L'`aria-label` s'affiche en infobulle au survol et au focus clavier :

```tsx
<>
  <GhostButton size="sm" icon="copy-01" aria-label="Dupliquer" onClick={onDuplicate} />
  <GhostButton size="sm" icon="edit-02" aria-label="Modifier" onClick={onEdit} />
  <GhostButton size="sm" icon="trash" aria-label="Supprimer" tone="danger" onClick={onDelete} />
</>
```

**Modale** — le pied est géré par `primaryAction` (`PrimaryButton`) et `secondaryAction` (`PrimaryButton outline`) de `Modal` : ne pas recréer de boutons dans `children`.

**Empty state**

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ color: "var(--cadence-color-text-secondary)", fontSize: 14 }}>Aucun scénario créé pour ce réseau.</p>
  <PrimaryButton label="Créer le premier scénario" onClick={onCreate} />
</div>
```

### Action destructive — visibilité selon l'impact

| Impact | Composant | Quand |
|---|---|---|
| Faible (1 élément, réversible) | `Link variant="destructive"` | Retirer une valeur, un filtre, un champ |
| Moyen (1 élément, irréversible) | `GhostButton tone="danger"` icône seule + confirmation `Modal` | Supprimer une ligne d'une liste |
| Fort (plusieurs éléments, irréversible) | `PrimaryButton tone="danger"` + confirmation `Modal size="small"` | Suppression multiple |

`GhostButton tone="danger"` sert à une action destructive **secondaire** dans un groupe (ex. « Retirer » à côté d'un `PrimaryButton` « Enregistrer »).

**Confirmation modale avant suppression irréversible**

```tsx
<Modal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Supprimer 3 scénarios ?"
  size="small"
  secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
  primaryAction={{ label: "Supprimer", onClick: onConfirmDelete, destructive: true }}
>
  Cette action est irréversible. Les 3 scénarios sélectionnés seront définitivement supprimés.
</Modal>
```

### Contrôles d'une liste

Au-dessus d'une liste filtrable, utiliser `FilterBar` (recherche, filtres rapides, filtres actifs). Sa recherche est un `SearchInput` : même hauteur (29px) et même bordure que les filtres en `variant="button"` et les boutons `sm` qui l'entourent, mais une forme de champ (coins de 8px, léger creux) qui la distingue des pilules des boutons. Hors `FilterBar`, une recherche placée à côté de boutons ou de filtres est aussi un `SearchInput`, jamais un `TextInput` (40px). Un tri hors `DataTable` se fait avec un `GhostButton size="sm" iconStart="switch-vertical-01"`, hors du flux des boutons d'action.

### Placement systématique

| Contexte | Position | Composant |
|---|---|---|
| Dashboard — création | En haut à droite, à côté des onglets | `PrimaryButton size="sm"` |
| Dashboard — actions de dashboard | À gauche de la création | `PrimaryButton outline size="sm"` |
| Dashboard — sélecteurs (période, date, liste) | En haut à droite, avant les actions | `DateRangePicker` / `DatePicker` / `Dropdown` en `variant="button"` |
| Page liste — création | En haut à droite, à côté des onglets | `PrimaryButton` (`md`) |
| Formulaire — soumission | En bas à droite | `Link` (option) + `GhostButton` + `PrimaryButton`, en `md` |
| Modale — validation | Pied (via `primaryAction` / `secondaryAction`) | géré par `Modal` |
| Liste — action par ligne | À droite du header de la ligne | `GhostButton size="sm"` icône seule |
| Liste — sélection multiple | Barre flottante en bas de la liste (`BulkActionBar`), après le compteur | `GhostButton` + `PrimaryButton tone="danger"`, `size="sm"` |
| Formulaire inline | À droite du champ associé | `GhostButton` |

Un bouton ne change jamais de position selon l'état de l'application : il peut être affiché, masqué, activé, désactivé ou en chargement, mais son emplacement reste fixe.

**Bouton désactivé — explication obligatoire**

`TooltipTrigger` rend sa propre icône ⓘ (il n'enveloppe pas d'enfants) : on l'accole au bouton désactivé.

```tsx
// ❌ Mauvais — l'utilisateur ne sait pas pourquoi
<PrimaryButton label="Enregistrer" disabled />

// ✅ Bon — icône ⓘ à côté du bouton, tooltip au survol
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <PrimaryButton label="Enregistrer" disabled />
  <TooltipTrigger label="Complétez tous les champs obligatoires pour enregistrer." position="top" />
</div>
```

### Migration vers la 1.0

Les anciennes API de boutons (0.2) et les composants dépréciés sont **supprimés en 1.0.0**. La correspondance complète et le codemod des boutons sont dans le **guide de migration 0.x → 1.0** du `CHANGELOG.md`.

---

## Formulaires

### Choisir le bon composant de saisie

| Composant | Quand l'utiliser |
|---|---|
| `TextInput` | Texte libre — nom, description. Pour une recherche à côté de filtres ou de boutons : `SearchInput`. |
| `TextArea` | Texte long multi-lignes — descriptions, commentaires. |
| `CounterInput` | Valeur numérique bornée avec +/−. |
| `Dropdown` | Choix parmi une liste fixe et courte (3 à ~10 options). |
| `Autocomplete` | Choix dans une longue liste, avec recherche au clavier. Sélection simple ou multiple (`multiple`). |
| `SegmentedControl` | 2 à 4 options mutuellement exclusives. **À privilégier dans les formulaires.** |
| `DatePicker` | Sélection d'une date (option heure avec `withTime`). |
| `TimePicker` | Heure seule ou heure de service après minuit (`allowOvernight`). |
| `DateRangePicker` | Sélection d'une période (début → fin) avec préréglages ; jours entiers. |
| `Checkbox` | Option booléenne indépendante, ou sélection multiple. |
| `RadioButton` | Sélection exclusive parmi 2 à 5 options courtes. |
| `RichRadioButton` | Sélection exclusive avec description par option. |
| `RichCheckbox` | Sélection multiple avec description par option. |
| `Toggle` | Activation/désactivation à effet immédiat (hors soumission). |

### Règles

- ✅ Toujours passer la prop `label` sur `TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker`, `CounterInput` et `TimePicker` — c'est le seul moyen de garantir la cohérence visuelle. Exception, qui prend `aria-label` à la place : `DatePicker` / `DateRangePicker` / `Dropdown` / `TimePicker` en `variant="button"` (dashboard, filtres rapides d'une `FilterBar`).
- ✅ Une période → un seul `DateRangePicker`, jamais deux `DatePicker` « Début » / « Fin » (sauf saisie avec heures, non gérée par `DateRangePicker` en v1).
- ✅ Utiliser la prop `helperText` de `TextInput`/`TextArea` pour les instructions.
- ✅ Afficher les erreurs avec `state="error"` + message dans `helperText`.
- ✅ Grouper les champs connexes avec un titre de section.
- ✅ Utiliser `SegmentedControl` pour les choix exclusifs de 2 à 4 options, dans les formulaires comme pour changer de vue.
- ❌ Ne jamais étirer un `SegmentedControl` sur toute la largeur : il épouse ses segments (voir sa [fiche API](#segmentedcontrol)).
- ❌ Ne pas mélanger `Checkbox` et `RadioButton` dans la même liste.
- ❌ Ne pas utiliser `Toggle` pour des choix qui nécessitent une confirmation.
- ❌ Ne jamais ajouter un `<label>` HTML custom autour d'un champ — utiliser la prop `label` du composant.
- ❌ Ne pas utiliser `TextInput type="number"` — utiliser `CounterInput`.

```tsx
<TextInput label="Nom du scénario" placeholder="Ex : Perturbation ligne A" />
<Dropdown label="Réseau" options={reseaux} value={reseauId} onChange={setReseauId} />
<TextInput label="Email" state="error" helperText="Format invalide." />
<CounterInput label="Durée (minutes)" min={0} max={120} step={5} unit="min" />
```

---

### Imports et formulaires à étapes

Combiner `Stepper`, `FileUpload`, `ProgressBar` et `InlineAlert` : l'app gère lecture, validation et transfert. Une étape terminée peut être revisitée via `onStepClick`. Une erreur de soumission est résumée en haut par `ErrorSummary`, qui donne accès aux champs par id ou ref. Conserver aussi le message d’erreur propre à chaque champ. Le pattern **Assistant / import** couvre ce parcours.

Pour une sélection multiple avec recherche et groupes, utiliser **`Autocomplete multiple`** (déjà disponible), sans créer un deuxième sélecteur. La sélection globale peut être une action de composition si le produit l'exige.

## Navigation

### Rôle de chaque composant

| Composant | Rôle | Position |
|---|---|---|
| `AppLayout` | Squelette : Sidebar à gauche, contenu de page dans un conteneur blanc arrondi bordé d'un liseré. | Plein écran (`100vh`) |
| `Sidebar` | Navigation principale entre les grandes sections ; en pied, sélecteur de périmètre (`scope`) et utilisateur connecté (`user`). | Gauche, pleine hauteur, dans `AppLayout` |
| `Breadcrumbs` | Localisation dans l'arborescence + navigation ascendante. | Au-dessus du titre |
| `Dropdown` `variant="button"` | Sélecteur de contexte dans le breadcrumb (produit/module), passé en `content` d'un item. | Dans le breadcrumb |
| `TabList` + `Tab` | Navigation entre vues au sein d'une même page. `TabList` porte `role="tablist"` et le clavier (←/→, Début / Fin). | Sous le titre de page |
| `TabList level="secondary"` + `SecondaryTab` | Sous-navigation (filtres/statuts, avec compteurs) à l'intérieur d'une vue choisie avec `SegmentedControl`. | Sous le `SegmentedControl` |

### Règles

- ✅ Toute page vit dans `AppLayout`, qui reçoit la `Sidebar` (prop `sidebar`) et le contenu de la page (`children`).
- ✅ Le fond de l'app prend la couleur produit de la Sidebar : la Sidebar s'y fond, sans arrondi ni ombre. Seul le conteneur blanc défile.
- ✅ Quand la Sidebar se replie (220 px → 80 px), le conteneur s'élargit tout seul : pas de mesure de largeur, pas de `position: fixed`, pas de `marginLeft`.
- ✅ Périmètre (réseau, client) et utilisateur connecté vont en pied de Sidebar (`scope`, `user`). Il n'y a plus de `Header`.
- ✅ Afficher `Breadcrumbs` dès que l'utilisateur est à plus d'un niveau de profondeur.
- ✅ Le dernier item du breadcrumb est la page courante — sans `href`.
- ✅ Sélecteur de contexte dans le fil d'Ariane : `content` sur l'item (le `<li>` et les séparateurs sont conservés, `label` nomme l'élément). Jamais de fil reconstruit à la main avec les classes internes `breadcrumbs__*`.

```tsx
<Breadcrumbs
  items={[
    { id: "home", label: "Accueil", href: "/" },
    {
      id: "product",
      label: "Produit",
      content: <Dropdown variant="button" aria-label="Produit" options={produits} value={produit} onChange={setProduit} />,
    },
    { id: "current", label: "Perturbations non planifiées" },
  ]}
/>
```
- ✅ Une rangée d'onglets est **toujours** dans un `TabList` nommé (`aria-label`) : un `role="tab"` hors d'un `role="tablist"` est invalide, et c'est `TabList` qui gère le clavier (seul l'onglet actif est tabulable, ←/→ et Début / Fin pour changer d'onglet). Un `Tab` seul émet un avertissement en développement.
- ✅ Relier chaque onglet à son panneau : `id` + `controls` sur le `Tab`, et côté panneau `role="tabpanel"`, `id`, `aria-labelledby` (id de l'onglet), `tabIndex={0}`.
- ✅ L'onglet actif se marque avec `variant="active"` sur `Tab`.
- ✅ Pour un second niveau de navigation (sous-filtres/statuts d'une vue), utiliser `SecondaryTab` dans un `TabList level="secondary"`, sous le `SegmentedControl` — plus compact, avec compteur optionnel.
- ❌ Ne jamais décaler ou centrer la `Sidebar` — toujours ancrée au bord gauche, jamais tronquée en hauteur.
- ❌ Ne pas recréer le squelette à la main (Sidebar en `position: fixed`, contenu décalé par `marginLeft`) : utiliser `AppLayout`.
- ❌ Ne pas ajouter de barre supérieure au-dessus du conteneur : le titre de la page est la première ligne du contenu.
- ❌ Ne pas imbriquer une `Sidebar` dans une `Sidebar`.
- ❌ Ne pas utiliser `Tab` pour de la navigation entre pages différentes.

Le code complet du layout est dans la [recette 1](#recette-1--layout-dapplication).

---

## Listes & tableaux

### Choisir : `DataTable` ou `TableCard`

| | `DataTable` | `TableCard` + `TableHeader` |
|---|---|---|
| **Volume** | Des centaines à des dizaines de milliers de lignes | Quelques dizaines de cartes |
| **Contenu d'une ligne** | Valeurs de colonnes (texte, nombres, `Badge`, `Indicator`) | Carte riche : titre, icône, actions par ligne, contenu libre |
| **Exemples** | Arrêts, courses, perturbations, véhicules | Scénarios, rapports, configurations |
| **Tri, sélection** | Intégrés (Maj+clic : multi-tri, plage) | À câbler (`TableHeader` + `checkboxState`) |

- ✅ Au-delà de ~50 lignes de données comparables → `DataTable`.
- ✅ Au-dessus d'une liste filtrable → `FilterBar` ; en dessous d'une liste paginée → `Pagination`.
- ❌ Ne pas utiliser `TableCard` pour des milliers de lignes (pas de virtualisation, une carte par ligne).
- ❌ Ne pas recréer un `<table>` HTML custom — `DataTable` couvre le besoin.

### Filtrer par catégorie : `CategoryFilter`

Au-dessus d'une liste dont chaque catégorie a son propre tableau (catalogue d'un référentiel : réseaux, lignes, arrêts…), `CategoryFilter` présente les catégories en **tuiles compactes** : picto, libellé, effectif dessous. Une seule catégorie est active ; la sélectionner change le tableau situé dessous.

- ✅ Placer le filtre juste au-dessus du tableau qu'il pilote, puis `FilterBar` (recherche dans la catégorie) et `DataTable`.
- ✅ L'effectif est celui de la catégorie entière, fourni par l'application. Un effectif à 0 s'affiche et reste sélectionnable ; `disabled` sert seulement quand la catégorie est indisponible.
- ❌ Pas de `Card` par catégorie : sa structure et son bouton d'action alourdissent un filtre.
- ❌ Pas de bouton, lien ou case à l'intérieur d'une tuile : la tuile entière est la cible.

### Pagination ou virtualisation

| Situation | Choix |
|---|---|
| Données paginées par l'API (cas courant en supervision) | `DataTable manualSorting manualPagination` + `Pagination` |
| Quelques milliers de lignes en mémoire, lecture page par page | `DataTable page pageSize` + `Pagination` (le tri porte sur toutes les lignes, puis la page est découpée) |
| Parcours continu d'un grand volume en mémoire (journal, flux de courses) | `DataTable virtualized maxHeight` — sans `Pagination` |

- ✅ `virtualized` est **explicite** : il impose une hauteur bornée (`maxHeight`, défaut 560px) et des lignes de hauteur fixe ; Ctrl+F et l'impression ne voient que les lignes montées.
- ✅ Le contenu des cellules tient sur une ligne (texte tronqué avec ellipse) : la hauteur de ligne est celle de la densité.
- ✅ Action avec libellé dans une cellule (« Consulter ») : `PrimaryButton outline size="sm"`. Un `GhostButton` avec libellé n'a ni fond ni bordure au repos et se confond avec les valeurs de la ligne. Les actions icône seule restent en `GhostButton size="sm"`.
- ❌ Ne pas combiner `virtualized` et `Pagination`.

### Sélection multiple et actions groupées

Les actions sur une sélection passent par `BulkActionBar`, placée **juste après la liste, dans le même conteneur** : elle colle au bas de la zone visible pendant le défilement, puis reprend sa place sous la liste. Elle apparaît à la première sélection et disparaît quand la sélection est vide ; le compteur (« 3 courses sélectionnées ») est annoncé aux lecteurs d'écran.

- ✅ Actions en `size="sm"` : `GhostButton` (Exporter, Modifier…) puis, en dernier, `PrimaryButton tone="danger"` pour une suppression, confirmée par une `Modal size="small"`.
- ✅ `countLabel` nomme les éléments de la liste (« 3 courses sélectionnées ») ; le défaut dit « éléments ».
- ✅ Quand la barre disparaît avec la sélection (après une suppression), ramener le focus sur la liste (case « Tout sélectionner » du `DataTable`).
- ✅ Liste de `TableCard` (sans case d'en-tête) : ajouter un `GhostButton size="sm" iconStart="x-close" label="Tout désélectionner"` en première action.
- ❌ Pas de barre au-dessus du tableau ni dans `PageHeader` : les actions groupées vivent dans `BulkActionBar`.
- ❌ Pas de `PrimaryButton` plein non destructif dans la barre : la vue garde son action principale (création) dans l'en-tête.

### Densité

- `comfortable` (48px, défaut) : listes consultées, lignes avec `Badge` / `Indicator`.
- `compact` (36px) : supervision dense, écrans de contrôle, tableaux virtualisés.

### Composition `TableCard`

Une liste de cartes se compose de trois briques :

1. **`TableHeader`** — la ligne d'en-têtes de colonnes (labels uppercase + flèches de tri).
2. **`TableCard`** — une ligne de la liste : header (checkbox + icône + titre + actions) et body en colonnes.
3. **`GhostButton size="sm"` icône seule** — les boutons d'action du header de ligne (slot `actions` de `TableCard`).

### Alignement des colonnes

**Règle clé** : les colonnes du `TableHeader` et celles des `TableCard` doivent utiliser **les mêmes valeurs `width`/`flex`**, dans le même ordre. Le `TableHeader` commence par une colonne *spacer* (`width` ≈ 220) qui compense la partie header des cards (checkbox + icône + titre).

### Règles

- ✅ `width` (px fixe) **ou** `flex` (part d'espace restant) par colonne — jamais les deux.
- ✅ Une seule colonne `flex: 1` par liste (la colonne de contenu principal).
- ✅ Gap de `8` entre les cards.
- ✅ État sélectionné : `state="selected"` + `checkboxState="checked"` ensemble.
- ✅ Sans titre ni actions, le header de la card disparaît automatiquement (variante contenu seul).
- ❌ Ne pas mettre de `<table>` HTML custom — `TableHeader` + `TableCard` (peu de lignes) ou `DataTable` (gros volume) couvrent le besoin.
- ❌ Ne pas mettre plus de 4 actions icône par ligne — au-delà, regrouper dans un menu.

Le code complet est dans la [recette 2](#recette-2--page-liste-avec-sélection-multiple) (`TableCard`) et la [recette 5](#recette-5--page-de-supervision) (`DataTable`).

---

### Colonnes et export

`ColumnManager` pilote `hiddenColumnIds` et `columnOrder` de `DataTable`. `ExportMenu` expose sélection/page/résultat et CSV/Excel : ne proposer que les formats réellement implémentés. L'export d'une page respecte les colonnes visibles et le tri appliqués (pattern **Liste / index**).

## Statuts & étiquettes

`LineBadge` représente une ligne, `StopLabel` un arrêt. Ne pas confondre couleurs de ligne (données GTFS) et couleurs de statut. Pour un panneau de détails, utiliser `DescriptionList` (sémantique `<dl>/<dt>/<dd>`, densité et repli mobile), `StopLabel` et `Accordion`. Un historique d’événements se présente avec `ActivityFeed` ; l’app fournit l’ordre, les dates et le fuseau.

Deux composants proches mais distincts :

| | `Badge` | `Indicator` |
|---|---|---|
| **Rôle** | Information neutre : catégorie, tag, code technique | État ou statut : porte une sémantique (couleur + picto) |
| **Exemples** | « Transilien », « stop_area:IDFM:47026 » | « En cours », « Critique », « Brouillon » |
| **Variantes** | `draggable`, `dismissible`, `mono` | 8 variantes sémantiques |

### Les 8 variantes d'Indicator

| Variante | Picto | Sens |
|---|---|---|
| `active` | double cercle | En cours |
| `upcoming` | horloge | À venir |
| `completed` | check cerclé | Passée / terminée |
| `draft` | crayon | Brouillon |
| `warning` | triangle | Ralenti / avertissement |
| `info` | cercle i | Information |
| `critical` | losange × | Critique |
| `nominal` | double check | Normal / RAS |

### Règles

- ✅ `Badge mono` pour les valeurs techniques (identifiants, codes) — police Spline Sans Mono.
- ✅ `Badge dismissible` pour les filtres actifs retirables.
- ✅ `Indicator` peut surcharger son libellé par défaut via `label`.
- ❌ Ne pas utiliser `Badge` pour un état (utiliser `Indicator`).
- ❌ Ne pas créer de nouvelles couleurs de statut — les 8 variantes couvrent les cas.

### Cartes : `Card`

Une `Card` réunit tout ce qu'une carte de tableau de bord peut porter ; seul le titre est obligatoire :
- **indicateur** : `value` et son évolution (`delta`), mini-courbe (`trend`), statut (`status`, un `Indicator` quand la valeur franchit un seuil) ;
- **action** : un bouton `PrimaryButton outline size="sm"` (`actionLabel`, `onAction`, `actionIcon`) et une `illustration` décorative en bas à droite ;
- **texte** : `description`, sous la valeur ou directement sous le titre.

Une `Card` est **interactive** de deux façons :
- **cliquable** (`onClick` + `actionLabel`, **obligatoire**) : toute la carte mène à la liste détaillée, et un bouton visible (`PrimaryButton outline size="sm"`, « Voir les perturbations ») **signale l'interactivité**. Ce bouton porte le clic : sa zone est étirée sur toute la carte, c'est la seule cible au clavier (pas de bouton dans une zone cliquable) et l'anneau de focus entoure la carte. Le typage refuse `onClick` sans `actionLabel` ;
- **à bouton d'action** (`actionLabel` + `onAction`) : seul le bouton est cliquable.

- ✅ Une carte cliquable a **toujours** un bouton visible au libellé explicite (« Voir les alertes », « Voir les courses ») : sans lui, rien n'indique que la carte est cliquable.
- ❌ Jamais `onClick` et `onAction` ensemble (un clic de carte et un clic de bouton distincts) : le typage l'interdit.

 Interactive, elle se soulève de 4px au survol avec l'ombre `--cadence-shadow-raised` (ombre seule avec `prefers-reduced-motion`) ; informative, elle ne bouge pas.

- ✅ Toujours préciser `goodDirection` quand une hausse n'est pas favorable : `"down"` pour un retard, des suppressions, des perturbations ; `"neutral"` pour un volume sans jugement.
- ✅ La variation est un nombre signé (`-12` → « −12 % ») ; `unit: "pt"` pour une variation de taux en points (`94,8 %` → `94,2 %` = « −0,6 pt »).
- ✅ Bouton d'action : le libellé dit l'action (« Importer », « Configurer »), le titre dit ce que l'on obtient.
- ✅ En grille : `CardGrid` (colonnes fluides de 240px minimum, `gap` 16). Les cartes d'une ligne prennent la même hauteur et les boutons s'alignent en bas.
- ✅ `headingLevel` suit la hiérarchie de la page (h3 par défaut, sous un h2 de section ; h2 directement sous le `PageHeader`).
- ❌ Ne pas colorer une variation à la main (vert / rouge) : la couleur vient de `goodDirection`.
- ❌ Une seule action par carte : pour plusieurs actions, utiliser une liste (`TableCard` + `GhostButton` icône seule).
- ❌ Pas plus de 4 à 6 cartes par ligne de tableau de bord.

```tsx
<Badge label="Transilien" />
<Badge label="stop_area:IDFM:47026" mono />
<Badge label="Ligne 13" dismissible onDismiss={() => removeFilter("l13")} />
<Indicator variant="active" />
<Indicator variant="warning" label="Ralenti" />
```

---

## Data visualisation

### Choisir le bon graphique

| Question | Composant |
|---|---|
| Comment une mesure évolue dans le temps ? Franchit-elle un objectif ? | `LineChart` (une à huit séries, aire empilée pour une composition) |
| Quand les perturbations se concentrent-elles (jour × heure) ? | `Heatmap` |
| Quels jours de l'année ont décroché (ponctualité quotidienne, grèves) ? | `CalendarHeatmap` |
| Quelles lignes sont les plus touchées ? | `BarList` |
| Comment se répartissent des catégories, série par série ? | `BarChart` (`layout="stacked" | "grouped"`, `orientation="vertical" | "horizontal"`) |
| Une valeur clé et sa tendance en haut de page ? | `Card` (`value`, `delta`, `trend`) |
| La tendance de chaque ligne d'un tableau ? | `Sparkline` dans une cellule de `DataTable` |
| Quand des plages se situent sur un axe temps (perturbations, amplitudes, travaux) ? | `Timeline` (une ligne par entité) ; `JourneyTimeline` (itinéraires comparés) |
| Comment un total se répartit-il (6 parts au plus) ? | `DonutChart` (au-delà : `BarList`) |
| Les indicateurs du contrat atteignent-ils leur objectif (malus, neutre, bonus) ? | `BulletChart` |
| Comment se distribuent les retards, les temps de parcours, les intervalles ? | `Histogram` |
| Quelle ligne, quel créneau est le plus irrégulier ? | `BoxPlot` |
| Deux mesures vont-elles ensemble ? Quels éléments sortent du lot ? | `ScatterChart` |
| Quel poids pour chaque mode et chaque ligne dans le total ? | `Treemap` |
| Où vont les voyageurs de chaque origine, par quelles correspondances ? | `SankeyChart` |
| Le volume et le taux évoluent-ils ensemble (fréquentation et ponctualité) ? | `ComboChart` (deux axes Y titrés) |
| Une valeur tient-elle par paliers (offre par tranche horaire, capacité) ? | `LineChart curve="step"` |
| Quelles lignes décrochent, toutes sur la même échelle ? | `SmallMultiples` |
| Comment une ligne a-t-elle été exploitée sur la journée (fréquence, croisements, théorique / réalisé) ? | `TimeSpaceDiagram` |
| Où sont les véhicules d'une ligne en ce moment, en retard ou en incident ? | `LineDiagram` |
| Où en est une valeur par rapport à sa capacité ou à ses seuils ? | `Meter` (barre) ; `Gauge` (KPI mis en avant) |
| De quoi se compose un total, rapporté à une capacité ? | `Meter segments` |

### Palette

- ✅ Les séries prennent les couleurs `--cadence-dataviz-series-1..8` **dans l'ordre** : la série principale en 1. Toutes atteignent 3:1 sur blanc (traits et marqueurs).
- ✅ Chaque série a aussi une **forme de marqueur** et un **motif de trait** (`LineChart`) ou un **motif de remplissage** (`BarChart` : hachures, points, lignes…), repris dans la légende et le tooltip : le sens ne repose jamais sur la couleur seule.
- ✅ Les valeurs ordonnées (intensité) utilisent la rampe séquentielle `--cadence-dataviz-seq-1..7` : une seule teinte, clarté croissante, lisible en daltonisme et en niveaux de gris.
- ❌ Pas de couleur en dur ni de palette maison : un statut (critique, avertissement) reste un `Indicator`, pas une couleur de série.

### Seuils et annotations

- ✅ Un objectif ou un seuil d'alerte est un `threshold` libellé (« Objectif 95 % », « Seuil d'alerte 5 min ») : ligne tiretée `--cadence-dataviz-threshold`. Avec `goodDirection`, les points du mauvais côté passent en `--cadence-dataviz-threshold-breach` et le libellé indique « franchi ».
- ✅ Un événement daté (grève, travaux, incident) est une `annotation` : trait vertical ou bande, toujours libellée (« Grève 14/10 »), rappelée dans le tooltip. `LineChart` (dates ou catégories), `BarChart` (catégories), `Histogram` (valeurs). Près du bord droit (événement en cours, « Aucune réception depuis 14 h »), le libellé s'ancre à la fin de la bande ou à gauche du trait : il n'est jamais coupé.
- ❌ Pas de seuil sans libellé, pas d'annotation sans date.
- ✅ Comparaison à une période précédente : une série `reference: true` (`LineChart`, `BarChart`) libellée par sa période (« 2025 », « Semaine 42 »), recalée sur les abscisses de la période courante. Elle ne prend pas de couleur de la palette : ardoise tiretée. Une seule référence par graphique pour que l'écart soit rappelé.
- ✅ `ComboChart` : chaque axe Y porte un titre et son unité (« Validations (k) », « Ponctualité (%) ») ; les seuils (`lineThresholds`) se lisent sur l'axe droit.
- ❌ Pas de `ComboChart` pour deux mesures de même unité : un `LineChart` ou un `BarChart` à deux séries.

### Accessibilité

- ✅ Chaque graphique a un `title` (nom accessible) et, de préférence, une `description` (période, périmètre).
- ✅ Alternative tabulaire : « Voir les données » affiche un vrai tableau, présent dans le DOM même masqué (`LineChart`, `BarChart` avec le total par catégorie, `BarList`, `DonutChart` avec les parts et le total, `BulletChart` avec l'objectif et le statut, `Histogram` (classe, effectif, part), `ComboChart` (une colonne par série, avec son unité), `Timeline` et `JourneyTimeline`) ; la `Heatmap` est elle-même une grille (`role="grid"`) avec en-têtes de lignes et de colonnes.
- ✅ Clavier : `LineChart` (←/→, Début / Fin, tooltip annoncé), `BarChart` (←/→ ou ↑/↓ d'une catégorie à l'autre, Entrée / Espace avec `onDatumClick`), `Heatmap` (flèches, Début / Fin, Ctrl+Début / Fin, Entrée), `BarList` (lignes cliquables = boutons nommés), `DonutChart` (←/→ d'une part à l'autre, en boucle, Début / Fin), `Histogram` (←/→ d'une classe à l'autre, Début / Fin), `ComboChart` (←/→ d'une catégorie à l'autre, Début / Fin), `BoxPlot` (←/→ d'un groupe à l'autre), `ScatterChart` et `Treemap` (←/→ d'un point ou d'une tuile au suivant, Entrée), `BulletChart` (lignes nommées : valeur, objectif, statut), `Timeline` / `JourneyTimeline` (←/→ entre plages d'une ligne, ↑/↓ de ligne, Début / Fin, Entrée).
- ✅ États `loading`, `empty`, `error` (avec `onRetry`) plutôt qu'un graphique vide.
- ✅ Donnée live (supervision) : `freshness` date le graphique ; export de ce qui est affiché : `exportable`. Pas de PNG : plusieurs graphiques sont en partie en HTML (centre du `DonutChart`, `BulletChart`, `BarList`, `Timeline`), une image SVG serait incomplète.
- ✅ Plusieurs graphiques sur une page (tableau de bord, graphiques côte à côte dans une `CardGrid`) : les encadrer avec `framed`, même surface qu'une `Card`. Sans cadre, deux graphiques voisins se confondent (titres, axes et légendes sans limite visible). Un graphique seul dans une `PageSection` peut rester sans cadre.
- ✅ Les graphiques suivent la largeur de leur conteneur : jamais de largeur fixe en px. Hauteurs par défaut : `LineChart` et `BarChart` vertical 280px (`LineChart compact` : 48px), `BarChart` horizontal 36px par catégorie, `Heatmap` 28px par ligne, `BarList` 32px par ligne, `Timeline` / `JourneyTimeline` 32px par ligne, `DonutChart` 200px de diamètre (légende à côté, dessous si la place manque), `BulletChart` 48px par indicateur, `Histogram` 280px, `ComboChart` 300px, `BoxPlot` 280px, `ScatterChart` 320px, `Treemap` 360px.

---

### Proportion unique

`Gauge` complète les KPI : arc/anneau, sens favorable et seuils libellés. `Meter` porte la même mesure en barre, plus compacte, pour une liste de lignes ou de courses (taux de charge), ou décompose un total (`segments`). Employer une `Card` pour une valeur seule ; `ProgressBar` pour l'avancement d'une tâche.

- ✅ Un taux de charge se juge avec `goodDirection="down"` et des seuils libellés (« Charge élevée 80 % », « Capacité 100 % »).
- ❌ Pas de `Meter` ni de `Gauge` pour un traitement en cours : c'est une `ProgressBar`.
- ❌ Pas de `DonutChart` au-delà de six parts ni pour comparer des périodes : `BarList` ou `BarChart`.

## Feedback

`InlineAlert` affiche un message persistant dans le flux (information, succès, avertissement ou erreur). `ProgressBar` affiche l'avancement et `FileUpload` réutilise cette barre pour les envois. Une progression n'annonce pas à elle seule la réussite du traitement.

### Choisir le bon composant

| Situation | Composant |
|---|---|
| Confirmation d'une action réussie | `AlertToast type="success"` |
| Erreur système ou action échouée | `AlertToast type="error"` |
| Avertissement non bloquant | `AlertToast type="warning"` |
| Info contextuelle sur un élément UI | `TooltipTrigger` |
| Explication d'un bouton désactivé | `TooltipTrigger` accolé au bouton `disabled` |
| Erreur de validation d'un champ | `TextInput state="error"` + `helperText`, ou `TimePicker error` |
| Plusieurs erreurs à la soumission | `ErrorSummary` + erreurs locales des champs |
| Confirmation avant action irréversible | `Modal size="small"` |

### Règles

- ✅ Les toasts s'affichent via le **`Toaster`** : monter un seul `<Toaster />` à la racine de l'app, puis déclencher avec `useToast()`. Ne pas instancier `AlertToast` à la main dans le flux.
- ✅ Position : **bas à droite**, en `position: fixed`. Empilement avec effet de profondeur (la plus récente au premier plan) ; au survol, la pile se déploie.
- ✅ `success` / `information` / `warning` : auto-dismiss après 4 s (géré par le `Toaster`, en pause au survol). `error` : reste jusqu'à fermeture manuelle.
- ✅ Max 3 toasts simultanés (le `Toaster` retire les plus anciens au-delà).
- ✅ Boutons d'action d'un toast : **faible emphase** — `GhostButton` (secondaire) + `PrimaryButton outline` (principale). **Jamais de bouton rempli** : exception assumée à la règle « groupe de deux = outline + rempli », justifiée par le contexte transitoire et non bloquant du toast.
- ❌ Ne pas utiliser `AlertToast` seul pour une notification applicative — passer par `useToast()` + `Toaster`.
- ❌ Ne pas utiliser `Tooltip` pour du contenu long ou interactif.

```tsx
// 1. Une fois, à la racine de l'app
import { Toaster } from "@ddaoellena/cadence-ui";
<Toaster />

// 2. N'importe où
import { useToast } from "@ddaoellena/cadence-ui";
const { toast } = useToast();
toast({ type: "success", title: "Scénario créé", description: "Le scénario est publié." });
toast({ type: "error", title: "Échec de l'envoi" }); // persistant

// Icône ⓘ d'aide accolée à un bouton désactivé
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <PrimaryButton label="Analyser" disabled />
  <TooltipTrigger label="Sélectionne un réseau d'abord" position="top" />
</div>
```

---

### Dates, heures et fuseaux

Les composants n'ont pas tous le même fuseau par défaut. Dans une composition, **passer `timeZone` (fuseau IANA du produit, ex. `"Europe/Paris"`) et `now` explicitement**, et transmettre des dates ISO avec décalage (`2026-06-12T08:15:00+02:00`) : le rendu ne dépend plus de la machine de l'utilisateur ni de celle des tests.

| Composant | Fuseau par défaut | Réglage |
|---|---|---|
| `DataFreshness`, `freshness` des graphiques | fuseau du navigateur | `timeZone`, `now` |
| `ActivityFeed` | `"UTC"` | `timeZone` |
| `DataTable` (rendu par défaut des `Date`) | fuseau du navigateur | formater dans `cell` si un fuseau métier s'impose |
| Axes et infobulles des graphiques temporels | fuseau du navigateur | dates déjà ramenées au fuseau voulu |
| `TimePicker`, `RouteStopList`, `ServiceCalendar` | heures et dates de service, sans fuseau | — |

- ✅ Une page = un fuseau et une horloge (`now`) partagés par tous ses composants.
- ❌ Ne pas mélanger une date sans décalage (`2026-06-12T08:15:00`, lue en heure locale) et une date en UTC (`…Z`) dans une même vue.

## Page patterns

Catalogue de gabarits de page nommés. **Choisir d'abord un pattern dans le tableau *Intention → pattern*, partir de son gabarit, puis composer.** Une page qui ne correspond à aucun pattern est **signalée, pas inventée**.

### Intention → pattern

| Intention | Pattern | État |
|---|---|---|
| Coque d'application (navigation + contenu) | Coque d'application | ✅ |
| Lister / parcourir un ensemble (filtres, sélection, pagination) | Liste / index | ✅ |
| Liste + détail latéral sans quitter la liste | Liste + détail latéral | ✅ |
| Page de détail d'un élément (onglets, historique, action destructive) | Page de détail | ✅ |
| Créer / éditer un objet en formulaire | Formulaire | ✅ |
| Assistant multi-étapes / import | Assistant | ✅ |
| Supervision temps réel (indicateurs, alertes, fraîcheur) | Tableau de bord de supervision | ✅ |
| Analyse (période partagée, grille de graphiques) | Tableau de bord d'analyse | ✅ |
| Planification / temps (axes temps, heures de service) | Planification / temps | ✅ |
| Réglages (sections, enregistrement explicite) | Paramètres | ✅ |
| États d'une page (chargement, erreur, accès, introuvable, vide) | États de page | ✅ |
| Examiner la validation d'un jeu de données (bilan, constats, détail) | Rapport qualité | ✅ |

### Correspondance recette → pattern

R1 → Coque d'application · R2 → Liste / index · R3 → Formulaire · R4 → États de page · R5 → Liste / index · R6 → Supervision · R7 → Analyse · R8 → Liste + détail latéral · R9 → Assistant · R10 → Planification / temps.

> Les 12 fiches sont ci-dessous. Les stories `Recettes/*` ont été retirées en 1.0.0 : leurs parcours sont couverts par les patterns (correspondance ci-dessus). Les recettes de code plus bas restent des exemples à adapter.

### Pattern — Formulaire

**Quand l'utiliser** — créer ou éditer un objet métier (scénario, perturbation, règle) dans un formulaire en sections, à largeur contenue, avec soumission explicite. **Ne pas confondre avec** — une page liste (Liste / index), un assistant multi-étapes (Assistant), une page de paramètres (Paramètres, souvent à effet immédiat).

**Anatomie**

```
PageHeader (h1)
ErrorSummary (si erreurs)
PageSection « Informations générales »  →  TextInput · FieldRow(Dropdown×2) · SegmentedControl
PageSection « Période »                 →  FieldRow(DatePicker×2) · CounterInput · TextArea
PageSection « Récapitulatif »           →  DescriptionList
FormActions  →  Link · GhostButton · PrimaryButton
```

**Variantes** — Création (défaut) ; Édition (champs pré-remplis, action « Enregistrer »).

**États** — Chargement (squelettes pendant la lecture en édition) ; Erreur (validation via `ErrorSummary`, formulaire `noValidate`) ; Vide (sans objet pour une création) ; Permissions (voir États de page).

**Comportements** — Soumission explicite ; la validation renvoie au premier champ fautif (`ErrorSummary focusOnMount`). Multi-colonnes (`FieldRow`) **dans** une section ; synthèse **sous** le formulaire. Quitter sans enregistrer → `Modal`. Succès → toast (`useToast()` + `Toaster`).

**Responsive** — Référence 1280 px : `max-width: 720px`. À 1024 px et en dessous : les `FieldRow` se replient en une colonne, pas de défilement horizontal.

**Accessibilité** — un seul `h1` (`PageHeader`), sections en `h2` sans saut de niveau ; `ErrorSummary` prend le focus et liste des liens vers les champs ; chaque champ a un `label`, l'erreur dans son `helperText` + `state="error"`.

**Règles** — ✅ `PageSection` empilées, multi-colonnes seulement via `FieldRow`. ✅ Un seul `PrimaryButton`, en dernier. ❌ Pas de synthèse à droite du formulaire. ❌ Pas de `<section>` + `<h2>` inline : `PageSection`.

**Gabarit** — vérifié : [`src/patterns/FormulairePattern.tsx`](src/patterns/FormulairePattern.tsx), affiché dans *Storybook → Page patterns / Formulaire / Documentation*.

> Chaque fiche ci-dessous suit la même structure (Quand / Anatomie / États / Comportements / Responsive / Accessibilité / Règles / Gabarit). La version détaillée et le code vivent dans la page MDX *Page patterns / <Nom> / Documentation* ; GUIDELINES en donne la version courte et renvoie au gabarit vérifié.

### Pattern — Coque d'application

**Quand l'utiliser** — toute page de l'app (coque navigation + contenu). **Ne pas confondre avec** — un pattern de contenu, qui vit dans la coque. **Anatomie** : `AppLayout` (main nommé) + `Sidebar` (nav nommée, périmètre + utilisateur) + `PageHeader` (h1) + `Toaster`. **Règles** : ✅ le contenu commence par un `PageHeader` ; ❌ pas de `Header` ni de wrapper `position: fixed`. **Gabarit** — vérifié : [`src/patterns/CoquePattern.tsx`](src/patterns/CoquePattern.tsx).

### Pattern — Liste / index

**Quand l'utiliser** — lister et parcourir (recherche, filtres, sélection, pagination). **Ne pas confondre avec** — Liste + détail latéral, Page de détail. **Anatomie** : `PageHeader` · `FilterBar` · barre de sélection (actions de masse) · `DataTable` · `Pagination`. **États** : chargement (squelettes), vide / sans résultat (`EmptyState variant`), erreur. **Règles** : ✅ états via `EmptyState` ; ❌ pas de pagination maison. **Gabarit** — vérifié : [`src/patterns/ListePattern.tsx`](src/patterns/ListePattern.tsx).

### Pattern — Liste + détail latéral

**Quand l'utiliser** — détail d'un élément sans quitter la liste (`Drawer`). **Ne pas confondre avec** — Page de détail (page entière). **Anatomie** : `DataTable` (`onRowClick`) + `Drawer` (`InlineAlert`, `Accordion`(`DescriptionList`, `ActivityFeed`)). **Comportements** : clic/Entrée ouvre le `Drawer`, Échap rend le focus à la ligne. **Règles** : ✅ un seul détail ouvert ; ❌ pas de détail long dans un `Drawer`. **Gabarit** — vérifié : [`src/patterns/ListeDetailPattern.tsx`](src/patterns/ListeDetailPattern.tsx).

### Pattern — Page de détail

**Quand l'utiliser** — page d'un seul objet (actions dont une destructive, onglets, sections, historique). **Ne pas confondre avec** — Liste + détail latéral, Formulaire. **Anatomie** : `PageHeader` (actions) · `TabList` · `PageSection`(`DescriptionList` / `ActivityFeed`) · `Modal` (confirmation destructive). **Règles** : ✅ une seule action destructive, confirmée ; ❌ pas de second `h1`. **Gabarit** — vérifié : [`src/patterns/DetailPattern.tsx`](src/patterns/DetailPattern.tsx).

### Pattern — Assistant / import

**Quand l'utiliser** — parcours en étapes (import, vérification, transfert, reprise). **Ne pas confondre avec** — Formulaire (une page). **Anatomie** : `PageHeader` · `Stepper` · contenu d'étape (`FileUpload` / `ErrorSummary` / `ProgressBar`) · `FormActions justify="between"`. **Comportements** : étape terminée revisitable ; l'erreur bloque l'étape suivante. **Gabarit** — vérifié : [`src/patterns/AssistantPattern.tsx`](src/patterns/AssistantPattern.tsx).

### Pattern — Tableau de bord de supervision

**Quand l'utiliser** — suivi temps réel (indicateurs, alertes, fraîcheur). **Ne pas confondre avec** — Analyse. **Anatomie** : `PageHeader` (période) · `DataFreshness` · `InlineAlert` · `CardGrid`(`Card` cliquables) · `BulletChart` (indicateurs du contrat vs objectif) · `LineDiagram` (thermomètre de la ligne en alerte). **Comportements** : la période filtre indicateurs et liste ; une carte cliquable ouvre la liste filtrée. **Règles** : ✅ `loading` par carte ; ✅ chaque carte cliquable porte son bouton visible (`actionLabel`), dont la zone couvre la carte. **Gabarit** — vérifié : [`src/patterns/SupervisionPattern.tsx`](src/patterns/SupervisionPattern.tsx).

### Pattern — Tableau de bord d'analyse

**Quand l'utiliser** — explorer sur une période (indicateurs, évolution, répartition, classement). **Ne pas confondre avec** — Supervision. **Anatomie** : `PageHeader` (période) · `CardGrid`(`Card`) · `LineChart` (avec la période précédente en `reference`) · `CardGrid min=360 fit`(`Heatmap`, `BarList`) · `CardGrid min=360 fit`(`DonutChart`, `Histogram`). **États** : chargement / erreur **par bloc** (`state`, `onRetry`). **Règles** : ✅ grilles fluides, jamais de px fixe ; ✅ graphiques encadrés (`framed`) pour les délimiter ; ❌ pas de graphique sans `title` ni état. **Gabarit** — vérifié : [`src/patterns/AnalysePattern.tsx`](src/patterns/AnalysePattern.tsx).

### Pattern — Planification / temps

**Quand l'utiliser** — visualiser et saisir du temps (amplitudes, plages, horaires de nuit ≤ 47:59). **Ne pas confondre avec** — Analyse. **Anatomie** : `PageHeader` · `Timeline`/`JourneyTimeline`/`ServiceCalendar` · `PageSection`(`FieldRow`(`TimePicker allowOvernight`)) · `ErrorSummary` · `FormActions`. **Règles** : ✅ `25:30` conservé tel quel ; ✅ échelle de la `Timeline` en `SegmentedControl size="sm"` (intégrée, à ne pas recréer) ; ❌ pas de mélange de hauteurs dans une `FieldRow`. **Gabarit** — vérifié : [`src/patterns/PlanificationPattern.tsx`](src/patterns/PlanificationPattern.tsx).

### Pattern — Paramètres

**Quand l'utiliser** — réglages (sections, bascules, choix exclusifs). **Ne pas confondre avec** — Formulaire. **Anatomie** : `PageHeader` · `PageSection`(rangées titre + description + `Toggle`/`RadioButton`) · `FormActions`. **Décision** : enregistrement **explicite** par défaut ; un réglage à **effet immédiat** l'annonce. **Règles** : ✅ dire ce qui est immédiat ; ❌ pas de prop `checked` (piloter par `state`). **Gabarit** — vérifié : [`src/patterns/ParametresPattern.tsx`](src/patterns/ParametresPattern.tsx).

### Pattern — États de page

**Quand l'utiliser** — le vocabulaire des états pleine page, réutilisé par les patterns. **Ne pas confondre avec** — un état *inline* (`EmptyState size="inline"`). **Anatomie** : chargement (`Skeleton`), erreur / accès refusé / introuvable (`EmptyState variant="error"`), vide (`EmptyState variant="empty"`). **Règles** : ✅ toujours une action de sortie (réessayer, créer, revenir) ; ❌ pas d'état vide à la main. **Gabarit** — vérifié : [`src/patterns/EtatsPattern.tsx`](src/patterns/EtatsPattern.tsx).

### Pattern — Rapport qualité

**Quand l'utiliser** — examiner le résultat de la validation d'un jeu de données (import GTFS, NeTEx…). **Ne pas confondre avec** — Assistant / import (étapes de l'import), `ErrorSummary` (champs d'un formulaire). **Anatomie** : `PageHeader` · `DatasetHealth` (bilan global) · `FilterBar` (recherche, `Dropdown` de niveau) · `DataTable` des constats (`onRowClick`) · `Drawer` de la page contenant `ValidationIssueInspector`. **Comportements** : le bilan porte sur tous les constats, indépendamment des filtres ; Échap referme le détail et rend le focus à la ligne. **Règles** : ✅ verdict et constats fournis par l'application ; ✅ garder le constat affiché pendant la fermeture du `Drawer` (état `open` séparé de la sélection) ; ❌ « Aucun constat pour ces filtres » n'est pas « aucune erreur » ; ❌ pas d'action « Ouvrir dans la source » sans destination réelle. **Gabarit** — vérifié : [`src/patterns/RapportQualitePattern.tsx`](src/patterns/RapportQualitePattern.tsx).

## Recettes de pages complètes

Exemples de code à adapter, en complément des [Page patterns](#page-patterns) : **partir d'abord du pattern** et de son gabarit vérifié, puis s'aider de la recette correspondante.

### Recette 1 — Layout d'application

Toute page de l'app vit dans `AppLayout`. Il place la `Sidebar` à gauche, fondue dans le fond de l'app, et le contenu de la page dans un conteneur blanc arrondi, bordé d'un liseré, avec un padding de `24px 32px`. Le sélecteur de périmètre et le profil utilisateur sont en pied de Sidebar.

```tsx
// AppShell.tsx
import { useState, type ReactNode } from "react";
import { AppLayout, Sidebar, Icons, Toaster } from "@ddaoellena/cadence-ui";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [reseauId, setReseauId] = useState("bordeaux");

  return (
    <AppLayout
      sidebar={
        <Sidebar
          product="datahub"
          clientName="Bordeaux Métropole"
          activeId="scenarios"
          onItemClick={(id) => navigate(id)}
          sections={[
            { id: "home", label: "Accueil", icon: <Icons icon="home" size={20} /> },
            {
              id: "disruptions", label: "Perturbations", icon: <Icons icon="alert-triangle" size={20} />,
              items: [
                { id: "scenarios", label: "Scénarios" },
                { id: "history", label: "Historique" },
              ],
            },
          ]}
          scope={{ options: reseaux, value: reseauId, onChange: setReseauId }}
          user={{ name: "Hector Malot" }}
          onLogout={logout}
        />
      }
    >
      {children}
      {/* Une seule pile de notifications pour toute l'app : useToast() partout ailleurs */}
      <Toaster />
    </AppLayout>
  );
};
```

- ✅ Le contenu commence par un `PageHeader` (titre, sous-titre, actions) : pas de padding à ajouter, `AppLayout` le fournit. Le `PageHeader` se colle en haut du conteneur au défilement.
- ✅ Le repli de la Sidebar élargit le conteneur sans code applicatif.
- ❌ Pas de `Header` (supprimé en 0.4.0) ni de wrapper `position: fixed`.

### Recette 2 — Page liste avec sélection multiple

Liste de `TableCard` avec en-têtes triables, sélection multiple, barre d'actions groupées et confirmation de suppression. Couvre : `TableHeader`, `TableCard`, `GhostButton` (actions par ligne), `BulkActionBar`, `Modal`, `useToast` (avec un `<Toaster />` monté à la racine de l'app), `TabList` + `Tab`, tri et filtres.

```tsx
import { useState } from "react";
import {
  Tab, TabList, PrimaryButton, GhostButton, BulkActionBar, TableHeader, TableCard, Modal, Indicator, useToast,
} from "@ddaoellena/cadence-ui";

// Largeurs partagées entre TableHeader et TableCard — NE PAS désynchroniser
const COL = { date: 110, severity: 110 };

export const ScenarioListPage = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Le <Toaster /> est monté une seule fois à la racine de l'app (recette 1).
  const { toast } = useToast();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"current" | "upcoming" | "past">("current");

  const toggleRow = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });

  return (
    <div>
      {/* ── Barre titre : onglets + création ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <TabList aria-label="État des scénarios">
          <Tab label="En cours" variant={view === "current" ? "active" : "default"} onClick={() => setView("current")} />
          <Tab label="À venir" variant={view === "upcoming" ? "active" : "default"} onClick={() => setView("upcoming")} />
          <Tab label="Passées" variant={view === "past" ? "active" : "default"} onClick={() => setView("past")} />
        </TabList>
        <PrimaryButton label="Créer un scénario" onClick={onCreate} />
      </div>

      {/* ── En-têtes de colonnes ── */}
      <TableHeader
        columns={[
          { key: "spacer", label: "", width: 220 },
          { key: "date", label: "Créé le", sortable: true, sortDirection: sortDir,
            onSort: () => setSortDir((d) => (d === "asc" ? "desc" : "asc")), width: COL.date },
          { key: "info", label: "Informations et impacts", flex: 1 },
          { key: "severity", label: "Sévérité", width: COL.severity },
        ]}
      />

      {/* ── Lignes ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row) => (
          <TableCard
            key={row.id}
            title={row.title}
            icon="route"
            checkboxState={selected.has(row.id) ? "checked" : "unchecked"}
            state={selected.has(row.id) ? "selected" : "default"}
            onCheckboxChange={(checked) => toggleRow(row.id, checked)}
            actions={
              <>
                <GhostButton size="sm" icon="copy-01" aria-label="Dupliquer" onClick={() => onDuplicateOne(row.id)} />
                <GhostButton size="sm" icon="edit-02" aria-label="Modifier" onClick={() => onEdit(row.id)} />
                <GhostButton size="sm" icon="trash" aria-label="Supprimer" tone="danger" onClick={() => onDeleteOne(row.id)} />
              </>
            }
            columns={[
              { key: "date", content: <span>{row.createdAt}</span>, width: COL.date },
              { key: "info", content: <span>{row.info}</span>, flex: 1 },
              { key: "severity", content: <Indicator variant={row.severity} />, width: COL.severity },
            ]}
          />
        ))}
      </div>

      {/* ── Actions groupées : barre flottante, masquée sans sélection ── */}
      <BulkActionBar
        count={selected.size}
        countLabel={(n) => (n > 1 ? `${n} scénarios sélectionnés` : `${n} scénario sélectionné`)}
      >
        <GhostButton size="sm" iconStart="x-close" label="Tout désélectionner" onClick={() => setSelected(new Set())} />
        <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" onClick={onDuplicate} />
        <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Supprimer" onClick={() => setConfirmOpen(true)} />
      </BulkActionBar>

      {/* ── Confirmation de suppression ── */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Supprimer ${selected.size} scénario(s) ?`}
        size="small"
        secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
        primaryAction={{
          label: "Supprimer",
          destructive: true,
          onClick: () => {
            deleteSelected();
            setConfirmOpen(false);
            toast({ type: "success", title: "Scénarios supprimés" });
          },
        }}
      >
        Cette action est irréversible.
      </Modal>
    </div>
  );
};
```

### Recette 3 — Page formulaire

Formulaire en sections, largeur contenue, soumission en bas à droite. Les **panneaux de premier niveau** (formulaire puis synthèse) s'empilent verticalement ; le multi-colonnes n'apparaît qu'**à l'intérieur** des sections (`FieldRow`). Voir [Composition des panneaux](#composition-des-panneaux-sur-une-page-formulaire) et le pattern **Formulaire**.

```tsx
import {
  PageHeader, PageSection, FieldRow, FormActions, TextInput, TextArea, Dropdown, DatePicker, CounterInput,
  SegmentedControl, DescriptionList, PrimaryButton, GhostButton, Link,
} from "@ddaoellena/cadence-ui";

export const ScenarioFormPage = () => (
  // Conteneur de page : flexDirection "column" → les panneaux de premier niveau s'empilent
  <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
    <PageHeader title="Créer un scénario" />

    {/* ══ PANNEAU 1 — Formulaire ══ */}
    <PageSection title="Informations générales">
      <TextInput label="Titre" placeholder="Ex : Tronçon Melun – Montereau" value={title} onChange={(e) => setTitle(e.target.value)} />
      {/* ✅ multi-colonnes AUTORISÉ à l'intérieur d'une section */}
      <FieldRow>
        <Dropdown label="Type" options={typeOptions} value={type} onChange={setType} placeholder="Sélectionner" />
        <Dropdown label="Cause" options={causeOptions} value={cause} onChange={setCause} placeholder="Sélectionner" />
      </FieldRow>
      <SegmentedControl
        options={[{ value: "planned", label: "Planifiée" }, { value: "immediate", label: "Immédiate" }]}
        value={mode}
        onChange={setMode}
        aria-label="Mode de déclenchement"
      />
    </PageSection>

    <PageSection title="Période">
      {/* Exception « saisie avec heures » : DateRangePicker ne gère pas les heures,
          d'où deux DatePicker withTime. Sans heure → un seul DateRangePicker. */}
      <FieldRow>
        <DatePicker label="Début" value={start} onChange={setStart} withTime />
        <DatePicker label="Fin" value={end} onChange={setEnd} withTime />
      </FieldRow>
      <CounterInput label="Durée estimée" min={0} max={480} step={15} unit="min" value={duration} onChange={setDuration} />
      <TextArea label="Description" placeholder="Impacts attendus, mesures prises…" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
    </PageSection>

    {/* ══ PANNEAU 2 — Synthèse / vérification ══ */}
    {/* ❌ JAMAIS à droite du formulaire — toujours EN DESSOUS */}
    <PageSection title="Récapitulatif" gap={12}>
      <DescriptionList
        aria-label="Scénario à créer"
        items={[
          { id: "title", label: "Titre", value: title },
          { id: "type", label: "Type et cause", value: type && cause ? `${type} · ${cause}` : undefined },
          { id: "period", label: "Période", value: start && end ? `${formatDateTime(start)} → ${formatDateTime(end)}` : undefined },
          { id: "duration", label: "Durée estimée", value: `${duration} min` },
        ]}
      />
    </PageSection>

    {/* ══ Soumission ══ */}
    <FormActions>
      <Link hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
      <GhostButton label="Réinitialiser" onClick={onReset} />
      <PrimaryButton label="Créer le scénario" onClick={onSubmit} />
    </FormActions>
  </div>
);
```

### Recette 4 — Empty state

Utiliser le composant `EmptyState` (ne plus assembler l'état vide à la main). `variant`
choisit la sémantique : `"empty"` (rien encore), `"no-results"` (filtres trop restrictifs),
`"error"` (chargement échoué) — les deux derniers portent `role="status"`. `size="page"`
pour une vue entière, `size="inline"` dans un `DataTable`, une `Card` ou un graphique.

```tsx
// Page vide
<EmptyState
  variant="empty"
  title="Aucun scénario créé pour ce réseau"
  description="Créez un premier scénario pour commencer à planifier."
  action={{ label: "Créer le premier scénario", onClick: onCreate }}
/>

// Sans résultat, dans un DataTable (emptyState accepte un ReactNode)
<DataTable
  /* … */
  emptyState={
    <EmptyState
      variant="no-results"
      size="inline"
      title="Aucune course ne correspond à ces filtres"
      action={{ label: "Réinitialiser les filtres", onClick: resetFilters }}
    />
  }
/>
```

### Recette 5 — Page de supervision

Liste de gros volume paginée par l'API : `FilterBar` au-dessus, `DataTable` (tri et pagination côté serveur, sélection), `BulkActionBar`, `Pagination` en dessous. Gabarit vérifié : pattern **Liste / index**.

```tsx
import { useEffect, useState } from "react";
import {
  FilterBar, DataTable, BulkActionBar, Pagination, Dropdown, PrimaryButton, GhostButton, Badge, Indicator,
  type DataTableColumn, type DataTableSort,
} from "@ddaoellena/cadence-ui";

// Colonnes au niveau module : référence stable
const COLUMNS: DataTableColumn<Disruption>[] = [
  { id: "title", header: "Perturbation", accessor: (d) => d.title, minWidth: 260, sortable: true },
  { id: "line", header: "Ligne", accessor: (d) => d.line, width: 120, sortable: true, cell: (d) => <Badge label={d.line} /> },
  { id: "start", header: "Début", accessor: (d) => d.start, width: 150, sortable: true },
  { id: "impactedStops", header: "Arrêts impactés", accessor: (d) => d.impactedStops, numeric: true, width: 160, sortable: true },
  { id: "severity", header: "Sévérité", accessor: (d) => d.severity, width: 160, sortable: true,
    cell: (d) => <Indicator variant={d.severity} /> },
];
const EMPTY: Disruption[] = [];

export const SupervisionPage = () => {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("all");
  const [sort, setSort] = useState<DataTableSort[]>([{ id: "start", desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<{ items: Disruption[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Toute modification de requête ramène en page 1
  const update = (apply: () => void) => { apply(); setPage(1); setLoading(true); };

  useEffect(() => {
    let cancelled = false;
    api.disruptions({ query, line, sort, page, pageSize }).then((r) => {
      if (!cancelled) { setResult(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [query, line, sort, page, pageSize]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FilterBar
        search={{ value: query, onChange: (v) => update(() => setQuery(v)), placeholder: "Rechercher une perturbation…" }}
        quickFilters={<Dropdown variant="button" aria-label="Ligne" options={lineOptions} value={line} onChange={(id) => update(() => setLine(id))} />}
        activeFilters={line !== "all" ? [{ id: "line", label: line }] : []}
        onRemoveFilter={() => update(() => setLine("all"))}
        resultCount={result?.total}
        actions={<GhostButton size="sm" iconStart="download-02" label="Exporter" />}
      />

      {/* Tableau et barre d'actions groupées dans le même conteneur */}
      <div>
        <DataTable
          aria-label="Perturbations"
          columns={COLUMNS}
          data={result?.items ?? EMPTY}
          getRowId={(d) => d.id}
          manualSorting
          manualPagination
          sort={sort}
          onSortChange={(next) => update(() => setSort(next))}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(d) => navigate(`/perturbations/${d.id}`)}
          maxHeight="calc(100vh - 320px)"
          emptyState="Aucune perturbation ne correspond à ces filtres."
        />
        <BulkActionBar
          count={selectedIds.length}
          countLabel={(n) => (n > 1 ? `${n} perturbations sélectionnées` : `${n} perturbation sélectionnée`)}
        >
          <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" />
          <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Clôturer" onClick={onConfirm} />
        </BulkActionBar>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={result?.total ?? 0}
        onPageChange={(p) => { setPage(p); setLoading(true); }}
        onPageSizeChange={(size) => update(() => setPageSize(size))}
      />
    </div>
  );
};
```

- ✅ `data` de repli stable (`EMPTY` au niveau module), jamais `?? []` dans le rendu.
- ✅ La sélection est conservée par ids entre les pages ; la case d'en-tête ne porte que sur la page affichée.
- ✅ En mode serveur, `loading` garde les lignes affichées (atténuées) pendant le rechargement : pas de saut de mise en page.

### Recette 6 — Tableau de bord de supervision

Haut d'écran : période d'analyse, grille de `Card` indicateurs (cliquables par `onClick` + `actionLabel`) qui mènent à la liste filtrée, puis la liste (recette 5) filtrée par la même période.

```tsx
import { useState } from "react";
import { Card, CardGrid, DateRangePicker, PageHeader, type DateRange } from "@ddaoellena/cadence-ui";

export const SupervisionDashboard = () => {
  const [period, setPeriod] = useState<DateRange>(last7Days());
  const stats = useStats(period); // { trips, punctuality, delay, disruptions, … } calculés côté API

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* En-tête collé en haut ; dashboard : sélecteur en variante bouton, nommé par aria-label */}
      <PageHeader
        title="Supervision"
        subtitle={`Dernière synchronisation le ${formatDateTime(stats.syncedAt)}`}
        actions={
          <DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} maxDate={new Date()} maxDays={92} />
        }
      />

      <CardGrid>
        <Card headingLevel={2} title="Courses réalisées" value={stats.trips} delta={{ value: stats.tripsDelta, label: "vs période précédente" }}
          loading={stats.loading} />
        <Card headingLevel={2} title="Ponctualité" value={stats.punctuality} unit="%" delta={{ value: stats.punctualityDelta, unit: "pt" }}
          trend={stats.punctualityTrend} loading={stats.loading} />
        <Card headingLevel={2} title="Retard moyen" value={stats.delay} unit="min" goodDirection="down"
          delta={{ value: stats.delayDelta, label: "vs période précédente" }} loading={stats.loading} />
        <Card headingLevel={2} title="Perturbations actives" value={stats.disruptions} goodDirection="down"
          status={stats.disruptions > 20 ? "critical" : undefined} statusLabel="Seuil dépassé"
          actionLabel="Voir les perturbations" onClick={() => navigate("/perturbations?etat=actives")} loading={stats.loading} />
      </CardGrid>

      {/* Liste filtrée par la même période : voir la recette 5 */}
    </div>
  );
};
```

- ✅ La période vit au niveau de la page : elle filtre à la fois les indicateurs et la liste.
- ✅ `loading` sur chaque carte pendant le rechargement : la grille garde sa taille.
- ✅ Une carte cliquable ouvre la liste déjà filtrée (`onClick`), avec son bouton visible (`actionLabel` : « Voir les perturbations »).

### Recette 7 — Tableau de bord d'analyse

`PageHeader` (période en variante bouton), une ligne de `Card` indicateurs, l'évolution en `LineChart`, puis le motif jour × heure (`Heatmap`) à côté du classement (`BarList`). Chaque graphique gère ses états à partir de la requête.

```tsx
import { useState } from "react";
import { BarList, Card, CardGrid, DateRangePicker, Heatmap, LineChart, PageHeader, type DateRange } from "@ddaoellena/cadence-ui";

export const AnalysisDashboard = () => {
  const [period, setPeriod] = useState<DateRange>(last7Days());
  const stats = useAnalysis(period); // { status, kpis, hourlyDelays, strike, cells, topLines, … } côté API
  const state = stats.status === "pending" ? "loading" : stats.status === "error" ? "error" : "ready";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Analyse des perturbations"
        subtitle={`Dernière synchronisation le ${formatDateTime(stats.syncedAt)}`}
        actions={<DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} maxDays={92} />}
      />

      <CardGrid>
        <Card headingLevel={2} title="Retard moyen" value={stats.kpis.delay} unit="min" goodDirection="down"
          delta={{ value: stats.kpis.delayDelta, label: "vs période précédente" }} trend={stats.kpis.delayTrend} loading={state === "loading"} />
        <Card headingLevel={2} title="Ponctualité" value={stats.kpis.punctuality} unit="%"
          delta={{ value: stats.kpis.punctualityDelta, unit: "pt" }} loading={state === "loading"} />
        <Card headingLevel={2} title="Perturbations" value={stats.kpis.disruptions} goodDirection="down"
          actionLabel="Voir les perturbations" onClick={() => navigate("/perturbations")} loading={state === "loading"} />
      </CardGrid>

      <LineChart
        framed
        headingLevel={2}
        title="Retard moyen par heure"
        description="Toutes lignes, sur la période"
        state={state}
        onRetry={stats.refetch}
        unit="min"
        goodDirection="down"
        series={[{ id: "delay", label: "Retard moyen", data: stats.hourlyDelays }]}
        thresholds={[{ value: 5, label: "Seuil d'alerte 5 min" }]}
        annotations={stats.strike ? [{ at: [stats.strike.start, stats.strike.end], label: stats.strike.label }] : []}
      />

      <CardGrid min={360} fit>
        <Heatmap
          framed
          headingLevel={2}
          title="Perturbations par jour et par heure"
          state={state}
          unit="perturbations"
          xLabels={HOURS}
          yLabels={WEEKDAYS}
          cells={stats.cells}
          onCellClick={(c) => navigate(`/perturbations?jour=${c.y}&heure=${c.x}`)}
        />
        <BarList
          framed
          headingLevel={2}
          title="Lignes les plus impactées"
          state={state}
          unit="perturbations"
          goodDirection="down"
          items={stats.topLines}
          limit={5}
          onShowAll={() => navigate("/lignes")}
          onItemClick={(item) => navigate(`/lignes/${item.id}`)}
        />
      </CardGrid>
    </div>
  );
};
```

- ✅ Un seul `h1` (le `PageHeader`) ; les cartes et les graphiques en `headingLevel={2}`.
- ✅ La même période pilote tous les blocs ; l'état de la requête (`loading`, `error` + `onRetry`) est passé à chaque graphique.
- ✅ Grilles fluides (`CardGrid`, `fit` pour étirer la dernière rangée), jamais de largeur fixe ; graphiques voisins encadrés (`framed`).

---

### Recette 8 — Détail d'une perturbation

Pattern **Liste + détail latéral** (gabarit vérifié : `src/patterns/ListeDetailPattern.tsx`) : `AppLayout` + `Sidebar` + `PageHeader`, liste `DataTable`, ouverture d'un `Drawer`, `InlineAlert`, `Accordion`, `LineBadge` et `StopLabel`. Les métadonnées utilisent `DescriptionList` et l’historique local utilise `ActivityFeed`. Pour situer les perturbations sur un axe temps (durées, chevauchements), ajouter un `Timeline` dont chaque plage ouvre le `Drawer` via `onItemClick`. Pour restreindre la liste à une branche du réseau (mode → ligne → parcours), un `TreeView` sert de volet de navigation à gauche, les enfants d'une ligne pouvant être chargés à la demande (`loadChildren`).

### Recette 9 — Import réseau et correction des erreurs

Pattern **Assistant / import** (gabarit vérifié : `src/patterns/AssistantPattern.tsx`) : `Stepper`, `TextInput`, `FileUpload`, résumé d'erreurs (`ErrorSummary` + refs), `Autocomplete multiple`, vérification et `ProgressBar`. Pour corriger les couleurs de lignes importées (GTFS `route_color`), utiliser `ColorField` (hex validé, aperçu `LineBadge`, contrôle de contraste).

L'application assure la lecture du fichier, la validation métier (schéma GTFS), le transfert, l'annulation et la reprise : les composants n'en font aucun.

### Recette 10 — Planification d'un service de nuit

Pattern **Planification / temps** (gabarit vérifié : `src/patterns/PlanificationPattern.tsx`) : deux `TimePicker allowOvernight`, validation native et comparaison début/fin par l'app, `ErrorSummary` pour revenir au champ fautif, puis `DescriptionList` et `ActivityFeed` après enregistrement local. `25:30` est conservé comme heure de service, sans conversion de date. Le formulaire utilise `noValidate` et appelle donc explicitement `checkValidity()` avant d'enregistrer.

## Référence API des composants

**Source de vérité des props.** Si une prop n'est pas listée ici, elle n'existe pas — ne pas en inventer. Convention : les props sans défaut indiqué sont `undefined` ; ⚠️ signale les pièges courants. `className` (classe additionnelle sur la racine) est accepté par tous les composants, même quand la fiche ne le liste pas : il sert au layout, jamais à recolorer.

### Card

Carte de tableau de bord : titre (obligatoire), statut, valeur et évolution, mini-courbe, description, bouton d'action, illustration. Remplace `KpiCard` et `ActionCard` (supprimés en 0.4.0).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Titre de la carte (rendu en `<hN>`) |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Niveau de titre |
| `description` | `string` | — | Texte secondaire : sous la valeur, ou sous le titre si la carte n'a pas de valeur |
| `value` | `number \| string` | — | Nombre formaté en fr-FR (police mono) ; chaîne affichée telle quelle (`"N/D"`) |
| `unit` | `string` | — | Unité accolée (`"min"`, `"%"`) |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | Ex. `{ notation: "compact" }` → « 1,2 M » |
| `delta` | `{ value: number, unit?: "%" \| "pt" \| "", label?: string }` | — | Variation signée (« +1,8 % », « −0,6 pt ») ; `label` : « vs hier ». Défaut d'unité `"%"` |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Sens favorable : colore la variation (vert / rouge / gris). ⚠️ `"down"` pour un retard |
| `status` | `IndicatorVariant` | — | `Indicator` à droite du titre (seuil dépassé…) |
| `statusLabel` | `string` | label de la variante | — |
| `trend` | `number[]` | — | Mini-courbe (2 points minimum), de la plus ancienne à la plus récente |
| `loading` | `boolean` | `false` | Squelettes à la place de la valeur et de la variation |
| `onClick` | `() => void` | — | Toute la carte devient cliquable. ⚠️ Exige `actionLabel` (bouton visible qui porte le clic, zone étirée sur la carte) ; exclusif avec `onAction` |
| `actionLabel` | `string` | — | Bouton `PrimaryButton outline size="sm"` en bas à gauche. Avec `onClick` : **obligatoire**, il signale et porte le clic de toute la carte. Avec `onAction` : seul lui est cliquable |
| `onAction` | `() => void` | — | Clic sur le bouton d'action seul (exige `actionLabel`). ⚠️ Exclusif avec `onClick` |
| `actionIcon` | nom d'icône `Icons` | — | Icône avant le libellé du bouton |
| `illustration` | `ReactNode` | — | Illustration décorative en bas à droite (`aria-hidden`), hauteur max 96px, largeur max 50 % |
| `className` | `string` | — | — |

- La variation est aussi annoncée en phrase complète aux lecteurs d'écran : « en baisse de 12 % vs hier, favorable ».
- ⚠️ Le style du bouton d'action est fixe (`outline`, `sm`) : pas de prop pour le changer.
- ⚠️ `illustration` est décorative et masquée aux lecteurs d'écran : jamais d'information utile dedans, jamais d'URL distante (fichier local ou SVG inline).

### AppLayout

Squelette d'application : la `Sidebar` à gauche et le contenu de la page dans un conteneur blanc arrondi (`--cadence-radius-xl`), bordé d'un liseré (`--cadence-color-border`), avec un padding de `24px 32px`. Plein écran (`100vh`) : seul le conteneur défile, et ses barres de scroll (verticale comme horizontale) restent dans l'arrondi.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `sidebar` | `ReactNode` | **requis** | La `Sidebar` de l'app |
| `children` | `ReactNode` | **requis** | Contenu de la page |
| `contentLabel` | `string` | `"Contenu principal"` | Nom accessible de la zone `<main>` |
| `className` | `string` | — | — |

⚠️ Le fond de l'app reprend la couleur produit de la `Sidebar` passée dans `sidebar` (datahub par défaut). Il est lu par CSS (`:has()`) : pas de prop `product` à dupliquer.
⚠️ Le conteneur suit la largeur courante de la Sidebar (dépliée ou repliée) sans mesure : ne pas ajouter de `marginLeft` ni de `position: fixed`.

### AlertToast

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"information" \| "success" \| "warning" \| "error"` | `"information"` | Couleur d'accent + icône de statut. ⚠️ Pas de prop `variant`. |
| `title` | `string` | label du type : `Information`, `Succès`, `Avertissement`, `Erreur` | Titre en gras |
| `description` | `string` | — | Texte secondaire. Sans valeur, la ligne n'est pas rendue |
| `progress` | `number` (0-100) | — | Barre de progression (masquée si absent) |
| `actions` | `[AlertToastAction]` ou `[AlertToastAction, AlertToastAction]` | — | 1 à 2 boutons `size="sm"` (`{ label, onClick?, outline? }`) **faible emphase** : `outline` (défaut pour la 1re) → `GhostButton` (secondaire), sinon → `PrimaryButton outline` (principale). **Jamais de bouton rempli dans un toast.** |
| `dismissible` | `boolean` | auto `true` si `actions` | Affiche le bouton × |
| `onDismiss` | `() => void` | — | Clic sur ×. ⚠️ Pas de prop `onClose`. |
| `className`, `style` | — | — | Échappatoires |

Annonce aux lecteurs d'écran selon le type : `error` et `warning` → immédiate (`role="alert"`) ; `success` et `information` → polie (`role="status"`). Dans le `Toaster`, deux régions live permanentes (montées avant le premier toast) portent ces annonces, et les cartes affichées n'ont pas de rôle : chaque toast est annoncé une fois, de façon fiable. Un `AlertToast` monté seul porte lui-même son rôle ; inséré déjà rempli, il peut ne pas être annoncé — passer par `useToast`.

### Autocomplete

Champ de recherche qui filtre une liste statique en interne. Choix **strict** dans la liste (le texte non validé est réinitialisé à la fermeture). Simple ou multiple via `multiple`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `AutocompleteOption[]` | **requis** | `{ id, label, description?, group?, icon?, content?, disabled? }` |
| `label` | `string` | — | Label au-dessus du champ |
| `placeholder` | `string` | `"Rechercher…"` | — |
| `multiple` | `boolean` | `false` | `true` → sélection multiple, chips `Badge` supprimables dans le champ |
| `value` | `string \| string[]` | — | ⚠️ `string` (id) si simple, `string[]` (ids) si `multiple` |
| `onChange` | `(value: string \| string[] \| null) => void` | — | ⚠️ `id \| null` si simple, `ids[]` si `multiple` |
| `disabled` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | Ouvre le menu au montage (afficher favoris / historique au focus) |
| `noResultsLabel` | `string` | `"Aucun résultat"` | Message si le filtre ne renvoie rien |

**Options groupées et enrichies** — chaque `AutocompleteOption` accepte : `description` (ligne secondaire grise, ex. adresse), `group` (catégorie → en-tête de groupe ; l'ordre des groupes suit leur 1re apparition), `content` (ReactNode libre sous le libellé, ex. badges de lignes). Voir la story *With Categories*.

Clavier : ↑/↓ pour naviguer, Entrée pour sélectionner l'option surlignée, Échap pour fermer, Retour arrière (champ vide, mode multiple) pour retirer le dernier chip.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `onInputChange` | `(query: string) => void` | — | Saisie et réinitialisations après sélection/Échap/sortie clavier. |
| `filter` | `boolean` | true | false : conserve les options fournies, leur classement et leur libellé. |
| `minChars` | `number` | 0 | Nombre de caractères avant de présenter des résultats. |
| `loading` | `boolean` | false | Annonce le chargement et rend les anciennes options indisponibles. |
| `limit` | `number` | — | Maximum d’options affichées ; toutes par défaut. |

```tsx
<Autocomplete label="Zone" options={results} onInputChange={search} filter={false} minChars={2} loading={loading} limit={20} />
```

✅ Recherche locale insensible aux accents sur label + description. Les libellés sélectionnés sont conservés lorsque les résultats changent. ⚠️ L’application assure le debounce, les erreurs et l’annulation des réponses périmées ; limiter les résultats avant de les transmettre. `minChars` ne déclenche aucune requête. ❌ Ne pas transmettre les 640 000 options pour une recherche distante.

### Avatar

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `src`, `alt` | `string` | — | Image (sinon initiales depuis `name`) |
| `name` | `string` | — | Génère les initiales |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Taille |
| `color` | `"green" \| "blue" \| "orange" \| "purple" \| "gray"` | — | Fond des initiales |
| `showIcon` | `boolean` | `false` | Icône placeholder à la place des initiales |
| `email` | `string` | — | Sous-titre (layout profil) |
| `showProfile` | `boolean` | `false` | Carte profil : avatar + nom + email |

### Badge

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Texte du badge |
| `draggable` | `boolean` | `false` | Handle de drag à gauche |
| `dismissible` | `boolean` | `false` | Croix × à droite |
| `mono` | `boolean` | `false` | Police Spline Sans Mono |
| `onDismiss` | `() => void` | — | Clic sur la croix |
| `onDragStart`, `onDragEnd` | `(e: DragEvent) => void` | — | Événements de drag |

### BarChart

Barres empilées ou groupées, verticales ou horizontales : comparaison de catégories, série par série. Chaque série a une couleur (`--cadence-dataviz-series-N`) et un motif (unie, hachures, points, lignes…), repris dans la légende et le tooltip. Tooltip par catégorie (avec le total si empilé), navigation au clavier, « Voir les données » (avec le total). Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `categories` | `string[]` | **requis** | Libellés (axe X en vertical, axe Y en horizontal) |
| `series` | `{ id, label, data: (number \| null)[], color?, reference? }[]` | **requis** | Une valeur par catégorie, dans l'ordre ; `color` : token attendu. `reference: true` : trait tireté en travers de chaque catégorie (N-1), hors empilement et groupement ; écart avec la série (ou le total empilé) au survol |
| `layout` | `"stacked" \| "grouped"` | `"stacked"` | Barres empilées ou côte à côte |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal pour des libellés longs ou de nombreuses catégories |
| `unit` | `string` | — | Tooltip, tableau |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `showValues` | `boolean` | `false` | Valeur au bout des barres (total de la pile si empilé) |
| `showLegend` | `boolean` | `true` | Légende cliquable (dès deux séries) |
| `showGrid` | `boolean` | `true` | Lignes de grille |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu), ex. quand une `Card` affiche déjà le titre |
| `height` | `number` | `280` en vertical ; 36px par catégorie en horizontal | Hauteur du tracé |
| `annotations` | `{ at: string \| [début, fin], label }[]` | `[]` | Événements (grève, travaux) : bande libellée sur une catégorie ou un intervalle de catégories, rappelée au survol |
| `onDatumClick` | `(datum: BarChartDatum) => void` | — | Catégorie cliquable (ouvrir le détail, filtrer une liste) : clic sur sa **bande entière** (toute la hauteur du tracé, pas seulement la barre), ou Entrée / Espace sur la catégorie active. `BarChartDatum` : `{ category, index, values: { seriesId, value }[] }`, séries de référence exclues. Curseur `pointer`, rappel dans le tooltip et la description lue ; dans « Voir les données », les en-têtes de ligne deviennent des boutons |
| `selectedCategory` | `string` | — | Catégorie mise en avant, **contrôlée** (filtre actif côté app) : contour plein en encre principale, autres barres atténuées, « sélectionné » dans l'annonce, ligne marquée `aria-current` dans le tableau |
| `clickHint` | `string` | `"Entrée ou clic : voir le détail"` | Rappel d'interaction (tooltip, `aria-describedby`) ; à adapter (« Entrée ou clic : filtrer les réceptions ») |

Clavier : le tracé est focusable ; ←/→ (vertical) ou ↑/↓ (horizontal) d'une catégorie à l'autre, Début / Fin, Échap masque le tooltip ; la catégorie est annoncée (`aria-live`). Avec `onDatumClick`, Entrée ou Espace activent la catégorie active.

- ⚠️ L'unité de clic est la **catégorie** : dans un graphique empilé, toute la colonne ; le datum contient toutes les séries (masquées par la légende comprises).
- ⚠️ Une catégorie sans valeur (`null` dans toutes les séries hors référence) n'est pas cliquable : ni appel, ni rappel, ni bouton dans le tableau.
- ⚠️ Le graphique ne gère pas la sélection : `onDatumClick` ne change rien tout seul. Pour un filtre, mettre à jour `selectedCategory` dans le callback et proposer l'effacement côté app (`selectedCategory={undefined}`).
- ⚠️ Sans `onDatumClick`, rendu et comportement sont strictement ceux d'avant (pas de curseur, Entrée sans effet).

```tsx
<BarChart
  title="Perturbations par cause"
  description="Semaine du 14 octobre 2026"
  unit="perturbations"
  categories={["mer. 14", "jeu. 15", "ven. 16", …]}
  series={[
    { id: "works", label: "Travaux", data: [6, 5, 4, …] },
    { id: "technical", label: "Incident technique", data: [8, 11, 7, …] },
  ]}
/>

<BarChart title="Retard cumulé par ligne" orientation="horizontal" unit="min" categories={lignes} series={parCause} showValues />

{/* Navigation : la barre ouvre le détail ; filtre actif contrôlé par l'app */}
<BarChart
  title="Activité du flux sur 12 h"
  unit="réceptions"
  categories={creneaux}
  series={[{ id: "received", label: "Réceptions", data: receptions }]}
  selectedCategory={creneau}
  onDatumClick={(d) => setCreneau(d.category)}
  clickHint="Entrée ou clic : filtrer les réceptions"
/>
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `maxTicks` | `number` | — | Maximum de libellés de catégorie, réduit davantage si la largeur l’impose. Omettre conserve tous les libellés ; minimum 1. |

```tsx
<BarChart title="Activité" categories={slots} series={series} maxTicks={12} onDatumClick={openSlot} />
```

### BarList

Les éléments acceptent aussi `absoluteValue?: number` et `absoluteUnit?: string` (sans défaut) pour montrer un écart absolu signé à côté du pourcentage ; si fourni, il remplace visuellement delta et s’ajoute au nom accessible et au tableau.

Classement horizontal : libellé, barre proportionnelle (`--cadence-dataviz-series-1`), valeur en mono alignée à droite, variation facultative. Hauteur : 32px par ligne. Props communes des graphiques : `title` (**requis**), `description`, `headingLevel` (3), `state` (`"ready" | "loading" | "empty" | "error"`), `emptyMessage`, `errorMessage`, `onRetry`, `framed` (false : cadre de carte — bordure, arrondi, marge — pour délimiter des graphiques voisins), `exportable` (false ; `true` ou un nom de fichier : bouton « Exporter (CSV) » dans l'en-tête, qui télécharge l'alternative tabulaire en CSV `;` + BOM UTF-8, nombres sans espaces de groupement), `onExport` (reprend l'export : `{ columns, rows, numeric, csv, fileName }`), `freshness` (`{ updatedAt, now?, freshWithin?, staleWithin?, label?, timeZone? }` : `DataFreshness` sous la description), `className`. Export et fraîcheur valent pour tous les graphiques qui ont « Voir les données » (pas `Heatmap`, qui est elle-même une grille).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{ id, label: ReactNode, ariaLabel?, value, delta?: { value, unit? } }[]` | **requis** | `ariaLabel` obligatoire si `label` n'est pas du texte |
| `sort` | `"none" \| "desc"` | `"none"` | `"desc"` : tri par valeur décroissante |
| `unit` | `string` | — | « perturbations », « min » |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Couleur de la variation (comme `Card`) |
| `limit` | `number` | — | N premières lignes |
| `onShowAll` | `() => void` | — | Lien « Voir tout (N) », affiché si des lignes sont masquées |
| `onItemClick` | `(item) => void` | — | Lignes cliquables : boutons nommés « Ligne 13 : 42 perturbations, en hausse de 12 %, défavorable » |

```tsx
<BarList
  title="Lignes les plus impactées"
  unit="perturbations"
  goodDirection="down"
  items={top10}
  limit={5}
  onShowAll={() => navigate("/lignes")}
  onItemClick={(item) => navigate(`/lignes/${item.id}`)}
/>
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `mode` | `"positive" \| "diverging"` | "positive" | diverging : axe central, échelle symétrique, valeurs signées, ton selon goodDirection. |
| `tolerance` | `number` | 0 | Demi-largeur de la zone neutre autour de zéro en mode divergent, dans l’unité des valeurs. |

```tsx
<BarList title="Évolution" mode="diverging" tolerance={3} unit="%" items={changes} />
```

### DonutChart

Anneau des parts d'un total (six au plus) : total au centre, légende à côté avec valeur et part. Chaque part a une couleur (`--cadence-dataviz-series-N`) **et** un motif, repris dans la légende. Au-delà de `maxSlices`, les plus petites parts sont regroupées dans « Autres » (dernière part, couleur neutre de la série 8). Survol ou clavier : la part active s'agrandit, les autres s'estompent et le centre affiche sa part du total. « Voir les données » : parts et total. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `slices` | `{ id, label: string, value, color? }[]` | **requis** | Parts dans l'ordre d'affichage (sens horaire depuis midi). Valeurs nulles, négatives ou non finies ignorées ; `color` : token attendu |
| `maxSlices` | `number` | `6` | Au-delà, regroupement dans « Autres » |
| `othersLabel` | `string` | `"Autres"` | Libellé de la part regroupée (« Autres causes ») |
| `unit` | `string` | — | Centre, tableau, annonces |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `centerLabel` | `string` | `"Total"` | Libellé sous le total (suivi de l'unité) |
| `showLegend` | `boolean` | `true` | Légende (libellé, valeur, part) ; non cliquable : masquer une part fausserait le total |
| `size` | `number` | `200` | Diamètre en px |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |

Clavier : l'anneau est focusable ; ←/→ (ou ↑/↓) d'une part à l'autre, en boucle, Début / Fin, Échap désactive la part. La part est annoncée (`aria-live`) : « Bus : 1 240 trajets, 42,5 % » ; la description résume le total et la plus grande part.

- ⚠️ Les parts sont calculées sur le total des valeurs fournies : pour une part d'un objectif ou d'une capacité, utiliser `Meter`.
- ⚠️ Pas d'infobulle : le centre de l'anneau en tient lieu.

```tsx
<DonutChart
  title="Parts modales"
  description="Validations du 14 au 20 octobre 2026, en milliers"
  unit="k validations"
  slices={[
    { id: "bus", label: "Bus", value: 1240 },
    { id: "metro", label: "Métro", value: 980 },
    { id: "tram", label: "Tramway", value: 420 },
    { id: "rer", label: "RER", value: 278 },
  ]}
/>
```

### BulletChart

Performance par rapport à un objectif : une ligne par indicateur, avec la barre de la valeur sur des plages qualitatives (insuffisant / moyen / bon en fond, tokens `--cadence-status-*-bg`), le repère d'objectif (trait `--cadence-dataviz-threshold`), la valeur en mono et le **statut écrit** sous le libellé (« Favorable — Bonus dès 92 % »). Les plages sont jugées comme `Gauge` selon `goodDirection`. Lignes non interactives, nommées (`role="group"`) : « Ponctualité : 93,4 %, objectif 92 %, Favorable — Bonus dès 92 % ». « Voir les données » : valeur, objectif, statut. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `BulletChartItem[]` | **requis** | Une ligne par indicateur (voir ci-dessous) |
| `min` | `number` | `0` | Début de l'échelle par défaut : `80` pour un taux contractuel lu entre 80 et 100 % |
| `max` | `number` | `100` | Fin de l'échelle par défaut |
| `unit` | `string` | — | Unité par défaut des lignes (« % ») |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Sens favorable par défaut |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |

`BulletChartItem` : `{ id, label, value, target?, ranges?: { value, label }[], min?, max?, unit?, goodDirection? }`. `ranges` donne les **bornes** libellées entre plages (« Malus sous 85 % », « Bonus dès 92 % ») : une borne → deux plages, deux bornes → trois. `min`, `max`, `unit` et `goodDirection` d'une ligne remplacent ceux du graphique (indicateurs d'unités différentes).

- ✅ Des plages serrées (85 / 92 %) se lisent mieux avec `min={80}` : sur 0 → 100, elles tiennent dans le dernier cinquième de la barre. L'indiquer dans la `description` (« échelle de 80 à 100 % »).
- ⚠️ L'échelle d'une ligne s'étend jusqu'à la valeur, l'objectif ou une borne qui sort de [`min`, `max`] : le nombre réel n'est jamais tronqué.
- ⚠️ Sans `ranges` ou avec `goodDirection="neutral"` : une seule plage neutre, pas de statut.
- ❌ Pas de plage sans libellé : le jugement doit se lire sans la couleur.

```tsx
<BulletChart
  title="Indicateurs du contrat de service public"
  description="Octobre 2026, réseau bus"
  unit="%"
  min={80}
  items={[
    { id: "ponctualite", label: "Ponctualité", value: 93.4, target: 92,
      ranges: [{ value: 85, label: "Malus sous 85 %" }, { value: 92, label: "Bonus dès 92 %" }] },
    { id: "offre", label: "Taux de réalisation de l'offre", value: 96.2, target: 98.5,
      ranges: [{ value: 97, label: "Malus sous 97 %" }, { value: 98.5, label: "Bonus dès 98,5 %" }] },
  ]}
/>
```

### ComboChart

Barres et courbes sur une même période, à **deux axes Y titrés** : volumes en barres sur l'axe gauche, taux en courbes sur l'axe droit. Les couleurs des courbes suivent celles des barres dans la palette (jamais la même couleur deux fois) ; barres avec motif, courbes avec marqueur et motif de trait. Tooltip par catégorie (toutes les séries, chacune avec son unité), légende cliquable, « Voir les données ». Hauteur par défaut 300px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `categories` | `string[]` | **requis** | Libellés de l'axe X (jours, semaines, tranches horaires) |
| `bars` | `{ id, label, data: (number \| null)[] }[]` | **requis** | Séries en barres (axe gauche) |
| `lines` | `{ id, label, data: (number \| null)[] }[]` | **requis** | Séries en courbes (axe droit) |
| `barAxis` | `{ label, unit?, format? }` | **requis** | Titre, unité et format de l'axe gauche |
| `lineAxis` | `{ label, unit?, format?, domain? }` | **requis** | Idem pour l'axe droit ; `domain` impose ses bornes (« 70 → 100 % ») |
| `barLayout` | `"grouped" \| "stacked"` | `"grouped"` | Plusieurs séries de barres côte à côte ou empilées |
| `lineThresholds` | `{ value, label }[]` | `[]` | Seuils libellés, lus sur l'axe droit |
| `showLegend` | `boolean` | `true` | Légende cliquable (masquer une série) |
| `showGrid` | `boolean` | `true` | Grille de l'axe gauche |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `300` | Hauteur du tracé |

Clavier : le tracé est focusable ; ←/→ d'une catégorie à l'autre, Début / Fin, Échap masque le tooltip ; la catégorie est annoncée (`aria-live`) : « mer. 16 — Validations : 236 k, Ponctualité : 81,5 % ».

- ⚠️ Les deux axes ont des échelles indépendantes : un croisement visuel entre une barre et une courbe ne signifie rien. Le dire dans la `description` si le public n'est pas averti.
- ⚠️ `lineAxis.domain` resserré (« 80 → 100 % ») accentue les écarts : l'indiquer par le titre ou la description.

```tsx
<ComboChart
  title="Fréquentation et ponctualité"
  description="Ligne 13, du 14 au 20 octobre 2026"
  categories={["lun. 14", "mar. 15", "mer. 16", …]}
  bars={[{ id: "validations", label: "Validations", data: [412, 428, 236, …] }]}
  lines={[{ id: "ponctualite", label: "Ponctualité", data: [94.2, 93.8, 81.5, …] }]}
  barAxis={{ label: "Validations", unit: "k" }}
  lineAxis={{ label: "Ponctualité", unit: "%", domain: [70, 100] }}
  lineThresholds={[{ value: 92, label: "Objectif 92 %" }]}
/>
```

### BoxPlot

Boîtes à moustaches à partir des **observations brutes**, un groupe par boîte (ligne, créneau). Boîte du 1er au 3e quartile (`--cadence-dataviz-seq-2` bordée de `--cadence-dataviz-series-1`), médiane épaisse, moustaches de Tukey jusqu'aux valeurs extrêmes dans 1,5 × l'écart interquartile, valeurs aberrantes en cercles. Tooltip et annonce par groupe : « Bus 91 : médiane 38,4 min, moitié centrale de 35,7 à 41,4 min, de 30,6 à 45,8 min hors valeurs aberrantes, 3 valeurs aberrantes, 83 courses ». « Voir les données » : effectif, minimum, quartiles, médiane, maximum, nombre de valeurs aberrantes. Hauteur par défaut 280px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `groups` | `{ id, label, values: number[] }[]` | **requis** | Une boîte par groupe, dans l'ordre ; valeurs non finies ignorées |
| `unit` | `string` | — | Unité des valeurs (« min ») |
| `countLabel` | `string` | `"observations"` | Ce que l'on compte, au pluriel (« courses ») |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `thresholds` | `{ value, label }[]` | `[]` | Lignes horizontales libellées (temps prévu, objectif) |
| `yDomain` | `[number, number]` | englobe les valeurs, arrondi | Bornes de l'axe des valeurs |
| `showGrid` | `boolean` | `true` | Grille horizontale |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `280` | Hauteur du tracé |

Clavier : ←/→ d'un groupe à l'autre, Début / Fin, Échap.

- ✅ Comparer la **dispersion** (régularité) entre lignes ou créneaux ; pour une seule distribution détaillée, `Histogram`.
- ⚠️ Moins de 5 valeurs par groupe : quartiles peu parlants, préférer un tableau.

### Breadcrumbs

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | **requis** | `{ id, label, icon?, href?, onClick?, content? }` — le dernier = page courante |
| `separator` | `ReactNode` | chevron | Séparateur custom |
| `onNavigate` | `(id: string) => void` | — | Clic sur un item |
| `className` | `string` | — | — |

`BreadcrumbItem.content` (`ReactNode`) remplace le rendu du libellé — typiquement `<Dropdown variant="button" aria-label="…" />` comme sélecteur de contexte. Le `<li>` et les séparateurs sont conservés ; `label` reste requis et nomme l'élément (`role="group"`) ; `href`, `onClick` et `icon` sont ignorés. ⚠️ Le type de `label` ne change pas : toujours une `string`.

### TreeView

Arborescence dépliable pour une hiérarchie profonde (réseau → mode → ligne → parcours, dépôt → véhicules…). Motif ARIA `tree` **aplati** : chaque ligne est un `treeitem` qui porte `aria-level` / `aria-setsize` / `aria-posinset` (pas de `group` imbriqué), ce qui autorise la virtualisation. Une seule ligne est tabulable (tabindex roving). Au clavier : ↑/↓ entre lignes visibles, → déplie puis entre dans le 1ᵉʳ enfant, ← replie puis remonte au parent, Début / Fin, `*` déplie tous les frères, saisie de la première lettre, Entrée active (`onNodeClick`). Un picto et un contenu secondaire non focusable (`TreeNode.meta` : compteur, `Badge`) sont possibles. Picto : `TreeNode.mode` (picto de mode `ModeIcon`, rempli, 20px) pour les nœuds de réseau (Métro → `metro`, Tramway → `tram`, Bus → `bus`, RER → `train`) ; sinon `TreeNode.icon` (icône d'interface en trait, 16px). ✅ Un mode de transport s'affiche toujours avec `mode`, jamais avec une icône d'interface (`train`, `bus`, `tram` du registre `Icons`). Si les deux sont fournis, `mode` l'emporte.

Sélection `none` | `single` (défaut) | `multiple`. En `multiple`, chaque ligne porte une case **tri-état** (`aria-checked` mixte) : cocher un parent coche tout son sous-arbre, cocher une partie des enfants remonte en « indéterminé ». La sélection est une liste d'identifiants de feuilles (et de parents non encore chargés) — contrôlée (`selectedIds`) ou non (`defaultSelectedIds`).

Chargement à la demande : un nœud `hasChildren` sans `children` déclenche `loadChildren(node)` à son premier dépliage — un `Skeleton` (`aria-busy`) s'affiche pendant le chargement, et une ligne de reprise « Réessayer » (activable à l'Entrée ou au clic) en cas d'échec. Au-delà de `virtualizeThreshold` lignes visibles (500 par défaut), la liste est virtualisée (`@tanstack/react-virtual`) dans une zone de hauteur `maxHeight` (420px par défaut).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `nodes` | `TreeNode[]` | **requis** | `{ id, label, mode?, icon?, children?, hasChildren?, disabled?, meta? }` — `mode` : `ModeName` (prioritaire sur `icon`) |
| `aria-label` | `string` | **requis** | Nom accessible de l'arbre |
| `selection` | `"none" \| "single" \| "multiple"` | `"single"` | Mode de sélection |
| `expandedIds` / `defaultExpandedIds` | `string[]` | — | Nœuds dépliés (contrôlé / au montage) |
| `onExpandedChange` | `(ids: string[]) => void` | — | Changement des dépliages |
| `selectedIds` / `defaultSelectedIds` | `string[]` | — | Sélection (contrôlée / au montage) |
| `onSelectionChange` | `(ids: string[]) => void` | — | Changement de la sélection |
| `loadChildren` | `(node: TreeNode) => Promise<TreeNode[]>` | — | Chargement des enfants d'un nœud `hasChildren` |
| `onNodeClick` | `(node: TreeNode) => void` | — | Activation (Entrée, clic) — ouvrir un détail côté app |
| `virtualizeThreshold` | `number` | `500` | Seuil de virtualisation (lignes visibles) |
| `maxHeight` | `number \| string` | `420` si virtualisé | Hauteur de la zone défilante |
| `emptyLabel` | `string` | `"Aucun élément."` | Texte quand l'arbre est vide |
| `id` / `className` | `string` | — | — |

- ✅ Marquer un parent chargé à la demande avec `hasChildren` (sans `children`) et fournir `loadChildren`.
- ✅ `onNodeClick` pour ouvrir un détail (un `Drawer` côté app), indépendamment du mode de sélection.
- ⚠️ `children: []` (tableau vide) = parent sans enfant (non dépliable), pas un chargement à la demande — pour le différé, utiliser `hasChildren`.
- ⚠️ La case tri-état est un visuel (`aria-hidden`) : l'état de sélection est porté par le `treeitem` (`aria-checked`), jamais par une case focusable à part.
- ❌ Pas pour une liste plate de gros volume avec colonnes de données : `DataTable`. Pas pour la navigation fixe de l'app : `Sidebar`.

### Checkbox

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"unchecked" \| "hover" \| "checked" \| "indeterminate" \| "disabled" \| "disabled-checked"` | `"unchecked"` | ⚠️ Pas de prop `checked` — piloter via `state`. |
| `onChange` | `(nextChecked: boolean) => void` | — | Clic (sauf disabled) |
| `aria-label` | `string` | — | Nom accessible. ⚠️ Obligatoire en pratique quand aucun texte n'accompagne la case (ligne de tableau, « Tout sélectionner ») |

### CounterInput

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | — | Mode contrôlé |
| `defaultValue` | `number` | `0` | Mode non contrôlé |
| `min`, `max` | `number` | — | Bornes (incluses) |
| `step` | `number` | `1` | Pas des boutons − et + ; décimal accepté (`0.5`) |
| `unit` | `string` | — | Unité affichée (ex : `"min"`, `"km"`) |
| `label` | `string` | — | Label au-dessus |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(value: number) => void` | — | — |

Champ bordé de 40px ; les boutons − et + sont des `GhostButton size="sm"` icône seule (« Décrémenter », « Incrémenter »), posés dans le cadre et désactivés seulement quand la valeur est **déjà** sur `min` / `max` : sinon ils vont jusqu'à la borne (valeur 5, pas 15, `min` 0 → « − » donne 0). Toute valeur (bouton ou saisie) est arrondie au pas **puis** bornée : elle reste toujours dans [`min`, `max`], même si la borne n'est pas un multiple du pas (`max` 58, pas 5 → 58, jamais 60). Sans infobulle : leur sens est évident (le nom reste annoncé aux lecteurs d'écran). La valeur reste saisissable au clavier (Entrée valide, Échap annule).

### DataTable

Tableau dense pour les gros volumes. Vrai `<table>` (rôles ARIA explicites), en-tête collant, tri, sélection, navigation clavier, virtualisation optionnelle. Générique : `DataTable<T>`.

**Colonne d'actions collée à droite** : passer `stickyActions`. Quand le tableau dépasse la largeur disponible, la **dernière colonne** (actions) reste collée à droite avec une ombre de séparation ; le reste défile dessous. La dernière colonne doit être la colonne d'actions. L'infobulle intégrée des boutons d'icône de cette colonne est masquée (rognée par le défilement) ; leur nom accessible reste. Story : *Données et tableaux / DataTable → Colonne d'actions (800px)*.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `DataTableColumn<T>[]` | **requis** | Voir ci-dessous. ⚠️ Définir au niveau module ou via `useMemo` (une nouvelle référence recalcule le tri) |
| `data` | `T[]` | **requis** | Lignes. En mode serveur : la page courante, déjà triée |
| `getRowId` | `(row: T) => string` | **requis** | Identifiant unique et stable |
| `aria-label` | `string` | **requis** | Nom accessible du tableau |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` | 36px / 48px par ligne |
| `hiddenColumnIds` | `string[]` | `[]` | Colonnes masquées (pilotées notamment par `ColumnManager`) |
| `columnOrder` | `string[]` | — | Ordre des ids ; les colonnes absentes restent à la fin |
| `sort` | `{ id, desc }[]` | — | Tri contrôlé. Sans `sort` : géré en interne |
| `defaultSort` | `{ id, desc }[]` | `[]` | Tri initial en mode non contrôlé |
| `onSortChange` | `(sort) => void` | — | Clic : asc → desc → aucun ; Maj+clic : multi-colonnes |
| `manualSorting` | `boolean` | `false` | Mode serveur : `data` arrive trié, pas de tri en mémoire |
| `page`, `pageSize` | `number` | — | Mode client : découpe la page **après** le tri (`page` 1-based) |
| `manualPagination` | `boolean` | `false` | Mode serveur : `data` est déjà la page, aucun découpage |
| `selectable` | `boolean` | `false` | Colonne de `Checkbox` + case d'en-tête à trois états |
| `selectedIds` | `string[]` | `[]` | Sélection contrôlée. ⚠️ Pas de mode non contrôlé |
| `onSelectionChange` | `(ids: string[]) => void` | — | Maj+clic sur une case : sélection de plage |
| `onRowClick` | `(row: T) => void` | — | Clic ou Entrée sur une ligne ; active ↑/↓, Début/Fin, Page préc./suiv. entre lignes, Espace pour sélectionner |
| `loading` | `boolean` | `false` | Sans données : lignes squelettes ; avec données : lignes atténuées + `aria-busy` |
| `emptyState` | `ReactNode` | `"Aucun résultat."` | Contenu sans résultat |
| `maxHeight` | `number \| string` | — | Zone scrollable, en-tête collant |
| `virtualized` | `boolean` | `false` | Seules les lignes visibles sont montées. ⚠️ Hauteur bornée (`maxHeight`, défaut 560px) |
| `stickyActions` | `boolean` | `false` | Colle la **dernière colonne** (actions) à droite au défilement horizontal, avec ombre de séparation |
| `className` | `string` | — | — |

**`DataTableColumn<T>`**

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | **requis** | Clé de tri et de masquage |
| `header` | `string` | **requis** | Libellé FR (affiché en majuscules) |
| `accessor` | `(row: T) => string \| number \| Date \| boolean \| null \| undefined` | **requis** | Valeur brute : tri et rendu par défaut |
| `cell` | `(row: T) => ReactNode` | — | Rendu custom (`Badge`, `Indicator`, mini-graphiques `Sparkline` et `Meter size="sm"`…). Garder la valeur brute dans `accessor` pour le tri |
| `align` | `"left" \| "right" \| "center"` | `"left"` (`"right"` si `numeric`) | — |
| `numeric` | `boolean` | `false` | Police mono + alignement à droite |
| `width` | `number` | — | Largeur fixe (px). Sans `width` : partage de l'espace restant |
| `minWidth` | `number` | `80` | Largeur minimale des colonnes sans `width` |
| `sortable` | `boolean` | `false` | — |

- Tri en mémoire : chaînes à la française (« Ligne 2 » avant « Ligne 10 », sans casse ni accents), nombres, dates ; valeurs vides toujours en dernier.
- Rendu par défaut : nombres `Intl.NumberFormat("fr-FR")`, dates `JJ/MM/AAAA HH:mm`, booléens « Oui » / « Non », vide « — ».
- ⚠️ La case d'en-tête sélectionne les lignes **affichées** (la page). « Sélectionner les N résultats » se fait par une action de la `BulkActionBar`.
- ⚠️ Le masquage et l'ordre des colonnes passent par `ColumnManager` (branché sur `hiddenColumnIds` et `columnOrder`). Il n'y a toujours ni filtre par colonne ni redimensionnement.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `rowHeight` | `"fixed" \| "auto"` | "fixed" | auto : texte multi-lignes, hauteur du contenu, alignement haut. Ignoré avec virtualized. |

```tsx
<DataTable aria-label="Journal" data={events} columns={columns} getRowId={row => row.id} rowHeight="auto" />
```

### BulkActionBar

Barre d'actions groupées flottante pour une sélection multiple (`DataTable selectable`, liste de `TableCard`). Placée juste après la liste, dans le même conteneur : collante en bas de la zone visible (`position: sticky`, 16px du bas), centrée, au-dessus des lignes tant que la liste défile. Surface blanche surélevée : compteur (Diatype 13px medium, `--cadence-color-accent` : c'est un état de sélection), séparateur, puis les actions. Masquée quand `count` vaut 0. Sous 480px de large, le compteur passe au-dessus des actions. Story : *Données et tableaux / BulkActionBar*.

```tsx
<div>
  <DataTable … selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
  <BulkActionBar
    count={selectedIds.length}
    countLabel={(n) => (n > 1 ? `${n} courses sélectionnées` : `${n} course sélectionnée`)}
  >
    <GhostButton size="sm" iconStart="download-02" label="Exporter" onClick={onExport} />
    <PrimaryButton size="sm" tone="danger" iconStart="trash" label="Supprimer" onClick={() => setConfirmOpen(true)} />
  </BulkActionBar>
</div>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `count` | `number` | **requis** | Nombre d'éléments sélectionnés. `0` : barre masquée |
| `children` | `ReactNode` | **requis** | Actions : `GhostButton` puis `PrimaryButton tone="danger"`, en `size="sm"` |
| `countLabel` | `(count: number) => string` | « 1 élément sélectionné », « 1 248 éléments sélectionnés », « Aucun élément sélectionné » | Libellé du compteur, affiché et annoncé. Appelé aussi avec `0` (annonce de la sélection vidée) |
| `aria-label` | `string` | `"Actions groupées"` | Nom de la région de la barre |
| `className` | `string` | — | — |

- Accessibilité : la barre est une région nommée (`role="region"`). Le compteur est annoncé poliment à chaque changement par une région `status` toujours montée, y compris barre masquée : la première sélection et la sélection vidée sont annoncées.
- ⚠️ Placer la barre **après** la liste et dans **le même conteneur** qu'elle : `position: sticky` ne colle qu'à l'intérieur de son parent. Dans un conteneur `flex` avec `gap`, envelopper liste + barre dans une `<div>` (sinon le `gap` reste visible barre masquée).
- ⚠️ Quand la sélection se vide, la barre disparaît avec le bouton qui avait le focus : ramener le focus sur la liste (ex. case « Tout sélectionner »).
- ⚠️ Pas de case « Tout désélectionner » intégrée : avec `DataTable`, la case d'en-tête vide la page ; avec `TableCard`, ajouter un `GhostButton` « Tout désélectionner » en première action.
- ⚠️ Pas de menu de débordement : au-delà de quatre actions, regrouper les moins fréquentes dans un `ActionMenu`.

### DatePicker

**Variante champ** (défaut) : la date se **saisit au clavier** dans des cases **JJ / MM / AAAA** (+ **HH : mm** avec `withTime`) séparées de « / » fixes, à l'allure d'un `TextInput`, comme `TimePicker`. Le curseur passe seul à la case suivante quand une case est remplie (taper « / » aussi) ; Retour arrière sur une case vide revient à la précédente ; coller « 12/06/2026 » remplit tout. Cliquer le champ place le curseur — **il n'ouvre pas le calendrier** ; seule l'**icône calendrier** à droite (`GhostButton` sans infobulle) ouvre le panneau, positionné sur la date saisie. Entrée ou quitter le champ valide la saisie ; Échap l'annule. Une date inexistante (31/02) ou hors bornes affiche un message d'erreur sous le champ, sans appeler `onChange`. Largeur 220px (260px avec `withTime`). **Variante bouton** : inchangée, le déclencheur entier ouvre le calendrier.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `Date \| null` | — | Date sélectionnée |
| `onChange` | `(date: Date) => void` | — | Appelé avec une date valide et dans les bornes (saisie validée ou jour choisi). ⚠️ Pas d'effacement : vider les cases rétablit la valeur |
| `label` | `string` | — | Label au-dessus ; cible la case du jour |
| `placeholder` | `string` | `"JJ/MM/AAAA"` (`"JJ/MM/AAAA HH:mm"` avec `withTime`) | Texte du déclencheur sans valeur. ⚠️ Variante bouton seulement : en variante champ, chaque case a son repère fixe (JJ, MM, AAAA, HH, mm) |
| `disabled` | `boolean` | `false` | — |
| `minDate`, `maxDate` | `Date` | — | Bornes (jours hors bornes désactivés) |
| `withTime` | `boolean` | `false` | Heures/minutes + bouton de validation |
| `labelConfirm` | `string` | `"Valider"` | Libellé du bouton de validation (`withTime`) |
| `segmentedOptions` | `{ value, label }[]` | — | SegmentedControl dans le popover (contrôlé via `segmentedValue` + `onSegmentChange`) |
| `variant` | `"field" \| "button"` | `"field"` | `"button"` : déclencheur en `PrimaryButton outline size="sm"` (icône, valeur, chevron). **À privilégier dans un dashboard** ; `"field"` dans un formulaire |
| `aria-label` | `string` | — | Nom accessible sans `label` visible (variante bouton) : « Date » → annoncé « Date : 20/10/2026 » |

Affichage en français : format `JJ/MM/AAAA` (`JJ/MM/AAAA HH:mm` avec `withTime`), mois en toutes lettres (« Octobre 2026 »), semaine commençant le **lundi** (`Lu Ma Me Je Ve Sa Di`). ⚠️ Pas de prop `locale`.

Clavier du calendrier : à l'ouverture, le focus va sur le jour sélectionné (ou saisi) ; un seul jour dans l'ordre de tabulation ; ←/→ (jour), ↑/↓ (semaine), Début/Fin (lundi/dimanche), Page préc./suiv. (mois), Entrée pour choisir, Échap pour fermer (le focus revient à l'icône calendrier, ou au déclencheur en variante bouton). Les jours sont annoncés en toutes lettres (« lundi 19 octobre 2026 »).

### DateRangePicker

Sélection d'une période. Même calendrier que `DatePicker` ; le déclencheur (champ ou bouton) ouvre le calendrier en entier, sans saisie au clavier. Sélection en deux clics (la fin peut précéder le début : les dates sont inversées), validée par « Appliquer » ; un clic sur un préréglage applique directement. Le popover s'ouvre aligné à gauche du déclencheur et se décale vers la gauche s'il sortirait de l'écran ou du conteneur (idem `DatePicker` et le menu de `Dropdown`).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `{ start: Date \| null, end: Date \| null }` | — | Période (contrôlée) |
| `onChange` | `(range: { start: Date, end: Date }) => void` | — | Appelé sur « Appliquer » ou un préréglage. ⚠️ Jours entiers : `start` à 00:00, `end` à 23:59:59.999 |
| `label` | `string` | — | Label au-dessus du déclencheur |
| `aria-label` | `string` | — | Nom accessible sans `label` visible (filtre rapide d'une `FilterBar`) |
| `placeholder` | `string` | `"JJ/MM/AAAA – JJ/MM/AAAA"` | — |
| `disabled` | `boolean` | `false` | — |
| `minDate`, `maxDate` | `Date` | — | Bornes (jours hors bornes désactivés) |
| `maxDays` | `number` | — | Durée maximale, bornes incluses ; rappelée sous le calendrier (« 92 jours maximum ») |
| `presets` | `{ id, label, getRange: (reference) => { start, end } }[]` | Aujourd'hui, Hier, 7 derniers jours, 30 derniers jours, Ce mois-ci, Mois dernier | `[]` pour masquer la colonne |
| `referenceDate` | `Date` | maintenant | Base des préréglages et repère « aujourd'hui » |
| `months` | `1 \| 2` | `2` | Mois affichés côte à côte (`1` dans une `FilterBar` ou un panneau étroit) |
| `variant` | `"field" \| "button"` | `"field"` | `"button"` : déclencheur en `PrimaryButton outline size="sm"` (icône, valeur, chevron). **À privilégier dans un dashboard** ; `"field"` dans un formulaire |

- Le déclencheur affiche le libellé du préréglage si la période correspond exactement (« 7 derniers jours »), sinon « 01/10/2026 – 19/10/2026 ».
- Clavier : comme `DatePicker` ; Échap ferme **sans appliquer**.
- ⚠️ Pas d'heures en v1, et pas de mode non contrôlé.

### Dropdown

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `DropdownOption[]` | **requis** | `{ id, label, icon?, disabled?, divider?, groupLabel? }` — ⚠️ clé `id`, pas `value`. `divider` = trait au-dessus de l'option ; `groupLabel` = en-tête du groupe qui commence à cette option (jusqu'au `groupLabel` suivant) |
| `label` | `string` | — | Label au-dessus ; nomme aussi la liste ouverte (`aria-labelledby`) |
| `value` | `string` | — | `id` de l'option sélectionnée |
| `placeholder` | `string` | `"Sélectionner…"` | Texte sans sélection. En variante bouton, il entre dans le nom annoncé : « Produit : Sélectionner… » |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(id: string) => void` | — | — |
| `variant` | `"field" \| "button"` | `"field"` | `"button"` : déclencheur en `PrimaryButton outline size="sm"` (icône, valeur, chevron). **À privilégier dans un dashboard** ; `"field"` dans un formulaire |
| `aria-label` | `string` | — | Nom accessible sans `label` visible (variante bouton) : « Devise » → annoncé « Devise : EUR € ». Nomme aussi la liste ouverte |

Accessibilité du menu : la liste (`role="listbox"`) porte le nom du champ (`label` via `aria-labelledby`, sinon `aria-label`). Les options d'un même `groupLabel` sont dans un `role="group"` nommé par son en-tête, annoncé aux lecteurs d'écran ; le `divider` reste décoratif. Au clavier, Tab parcourt les seules options (en-têtes et séparateurs sont sautés), Entrée choisit, Échap ferme.

⚠️ En variante bouton, l'icône de l'option sélectionnée (`icon`) s'affiche avant le libellé, ramenée à 12px.

Menu : même gabarit que les préréglages du `DateRangePicker` — options de 13px arrondies à 8px (`--cadence-radius-md`), fond `--cadence-color-surface-alt` au survol et à la sélection, option sélectionnée en gras avec une coche en pastille encre.

### FilterBar

Barre au-dessus d'une liste : ligne 1 = recherche · filtres rapides · actions (à droite) ; ligne 2 = filtres actifs · « Tout effacer » · nombre de résultats.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `search` | `{ value, onChange, placeholder?, "aria-label"? }` | — | `SearchInput` (29px, coins de 8px, loupe, bouton effacer). `onChange` est appelé 300 ms après la dernière frappe (ou sur Entrée) ; `value` reste contrôlée. Défauts : `"Rechercher…"` / `"Rechercher"` |
| `quickFilters` | `ReactNode` | — | Slot : `Dropdown variant="button"`, `DateRangePicker variant="button"` (même hauteur que la recherche), avec `aria-label` |
| `activeFilters` | `{ id, label }[]` | `[]` | Affichés en `Badge dismissible` |
| `onRemoveFilter` | `(id: string) => void` | — | Croix d'un badge. Sans callback, les badges ne sont pas supprimables |
| `onClearAll` | `() => void` | — | « Tout effacer » (`GhostButton size="sm"`), affiché à partir de **2** filtres actifs |
| `resultCount` | `number` | — | « 12 430 résultats » / « 1 résultat » / « Aucun résultat » (annoncé aux lecteurs d'écran) |
| `actions` | `ReactNode` | — | Slot à droite : export, menu de colonnes… |
| `className` | `string` | — | — |


### Heatmap

Grille à deux catégories (jour × heure, ligne × jour) sur la rampe séquentielle en 7 classes, avec légende et bornes. Cellule sans donnée (`value: null`, différent de 0) : hachures. Hauteur : `rowHeight` par ligne. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `xLabels` | `string[]` | **requis** | Colonnes, dans l'ordre (« 05 h » … « 00 h ») |
| `yLabels` | `string[]` | **requis** | Lignes, dans l'ordre (« lun. » … « dim. ») |
| `cells` | `{ x, y, value: number \| null }[]` | **requis** | Une valeur par cellule (absente = pas de donnée) |
| `domain` | `[number, number]` | `[0, max]` | Bornes de la rampe |
| `unit` | `string` | — | Tooltip, légende et nom des cellules |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `onCellClick` | `(cell) => void` | — | Clic ou Entrée sur une cellule renseignée (ouvrir la liste filtrée) |
| `rowHeight` | `number` | `28` | Hauteur d'une ligne |
| `showTotals` | `boolean` | `false` | Matrice origine-destination : total par ligne (dernière colonne), par colonne (dernière ligne) et total général, en chiffres hors rampe ; cases de total focusables et nommées (« Total Châtelet : 218 k voyages ») |
| `sort` | `"none" \| "desc"` | `"none"` | `"desc"` : lignes et colonnes triées par total décroissant |

Clavier : une seule cellule tabulable ; flèches, Début / Fin (ligne), Ctrl+Début / Fin (grille), Entrée ; tooltip au survol et au focus. Quand la place manque, une étiquette de colonne sur deux ou trois est masquée visuellement (toujours lue).

```tsx
<Heatmap
  title="Perturbations par jour et par heure"
  description="4 dernières semaines"
  unit="perturbations"
  xLabels={hours}
  yLabels={days}
  cells={cells}
  onCellClick={(c) => navigate(`/perturbations?jour=${c.y}&heure=${c.x}`)}
/>
```

### CalendarHeatmap

Calendrier annuel en carte de chaleur : une colonne par semaine, une ligne par jour (lundi en tête), la rampe séquentielle de `Heatmap` en 7 classes. Étiquettes de mois sur la semaine du 1er, un jour de la semaine sur deux affiché (tous lus). Jour sans donnée : hachures ; jour annoté : contour `--cadence-dataviz-annotation`. Cases carrées de 8 à 18 px selon la largeur ; défilement horizontal si la place manque. Grille accessible (`role="grid"`), sans « Voir les données » (la grille est elle-même l'alternative). Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `values` | `{ date: Date \| "AAAA-MM-JJ", value: number \| null }[]` | **requis** | Une valeur par jour ; jour absent ou `null` = pas de donnée |
| `range` | `[début, fin]` | année civile du jour le plus récent | Période affichée (jours locaux, sans décalage de fuseau) |
| `domain` | `[number, number]` | `[0, max]` | Bornes de la rampe (`[75, 100]` pour une ponctualité) |
| `unit` | `string` | — | Tooltip, légende et nom des jours |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `annotations` | `{ date, label }[]` | `[]` | Jours marqués (« Grève ») : contour, tooltip, nom du jour, entrée « Événement » de la légende |
| `onDayClick` | `({ date, key, value }) => void` | — | Clic ou Entrée sur un jour renseigné |

Clavier : une seule case tabulable ; ←/→ d'une semaine à l'autre (même jour), ↑/↓ d'un jour à l'autre, Début / Fin (ligne), Ctrl+Début / Fin, Entrée. Nom d'un jour : « vendredi 16 octobre 2026 : 78 %. Grève ».

- ⚠️ La rampe va du clair (bas) au foncé (haut) : pour une ponctualité, les mauvais jours sont les plus clairs. Resserrer `domain` pour que les écarts se voient.
- ❌ Pas pour saisir des jours de circulation : `ServiceCalendar`.

```tsx
<CalendarHeatmap
  title="Ponctualité quotidienne 2026"
  unit="%"
  domain={[75, 100]}
  values={jours}
  annotations={[{ date: "2026-10-16", label: "Grève" }]}
  onDayClick={(d) => navigate(`/ponctualite/${d.key}`)}
/>
```

### Histogram

Distribution d'une mesure : effectif par classe de valeurs, à partir des **observations brutes** (retards en minutes, temps de parcours, intervalles entre passages). Classes contiguës (`--cadence-dataviz-series-1`), **toutes de même largeur à l'écran** : seule la hauteur (l'effectif) porte la valeur, même avec des bornes inégales comme `[0, 1, 2, 3, 5, 10]` ; une classe ouverte (« 10 min et plus ») a un bord tireté. Seuils en traits verticaux libellés. Tooltip et annonce : « De 2 à 3 min : 128 courses, 26,7 % » ; la description résume l'effectif, la médiane et la classe la plus fournie. « Voir les données » : classe, effectif, part. Hauteur par défaut 280px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `values` | `number[]` | **requis** | Observations ; valeurs non finies ignorées |
| `bins` | `number \| number[]` | règle de Sturges | Nombre de classes visé (bornes « rondes ») ou bornes imposées `[0, 1, 2, 3, 5, 10]` |
| `unit` | `string` | — | Unité des valeurs (« min ») |
| `countLabel` | `string` | `"observations"` | Ce que l'on compte, au pluriel (« courses », « passages ») |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | Format des bornes |
| `thresholds` | `{ value, label }[]` | `[]` | Traits verticaux libellés (« Retard 5 min ») |
| `annotations` | `{ at: number \| [début, fin], label }[]` | `[]` | Trait ou bande d'annotation (`--cadence-dataviz-annotation`), libellés, rappelés au survol de la classe (« Tolérance ±30 s ») |
| `showGrid` | `boolean` | `true` | Grille horizontale |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `280` | Hauteur du tracé |
| `serviceTime` | `boolean` | `false` | Valeurs en minutes depuis 00:00 du jour de service (`1530` = 25h30) : classes alignées sur l'horloge (5 à 360 min), bornes « 22h30 », classes ouvertes « avant 06h00 » / « 25h00 et après » |

Clavier : le tracé est focusable ; ←/→ d'une classe à l'autre, Début / Fin, Échap masque le tooltip.

- ✅ Bornes imposées pour un indicateur métier : `[0, 1, 2, 3, 5, 10]` pour les retards rend les classes comparables d'une période à l'autre.
- ⚠️ Avec des bornes imposées, les valeurs en dehors rejoignent la première ou la dernière classe, alors **ouverte** (« moins de 1 min », « 5 min et plus ») : rien n'est perdu.
- ❌ Pas d'`Histogram` pour des catégories nommées (lignes, modes) : `BarChart` ou `BarList`.

```tsx
<Histogram
  title="Distribution des retards à l'arrivée"
  description="Ligne 13, du 14 au 20 octobre 2026"
  values={retardsEnMinutes}
  bins={[0, 1, 2, 3, 5, 10]}
  unit="min"
  countLabel="courses"
  thresholds={[{ value: 5, label: "Retard 5 min" }]}
/>
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `onDatumClick` | `(datum: HistogramDatum) => void` | — | Clic/Entrée/Espace sur une classe non vide, action dans le tableau. |
| `selectedBin` | `number` | — | Index 0-based de la classe sélectionnée, contour de bande. |
| `clickHint` | `string` | "Entrée ou clic : voir le détail" | Instruction dans tooltip et description accessible. |

```tsx
<Histogram title="Retards" values={delays} onDatumClick={openBin} selectedBin={selected} />
```

`HistogramDatum` : `{ index: number; lower: number; upper: number; count: number; share: number; openStart: boolean; openEnd: boolean }`. `share` entre 0 et 1. Les bornes des classes extrêmes ne sont pas des limites fermées lorsque `openStart`/`openEnd` est vrai.

### TimeSpaceDiagram

Graphique espace-temps (Marey) : une ligne brisée par course, **arrêts de haut en bas** dans l'ordre de l'aller, heures de service en abscisse (au-delà de 24:00). Arrivée puis départ à chaque arrêt : le palier montre l'arrêt en station, la pente la vitesse. Aller en `--cadence-dataviz-series-1` trait plein, retour en `--cadence-dataviz-series-2` tireté ; avec un réalisé, celui-ci est en trait plein et le théorique en pointillé fin. Course supprimée : estompée et pointillée ; incident : `--cadence-status-critical-fg`. Repère « maintenant » en option. Fenêtre, sélecteur d'échelle et défilement de `Timeline` (gouttière des arrêts collée à gauche). Composant **contrôlé** : l'application fournit les courses (GTFS `stop_times`, temps réel). Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `line` | `{ code, color?, textColor?, mode? }` | **requis** | Ligne GTFS (badge en tête) |
| `stops` | `{ id, name, distance? }[]` | **requis** | Ordre de l'aller, de haut en bas ; `distance` sur tous : espacement à l'échelle (comme `LineDiagram`) |
| `trips` | `TimeSpaceTrip[]` | **requis** | `{ id, label, direction: "outbound" \| "inbound", scheduled, actual?, status?, note? }` ; passages `{ stopId, arrival?, departure? }` en `"HH:mm"` ou `"HH:mm:ss"` jusqu'à `47:59` |
| `range` | `[début, fin]` (`"HH:mm"`) | englobe les courses, au quart d'heure | Fenêtre affichée |
| `scales` | `("fit" \| "4h" \| "2h" \| "1h" \| "30min")[]` | `["fit", "2h", "1h"]` | Échelles du sélecteur (la première est l'échelle initiale) |
| `now` | `string` (`"HH:mm"`) | — | Repère vertical « maintenant » |
| `show` | `"both" \| "outbound" \| "inbound"` | `"both"` | Sens affichés |
| `directions` | `{ outbound?, inbound? }` | « Vers <terminus> » | Libellés des sens |
| `onTripClick` | `(trip) => void` | — | Clic ou Entrée sur une course (ouvrir ses passages, `RouteStopList`) |

Clavier : un seul arrêt de tabulation (la zone qui défile) ; ←/→ d'une course à la suivante dans le sens courant (ordre de départ), ↓/↑ d'un passage au suivant **le long de la course**, Maj + ↑/↓ change de sens, Début / Fin, Entrée, Échap. Annonce : « Course 13-0712 vers Montparnasse, Garibaldi : prévu 06h39, réalisé 06h42, retard 3 min ». Description : « 48 courses dans la fenêtre, 24 vers Montparnasse, 24 vers Saint-Denis Université, 1 supprimée, 1 incident ». « Voir les données » : course, sens, départ, arrivée, écart max, statut.

- ⚠️ Ligne **linéaire** en v1 ; au-delà de ~300 courses, filtrer côté application (sens, période).
- ⚠️ Pas d'édition des courses : le graphique se lit, il ne se manipule pas.

```tsx
<TimeSpaceDiagram
  title="Ligne 13 — graphique espace-temps"
  line={{ code: "13", mode: "metro", color: "#6ec4e8" }}
  stops={arrets}
  trips={courses}
  range={["05:30", "09:30"]}
  now={heureDeService}
  onTripClick={(t) => openTrip(t.id)}
/>
```

### SankeyChart

Diagramme de flux (Sankey / alluvial) : volumes entre étapes de gauche à droite (origine → destination, mode d'arrivée → pôle → mode de départ). Nœuds empilés par colonne, hauteur proportionnelle au volume (max des arrivées et des départs) ; rubans de l'épaisseur du flux, à la couleur **et** au motif de leur origine (première colonne ; ensuite, origine de la plus grosse arrivée). Libellés et volumes à gauche de la première colonne, à droite des autres. Tooltip et annonce par flux : « Châtelet → La Défense : 88 k voyages, 62 % des départs de Châtelet ». « Voir les données » : origine, destination, volume, part de l'origine. Mise en page maison, sans `d3-sankey` (voir `docs/proposals/sankey-chart.md`). Hauteur par défaut 360px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `nodes` | `{ id, label, column? }[]` | **requis** | `column` (à partir de 0) sur **tous** les nœuds impose les étapes ; sinon déduites des liens (plus long chemin) |
| `links` | `{ source, target, value }[]` | **requis** | Flux orientés ; volumes nuls ou négatifs, nœuds inconnus et retours vers une étape antérieure ignorés (avertissement en développement) |
| `unit` | `string` | — | « k voyages » |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `onLinkClick` | `({ source, target, value }) => void` | — | Clic ou Entrée sur le flux actif |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `360` | Hauteur du tracé |

Clavier : ←/→ (ou ↑/↓) d'un flux au suivant (par origine, puis par destination), Début / Fin, Entrée, Échap.

- ✅ Au plus une douzaine de nœuds par colonne : regrouper côté application (« Autres gares »).
- ⚠️ Pas de cycles : un Sankey va de gauche à droite.
- ❌ Pour lire des valeurs croisées origine × destination : `Heatmap showTotals`.

### ScatterChart

Nuage de points : corrélation entre deux mesures, un point par élément (ligne, course, arrêt). Une forme **et** une couleur par série (`--cadence-dataviz-series-N`), axes titrés avec leur unité, seuils sur l'un ou l'autre axe pour délimiter des quadrants. Tooltip au point le plus proche (24 px), parcours au clavier de gauche à droite, annonce « Ligne 13 (Métro) : Charge à la pointe 112 %, Retard moyen 4,6 min ». « Voir les données » : point, série, x, y. Hauteur par défaut 320px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `series` | `{ id, label, points: { id, x, y, label? }[] }[]` | **requis** | Une à huit séries ; `label` nomme le point |
| `xAxis`, `yAxis` | `{ label, unit?, format?, domain?, includeZero? }` | **requis** | Titre et unité de l'axe ; `domain` impose les bornes ; `includeZero` (défaut `true`) |
| `thresholds` | `{ axis: "x" \| "y", value, label }[]` | `[]` | Traits tiretés libellés, verticaux (`x`) ou horizontaux (`y`) |
| `onPointClick` | `(point, series) => void` | — | Clic ou Entrée sur le point actif |
| `showLegend` | `boolean` | `true` | Légende cliquable (dès deux séries) |
| `showGrid` | `boolean` | `true` | Grille |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `320` | Hauteur du tracé |

Clavier : ←/→ (ou ↑/↓) d'un point au suivant dans l'ordre des abscisses, Début / Fin, Entrée, Échap.

- ✅ Repérer des anomalies (lignes chargées **et** en retard) avec deux seuils.
- ❌ Pas pour une évolution dans le temps : `LineChart`.

### Treemap

Pavage hiérarchique (squarify, `d3-hierarchy`) : aire proportionnelle à la valeur, réseau → mode → ligne. Les branches de premier niveau reçoivent une couleur **et** un motif, un bandeau avec leur libellé et leur total ; une feuille directe de la racine (« RER ») est sa propre branche. Libellé et valeur posés sur la tuile quand ils tiennent. Tooltip et annonce : « Bus › Ligne 91 : 640 km, 4,9 % du total ». « Voir les données » : chemin, valeur, part. Hauteur par défaut 360px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `data` | `{ id, label, value?, children? }` | **requis** | Racine ; une valeur sur les feuilles (somme automatique), valeurs nulles ou négatives ignorées |
| `unit` | `string` | — | Unité (« km ») |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `onTileClick` | `({ id, label, value, path }) => void` | — | Clic ou Entrée sur la tuile active |
| `showLegend` | `boolean` | `true` | Légende des branches avec leur part (dès deux branches) |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu) |
| `height` | `number` | `360` | Hauteur du pavage |

Clavier : ←/→ (ou ↑/↓) d'une tuile à la suivante dans l'ordre de lecture (branches puis tuiles par valeur décroissante), Début / Fin, Entrée, Échap.

- ✅ Au plus huit branches (une couleur chacune) ; au-delà, regrouper.
- ❌ Pas pour comparer des valeurs proches : les aires se jugent mal, préférer `BarList`.

### Icons

SVG inline issu de `@untitledui/icons` — aucune requête réseau. L'icône suit `currentColor` : par défaut elle prend la couleur du texte parent. Modes de transport : `"bus"`, `"tram"`, `"train"` (métro, RER, train), `"anchor"` (bateau) ; `"walk"` (marche) est dessinée au même gabarit, faute d'équivalent Untitled UI.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `IconName` (≈ 94 valeurs) | `"search-md"` | Ex : `"trash"`, `"copy-01"`, `"edit-02"`, `"plus"`, `"calendar"`, `"chevron-down"`, `"switch-vertical-01"`… |
| `size` | `number` | `24` | Taille en px (largeur = hauteur) |
| `color` | `string` | `"currentColor"` | Couleur du trait. Laisser à `currentColor` pour piloter la couleur en CSS |
| `title` | `string` | — | Si fourni → `role="img"` + `aria-label` ; sinon l'icône est `aria-hidden` |
| `className` | `string` | — | Classe CSS additionnelle (optionnelle) |
| `iconMap` | `string` | — | @deprecated — ignoré (compat ascendante) |

```tsx
<Icons icon="trash" />                       {/* 24px, suit la couleur du texte */}
<Icons icon="trash" size={16} />             {/* taille custom */}
<Icons icon="trash" color="#da1e28" />       {/* couleur explicite */}
<span style={{ color: "var(--cadence-color-danger)" }}><Icons icon="trash" /></span>  {/* via currentColor */}
```

### ModeIcon

Pictogramme **rempli** d'un mode de transport (31 modes), famille distincte des icônes d'interface en trait d'`Icons`. SVG inline (gabarit 80), aucune requête réseau, suit `currentColor`. Même interface que `Icons` (`size`, `color`, `title`). La liste ordonnée `MODE_NAMES` (et le type `ModeName`) sert à itérer : galerie, sélecteur de mode.

Modes : `all-pt`, `metro`, `metro-alt`, `train`, `tram`, `funicular`, `bus`, `bus-on-demand`, `substitute-bus-alt`, `coach`, `coach-station`, `plane`, `boat`, `car`, `carpool`, `taxi`, `bike`, `bike-parking`, `parking`, `park-and-ride-alt`, `station`, `network`, `walk`, `slow-walk`, `mid-walk`, `fast-walk`, `run`, `home`, `work`, `wheelchair`, `ticket`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `mode` | `ModeName` (31 valeurs) | **requis** | Mode de transport |
| `size` | `number` | `24` | Taille en px (largeur = hauteur) |
| `color` | `string` | `"currentColor"` | Remplissage. Laisser à `currentColor` pour piloter en CSS |
| `title` | `string` | — | Si fourni → `role="img"` + `aria-label` ; sinon `aria-hidden` |
| `className` | `string` | — | Classe CSS additionnelle |

- ✅ Pictogramme de mode (rempli, carré). Décoratif à côté d'un libellé → sans `title` ; porteur de sens seul → `title`.
- ❌ Pas pour une icône d'interface (trash, chevron…) : `Icons`. Pas pour l'identité d'une ligne (code + couleur GTFS) : `LineBadge`.

### ModeFilter

Filtre par mode de transport ou par ligne : une rangée de **chips togglables** (picto `ModeIcon` ou `LineBadge` + libellé), **multi-sélection** par défaut. Pour un filtre de tableau de bord ou de liste, dans une `FilterBar` ou une barre d'outils. Chaque chip est un bouton bascule (`aria-pressed`) ; le groupe est nommé par `aria-label`. Une sélection **vide = aucun filtre** (l'app affiche tout). Libellés FR par défaut (`MODE_LABELS`), surchargables.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modes` | `ModeName[]` | — | Modes proposés ; exclusif avec `items` |
| `items` | `ModeFilterItem[]` | — | Lignes `{ id, label, badge? }` ; fournir `items` ou `modes` |
| `aria-label` | `string` | **requis** | Nom accessible du groupe |
| `value` / `defaultValue` | `ModeName[]` ou `string[]` | — | Modes ou identifiants des lignes (contrôlé / au montage) |
| `onChange` | `(modes: ModeName[]) => void` ou `(ids: string[]) => void` | — | Sélection selon l’API choisie |
| `selection` | `"multiple" \| "single"` | `"multiple"` | Multi ou un seul mode |
| `labels` | `Partial<Record<ModeName, string>>` | `MODE_LABELS` | Libellés personnalisés |
| `allLabel` | `string` | — | Bouton facultatif « Toutes » qui appelle `onChange([])` |
| `iconSize` | `number` | `18` | Taille du picto de mode ; badges de ligne en `sm` |
| `id` / `className` | `string` | — | — |

`ModeFilterItem` : `id: string` unique et stable, `label: string`, `badge?: Omit<LineBadgeProps, "size" | "className">`. Le badge est décoratif dans le bouton, dont le nom accessible reste le libellé. Omettre `badge` pour un groupe agrégé (« Autres lignes »). Les couleurs du badge viennent des données, son contraste est géré par LineBadge.

```tsx
<ModeFilter
  aria-label="Filtrer par ligne"
  items={[
    { id: "rer-b", label: "RER B", badge: { code: "B", mode: "rer", color: "#5291ce" } },
    { id: "other", label: "Autres lignes" },
  ]}
  value={lines}
  onChange={setLines}
  selection="single"
  allLabel="Toutes"
/>
```

- ⚠️ Fournir exactement une source : `modes` ou `items`. `labels` concerne seulement les modes. Les identifiants des lignes ne doivent pas être placés dans `modes`.
- ⚠️ En sélection unique, recliquer la ligne active vide la sélection. Le bouton `allLabel` est actif quand la sélection est vide, en unique comme en multiple.
- ✅ Sélection vide = aucun filtre ; l'app décide (tout afficher). Contrôlé pour piloter le filtre ↔ URL.
- ❌ Pour un choix exclusif court (2-4) sans picto : `SegmentedControl`. Pour 1 valeur dans un menu : `Dropdown`.

### CategoryFilter

Filtre **exclusif** par catégorie : une grille de tuiles compactes (picto + libellé sur deux lignes, effectif en dessous), chacune entièrement cliquable. Groupe radio nommé (`radiogroup`, chaque tuile est un `radio` avec `aria-checked`). Une seule tuile dans l'ordre de tabulation : flèches, Home et End déplacent le focus **et** sélectionnent, en sautant les tuiles désactivées. Les colonnes s'adaptent à la largeur (128px minimum, une colonne pleine largeur en dessous). Apparence : au repos et au survol, celle de `Card` (bordure fine, la tuile se soulève avec `--cadence-shadow-raised`) ; sélectionnée, celle de `RichCheckbox` cochée (bordure `control-border-active` doublée, relief intérieur, sans soulèvement) ; désactivée, celle de `RichCheckbox` désactivée. Story : *Données et tableaux / CategoryFilter*.

```tsx
const [category, setCategory] = useState("lignes");

<CategoryFilter
  aria-label="Catégories du catalogue"
  items={[
    { id: "reseaux", label: "Réseaux", count: 42, icon: <ModeIcon mode="network" size={20} /> },
    { id: "lignes", label: "Lignes", count: 1984, icon: <Icons icon="route" size={20} /> },
    { id: "points-arret", label: "Points d’arrêt", count: 61207, icon: <Icons icon="marker-pin-01" size={20} /> },
  ]}
  value={category}
  onChange={setCategory}
/>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `CategoryFilterItem[]` | **requis** | Catégories, dans l'ordre d'affichage (voir ci-dessous) |
| `value` | `string` | **requis** | `id` de la catégorie sélectionnée (contrôlé uniquement) |
| `onChange` | `(id: string) => void` | **requis** | Sélection d'une autre catégorie ; pas appelé quand on reclique l'active |
| `aria-label` | `string` | **requis** | Nom accessible du groupe |
| `className` | `string` | — | Classe CSS additionnelle sur la grille |

`CategoryFilterItem` :

| Champ | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant unique, renvoyé par `onChange` |
| `label` | `string` | Libellé visible ; deux lignes réservées, retour à la ligne au-delà, jamais tronqué |
| `count` | `number` | Effectif, formaté en français (`61 207`, espace fine insécable) en police mono |
| `icon` | `ReactNode` | Picto décoratif (`aria-hidden`) : `Icons`, `ModeIcon` ou pictogramme métier hors registre, de 20px |
| `disabled` | `boolean` | Catégorie indisponible : grisée, ni cliquable ni atteignable au clavier |

- ✅ Nom accessible de chaque tuile : « Lignes, 1 984 » (libellé puis effectif).
- ✅ Les effectifs peuvent changer après une sélection (rechargement) : la tuile reste en place et garde le focus.
- ⚠️ **Sélection obligatoire** : il n'y a pas d'état « aucune catégorie ». Recliquer la catégorie active ne la désélectionne pas et n'appelle pas `onChange`. Pour un filtre qu'on peut vider, `ModeFilter` (modes) ou `FilterBar`.
- ⚠️ **Pas de mode non contrôlé** (`defaultValue` n'existe pas) : l'application tient `value`, qui pilote aussi le tableau. Si `value` ne correspond à aucune catégorie disponible, aucune tuile n'est cochée et la première disponible reçoit le focus au clavier.
- ⚠️ **0 n'est pas désactivé** : un effectif nul s'affiche en texte secondaire mais reste sélectionnable. Ne passer `disabled` que si la catégorie est réellement indisponible.
- ⚠️ `icon` est décoratif : ne pas y mettre de texte porteur de sens, ni d'élément interactif.
- ❌ Pas de prop `checked` ni de `state` par tuile : la sélection passe par `value`.
- ❌ Pas pour 2-4 options sans effectif (`SegmentedControl`), ni pour une multi-sélection (`ModeFilter`, `RichCheckbox`).

### Indicator

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"active" \| "upcoming" \| "completed" \| "draft" \| "warning" \| "info" \| "critical" \| "nominal"` | **requis** | Statut sémantique (picto + couleurs) |
| `label` | `string` | label de la variante | Surcharge du libellé |
| `hideIcon` | `boolean` | `false` | Masque le picto : couleur et libellé seuls |

- ✅ Garder le picto par défaut : il double la couleur pour qui ne la distingue pas (WCAG 1.4.1).
- ✅ `hideIcon` seulement quand un picto voisin porte déjà l'état (marqueur coloré d'`ActivityFeed`) : sinon il est redondant.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `appearance` | `"badge" \| "dot"` | "badge" | dot : point de 8px, label obligatoire et non visible ; pas d’action. |
| `onClick` | `() => void` | — | Badge rendu en bouton natif ; clavier, focus et survol. |
| `disabled` | `boolean` | false | Désactive un badge interactif. |
| `inverse` | `boolean` | false | Contraste pour fond primary sombre. |

```tsx
<Indicator variant="warning" appearance="dot" label="Champ modifié" />
```

### DatasetHealth

Bilan de validation d'un jeu de données : titre, verdict (`Indicator`), nombre d'erreurs et d'avertissements, date de la dernière validation, bouton « Voir le rapport ». Carte blanche à bordure fine, région nommée par son titre. **Présentation seule** : le verdict et les compteurs viennent de l'application ; aucun score, aucun verdict déduit de la fraîcheur ou des compteurs, aucune décision de publication. Story : *Retours et statuts / DatasetHealth*.

```tsx
<DatasetHealth
  label="Offre théorique — GTFS Bordeaux Métropole"
  verdict="failed"
  errorCount={2}
  warningCount={1}
  validatedAt={report.validatedAt}
  timeZone="Europe/Paris"
  onViewReport={() => navigate("/qualite/rapport")}
/>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Nom du jeu de données (titre) |
| `verdict` | `ValidationVerdict` | **requis** | `"not-run" \| "unknown" \| "passed" \| "warning" \| "failed"` → « Non validé », « Verdict inconnu », « Valide », « Valide avec avertissements », « Invalide » |
| `errorCount` | `number \| null` | — | Erreurs. `null` ou absent : « Inconnu », jamais 0 |
| `warningCount` | `number \| null` | — | Avertissements. `null` ou absent : « Inconnu » |
| `validatedAt` | `Date \| string \| number` | — | Date de la dernière **validation** (pas de la collecte) → « Validé il y a 2 h ». Absente : « Date inconnue » (« Jamais validé » si `not-run`) |
| `now` | `Date \| string \| number` | maintenant | Instant de référence du libellé relatif (à fixer pour les tests) |
| `timeZone` | `string` | fuseau local | Fuseau de la date absolue |
| `loading` | `boolean` | `false` | Squelettes et `aria-busy` ; ni verdict ni bouton |
| `onViewReport` | `() => void` | — | Bouton `GhostButton size="sm"` ; sans callback, pas de bouton |
| `reportLabel` | `string` | `"Voir le rapport"` | Libellé du bouton |
| `headingLevel` | `2 \| 3 \| 4` | `2` | Niveau du titre |
| `className` | `string` | — | — |

- ✅ `0` s'affiche « 0 » : c'est une valeur connue, distincte d'un compteur inconnu.
- ✅ `verdict="not-run"` masque les compteurs : sans validation, ils n'ont pas de sens.
- ⚠️ La date est affichée par `DataFreshness` **sans point coloré** : l'âge de la validation n'est pas un verdict.
- ❌ Pas de `ProgressBar` ni de score en pourcentage : la bibliothèque n'invente pas de mesure de qualité.

### ValidationIssueInspector

Détail d'un constat de validation : sévérité (`Indicator`), message, localisation (`DescriptionList` : source, ligne, champ, objet), code de règle et identifiant copiables (`CopyableText`), correction attendue (`InlineAlert type="information"`), bouton facultatif vers la source. **Sans surface ni Drawer** : l'application le place dans un `Drawer` (pattern **Rapport qualité**) ou dans une section de page. Aucun appel réseau, aucune correction. Story : *Retours et statuts / ValidationIssueInspector*.

```tsx
<Drawer isOpen={open} onClose={() => setOpen(false)} title="Détail du constat">
  <ValidationIssueInspector issue={selected} onOpenSource={openInEditor} />
</Drawer>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `issue` | `ValidationIssue \| null` | **requis** | Constat. `null` : `EmptyState` « Aucun constat sélectionné » |
| `onOpenSource` | `(issue) => void` | — | Bouton `GhostButton size="sm"` ; sans callback, pas de bouton |
| `openSourceLabel` | `string` | `"Ouvrir dans la source"` | Libellé du bouton |
| `emptyTitle` | `string` | `"Aucun constat sélectionné"` | Titre de l'état vide |
| `className` | `string` | — | — |

**Types** (exportés) — `ValidationIssue` : `{ id: string; severity: "error" \| "warning" \| "info"; message: string; location?: { source?; line?; field?; objectId? }; ruleCode?: string; correction?: string }`. `ValidationSeverity`, `ValidationVerdict` et `ValidationIssueLocation` sont exportés aussi.

- ✅ Source, ligne et champ absents s'affichent « Non renseigné » ; objet, règle et correction absents ne s'affichent pas.
- ✅ Messages et identifiants longs se replient sans élargir le conteneur.
- ⚠️ Dans un `Drawer`, garder le constat sélectionné pendant la fermeture (état `open` séparé), sinon l'état vide apparaît pendant l'animation.
- ❌ Pas d'`onOpenSource` sans destination réelle.

### DataSourceStatus

État d'une source de données (flux GTFS-RT, API SIRI, dépôt de fichiers) : titre, disponibilité (`Indicator`), dernière observation, dernière réussite, fraîcheur des données et dernière erreur, bouton facultatif vers le détail. Carte blanche à bordure fine, région nommée par son titre. Trois dimensions **indépendantes**, jamais déduites l'une de l'autre : la disponibilité (la source répond-elle ?), les dates d'interrogation (observation, réussite) et la fraîcheur des données servies. Story : *Retours et statuts / DataSourceStatus*.

```tsx
<DataSourceStatus
  label="GTFS-RT — positions des véhicules"
  availability="unavailable"
  lastObservedAt={source.lastPollAt}
  lastSuccessAt={source.lastSuccessAt}
  dataUpdatedAt={source.feedTimestamp}
  error="HTTP 503 — Service Unavailable"
  now={pageClock}
  timeZone="Europe/Paris"
  onViewDetails={() => openSource(source.id)}
/>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Nom de la source (titre) |
| `availability` | `DataSourceAvailability` | **requis** | `"available" \| "degraded" \| "unavailable" \| "unknown"` → « Disponible », « Dégradée », « Indisponible », « État inconnu » |
| `lastObservedAt` | `Date \| string \| number` | — | Dernière interrogation, réussie ou non → « Observée il y a 1 min ». Absente : « Jamais observée » |
| `lastSuccessAt` | `Date \| string \| number` | — | Dernière récupération réussie, **conservée après une erreur** → « Réussie il y a 2 h ». Absente : « Aucune connue » |
| `dataUpdatedAt` | `Date \| string \| number` | — | Horodatage des données servies (pas de la récupération) → `DataFreshness` avec son point de ton. Absent : « Inconnue » |
| `freshWithin` / `staleWithin` | `number` | `300` / `3600` | Seuils de fraîcheur des données (s), à régler sur la cadence de la source |
| `error` | `string` | — | Dernière erreur, affichée en texte critique dans la carte (pas d'alerte annoncée) |
| `now` | `Date \| string \| number` | maintenant | Instant de référence ; une même horloge pour toutes les sources d'une page |
| `timeZone` | `string` | fuseau du navigateur | Fuseau des dates absolues |
| `loading` | `boolean` | `false` | Squelettes et `aria-busy` ; ni disponibilité ni bouton |
| `onViewDetails` | `() => void` | — | Bouton `GhostButton size="sm"` ; sans callback, pas de bouton |
| `detailsLabel` | `string` | `"Voir la source"` | Libellé du bouton |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Niveau du titre |
| `className` | `string` | — | — |

- ✅ Une source joignable peut servir des données périmées : « Disponible » et un point rouge de fraîcheur peuvent coexister.
- ✅ Plusieurs sources : une grille (`CardGrid`), un même `now` et un même `timeZone`.
- ⚠️ Seule la fraîcheur des données porte un point coloré ; les dates d'observation et de réussite n'en ont pas (leur âge n'est pas un verdict).
- ❌ Pas de polling ni de secret de connexion dans le composant : l'application interroge la source et transmet l'état.
- ❌ Ne pas déduire `availability` de la fraîcheur, ni l'inverse.

### DataFreshness

Fraîcheur d'une donnée : un point coloré (ton de statut) et un libellé relatif compact (« Mis à jour il y a 3 min », « il y a 2 h »), la date absolue restant en `title` et pour les lecteurs d'écran (`<time dateTime>`). Le ton suit l'âge : **frais** (`nominal`, vert) sous `freshWithin`, **vieillissant** (`warning`, orange) sous `staleWithin`, **périmé** (`critical`, rouge) au-delà. Au-delà de 7 jours, la date absolue remplace le libellé relatif. **Date future** : jusqu'à une minute d'avance (horloges décalées), « à l'instant » ; au-delà, jamais présentée comme fraîche — point gris neutre, date absolue suivie de « (date future) ». Une date invalide donne un repli discret « Date indisponible ».

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `updatedAt` | `Date \| string \| number` | **requis** | Dernière mise à jour (Date, ISO ou timestamp) |
| `now` | `Date \| string \| number` | maintenant, recalculé toutes les 30 s | Instant de référence. Fourni : l'application pilote l'horloge (une horloge partagée par la page, tests) ; absent : le libellé se recalcule seul toutes les 30 s |
| `freshWithin` | `number` | `300` | Seuil « frais », en secondes (5 min) |
| `staleWithin` | `number` | `3600` | Seuil « vieillissant », en secondes (1 h) |
| `label` | `string` | `"Mis à jour"` | Préfixe du libellé |
| `hideDot` | `boolean` | `false` | Masquer le point coloré |
| `timeZone` | `string` | fuseau local | Fuseau du format absolu |
| `className` | `string` | — | — |

- ✅ En-tête de tableau de bord ou de carte pour dater une donnée live (ponctualité, affluence).
- ✅ Régler `freshWithin` / `staleWithin` selon la cadence réelle de la source.
- ✅ Plusieurs fraîcheurs sur une page : leur passer le même `now` (une horloge de page mise à jour par l'app), pour qu'elles avancent ensemble.
- ❌ Pas pour un statut métier (en cours, ralenti…) : `Indicator`. Pas pour un journal d'événements : `ActivityFeed`.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `inverse` | `boolean` | false | Texte et point lisibles sur fond primary sombre. |

```tsx
<DataFreshness updatedAt={updatedAt} inverse timeZone="Europe/Paris" />
```

### LineChart

Évolution d'une à huit séries, temporelles (`x: Date`, axe de dates fr-FR adapté à l'étendue : heures, jours ou mois) ou catégorielles. Tooltip partagé (toutes les séries à l'abscisse survolée), dans un portail. Hauteur par défaut 280px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `series` | `{ id, label, data: { x: Date \| string, y: number \| null }[], reference? }[]` | **requis** | `y: null` = trou dans la courbe. `reference: true` : série de comparaison (N-1, semaine type), trait tireté ardoise sans marqueur ni aire, hors empilement et hors seuils ; l'écart avec la série principale est rappelé au survol |
| `variant` | `"line" \| "area"` | `"line"` | — |
| `stacked` | `boolean` | `false` | Aires empilées (`variant="area"`) |
| `onRangeSelect` | `([début, fin]) => void` | — | Sélection d'une période : glisser sur le tracé, ou Maj + ←/→ depuis le point actif puis Entrée (Échap annule) ; à relier au `DateRangePicker` de la page (zoom) |
| `serviceTime` | `boolean` | `false` | Abscisses en heures de service `"HH:mm"` jusqu'à `"47:59"` (`"25:30"` = 1 h 30 après minuit, même jour de service) : positions proportionnelles au temps, graduations d'horloge (« 24h00 », « 25h00 »), colonne « Heure » dans le tableau |
| `curve` | `"smooth" \| "step"` | `"smooth"` | `"step"` : paliers, la valeur tient jusqu'au point suivant (offre par tranche horaire, capacité, tarifs) |
| `thresholds` | `{ value, label }[]` | `[]` | Lignes de seuil libellées |
| `annotations` | `{ at: Date \| string \| [début, fin], label }[]` | `[]` | Trait vertical ou bande libellés |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Côté défavorable d'un seuil : points en `--cadence-dataviz-threshold-breach`, libellé « franchi » |
| `unit` | `string` | — | Axe Y, tooltip, tableau |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `yDomain` | `[number, number]` | 0 → max arrondi | Bornes de l'axe Y |
| `compact` | `boolean` | `false` | Sans axes ni légende ni titre visible (titre lu) : pour une `Card` |
| `height` | `number` | `280` (`48` en compact) | Hauteur du tracé |

Clavier : le tracé est focusable ; ←/→ passent d'une abscisse à l'autre, Début / Fin, Échap masque le tooltip ; la valeur est annoncée (`aria-live`). Légende cliquable (masquer une série) dès deux séries. Marqueurs sur tous les points jusqu'à 40 abscisses, au-delà seulement sur les points qui franchissent un seuil.

```tsx
<LineChart
  title="Retard moyen par heure"
  description="7 derniers jours, toutes lignes"
  unit="min"
  goodDirection="down"
  series={[{ id: "delay", label: "Retard moyen", data: hourlyDelays }]}
  thresholds={[{ value: 5, label: "Seuil d'alerte 5 min" }]}
  annotations={[{ at: [strikeStart, strikeEnd], label: "Grève 16/10" }]}
/>
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `onDatumClick` | `(datum: LineChartDatum) => void` | — | Clic/Entrée/Espace sur une abscisse non vide ; action aussi dans le tableau. |
| `selectedX` | `Date \| string` | — | Abscisse sélectionnée contrôlée, repère vertical. |
| `clickHint` | `string` | "Entrée ou clic : voir le détail" | Instruction dans tooltip et description accessible. |

```tsx
<LineChart title="Réceptions" series={series} onDatumClick={openReception} selectedX={selected} />
```

`LineChartDatum` : `{ x: Date | string; index: number; values: { seriesId: string; value: number | null }[] }`, références exclues, séries masquées incluses. Avec `onRangeSelect`, un glissement ou Maj + flèche puis Entrée privilégie la période et ne déclenche pas le clic de point.

### Link

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Texte du lien |
| `href` | `string` | — | Rend un `<a>` ; sans `href` + avec `onClick` → `<button>` |
| `variant` | `"primary" \| "destructive" \| "inverse"` | `"primary"` | `--cadence-color-link`, `--cadence-color-danger-text`, blanc. ⚠️ `"destructive"`, pas `"danger"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 11 / 12 / 13px |
| `icon` | `ReactNode` | — | Icône avant le texte |
| `hideArrow` | `boolean` | `false` | Masque la flèche (usage bouton texte) |
| `disabled` | `boolean` | `false` | — |
| `target` | `"_blank" \| …` | — | — |
| `onClick` | `(e) => void` | — | — |

### Modal

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `isOpen` | `boolean` | **requis** | Visibilité |
| `onClose` | `() => void` | **requis** | Backdrop, ×, Échap |
| `title` | `string` | — | Titre de l'en-tête (fond `--cadence-color-surface-subtle`, filet bas), relié par un identifiant unique |
| `aria-label` | `string` | `"Dialogue"` | Nom accessible sans titre visible ; fournir un libellé précis |
| `children` | `ReactNode` | **requis** | Corps (scrollable si long). Texte seul (`string`) → message centré en 15px, comme une confirmation ; contenu riche (formulaire, liste) → aligné à gauche en 13px |
| `primaryAction` | `{ label, onClick, destructive?, disabled?, loading? }` | — | Bouton droit du pied : `PrimaryButton` (`destructive` → `tone="danger"`) |
| `secondaryAction` | `{ label, onClick, disabled? }` | — | Bouton gauche du pied : `PrimaryButton outline` |
| `footer` | `ReactNode` | — | Pied composé, prioritaire sur les actions standard ; reste hors du corps défilant |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | 400 / 560 / 800 px |
| `hideCloseButton` | `boolean` | `false` | — |

Comportements intégrés : fermeture sur Échap, scroll du body et du conteneur AppLayout verrouillé, footer fixe quand le corps scrolle. Avec plusieurs Modal/Drawer, seul le dernier ouvert gère Échap et le piège à focus. Fermer une surcouche en arrière-plan conserve le verrouillage et le focus de celle au premier plan. Les attributs `inert` et `aria-hidden` préexistants sont restaurés à la fermeture. Les contrôles masqués, désactivés (y compris par un fieldset) ou hors tabulation sont exclus du cycle Tab.

Anatomie : carte blanche (`--cadence-radius-2xl`, liseré `--cadence-color-border`), en-tête compact (48px) sur fond discret avec titre 17px et croix de fermeture (`GhostButton` sans infobulle), corps, pied d'actions alignées à droite sans filet (un filet n'apparaît que si le corps défile).

```tsx
<Modal
  isOpen={open}
  onClose={close}
  title="Confirmez-vous la suppression ?"
  size="small"
  primaryAction={{ label: "Supprimer", onClick: onDelete, destructive: true }}
  secondaryAction={{ label: "Annuler", onClick: close }}
>
  Si vous confirmez, votre objet sera définitivement effacé.
</Modal>
```

- ✅ Réservée à ce qui **bloque** : confirmation d'une action irréversible, décision à prendre avant de continuer, formulaire court (2-3 champs).
- ✅ Titre formulé en question ou en action (« Confirmez-vous la suppression ? », « Renommer le scénario ») ; libellés de boutons explicites (« Supprimer », pas « OK »).
- ❌ Pas pour consulter ou éditer le détail d'un élément, ni pour un formulaire long : `Drawer` (l'utilisateur garde la liste en vue).
- ❌ Pas pour une aide riche ou un réglage rapide ancré à un bouton (seuil, filtre) : `Popover`.
- ❌ Pas pour informer sans demander de décision : `useToast()` (temporaire) ou `InlineAlert` (dans la page).

⚠️ Les actions de fin de parcours doivent être dans `primaryAction` / `secondaryAction`, ou `footer` pour une barre composée. Ne pas placer un pied sticky dans `children` : il serait limité par le padding et le défilement du corps. `disabled` conserve les validations métier ; `loading` signale une opération en cours.

### PageHeader

En-tête de page : titre (`<h1>`, display 22px), sous-titre et actions sur une ligne (les actions passent sous le titre si la place manque). Collé en haut du conteneur d'`AppLayout` au défilement ; un liseré bas apparaît dès que le contenu passe dessous.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `breadcrumbs` | `ReactNode` | — | Fil d'Ariane au-dessus du titre (`<Breadcrumbs />`) |
| `title` | `string` | **requis** | Titre de la page (`<h1>`) |
| `subtitle` | `ReactNode` | — | Ligne sous le titre : contexte, date de mise à jour… |
| `actions` | `ReactNode` | — | Actions à droite. Dashboard : tout en `sm`, sélecteurs en `variant="button"` |
| `sticky` | `boolean` | `true` | Reste collé en haut au défilement |
| `className` | `string` | — | — |

- ✅ Premier élément du contenu d'`AppLayout` : il recouvre le padding du conteneur (`24px 32px`) pour que rien ne défile au-dessus ni sur les côtés.
- ✅ Les popovers des actions (`DateRangePicker`, `DatePicker`, `Dropdown`) se décalent vers la gauche pour rester dans le conteneur quand le déclencheur est au bord droit.
- ❌ Un seul `PageHeader` par page, et pas de `<h1>` à côté.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tabs` | `ReactNode` | — | TabList ou SegmentedControl sur une rangée dédiée, dans l’en-tête collant. |
| `tabsActions` | `ReactNode` | — | Actions à droite des onglets ; ignorées sans tabs. |

```tsx
<PageHeader title="Catalogue" tabs={tabs} tabsActions={createAction} />
```

### PageSection

Section de page : un titre (`h2` par défaut, `h3`/`h4` pour une sous-section), une description et des actions optionnelles, au-dessus d'un contenu empilé. Remplace le `<section>` + `<h2>` en style inline recréé à la main. Nommée par son titre (`aria-labelledby`) : c'est un repère `region`. L'espacement (`gap`) s'applique entre le titre et le contenu **et** entre les éléments du contenu.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Titre (porte le repère) |
| `headingLevel` | `2 \| 3 \| 4` | `2` | Niveau du titre |
| `description` | `string` | — | Texte sous le titre |
| `actions` | `ReactNode` | — | Actions alignées à droite du titre |
| `gap` | `number` | `20` | Espacement vertical (échelle 4/8/12/16/20/24/32/48) |
| `surface` | `"none" \| "card"` | `"none"` | `"card"` : enveloppe de `Card` (bordure, rayon `lg`, fond blanc), en-tête rembourré (16px 20px) séparé du corps par un filet. ⚠️ Le corps n'a **pas de padding** : liste ou tableau bord à bord ; un contenu libre prend son propre padding. `gap` n'espace plus que les enfants du corps |
| `children` | `ReactNode` | **requis** | Contenu de la section |
| `id` / `className` | `string` | — | — |

- ✅ Enchaîner des `PageSection` dans un conteneur en colonne pour structurer une page de formulaire ou de détail. Le multi-colonnes (`FieldRow`) vit **à l'intérieur** d'une section.
- ❌ Ne pas sauter de niveau de titre : après le `h1` du `PageHeader`, les sections sont en `h2`.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `IconName` | — | Icône décorative de 20px dans une tuile 40px. |
| `iconElement` | `ReactNode` | — | Prioritaire sur icon ; contenu décoratif non interactif. |
| `iconTone` | `"label" \| "muted" \| "accent"` | "label" | Ton de la tuile ; conservée sur mobile. |

```tsx
<PageSection title="Source principale" icon="database" iconTone="label">{content}</PageSection>
```

### FieldRow

Rangée de champs de formulaire à **largeurs égales**, alignés par le bas (`align-items: flex-end`), gap 12. Remplace le `<div style="display:flex;gap:12">` + `flex:1` recréé à la main.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Champs (chacun prend une part égale) |
| `gap` | `number` | `12` | Espacement horizontal (échelle) |
| `className` | `string` | — | — |

- ✅ Pour 2-3 champs d'un même gabarit de hauteur (40 px) côte à côte dans une section.
- ❌ Ne pas y mélanger un champ 40 px et un contrôle compact 29 px (voir [Hauteurs de contrôle](#hauteurs-de-contrôle-et-alignement-sur-une-rangée)). Pas de `helperText` sous un seul champ de la rangée (il décale l'alignement).

### FormActions

Barre d'actions de formulaire. Alignée à droite par défaut, gap 8. Ordre attendu des enfants : `Link` (tertiaire) → `GhostButton` (secondaire) → `PrimaryButton` (principal, en dernier). `justify="between"` pour un pied d'assistant (Précédent à gauche, Suivant à droite).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Actions, dans l'ordre `Link` → `Ghost` → `Primary` |
| `justify` | `"end" \| "between" \| "start"` | `"end"` | Alignement horizontal |
| `gap` | `number` | `8` | Espacement (échelle) |
| `className` | `string` | — | — |

- ✅ Un seul `PrimaryButton` plein, en dernier. Une 3ᵉ action est un `Link hideArrow`.

### CardGrid

Grille fluide de cartes ou de graphiques : colonnes `minmax(min, 1fr)` en `auto-fill` (ou `auto-fit`), gap 16. Remplace le `<div style="display:grid;…">` recréé à la main. Jamais de largeur fixe : les cartes suivent leur conteneur et se replient en une colonne sur mobile.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Cartes / graphiques |
| `min` | `number` | `240` | Largeur mini d'une colonne (px) |
| `gap` | `number` | `16` | Espacement (échelle) |
| `fit` | `boolean` | `false` | `auto-fit` (étire la dernière rangée) au lieu d'`auto-fill` |
| `className` | `string` | — | — |

- ✅ Une grille de `Card` indicateurs en haut d'un tableau de bord ; une grille de graphiques (`min` 360) en dessous.
- ❌ Pas de `gridTemplateColumns` fixe en px : la grille doit rester fluide.

### Pagination

Navigation dans un résultat paginé. Composant contrôlé.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `page` | `number` | **requis** | Page courante, **1-based** |
| `pageSize` | `number` | **requis** | Éléments par page |
| `totalItems` | `number` | **requis** | Total toutes pages confondues |
| `onPageChange` | `(page: number) => void` | **requis** | — |
| `pageSizeOptions` | `number[]` | `[25, 50, 100]` | Tailles proposées |
| `onPageSizeChange` | `(size: number) => void` | — | Sans callback, le sélecteur « 50 par page » n'est pas affiché. ⚠️ Remettre `page` à 1 côté app |
| `aria-label` | `string` | `"Pagination"` | Nom de la `nav` |
| `className` | `string` | — | — |

Affiche « 1–50 sur 12 430 » (`Intl.NumberFormat("fr-FR")`), précédent / suivant, et les pages avec ellipses (`1 … 4 5 6 … 249`, 7 positions fixes). ⚠️ Le menu de taille s'ouvre vers le bas : prévoir de l'espace sous la pagination.

### PrimaryButton / GhostButton

**Compteur (GhostButton uniquement)** : `count?: number` (absent ou zéro : masqué), `countMax?: number` (9), `countLabel?: string` ("non lues"). Le nombre réel fait partie du nom accessible, même lorsque la pastille affiche « 9+ ».

```tsx
<GhostButton icon="bell-01" aria-label="Notifications" count={12} />
```

API identique pour les deux ; seul le rendu change (`PrimaryButton` plein ou contour, `GhostButton` sans fond ni bordure). Mêmes dimensions à taille égale.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** (sauf icône seule) | Libellé. ⚠️ Exclusif avec `icon`. Sans `label` ni `icon`, le bouton ne rend **aucun texte de repli** et une erreur est émise en développement |
| `icon` | nom d'icône `Icons` | — | Icône seule (bouton carré). ⚠️ `aria-label` **obligatoire** (typé) ; à défaut, le nom de l'icône sert de nom accessible avec un avertissement en développement. Le nom accessible s'affiche en **infobulle** sous le bouton, au survol (après 300 ms) et au focus clavier. Masquée, elle est hors du rendu (`display: none`) : elle n'élargit pas la zone défilable d'une `Modal` ou d'un corps défilant ; affichée, elle est recalée horizontalement dans la zone visible (8px du bord), flèche toujours sous le bouton |
| `aria-label` | `string` | — | Nom accessible. Obligatoire avec `icon` |
| `iconStart`, `iconEnd` | nom d'icône `Icons` | — | Icône avant / après le libellé |
| `tone` | `"default" \| "danger"` | `"default"` | `"danger"` : action destructive (fond rouge / texte rouge) |
| `size` | `"sm" \| "md"` | `"md"` | 29 / 34px, texte 11 / 13px. Dépend du contexte, ne porte pas de sens. ⚠️ Pas de `"lg"` |
| `outline` | `boolean` | `false` | **`PrimaryButton` uniquement** : variante contour (fond blanc, bordure `--cadence-color-border-strong`), pour les actions secondaires d'un dashboard |
| `loading` | `boolean` | `false` | Clics ignorés, `aria-busy`, spinner (à la place de `iconStart`), largeur conservée |
| `disabled` | `boolean` | `false` | — |
| `fullWidth` | `boolean` | `false` | Occupe toute la largeur |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | — |
| `onClick` | `MouseEventHandler` | — | — |
| `className` | `string` | — | — |
| `ref` | `Ref<HTMLButtonElement>` | — | `forwardRef` vers le `<button>` |

- Contenu : le typage impose `label`, ou `icon` + `aria-label`. Hors TypeScript, un bouton sans l'un ni l'autre reste vide et une erreur est émise en développement.
- Survol, appui et focus sont gérés en CSS (`:hover`, `:active`, `:focus-visible` avec `--cadence-focus-ring`). Au survol, la couleur fonce d'un cran (plein : `--cadence-color-primary-hover` ; `outline` : voile d'encre sur le blanc ; danger : `--cadence-color-danger-hover`). Le bouton plein (default et danger) se soulève aussi d'une ombre portée douce, teintée de rouge en danger ; l'`outline` n'en a pas. ⚠️ Pas de prop `state`.
- Les anciennes props de la 0.2 (`withIcon`, `destructive`, `size` `"medium"` / `"large"`, `state`) sont supprimées en 1.0.0 : voir [Migration vers la 1.0](#migration-vers-la-10). `outline` est une variante à part entière de `PrimaryButton` ; `GhostButton` ne l'accepte pas.

### RadioButton

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "selected" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` |
| `onChange` | `() => void` | — | — |
| `aria-label` | `string` | — | Nom accessible quand aucun texte n'est associé au bouton radio |

### RichCheckbox

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `"Choice"` | Texte principal |
| `description` | `string` | — | Texte secondaire |
| `state` | `"unchecked" \| "hover" \| "checked" \| "disabled"` | `"unchecked"` | ⚠️ Pas de prop `checked` — piloter via `state` |
| `size` | `"medium" \| "large"` | `"medium"` | — |
| `onChange` | `(nextChecked: boolean) => void` | — | Bascule, comme `Checkbox` |

Carte cliquable avec icône + label + description + carré de coche. Sélection **multiple** — pour un choix exclusif, utiliser `RichRadioButton`.

### RichRadioButton

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `"Choice"` | Texte principal |
| `description` | `string` | — | Texte secondaire |
| `state` | `"default" \| "hover" \| "selected" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` — piloter via `state` |
| `size` | `"medium" \| "large"` | `"medium"` | — |
| `onChange` | `() => void` | — | Clic (le parent gère l'exclusivité) |

### SearchInput

Champ de recherche de 29px, la hauteur des boutons `sm`, avec la même bordure `--cadence-color-border-strong` : il s'aligne sur les filtres. Pour ne pas être pris pour un bouton, il a une forme de champ : coins de 8px (`--cadence-radius-md`) au lieu de la pilule, et un léger creux (ombre interne en haut) là où les boutons ont un relief. Texte 12px. Loupe à gauche ; bouton « Effacer la recherche » (×) dès qu'il y a du texte ; Échap vide aussi le champ (vide, Échap n'est pas intercepté). Prend toute la largeur de son parent.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | **requis** | Texte recherché (contrôlé) |
| `onChange` | `(value: string) => void` | **requis** | Chaque frappe, « effacer » et Échap (avec `""`) |
| `placeholder` | `string` | `"Rechercher…"` | — |
| `aria-label` | `string` | `"Rechercher"` | Nom accessible du champ (pas de label visible) |
| `disabled` | `boolean` | `false` | — |
| `className` | `string` | — | — |

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <div style={{ flex: "0 1 320px" }}>
    <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une perturbation…" />
  </div>
  <Dropdown variant="button" aria-label="Ligne" options={lignes} value={ligne} onChange={setLigne} />
</div>
```

⚠️ `onChange` est appelé à chaque frappe : pour filtrer côté serveur, temporiser (c'est ce que fait `FilterBar`, 300 ms). Dans une `FilterBar`, passer par sa prop `search` plutôt que de poser un `SearchInput` à la main.

### SecondaryTab

Onglet de sous-navigation (niveau 2), sous un `SegmentedControl`. Style ghost (pastille douce sur l'onglet actif, inactifs en `--cadence-color-text-secondary`), avec compteur optionnel. Un `<SecondaryTab>` par onglet, dans un `TabList level="secondary"`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | — |
| `count` | `number` | — | Compteur affiché entre parenthèses après le libellé (ex. « (4) ») |
| `variant` | `"default" \| "active"` | `"default"` | ⚠️ Pas de prop booléenne `active` |
| `disabled` | `boolean` | `false` | — |
| `onClick` | `() => void` | — | — |
| `id` | `string` | — | `id` de l'onglet (cible de `aria-labelledby` côté panneau) |
| `controls` | `string` | — | `id` du panneau → `aria-controls` |

⚠️ Toujours dans un `TabList level="secondary"` ; hors `TabList`, avertissement en développement.

### SegmentedControl

Composant unique : apparence de l’ancien Alt, pour les formulaires et les bascules de vue. Dans un parcours à plusieurs niveaux, associer `SegmentedControl` au premier niveau et `SecondaryTab` dans un `TabList level="secondary"` au second. Le groupe utilise `role="radiogroup"`, sans `TabList` autour de lui. Les flèches déplacent le focus et la sélection ; Début/Fin atteignent les extrémités.

- ✅ Le `SegmentedControl` **épouse ses segments** (« hug ») : sa largeur est celle de ses options, alignées à gauche. Le composant fixe `width: fit-content`, donc il ne s'étire pas dans une colonne flex ou une grille.
- ❌ Ne jamais l'étirer sur toute la largeur de la page ou de son conteneur (`width: 100%`, `flex: 1`, `alignSelf: "stretch"`, segments en `flex: 1`). Seul l'en-tête interne du popover de `DatePicker` le fait, et ce n'est pas un modèle à reproduire.
- ✅ Choisir la taille selon la rangée : `"md"` (40px) parmi des champs de formulaire, `"sm"` (29px) dans un en-tête de dashboard ou une barre d'outils serrée, à côté de boutons `sm` et d'un `SearchInput` (ex. échelle de `Timeline`).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `{ value, label, disabled? }[]` | **requis** | 2 à 4 segments. Une option `disabled` est grisée et sautée par les flèches (ex. échelle plus large que la fenêtre d'une frise) |
| `value` | `string` | — | Mode contrôlé |
| `defaultValue` | `string` | — | Mode non contrôlé |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | `false` | — |
| `size` | `"sm" \| "md"` | `"md"` | `"md"` : 40px (`--cadence-control-height-field`), texte 13px — formulaires. `"sm"` : 29px (`--cadence-control-height-compact`), texte 12px, piste et pastille resserrées — dashboard serré. ⚠️ Ne pas mêler `sm` et champs 40px sur une rangée |
| `aria-label` | `string` | `"Choix"` | Fournir un nom précis du groupe |
| `className` | `string` | — | Classe additionnelle |
| `ref` | `Ref<HTMLDivElement>` | — | Conteneur du groupe |

### Sidebar

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `product` | `"datahub" \| "traffic-report" \| "insights"` | **requis** | Thème de couleur |
| `clientName` | `string` | **requis** | Nom client sous le logo |
| `sections` | `SidebarNavSection[]` | **requis** | `{ id, label, icon, items?, defaultOpen?, notification? }` — sans `items`, la section est un lien direct |
| `activeId` | `string` | — | Item ou section actif |
| `onItemClick` | `(id: string) => void` | — | — |
| `onCollapse` | `() => void` | — | Clic sur le bouton replier / déplier. ⚠️ N'indique pas l'état (replié ou non) ; dans `AppLayout`, rien à faire : le conteneur suit la largeur |
| `onLogout` | `() => void` | — | Bouton déconnexion |
| `scope` | `SidebarScope` | — | Sélecteur de périmètre en pied : `{ options, value?, onChange?, placeholder? }` (options au format `Dropdown`, ⚠️ clé `id`). Masqué quand la Sidebar est repliée ; le menu s'ouvre vers le haut |
| `user` | `SidebarUser` | — | Utilisateur connecté en pied : `{ name, avatarSrc? }` — avatar et nom seuls. Avatar seul quand la Sidebar est repliée |
| `className` | `string` | — | — |

**Repli** — géré en interne : le bouton « » fait passer la Sidebar de **220 px** (dépliée) à **80 px** (repliée), avec une transition de 250 ms. Il n'y a pas de prop pour piloter ou lire cet état. Dans `AppLayout`, le conteneur de la page suit cette largeur tout seul.

**Apparence** — libellés en casse normale (13px, jamais en capitales), icônes ramenées à 18px ; l'élément actif est une pastille claire en relief, texte blanc. ⚠️ À 220 px, un libellé de section dépasse vite (≈ 18 caractères avec chevron) et se tronque : préférer des libellés courts (« Données géo » plutôt que « Données Géographiques »).

```tsx
<AppLayout
  sidebar={
    <Sidebar
      product="datahub"
      clientName="Bordeaux Métropole"
      sections={sections}
      scope={{ options: reseaux, value: reseauId, onChange: setReseauId }}
      user={{ name: "Hector Malot" }}
    />
  }
>
  {children}
</AppLayout>
```

⚠️ Pas de prop `style`. Sans arrondi ni ombre : elle est faite pour se fondre dans le fond d'`AppLayout`.

### Tab

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | — |
| `variant` | `"default" \| "active"` | `"default"` | ⚠️ Pas de prop booléenne `active` |
| `disabled` | `boolean` | `false` | — |
| `onClick` | `() => void` | — | — |
| `id` | `string` | — | `id` de l'onglet (cible de `aria-labelledby` côté panneau) |
| `controls` | `string` | — | `id` du panneau → `aria-controls` |

⚠️ Toujours dans un `TabList` ; hors `TabList`, avertissement en développement.

### TabList

Conteneur `role="tablist"` d'une rangée de `Tab` ou de `SecondaryTab`. *Roving tabindex* : seul l'onglet actif est dans l'ordre de tabulation (sans onglet actif, le premier activable). ←/→ en boucle, Début / Fin ; les onglets désactivés sont sautés.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `aria-label` | `string` | **requis** | Nom de la rangée (« État des scénarios ») |
| `level` | `"primary" \| "secondary"` | `"primary"` | Écart entre onglets : 16px (`Tab`) ou 4px (`SecondaryTab`) |
| `activation` | `"automatic" \| "manual"` | `"automatic"` | `automatic` : les flèches activent l'onglet ; `manual` : les flèches déplacent le focus, Entrée / Espace activent (panneau coûteux à charger) |
| `children` | `ReactNode` | **requis** | Les onglets |
| `className` | `string` | — | — |

```tsx
<TabList aria-label="État des scénarios">
  <Tab label="En cours" variant="active" id="tab-current" controls="panel-current" onClick={…} />
  <Tab label="À venir" id="tab-upcoming" controls="panel-upcoming" onClick={…} />
</TabList>
<div role="tabpanel" id="panel-current" aria-labelledby="tab-current" tabIndex={0}>…</div>
```

### TableCard

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — | Titre du header. Sans `title`/`icon`/`actions`, le header n'est pas rendu |
| `icon` | nom d'icône `Icons` | — | Icône à gauche du titre |
| `iconElement` | `ReactNode` | — | SVG custom (16×16) — prioritaire sur `icon` |
| `checkboxState` | `"unchecked" \| "checked" \| "indeterminate"` | `"unchecked"` | — |
| `onCheckboxChange` | `(checked: boolean) => void` | — | — |
| `checkboxLabel` | `string` | « Sélectionner {title} » | Nom accessible de la case (sinon « Sélectionner la ligne ») |
| `actions` | `ReactNode` | — | Slot — des `GhostButton size="sm"` icône seule (`icon` + `aria-label`, `tone="danger"` pour supprimer) |
| `columns` | `TableCardColumn[]` | `[]` | `{ key, content, width? \| flex? }` — `width` px fixe **ou** `flex` (jamais les deux) |
| `state` | `"default" \| "selected" \| "disabled"` | `"default"` | `selected` = fond bleu du wrapper |

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `selectable` | `boolean` | true | false retire la case ; fournir une action de téléchargement dans actions. |

```tsx
<TableCard title="Export GTFS" selectable={false} actions={downloadAction} />
```

### TableHeader

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `TableHeaderColumn[]` | **requis** | `{ key, label, ariaLabel?, sortable?, sortDirection?, onSort?, width? \| flex? }` — `ariaLabel` nomme une colonne sans libellé (défaut « Sélection ») |

`sortDirection` : `"asc" \| "desc" \| "none"`. Rendu ARIA : `role="table"` (« En-têtes de colonnes ») > `row` > `columnheader`. Les `width`/`flex` doivent refléter ceux des `TableCard` en dessous (+ colonne spacer initiale ≈ 220).

### TextArea

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"enabled" \| "hover" \| "focus" \| "disabled" \| "error" \| "success"` | `"enabled"` | — |
| `label` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `value` | `string` | — | Contrôlé |
| `onChange` | `ChangeEventHandler<HTMLTextAreaElement>` | — | — |
| `helperText` | `string` | — | Message sous le champ |
| `rows` | `number` | `4` | Hauteur initiale (redimensionnable verticalement) |
| `aria-label` | `string` | libellé de `label` | Nom accessible sans `label` visible |
| `disabled` | `boolean` | `false` | — |

### TextInput

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"enabled" \| "hover" \| "focus" \| "disabled" \| "error" \| "success"` | `"enabled"` | — |
| `label` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `value` | `string` | — | Contrôlé |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | — |
| `helperText` | `string` | — | ⚠️ Pas de prop `helper` |
| `aria-label` | `string` | libellé de `label` | Nom accessible sans `label` visible |
| `type` | type HTML natif | `"text"` | ⚠️ Pas de `type="number"` — utiliser `CounterInput` |
| `disabled` | `boolean` | `false` | — |

### Toggle

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "active" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` ni `label` — accoler un `<span>` pour le texte |
| `onChange` | `(nextActive: boolean) => void` | — | — |
| `aria-label` | `string` | — | Nom accessible du `role="switch"`. ⚠️ Obligatoire en pratique : le `<span>` voisin n'est pas relié au contrôle |

### Popover

Panneau non modal ancré à un bouton, pour du contenu libre et interactif : aide contextuelle avec lien, mini-formulaire (seuil, filtre), détail d'un élément. Rendu en portail (position fixe), gardé dans la fenêtre, retourné au-dessus s'il manque de place. Couche `--cadence-z-popover`, ou juste au-dessus d'une `Modal` / d'un `Drawer` d'où il est ouvert. `role="dialog"` nommé par `title`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Titre du panneau et nom accessible |
| `hideTitle` | `boolean` | `false` | Titre masqué visuellement (reste le nom) |
| `children` | `ReactNode \| ({ close }) => ReactNode` | **requis** | Contenu ; la forme fonction reçoit `close` (bouton « Appliquer ») |
| `renderTrigger` | `({ ref, open, toggle }) => ReactNode` | **requis** | Rend le déclencheur : poser `ref` sur le bouton, câbler `toggle` sur son `onClick` |
| `open` | `boolean` | — | Ouverture contrôlée |
| `defaultOpen` | `boolean` | `false` | Ouverture initiale (non contrôlé) |
| `onOpenChange` | `(open: boolean) => void` | — | Ouverture ou fermeture demandée |
| `align` | `"start" \| "end"` | `"start"` | Bord du déclencheur sur lequel s'aligner |
| `width` | `number` | `320` | Largeur en px (bornée à la fenêtre) |
| `className` | `string` | — | Classe du panneau |

Clavier et focus : à l'ouverture, focus sur le premier élément focusable du contenu (sinon sur le panneau). Échap et « Fermer » ferment et rendent le focus au déclencheur ; Maj+Tab avant le premier élément aussi ; Tab après le dernier ferme et passe à l'élément qui suit le déclencheur. Le clic extérieur ferme ; un menu en portail ouvert depuis le contenu (`ActionMenu`, `ExportMenu`, `ColumnManager`) ne compte pas comme extérieur. Le défilement et le redimensionnement replacent le panneau sans le fermer (clavier virtuel sur mobile) ; il se ferme si le déclencheur sort de la fenêtre. `ActionMenu`, `ExportMenu` et `ColumnManager` suivent le même comportement. Seuls les éléments affichés comptent pour la sortie au clavier. Fermé par le parent (mode contrôlé) alors que le focus y était, le focus revient au déclencheur ; une fermeture refusée par le parent laisse le panneau affiché. Dans une `Modal`, Échap ne ferme que le `Popover`. Le déclencheur reçoit `aria-haspopup="dialog"`, `aria-expanded` et `aria-controls` ; il n'affiche pas d'infobulle au survol (même un `GhostButton` icône seule) : son nom reste porté par `aria-label`, et le panneau prend le relais au clic.

```tsx
<Popover
  title="Seuil d’alerte"
  renderTrigger={({ ref, toggle }) => (
    <PrimaryButton ref={ref} outline size="sm" iconStart="settings-01" label="Seuil d’alerte" onClick={toggle} />
  )}
>
  {({ close }) => (
    <>
      <CounterInput label="Retard" unit="min" min={1} max={30} value={draft} onChange={setDraft} />
      <GhostButton size="sm" label="Annuler" onClick={close} />
      <PrimaryButton size="sm" label="Appliquer" onClick={() => { apply(draft); close(); }} />
    </>
  )}
</Popover>
```

- ✅ Déclencheur : un vrai bouton (`GhostButton`, `PrimaryButton outline`) ; icône seule → `aria-label` explicite (« Aide : calcul de la ponctualité »).
- ✅ Un mini-formulaire garde sa valeur en brouillon et ne l'applique qu'au clic sur « Appliquer » (un seul `PrimaryButton`, plein, dans le panneau).
- ❌ Pas pour une simple bulle de texte au survol : `Tooltip` / `TooltipTrigger`.
- ❌ Pas pour un choix dans une liste (`Dropdown`, `Autocomplete`), une liste d'actions (`ActionMenu`) ni un contenu long ou bloquant (`Drawer`, `Modal`).

### Tooltip

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte de la bulle |
| `theme` | `"light" \| "dark"` | `"light"` | — |
| `arrow` | `"top" \| "bottom" \| "right" \| "left"` | — | Direction de la flèche. `arrow="top"` = la bulle est **sous** l'élément (flèche vers le haut) |

Composant purement visuel — pas de logique de positionnement ni de déclenchement. Préférer `TooltipTrigger` pour le pattern complet.

### TooltipTrigger

Icône ⓘ (bouton `type="button"`) qui affiche une bulle d'aide **au survol et au focus clavier** ; Échap la ferme sans déplacer le focus, la sortie du focus aussi. Le texte est le nom accessible du bouton (la bulle est `aria-hidden` pour ne pas être lue deux fois).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `"Label"` | Texte du tooltip |
| `theme` | `"light" \| "dark"` | `"light"` | — |
| `position` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Côté où la bulle apparaît. ⚠️ Pas de prop `tooltip` ni `arrowPosition` |

⚠️ Rend sa **propre icône ⓘ** comme déclencheur — il n'accepte pas de `children` et ne peut pas envelopper un autre élément. Pour un tooltip sur un élément custom, gérer le survol manuellement avec `Tooltip`.

### Toaster / useToast

Système de notifications. Monter **un seul `<Toaster />`** à la racine de l'app ; déclencher avec `useToast()` (ou la fonction `toast()` importable directement). Pile en bas à droite, effet de profondeur, déploiement au survol, max 3, auto-dismiss (pause au survol).

**`<Toaster />`**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `className` | `string` | — | Classe CSS additionnelle sur le conteneur |

**`useToast()` → `{ toast, dismiss }`**

| Fonction | Signature | Description |
|---|---|---|
| `toast` | `(options: ToastOptions) => number` | Affiche un toast, renvoie son id |
| `dismiss` | `(id: number) => void` | Ferme un toast |

**`ToastOptions`**

| Champ | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Titre (gras) |
| `type` | `"information" \| "success" \| "warning" \| "error"` | `"information"` | Couleur + icône |
| `description` | `string` | — | Texte secondaire |
| `duration` | `number` | `4000` (`error` → persistant) | Fermeture auto (ms) ; `0`/`Infinity` = persistant |
| `dismissible` | `boolean` | `true` | Bouton de fermeture × |
| `actions` | `[AlertToastAction]` ou `[AlertToastAction, AlertToastAction]` | — | 1 à 2 boutons |

```tsx
const { toast } = useToast();
toast({ type: "success", title: "Scénario créé" });
```

⚠️ `toast()` est sans effet si aucun `<Toaster />` n'est monté. `AlertToast` reste exporté comme carte brute (hors pile) pour des cas particuliers.

### Skeleton

Forme animée qui réserve la place d'un contenu en cours de chargement. **Décoratif** (`aria-hidden`) : c'est **le conteneur** qui porte `aria-busy="true"` pour annoncer le chargement. Pulsation coupée sous `prefers-reduced-motion`. Adopté en interne par `DataTable` (lignes squelettes) et `Card` (`loading`).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"text" \| "rect" \| "circle"` | `"text"` | Forme |
| `lines` | `number` | `3` | `variant="text"` : nombre de lignes (la dernière plus courte) |
| `width` | `number \| string` | — | Largeur (px si nombre, sinon unité CSS). `circle` : diamètre |
| `height` | `number \| string` | — | Hauteur (px ou unité CSS). `circle` : = `width` |
| `className` / `style` | — | — | Échappatoires |

```tsx
<div aria-busy="true">
  <Skeleton variant="text" lines={3} />
</div>
```

### EmptyState

État vide d'une liste, carte ou graphique. `"no-results"` et `"error"` portent `role="status"` (annoncés sans voler le focus). Remplace la [recette 4](#recette-4--empty-state). Les libellés (titre, description, actions) sont pilotés par l'app.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"empty" \| "no-results" \| "error"` | `"empty"` | Nature de l'état (pilote `role`) |
| `size` | `"page" \| "inline"` | `"page"` | `page` = centré (48px) ; `inline` = compact (DataTable, Card, graphique) |
| `title` | `string` | **requis** | Titre |
| `description` | `string` | — | Texte secondaire |
| `action` | `{ label; onClick? }` | — | Action principale → `PrimaryButton` |
| `secondaryAction` | `{ label; onClick?; disabled? }` | — | Action secondaire → `GhostButton` |
| `illustration` | `ReactNode` | — | Illustration décorative (aria-hidden) |

⚠️ `DataTable.emptyState` accepte un `ReactNode` : y passer un `<EmptyState size="inline" />`.

### ActionMenu

Menu d'actions par ligne, déclenché par un bouton icône (« … »). À utiliser **au-delà de 4 actions** par ligne, ou dans le slot `actions` d'une `TableCard` / la colonne d'actions d'un `DataTable`. Rendu dans un **portail** (position fixe) : non rogné par l'overflow du tableau, même dans une colonne collée à droite. Pattern ARIA `menu`/`menuitem` ; clavier complet (flèches, Début/Fin, saisie de la 1re lettre, Échap, Tab).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `ActionMenuItem[]` | **requis** | Actions du menu |
| `label` | `string` | `"Plus d'actions"` | Nom accessible du déclencheur icône |
| `triggerLabel` | `string` | — | Libellé visible (au lieu de l'icône seule) |
| `triggerIcon` | `IconName` | `"dots-horizontal"` | Icône du déclencheur |
| `align` | `"start" \| "end"` | `"end"` | Bord d'alignement sous le déclencheur |

**`ActionMenuItem`** : `id`, `label`, `icon?`, `tone?` (`"default" \| "danger"`), `disabled?`, `divider?` (séparateur au-dessus), `onSelect`.

```tsx
<ActionMenu items={[
  { id: "edit", label: "Modifier", icon: "edit-02", onSelect: onEdit },
  { id: "del", label: "Supprimer", icon: "trash", tone: "danger", divider: true, onSelect: askDelete },
]} />
```

### Drawer

Panneau latéral droit pour consulter le détail d'un élément **sans quitter la liste** (≠ `Modal`, dialogue bloquant). Voile, Échap, clic sur le voile, bouton fermer, **piège à focus et retour du focus** (primitives de surcouche partagées, également utilisées par `Modal`). Entrée/sortie en `transform` (250 ms, comme la `Sidebar`), coupées sous `prefers-reduced-motion`.

Avec `navigation`, les flèches précédent/suivant et le compteur occupent une seconde ligne alignée à droite sous la croix. Le contenu complémentaire `headerContent` (badge ou statut) est placé à gauche sur cette même ligne, dans l’en-tête.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `isOpen` | `boolean` | **requis** | Visibilité |
| `onClose` | `() => void` | **requis** | Échap, clic voile, bouton fermer |
| `title` | `string` | **requis** | Titre |
| `subtitle` | `string` | — | Sous-titre |
| `children` | `ReactNode` | **requis** | Corps défilant (`cadence-scrollbar`) |
| `primaryAction` | `{ label; onClick?; destructive?; loading?; disabled? }` | — | Pied → `PrimaryButton` (`destructive` → `tone="danger"`, `loading` → spinner, clics ignorés). Avec `onSubmit` : `type="submit"`, `onClick` facultatif |
| `secondaryAction` | `{ label; onClick?; disabled? }` | — | Pied → `GhostButton` (toujours `type="button"`, ne soumet jamais) |
| `footer` | `ReactNode` | — | Pied composé, prioritaire sur les actions standard ; reste hors du corps défilant |
| `width` | `"md" \| "lg"` | `"md"` | 480px / 720px (`lg` : formulaire, contenu dense) |
| `onSubmit` | `(event: FormEvent<HTMLFormElement>) => void` | — | Panneau formulaire : corps + pied dans un `<form>`, l'action principale soumet (Entrée dans un champ aussi) |
| `className` | `string` | — | Classe additionnelle sur le panneau |

**Drawer formulaire** (`width="lg"` + `onSubmit`) : en-tête et pied restent fixes, seul le corps défile. Champs côte à côte avec `FieldRow`. Story : *Surcouches / Drawer / Large avec formulaire*.

```tsx
<Drawer isOpen={open} onClose={close} title="Nouvelle perturbation" width="lg"
  onSubmit={(e) => { e.preventDefault(); if (valid) save(); }}
  primaryAction={{ label: "Créer", loading: saving }}
  secondaryAction={{ label: "Annuler", onClick: close }}>
  <TextInput label="Titre *" … />
  <FieldRow><TextInput label="Début" … /><TextInput label="Fin" … /></FieldRow>
</Drawer>
```

⚠️ `onSubmit` reçoit l'événement natif : appeler `event.preventDefault()`, sinon la page est rechargée. La validation reste à l'app (état `error` + `helperText` des champs, `ErrorSummary` si plusieurs erreurs). Ne pas mettre de bouton de soumission dans `children` : c'est l'action principale du pied.

Le panneau partage avec `Modal` la gestion des surcouches superposées : seule celle au premier plan possède le clavier ; le fond reste verrouillé jusqu’à la fermeture de la dernière.

⚠️ Actions du pied : `GhostButton` (secondaire) + `PrimaryButton` (principale), jamais deux boutons pleins. (La `Modal` met son action secondaire en `PrimaryButton outline`.)

⚠️ Les actions de fin de parcours doivent être dans `primaryAction` / `secondaryAction`, ou `footer` pour une barre composée. Ne pas placer un pied sticky dans `children` : il serait limité par le padding et le défilement du corps. `disabled` conserve les validations métier ; `loading` signale une opération en cours.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `headerContent` | `ReactNode` | — | Contenu sous le titre, hors défilement ; statuts/actions. |
| `navigation` | `{ current: number; total: number; onPrevious: () => void; onNext: () => void }` | — | Précédent / suivant dans l'en-tête, à droite du titre et avant la fermeture. Position 1-based et total positif ; boutons bornés, compteur annoncé ; flèches sans infobulle (nommées par `aria-label`). |
| `width` | `"md" \| "intermediate" \| "lg"` | "md" | 480 / 576 / 720px, bornés par la fenêtre. |

```tsx
<Drawer isOpen={open} onClose={close} title={name} width="intermediate" navigation={navigation}>{detail}</Drawer>
```

### ProgressBar

Progression déterminée (0–100, bornée) ou indéterminée (valeur absente/non finie). Animation désactivée sous `prefers-reduced-motion`. `role="progressbar"` sur la piste ; nom accessible par label, `aria-label`, ou « Progression ».

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | — | 0–100 ; absente → indéterminée |
| `label` | `string` | — | Libellé visible |
| `showValue` | `boolean` | `false` | Pourcentage visible en mode déterminé |
| `tone` | `"default" \| "success" \| "danger"` | `"default"` | Teinte du remplissage : `default` = `--cadence-color-accent` (`#1b6cff`, progression en cours), `success`, `danger` |
| `aria-label` | `string` | `"Progression"` | Nom en l'absence de label |
| `className` | `string` | — | Classe additionnelle |
| `ref` | `Ref<HTMLDivElement>` | — | Conteneur racine |

Réutilisée par `AlertToast` et `FileUpload`. Une progression n'est pas une notification : l'app annonce aussi le succès ou l'échec avec `InlineAlert` ou `Toaster`.

### InlineAlert

Message persistant dans le flux. Erreur : `role="alert"` ; autres types : `role="status"`. Fermeture contrôlée par l'app.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"information" \| "success" \| "warning" \| "error"` | **requis** | Type sémantique |
| `title` | `string` | — | Titre facultatif |
| `children` | `ReactNode` | **requis** | Corps du message |
| `action` | `{ label: string; onClick: () => void }` | — | Action secondaire, rendue en `PrimaryButton outline size="sm"` (contour visible sur le fond teinté, quel que soit le type) |
| `dismissible` | `boolean` | `false` | Affiche « Fermer » |
| `onDismiss` | `() => void` | — | L'app retire l'alerte au clic |
| `className` | `string` | — | Classe additionnelle |

Pour un résumé d’erreurs de soumission, utiliser `ErrorSummary`, qui réutilise `InlineAlert` et `Link` et prend en charge le focus. Voir le pattern **Assistant / import**.

### LineBadge

Identité d'une ligne : pastille (code court ≤ 3 caractères hors espaces) ou pilule. Nom accessible « Ligne 13, métro » (`role="img"`). Le mode est annoncé ; aucun pictogramme de mode n'est rendu.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `code` | `string` | **requis** | Code court de ligne |
| `mode` | `"metro" \| "rer" \| "train" \| "tram" \| "bus" \| "car" \| "bateau" \| "navette"` | — | Mode annoncé |
| `color` | `string` | encre | Fond hexadécimal 3/6 caractères, avec ou sans `#` (GTFS). Invalide → repli encre |
| `textColor` | `string` | calculée | Hexadécimal fourni par l'app. Sans valeur : blanc/encre, puis noir si nécessaire pour AA |
| `size` | `"sm" \| "md"` | `"md"` | Hauteur 18 / 22px |
| `className` | `string` | — | Classe additionnelle |

⚠️ Exception à « tokens uniquement » : les couleurs de ligne sont des données métier. Sans `textColor`, la couleur calculée (blanc, encre ou noir) atteint toujours 4,5:1. Une `textColor` explicite est respectée telle quelle ; sous 4,5:1, un avertissement est émis en développement (une fois par couple de couleurs) : corriger la donnée, ou omettre `textColor`. Les couleurs CSS nommées, RGB et alpha ne sont pas acceptées.

### CopyableText

Identifiant technique en police mono, tronqué avec ellipse, suivi d'un `GhostButton` de copie. Aucune infobulle : ni bulle au survol du bouton (son nom reste porté par `aria-label`), ni `title` natif sur la valeur (la valeur complète reste dans le DOM, lue et copiée). Le retour « Copié » (ou « Copie impossible ») est écrit à côté du bouton, l'icône passe en coche, une région `role="status"` l'annonce, puis il s'efface après 2 s. Copie via l'API Clipboard, avec repli `execCommand` hors contexte sécurisé.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | **requis** | Texte copié, affiché par défaut |
| `children` | `ReactNode` | — | Affichage à la place de `value` (identifiant abrégé) ; c'est toujours `value` qui est copié |
| `copyLabel` | `string` | `"Copier {value}"` | Nom du bouton (et de son infobulle) |
| `mono` | `boolean` | `true` | Police mono |
| `truncate` | `boolean` | `true` | Ellipse sur une ligne |
| `onCopy` | `(value: string) => void` | — | Après une copie réussie |
| `className` | `string` | — | Classe additionnelle |

- ✅ Dans `DescriptionList` (valeur d'une métadonnée), une cellule de `DataTable` ou le détail d'un arrêt de `RouteStopList`.
- ✅ Abréger un identifiant très long avec `children` et nommer le bouton avec `copyLabel` (« Copier l’identifiant de la course »).
- ❌ Pas pour du texte courant ou un libellé : réservé aux identifiants qu'on recopie dans un autre outil.

### StopLabel

Nom, commune et identifiant d'arrêt, avec lignes facultatives. Le nom est tronqué par ellipse, sa valeur complète restant dans l'attribut `title` natif ; l'identifiant est affiché en entier dans un `Badge mono` (donc pas de `title`). Ce n'est pas une infobulle Cadence interactive.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `name` | `string` | **requis** | Nom de l'arrêt |
| `id` | `string` | — | Identifiant technique, en mono ; n'est pas un id DOM |
| `city` | `string` | — | Commune |
| `lines` | `ReactNode` | — | Ex. plusieurs `LineBadge` |
| `className` | `string` | — | Classe additionnelle |

### Accordion

Panneaux disclosure avec boutons natifs, `aria-expanded`, `aria-controls`, régions nommées et panneaux fermés `inert`. Animation coupée sous `prefers-reduced-motion`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `AccordionItem[]` | **requis** | `{ id: string; title: ReactNode; content: ReactNode; defaultOpen?: boolean }` |
| `mode` | `"single" \| "multiple"` | `"single"` | Un ou plusieurs panneaux ouverts |
| `className` | `string` | — | Classe additionnelle |

Les ids doivent être uniques. `defaultOpen` s'applique au montage ; en mode `single`, seul le premier défaut est retenu. L'état d'ouverture est interne. Ne pas placer d'action interactive dans `title` (déjà contenu dans un bouton).

### Stepper

Liste ordonnée d'étapes. État explicite en texte (terminée, en cours, à venir, en erreur) et `aria-current="step"`. Les étapes terminées sont navigables si `onStepClick` est fourni.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `steps` | `StepperStep[]` | **requis** | `{ id: string; label: string; description?: string; state: StepState }` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Horizontal empilé sous 480px |
| `onStepClick` | `(id: string) => void` | — | Retour vers une étape terminée |
| `className` | `string` | — | Classe additionnelle |

`StepState` : `"upcoming" | "current" | "completed" | "error"`. L'app fournit une seule étape courante et gère validation/navigation ; le composant ne valide aucun champ.

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `steps[].state` | `"upcoming" \| "current" \| "completed" \| "error" \| "warning"` | requis | warning : marqueur ! et libellé « À vérifier ». Seules les étapes terminées restent cliquables. |

```tsx
<Stepper steps={[{ id: "quality", label: "Qualité", state: "warning" }]} />
```

### FileUpload

Zone de dépôt avec bouton « Parcourir » (`PrimaryButton outline size="sm"`), validation locale du format et de la taille, liste de fichiers contrôlée et erreurs annoncées. Ne réalise aucun transfert réseau.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `accept` | `string` | — | Extensions et/ou MIME séparés par virgules ; jokers MIME (`image/*`) acceptés |
| `multiple` | `boolean` | `false` | Sinon seul le premier fichier valide est transmis |
| `maxSize` | `number` | — | Taille maximale en octets, par fichier |
| `onFiles` | `(files: File[]) => void` | — | Fichiers valides ; l'app gère lecture et envoi |
| `files` | `UploadFile[]` | `[]` | Liste affichée, contrôlée |
| `onRemove` | `(id: string) => void` | — | Retrait demandé à l'app |
| `className` | `string` | — | Classe additionnelle |

`UploadFile` : `id: string`, `name: string`, `size: number`, `status: "pending" | "uploading" | "success" | "error"`, `progress?: number` (0–100 ; absente pendant l'envoi → indéterminée), `error?: string` (message de l'app).

Chaque fichier est une carte (fond `surface-subtle`, bordure, rayon `lg`) : intitulé d'état en capitales (« Fichier importé », « Fichier en cours d’import », « Fichier en attente », « Échec de l’import »), picto document, nom et taille. Action de droite, si `onRemove` est fourni : corbeille `PrimaryButton outline tone="danger"` pour un fichier importé (« Supprimer … »), croix `GhostButton` sinon (« Annuler l’import de … » pendant l'envoi, « Retirer … » en attente ou en échec). Pendant l'envoi : barre fine accent et pourcentage à droite (absent si la progression est indéterminée).

⚠️ `accept`/`maxSize` ne valident pas le contenu du fichier. L'app/serveur assure le contrôle métier (ex. schéma GTFS), la sécurité et l'annulation d'un envoi lors du retrait. Les états sont aussi écrits en texte, indépendamment des icônes. L'input natif est hors tabulation ; le bouton visible donne accès au sélecteur.

### ExportMenu

Menu de portée × format, partagé avec la primitive interne d'`ActionMenu`. L'app fabrique et télécharge le fichier ; le menu ne sérialise aucune donnée.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `counts` | `ExportScopeCounts` | **requis** | `{ selection?: number; page?: number; total?: number }` ; absente → portée masquée, ≤ 0 → désactivée |
| `formats` | `ExportFormat[]` | `["csv", "excel"]` | Formats effectivement pris en charge par l'app |
| `loading` | `boolean` | `false` | Déclencheur en chargement, actions désactivées |
| `onExport` | `(args: { scope: ExportScope; format: ExportFormat }) => void` | **requis** | Demande d'export |
| `className` | `string` | — | Classe additionnelle |

`ExportScope` : `"selection" | "page" | "all"`. `ExportFormat` : `"csv" | "excel"`. Chaque option annonce sa portée via une description accessible. La sélection peut être limitée au résultat filtré par l'app (comme la recette de supervision). Exporter une page exige de respecter le tri appliqué.

### Timeline

Plages horizontales sur un axe temps, une ligne par entité (ligne, arrêt, véhicule, perturbation) : durée des perturbations, amplitudes de service, travaux. Les bornes sont des `Date` **ou** des heures de service `HH:mm` (jusqu'à 47:59 avec `allowOvernight`, comme `TimePicker`). Couleurs par `tone` (tokens de statut) **toujours doublées d'un motif**. 40 px par ligne, libellés dans une gouttière de 148 px qui reste visible au défilement. Repère « maintenant » optionnel, `annotations` (traits et bandes). Survol/focus → `ChartTooltip` ; clic/Entrée → `onItemClick` (ouvrir un `Drawer`). États `loading`/`empty`/`error` et « Voir les données » comme les autres graphiques.

**Cadre commun avec `JourneyTimeline`** : carte bordée avec bandeau « Fenêtre » (`Jeu. 11/06/2026 07h55 → 08h35`, durée, en police mono), sélecteur **Échelle**, axe horaire **en haut** au format `08h15` (graduations alignées sur l'horloge, pas majeurs en gras : quarts d'heure pour un pas de 5 min), grille verticale, défilement horizontal et aide en pied.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Nom accessible (comme tous les graphiques) |
| `rows` | `TimelineRow[]` | **requis** | `{ id; label; items: TimelineItem[] }` ; item : `{ id; start; end?; label?; tone?; pattern? }` |
| `allowOvernight` | `boolean` | `false` | Heures de service au-delà de 24:00 (jusqu'à 47:59) |
| `range` | `[TimeValue, TimeValue]` | englobe les plages, arrondie à 5 min | Fenêtre affichée |
| `now` | `TimeValue` | — | Repère « maintenant » |
| `annotations` | `TimelineAnnotation[]` | — | `{ id; start; end?; label? }` : trait (sans `end`) ou bande |
| `onItemClick` | `(item, row) => void` | — | Clic ou Entrée sur une plage |
| `scales` | `number[]` | `[60, 30, 15]` | Échelles en plus de « Ajuster », en **minutes visibles dans la largeur**. `[]` masque le sélecteur |
| `defaultScale` | `"fit" \| number` | `"fit"` | Échelle initiale |
| `hint` | `string \| false` | phrase adaptée | Aide en pied ; `false` la masque |
| `state` / `emptyMessage` / `errorMessage` / `onRetry` / `description` / `headingLevel` / `framed` / `className` | — | — | Props communes des graphiques |

- Clavier : une seule plage tabulable (`role="group"`), ←/→ dans la ligne, ↑/↓ de ligne, Début / Fin, Entrée, Échap. La plage focalisée est annoncée (`role="status"`) et ramenée dans la zone visible.
- **Échelle** : « Ajuster » fait tenir toute la fenêtre dans la largeur ; une échelle fixe (1 h, 30 min, 15 min) montre cette durée dans la largeur et la frise défile horizontalement. Une échelle supérieure ou égale à la fenêtre est désactivée (« 1 h » sur une fenêtre de 40 min).
- ✅ Toujours un `tone` (motif automatique) ou un `pattern` explicite : jamais la couleur seule.
- ✅ Donner `range` quand la fenêtre est connue de l'app (fenêtre de départ, journée de service) : le bandeau l'affiche telle quelle.
- ❌ Hors périmètre : glisser, redimensionner, créer une plage, zoom libre (molette, pincement) : seules les échelles proposées.

### JourneyTimeline

Comparaison d'**itinéraires** sur une fenêtre de départ : une ligne par itinéraire, faite d'étapes (marche, transport, attente) sur l'axe horaire commun, suivie d'un résumé calculé (`20 min · 0 correspondance · 5 min de marche`) et de la mention **« Recommandé »**. Même cadre que `Timeline` (bandeau « Fenêtre » avec le nombre d'itinéraires, échelle, axe `08h15`, grille, aide en pied). Le libellé `[1]`, `[2]`… est collé au départ de chaque trajet (effet d'escalier).

```tsx
<JourneyTimeline
  title="Itinéraires proposés"
  range={[depart, depart + 40 min]}
  journeys={[{
    id: "j1",
    recommended: true,
    segments: [
      { id: "w1", kind: "walk", start: t0, end: t1 },
      { id: "b1", kind: "transit", start: t1, end: t2, line: { code: "A", mode: "bus", color: "#E3051B" }, label: "Mairie → Gare" },
      { id: "w2", kind: "walk", start: t2, end: t3 },
    ],
  }]}
  onJourneyClick={(journey) => openDrawer(journey)}
/>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | **requis** | Nom accessible |
| `journeys` | `Journey[]` | **requis** | `{ id; segments; label?; recommended? }` ; `label` défaut `[n]` (nom accessible « Itinéraire n ») |
| `range` | `[TimeValue, TimeValue]` | englobe les trajets, arrondie à 5 min | Fenêtre de départ affichée |
| `allowOvernight` | `boolean` | `false` | Heures de service au-delà de 24:00 |
| `onJourneyClick` | `(journey) => void` | — | Clic sur une ligne, ou Entrée sur une de ses étapes |
| `scales` / `defaultScale` / `hint` | — | comme `Timeline` | Échelle et aide |
| `state` / `emptyMessage` / `errorMessage` / `onRetry` / `description` / `headingLevel` / `framed` / `className` | — | — | Props communes des graphiques |

Étape (`JourneySegment`) : `{ id; kind: "walk" | "transit" | "wait"; start; end; line?: { code; mode?; color?; textColor? }; label? }`. `label` est le détail de l'info-bulle (« Châtelet → Nation »).

Rendu des étapes :
- **Marche** : fond gris, picto piéton (`ModeIcon walk`), durée si la place le permet.
- **Transport** : teinte pâle et bord de la couleur de ligne GTFS (`route_color`), picto du mode (`ModeIcon` : `metro`, `train` pour RER et train, `tram`, `bus` pour bus et navette, `coach` pour car, `boat` ; `all-pt` sans mode), `LineBadge`, durée. Sans couleur : bord encre, fond neutre. Le contenu se réduit selon la place (durée, puis badge) ; le picto reste.
- **Attente** : bord pointillé, picto horloge (`Icons clock` : pas de mode de transport).

- Résumé : durée de bout en bout, correspondances = étapes en transport − 1, cumul de marche. Calculé par le composant : fournir des étapes contiguës.
- Clavier : ↑/↓ entre itinéraires, ←/→ entre étapes, Début / Fin, Entrée ouvre l'itinéraire, Échap. L'étape et le total de l'itinéraire sont annoncés (`role="status"`). « Voir les données » : une ligne par étape et un total par itinéraire.
- ✅ « Recommandé » est un texte (pas seulement une couleur) ; un seul itinéraire recommandé.
- ✅ Couleurs de ligne issues des données GTFS, comme `LineBadge` : texte calculé pour AA.
- ❌ Pas pour des plages par entité (perturbations, amplitudes) : `Timeline`.
- ❌ Pas de calcul d'itinéraire : le composant affiche ce que l'app fournit.

### LineDiagram

Thermomètre de ligne temps réel : arrêts sur une voie horizontale à la couleur GTFS de la ligne, véhicules de l'aller **au-dessus**, du retour **au-dessous**, chacun en pastille `ModeIcon` + numéro + écart (« +4 », « −1 ») ou picto d'incident. Statut par teinte **et** texte : incident > retard > avance > à l'heure (tokens `--cadence-status-*`). Sans `delay` : **écart inconnu**, pastille tiretée « ? », lue « écart inconnu » et comptée « n sans écart connu » — jamais « à l'heure ». Arrêt fermé : pastille barrée et libellé rayé ; arrêt perturbé : tronçon suivant tireté. Véhicules proches empilés sur trois niveaux, au-delà estompés (toujours au clavier et dans le tableau). Espacement régulier, ou à l'échelle si tous les arrêts ont une `distance` ; au moins 64 px par interarrêt, défilement horizontal au-delà. Composant **contrôlé** : l'application fournit les positions à chaque rafraîchissement (aucune requête). Déplacements animés (600 ms), sans animation sous `prefers-reduced-motion`. Props communes : voir `BarList` (dont `freshness` pour dater la donnée et `exportable`).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `line` | `{ code, color?, textColor?, mode? }` | **requis** | Ligne GTFS : badge, couleur de la voie, picto des véhicules |
| `stops` | `{ id, name, distance?, status?, note? }[]` | **requis** | Arrêts dans l'ordre de l'aller ; `status` `"normal" \| "disrupted" \| "closed"`, `note` lue et au survol |
| `vehicles` | `LineDiagramVehicle[]` | **requis** | `{ id, label, direction: "outbound" \| "inbound", position, delay?, incident?, load? }` ; `position` `{ at }` ou `{ from, to, progress? }` (0 à 1, défaut 0,5) |
| `directions` | `{ outbound?, inbound? }` | « Vers <terminus> » | Libellés des sens |
| `show` | `"both" \| "outbound" \| "inbound"` | `"both"` | Sens affichés |
| `delayThresholds` | `{ late, early }` | `{ late: 3, early: -1 }` | Seuils (min) du statut retard / avance |
| `announce` | `"none" \| "incidents" \| "all"` | `"incidents"` | Annonces des changements non sollicités (nouvel incident, arrêt fermé ; `"all"` : aussi retard / avance), regroupées au plus toutes les 10 s |
| `onVehicleClick` | `(vehicle) => void` | — | Clic ou Entrée sur un véhicule |
| `onStopClick` | `(stop) => void` | — | Clic ou Entrée sur un arrêt ; ajoute la file des arrêts au clavier |

Clavier : un seul arrêt de tabulation ; ←/→ d'un véhicule au suivant dans la file (ordre de la ligne), ↑/↓ change de file (aller, retour, puis arrêts si `onStopClick`), Début / Fin, Entrée, Échap. Annonce : « 4521, Vers Montparnasse, entre Basilique de Saint-Denis et Porte de Paris, retard 4 min, charge 92 % ». Description : « 4 véhicules vers Montparnasse, 3 vers Saint-Denis Université, 1 incident, 2 en retard, 1 arrêt fermé ». « Voir les données » : véhicule, sens, position, écart, charge, incident.

- ⚠️ Ligne **linéaire** en v1 : pas de fourches ni de boucles, une ligne à la fois.
- ⚠️ `vehicles` change à chaque rafraîchissement : garder des `id` stables pour que les véhicules glissent au lieu de réapparaître.
- ❌ Pas une carte : pour la géographie, l'application garde sa carte ; pour l'espace-temps, `TimeSpaceDiagram`.

```tsx
<LineDiagram
  title="Ligne 13 — supervision"
  freshness={{ updatedAt: lastPoll }}
  line={{ code: "13", mode: "metro", color: "#6ec4e8" }}
  stops={arrets}
  vehicles={positions}
  directions={{ outbound: "Vers Montparnasse", inbound: "Vers Saint-Denis Université" }}
  onVehicleClick={(v) => openVehicle(v.id)}
/>
```

### ChartSyncGroup

Groupe de graphiques à **curseur synchronisé**, sans rendu propre : envelopper la grille. Survoler ou parcourir au clavier une abscisse d'un `LineChart` ou d'un `BarChart` du groupe la repère (crosshair, bande de survol) dans tous les autres qui ont la même abscisse — même date (`Date`), même catégorie ou même heure de service. Seul le graphique actif affiche son tooltip et fait son annonce.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Les graphiques, à n'importe quelle profondeur |

- ✅ Pattern Analyse : évolution, volumes et taux sur la même période.
- ⚠️ Les abscisses doivent être identiques (mêmes libellés de catégories, mêmes dates) pour se répondre.

```tsx
<ChartSyncGroup>
  <CardGrid min={320} fit>
    <LineChart framed title="Retard moyen" series={retards} />
    <BarChart framed title="Perturbations" categories={jours} series={perturbations} />
  </CardGrid>
</ChartSyncGroup>
```

### SmallMultiples

Petits multiples : un `LineChart` compact par élément (ligne, mode, arrêt) dans une grille fluide, sur une **échelle Y commune** (formes et niveaux comparables), libellé et dernière valeur au-dessus de chaque case, seuils communs. Curseur synchronisé entre les cases (`ChartSyncGroup` intégré), chaque case parcourable au clavier comme un `LineChart`. « Voir les données » : élément, dernière valeur, minimum, maximum. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `{ id, label, data: { x, y }[] }[]` | **requis** | Un petit graphique par élément |
| `unit` | `string` | — | — |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `thresholds` | `{ value, label }[]` | `[]` | Seuils communs (ligne tiretée dans chaque case) |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Côté défavorable d'un seuil signalé |
| `yDomain` | `[number, number]` | de min(0, valeurs) au max, arrondi | Échelle commune |
| `serviceTime` | `boolean` | `false` | Abscisses en heures de service |
| `minItemWidth` | `number` | `200` | Largeur minimale d'une case |
| `itemHeight` | `number` | `56` | Hauteur du tracé d'une case |

- ✅ Jusqu'à une vingtaine d'éléments ; au-delà, `DataTable` avec `Sparkline`.
- ❌ Pas d'échelle propre à chaque case : l'intérêt est la comparaison.

### ColorField

Saisie d'une couleur de ligne GTFS (`route_color`), avec `route_text_color` optionnel. Champ de 40 px : pastille, champ hex validé (avec ou sans `#`) et aperçu `LineBadge` en direct. La pastille ouvre un **sélecteur HEX** dans un `Popover` (titré par `label`) : zone saturation / luminosité, réglette de teinte et champ « HEX ». Chaque changement s'applique aussitôt au champ et à l'aperçu ; Échap ou « Fermer » referme le sélecteur. Un seul mode, l'hexadécimal (format GTFS) : pas de RGB ni de HSL. Le contraste texte/fond est contrôlé via `line-badge-utils` ; sous 4,5:1, l'aide passe en erreur et un bouton « Calculer la couleur du texte » propose une couleur lisible.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Libellé visible |
| `value` | `string` | **requis** | Couleur de fond hex (avec ou sans `#`) |
| `onChange` | `(hex: string) => void` | **requis** | Couleur normalisée `#RRGGBB` |
| `textColor` | `string` | — | `route_text_color` ; déclenche le contrôle de contraste |
| `onTextColorChange` | `(hex: string) => void` | — | Appelé par « Calculer la couleur du texte » |
| `previewCode` | `string` | `"00"` | Code affiché dans l'aperçu `LineBadge` |
| `previewMode` | `LineMode` | — | Mode de l'aperçu (nom accessible) |
| `helperText` | `string` | — | Aide, remplacée par l'erreur de validation/contraste |
| `state` | `"enabled" \| "error"` | `"enabled"` | `"error"` force le rendu d'erreur |
| `disabled` / `required` | `boolean` | `false` | États natifs |
| `id` / `className` | `string` | — | — |
| `ref` | `Ref<HTMLInputElement>` | — | Cible le champ hex (pour `ErrorSummary`) |

- ✅ Couleur **des données** (GTFS), jamais un token : c'est l'exception assumée de `LineBadge`/`ColorField`.
- ✅ Fournir `onTextColorChange` pour laisser l'utilisateur corriger un contraste insuffisant.
- Clavier du sélecteur : la zone de couleur est un curseur (←/→ saturation, ↑/↓ luminosité, Maj pour un pas de 10) ; la teinte est un curseur natif ; le champ HEX accepte `#RRGGBB`, `RRGGBB` ou `#RGB`.
- ❌ Ne pas utiliser pour une couleur de thème ou de statut (celles-ci passent par les tokens).

### ColumnManager

Panneau non modal en portail : visibilité, ordre et réinitialisation des colonnes. Ordre modifiable de trois façons : glisser-déposer de la poignée (souris et tactile, trait accent à la position de dépôt, ligne saisie estompée), ↑ / ↓ au clavier sur la poignée (nouvelle position annoncée, focus conservé), ou boutons Monter / Descendre, l'alternative sans glisser. Le nouvel ordre est transmis par `onChange`. Focus à l'ouverture, Échap et sortie par Tab rendent le focus au déclencheur. Le défilement interne reste possible.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `ColumnManagerColumn[]` | **requis** | `{ id: string; label: string }` |
| `visibleIds` | `string[]` | **requis** | Colonnes visibles |
| `order` | `string[]` | **requis** | Ordre partiel ou complet ; doublons/inconnus ignorés, absentes ajoutées à la fin |
| `onChange` | `(next: { visibleIds: string[]; order: string[] }) => void` | **requis** | État contrôlé |
| `className` | `string` | — | Classe additionnelle |

Brancher `DataTable.hiddenColumnIds` sur le complément de `visibleIds`, et `DataTable.columnOrder` sur `order`. « Réinitialiser » restaure toutes les colonnes dans l'ordre de `columns`. L'app assure leur persistance si souhaité.

### Sparkline

Mini-courbe sans axe ni interaction, pour une cellule de `DataTable`, une ligne de liste ou une `Card` (qui l'utilise pour `trend`). Point final marqué. Nom accessible (`role="img"`) résumant la tendance : « Tendance en hausse : de 2,1 min à 3,9 min sur 7 points », complété du minimum et du maximum quand un pic ou un creux dépasse les extrémités (« …, minimum 84 %, maximum 95 % »).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `values` | `number[]` | **requis** | Ordre chronologique. Valeurs non finies ignorées ; moins de 2 valeurs → rien n'est rendu |
| `color` | `"ink" \| 1 \| … \| 8` | `"ink"` | Encre `--cadence-color-label` ou série `--cadence-dataviz-series-N` |
| `width` / `height` | `number` | `80` / `32` | Taille en px |
| `showLastPoint` | `boolean` | `true` | Point sur la dernière valeur |
| `unit` | `string` | — | Unité du résumé accessible |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | Format fr-FR du résumé |
| `aria-label` | `string` | résumé automatique | Remplace le résumé |
| `decorative` | `boolean` | `false` | `aria-hidden` : la valeur est déjà écrite à côté |
| `className` | `string` | — | Classe additionnelle |

- ✅ Dans une cellule de tableau, garder la valeur actuelle dans sa propre colonne : la `Sparkline` montre la forme, pas le chiffre.
- ✅ Une même couleur pour toutes les lignes d'un tableau (`color={1}` ou encre) : la couleur ne distingue pas les lignes.
- ❌ Pas de seuil, d'axe ni de tooltip : passer à `LineChart compact` ou `LineChart`.
- ❌ Ne pas l'utiliser seule pour porter un statut : un écart à l'objectif reste un `Indicator`.

### Gauge

Proportion unique en arc 270° ou anneau. Valeur formatée en français, statut écrit « Favorable », « Intermédiaire » ou « Défavorable », suivi du libellé de la borne qui décide (la zone favorable pour un niveau favorable ou intermédiaire, la zone défavorable sinon). Valeur graphique bornée à [0, max] ; nombre brut conservé. Pas d'animation sous `prefers-reduced-motion`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | **requis** | Valeur brute |
| `max` | `number` | `100` | Maximum strictement positif |
| `unit` | `string` | — | Unité affichée |
| `thresholds` | `GaugeThreshold[]` | — | `{ value: number; label: string }` |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Sens favorable |
| `shape` | `"arc" \| "ring"` | `"arc"` | Forme |
| `className` | `string` | — | Classe additionnelle |

Avec `up` : sous le premier seuil → défavorable, à partir du dernier → favorable, entre les deux → intermédiaire. Avec `down` : jusqu'au premier → favorable, au-dessus du dernier → défavorable. Sans seuil ou avec `neutral`, pas de jugement. Valeur/max non finis ou max ≤ 0 → nom accessible « Donnée indisponible », piste vide. Ce composant n'a pas les états `loading`/`error` de `ChartFrame` : les gérer dans la composition avec `Skeleton`/`InlineAlert`.

### Meter

Mesure d'une valeur par rapport à une capacité, en barre horizontale (8px). Primitive compacte comme `Gauge` : `label` visible au lieu de `title`, sans états `loading` / `error` (les gérer dans la composition avec `Skeleton` / `InlineAlert`). Deux modes exclusifs, selon la présence de `value` ou de `segments`.

**Mode simple** (`value`) : remplissage coloré selon `goodDirection` et `thresholds` (même règle que `Gauge`), repères de seuil sur la barre et statut écrit dessous (« Intermédiaire — Charge élevée 80 % »). `role="meter"` ; `aria-valuetext` reprend la valeur et le statut. Au-delà de `max`, la barre est pleine et le nombre réel reste affiché (« 112 % »).

**Mode proportionnel** (`segments`) : barre de 12px découpée en segments (couleur **et** motif par segment), légende dessous (libellé, valeur, part). Le reste jusqu'à `max` apparaît en piste vide. `role="img"` décrit par le résumé (« Commerciaux : 1 020 km (68 %), … Total 1 240 km sur 1 500 km. »).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Libellé visible (nom accessible) |
| `value` | `number` | — | Mode simple : valeur mesurée |
| `segments` | `{ id, label, value, color? }[]` | — | Mode proportionnel : décomposition, dans l'ordre ; exclusif avec `value` |
| `max` | `number` | `100` (simple) ; somme des segments (proportionnel) | Capacité. En proportionnel, un `max` inférieur à la somme est ignoré ; sans `max`, seul le total est affiché |
| `min` | `number` | `0` | Mode simple : début de l'échelle (`90` pour un taux lu entre 90 et 100 %) |
| `target` | `number` | — | Mode simple : repère d'objectif (trait plus marqué que les seuils), rappelé dans la valeur lue (« objectif 98,5 % ») : un bullet compact |
| `size` | `"md" \| "sm"` | `"md"` | `"sm"` : une rangée barre + valeur, pour une cellule de `DataTable` ou une ligne de liste ; libellé et statut masqués visuellement, toujours lus. En proportionnel, sans légende |
| `unit` | `string` | — | « places », « km », « % ». Avec `"%"`, seule la valeur est affichée ; sinon « 96 / 120 places » |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `thresholds` | `{ value: number; label: string }[]` | — | Mode simple : seuils libellés, repères entre 0 et `max` |
| `goodDirection` | `"up" \| "down" \| "neutral"` | `"up"` | Mode simple : sens favorable. Taux de charge → `"down"` |
| `showLegend` | `boolean` | `true` | Mode proportionnel : légende sous la barre |
| `className` | `string` | — | Classe additionnelle |

- ⚠️ `value` et `segments` sont exclusifs (erreur de typage si les deux sont passés) ; `thresholds`, `goodDirection`, `min` et `target` n'existent qu'en mode simple.
- ✅ Dans une cellule de `DataTable` : `size="sm"` avec un `label` qui nomme la ligne (« Charge à la pointe, ligne 13 ») — le libellé n'est pas visible, c'est le nom lu. Story : *Données et tableaux / DataTable → Mini-graphiques en cellule*.
- ⚠️ Valeur ou `max` non finis, ou `max` ≤ 0 : piste vide, « Donnée indisponible ».

```tsx
<Meter
  label="Ligne 13 — course de 8 h 12"
  value={92}
  unit="%"
  goodDirection="down"
  thresholds={[
    { value: 80, label: "Charge élevée 80 %" },
    { value: 100, label: "Capacité 100 %" },
  ]}
/>

<Meter
  label="Kilomètres du jour"
  unit="km"
  max={1500}
  segments={[
    { id: "commercial", label: "Commerciaux", value: 1020 },
    { id: "hlp", label: "Haut-le-pied", value: 140 },
    { id: "annules", label: "Annulés", value: 80 },
  ]}
/>
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `hideValue` | `boolean` | false | Masque la valeur visuelle dans les deux modes ; mesure et total restent accessibles. |

```tsx
<Meter label="Composition" size="sm" segments={segments} hideValue />
```

### ErrorSummary

Pour une cible conteneur, le lien cherche un contrôle visible et utilisable ; les champs cachés, contrôles désactivés et descendants inertes sont ignorés. Une cible focalisable avec `tabIndex={-1}` reste prise en charge.

Résumé d'erreurs après soumission, basé sur `InlineAlert` et `Link`. Région nommée par un titre `<h2>`, focusable par ref ; ne rend rien lorsque `errors` est vide. Le composant ne calcule pas la validité des champs.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `errors` | `SummaryError[]` | **requis** | `{ id: string; message: string; target?: string \| RefObject<HTMLElement \| null> }` |
| `title` | `string` | `"Corrigez les champs suivants"` | Titre de la région |
| `focusOnMount` | `boolean` | `true` | Focus à la première apparition d'erreurs (et après passage de vide à non vide) |
| `className` | `string` | — | Classe additionnelle |
| `ref` | `Ref<HTMLDivElement>` | — | Permet de refocaliser le résumé à chaque nouvelle soumission invalide |

`target` est un id DOM (sans `#`) ou une ref. Si la cible est un conteneur (ex. zone `FileUpload`), le premier bouton/champ actif est focalisé. Sans cible, l'erreur est du texte simple. Une cible absente du DOM ne provoque pas d'erreur ; l'app doit néanmoins fournir des cibles valides et accessibles. Les `id` d'erreur sont uniques et ne sont pas des ids DOM.

⚠️ Ne pas utiliser pour chaque frappe ni pour une erreur réseau générique (`InlineAlert`). Garder les erreurs au niveau de chaque champ (`state="error"` pour `TextInput`, `error` pour `TimePicker`). Le résumé n'associe pas lui-même les erreurs aux champs. Un contrôle natif ne soumet pas un formulaire invalide : avec un formulaire `noValidate`, l'app doit calculer ses erreurs et/ou appeler `checkValidity()`.

```tsx
const field = useRef<HTMLInputElement>(null);
const summary = useRef<HTMLDivElement>(null);
<ErrorSummary ref={summary} errors={[
  { id: "name", message: "Renseignez le nom du réseau.", target: field },
]} />
<TextInput ref={field} label="Nom du réseau" state="error" helperText="Ce champ est requis." />
```

### DescriptionList

Liste sémantique de propriétés (`dl` / `dt` / `dd`) pour un détail, un panneau ou une synthèse de formulaire. Sans items, ne rend rien. Le mode horizontal s'empile sous 480px ; les valeurs longues se replient sans élargir le conteneur.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `DescriptionItem[]` | **requis** | `{ id: string; label: ReactNode; value?: ReactNode }` |
| `aria-label` | `string` | — | Nom accessible de la liste |
| `layout` | `"horizontal" \| "stacked"` | `"horizontal"` | Label/valeur côte à côte, ou superposés |
| `density` | `"comfortable" \| "compact"` | `"comfortable"` | Espacement vertical 16 / 8px |
| `emptyValue` | `string` | `"Non renseigné"` | Repli pour null, undefined et chaîne vide |
| `className` | `string` | — | Classe additionnelle |

`false` devient « Non », `true` « Oui », `0` reste affiché. Les dates/nombres sont formatés par l'app avant de les transmettre. Les `id` sont uniques et servent de clés React. Une valeur peut contenir `LineBadge`, `StopLabel`, `Indicator` ou une action `Link`.

```tsx
<DescriptionList density="compact" items={[
  { id: "name", label: "Réseau", value: "Bordeaux Métropole" },
  { id: "line", label: "Ligne", value: <LineBadge code="A" mode="tram" /> },
]} />
```

**Compléments lot 6**

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `labelWidth` | `number \| "auto"` | — | Largeur partagée en px, ou plus long libellé ; uniquement horizontal, empilé sur mobile. |
| `appearance` | `"default" \| "tiles"` | "default" | tiles : faits courts sur fond surface-alt, grille responsive. |

```tsx
<DescriptionList items={facts} labelWidth="auto" />
```

### ActivityFeed

Historique d'événements ponctuels. Liste ordonnée, reliée par un fil vertical. Hiérarchie de chaque étape, du plus au moins visible :
1. **titre** (14px, gras) et **statut** dans un `Indicator hideIcon` coloré (Succès vert, Avertissement orange, Erreur rouge), sans picto : le marqueur à gauche porte déjà l'icône et la couleur ;
2. **auteur et date** en secondaire (12px) : mini-avatar 20px à initiales (décoratif, le nom est écrit à côté), nom, « · », date absolue ;
3. **contenu** (`description`) **mis en avant** dans un encadré (bordure, fond `surface-subtle`, 14px).

Ne trie pas les données et ne les récupère pas : l'app contrôle l'ordre, la pagination éventuelle et l'autorisation d'accès.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `ActivityItem[]` | **requis** | Voir ci-dessous |
| `aria-label` | `string` | **requis** | Nom de la région |
| `loading` | `boolean` | `false` | `aria-busy`, squelette et annonce de chargement ; masque temporairement les items |
| `emptyTitle` | `string` | `"Aucune activité"` | Titre de l'`EmptyState` intégré |
| `timeZone` | `string` | `"UTC"` | Fuseau IANA valide ; passer celui du produit explicitement |
| `className` | `string` | — | Classe additionnelle |

**`ActivityItem`** : `id: string` (unique), `title: string`, `date: Date`, `author?: string`, `description?: ReactNode`, `tone?: ActivityTone` (défaut `"neutral"`), `icon?: IconName` (surcharge de l'icône par défaut).

`ActivityTone` : `"neutral" | "success" | "warning" | "danger"`. Statuts affichés (`Indicator`) : « Succès » (`completed`), « Avertissement » (`warning`), « Erreur » (`critical`). ⚠️ `"neutral"` n'affiche **pas** de statut (seul le marqueur gris) : un événement ordinaire ne porte pas de pastille. Dates formatées en `fr-FR`, avec `<time dateTime={date.toISOString()}>` ; une Date invalide affiche « Date indisponible ». Pas de temps relatif ni de mise à jour périodique. Le fuseau par défaut UTC garantit le même rendu serveur/client ; une configuration IANA invalide doit être corrigée par l'app.

⚠️ Ce composant ne remplace ni une frise de périodes (`Timeline`), ni un journal d'audit serveur. Une erreur de récupération se compose avec `InlineAlert`/`EmptyState variant="error"`.

### TimePicker

Heure seule. **Variante champ** : deux cases **Heures / Minutes** éditables directement au clavier, séparées d'un « : » fixe, à l'allure d'un `TextInput` (survol, focus). Cliquer le champ place le curseur pour saisir — **il n'ouvre pas le panneau** ; seule l'icône horloge à droite (un `GhostButton` sans infobulle) ouvre un panneau ancré de réglage par flèches (en lecture seule). **Variante bouton** : déclencheur outline sm ouvrant un panneau éditable (cases + flèches). Module horaire partagé avec `DatePicker withTime`. Aucune conversion via Date : `25:30` reste une heure de service.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Label visible en variante champ ; à fournir pour un formulaire |
| `aria-label` | `string` | `"Heure"` | Nom en l’absence de label, notamment en variante bouton |
| `value` | `string` | requis | Heure valide `HH:mm` ou `""` |
| `onChange` | `(value: string) => void` | requis | Heure normalisée validée, jamais un brouillon invalide |
| `variant` | `"field" \| "button"` | `"field"` | Champ éditable (allure TextInput) ou bouton outline sm ouvrant le panneau |
| `allowOvernight` | `boolean` | `false` | Plage 00:00–47:59 au lieu de 00:00–23:59 |
| `min`, `max` | `string` | bornes du mode | Bornes inclusives HH:mm |
| `minuteStep` | `1 \| 5 \| 10 \| 15 \| 30` | `1` | Pas des flèches de minutes ; saisie manuelle libre à la minute |
| `disabled` | `boolean` | `false` | Désactive les contrôles |
| `required` | `boolean` | `false` | Interdit une heure vide, validité native |
| `helperText` | `string` | — | Instruction, remplacée par l’erreur |
| `error` | `string` | — | Erreur métier prioritaire |
| `id` | `string` | généré | Id DOM de la case des heures |
| `className` | `string` | — | Classe additionnelle |
| `ref` | `Ref<HTMLInputElement>` | — | Case des heures ; sa validité reflète l’heure complète |

- **Champ** : conteneur de 40 px à l’allure d’un `TextInput` (survol, focus), contenant les deux cases **HH : mm** éditables au clavier et un « : » fixe, puis l’horloge à droite. La saisie est **directe dans le champ** : taper ne l’ouvre pas. Entrée ou la sortie du champ valident et normalisent (`9`/`5` → `09:05`) ; Échap annule la saisie en cours. Le panneau ouvert par l’horloge n’affiche que les flèches (cases en lecture seule).
- **Bouton** : déclencheur outline sm, comme DatePicker ; son panneau est éditable (cases + flèches), focus sur les heures à l’ouverture. Les changements (saisie et flèches) restent en brouillon jusqu’à « Valider » ou Entrée. « Annuler », Échap, clic extérieur ou sortie au clavier annulent les modifications. Validation/annulation rend le focus au déclencheur (l’horloge en variante champ).
- ↑/↓ modifie l’unité focalisée : une heure ou `minuteStep` minutes. Les minutes peuvent passer à l’heure suivante (23:55 + 15 min → 24:10 si autorisé). Les bornes ne bouclent pas. Depuis un éditeur vide, une flèche initialise la borne basse.
- Un collage HH:mm dans l’une des cases renseigne les deux. Vider les deux cases puis valider efface une heure facultative ; une seule case vide constitue une saisie incomplète.
- Échap ferme le panneau sans modifier la valeur dans les deux variantes. L’événement est consommé avant le Modal/Drawer parent.
- Les inputs utilisent `role="spinbutton"` et des noms distincts (« Heures — Départ », « Minutes — Départ »). En variante champ, les cases sont **toujours visibles** (saisie directe) ; en variante bouton, l’éditeur reste monté mais caché quand fermé. `checkValidity()` sur la ref invalide reflète l’heure complète. Pour le focus via ErrorSummary, privilégier une cible conteneur incluant le champ.
- Dans un formulaire `noValidate`, vérifier `checkValidity()` avant de lire la valeur contrôlée. L’application calcule les contraintes entre début et fin.
- `min`/`max` invalides sont ignorés ; un intervalle inversé revient aux bornes du mode. Aucune gestion de fuseau ou changement d’heure. Le plafond 47:59 est un choix du composant, pas une couverture de tous les formats d’échange.

```tsx
<TimePicker label="Fin de service" value={end} onChange={setEnd} allowOvernight minuteStep={15} />
<TimePicker variant="button" aria-label="Départ" value={start} onChange={setStart} />
```

Migration : les props existantes restent utilisables ; le DOM passe d’un champ HH:mm unique à deux cases. La ref/id cible les heures du panneau ; le label visible est associé au déclencheur. Les tests doivent ouvrir le panneau avant de cibler les cases. Le module interne `TimeFields` n’est pas exporté.


## Compositions métier transport

- `ServiceCalendar` pour éditer une règle de circulation : période inclusive, semaine type, exceptions explicites. Aucune déduction des jours fériés ou vacances scolaires.
- `RouteStopList` pour lire la succession de passages d’une course. Réutilise `StopLabel` et accepte un `LineBadge` en en-tête.
- Offre et qualité d'un réseau : premier niveau `SegmentedControl` (« Offre / Qualité »), second niveau `SecondaryTab` dans `TabList level="secondary"`. L’onglet Offre montre le calendrier puis les courses ; Qualité compose le rapport décrit ci-dessous.
- **Rapport qualité d'un import : une composition, pas un composant de la bibliothèque.** Elle compose `InlineAlert`, `FilterBar`, `DataTable`, `Drawer`, `DescriptionList` et `EmptyState`. L’application fournit les constats et décide quels niveaux bloquent l’import. Le résumé global reste indépendant du filtre ; aucun résultat de recherche ne signifie pas absence d’erreurs.
- `DisruptionScopePicker` pour choisir le périmètre réseau d’une perturbation. Compose un champ, un `Popover`, une recherche (`SearchInput`) et un `TreeView` en sélection multiple ; le périmètre retenu s’affiche en chips (`Badge dismissible`).

### DisruptionScopePicker

Sélection du périmètre d’une perturbation dans l’arborescence du réseau (réseau → ligne → parcours). Champ de 40 px qui ouvre un `Popover` nommé par le `label` ; à l’intérieur, une recherche filtre l’arbre (et déplie les branches correspondantes) et un `TreeView` en sélection **multiple** (cases tri-état) coche lignes et réseaux — cocher un réseau coche ses lignes. Le périmètre retenu apparaît en chips `Badge dismissible` sous le champ (retirables), le champ résumant la sélection (« Ligne 1 +2 ») ; « Tout effacer » vide la sélection. Les enfants peuvent se charger à la demande via `TreeView` (`loadChildren`). Variante **hiérarchique** du multi-select : `Autocomplete multiple` filtre une liste plate, ce composant gère la hiérarchie.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Libellé du champ et nom du `Popover` |
| `nodes` | `TreeNode[]` | **requis** | Arbre du réseau (voir `TreeView`) |
| `value` / `defaultValue` | `string[]` | — | Périmètre (contrôlé / au montage) : identifiants de feuilles |
| `onChange` | `(ids: string[]) => void` | — | Changement du périmètre |
| `loadChildren` | `(node: TreeNode) => Promise<TreeNode[]>` | — | Chargement des enfants d’un nœud `hasChildren` |
| `placeholder` | `string` | `"Tout le réseau"` | Texte quand rien n’est sélectionné |
| `helperText` | `string` | — | Aide sous le champ (remplacée par l’erreur) |
| `state` | `"enabled" \| "error"` | `"enabled"` | `"error"` force le rendu d’erreur |
| `disabled` / `required` | `boolean` | `false` | États natifs |
| `searchPlaceholder` | `string` | `"Rechercher une ligne…"` | Placeholder de la recherche |
| `ref` | `Ref<HTMLButtonElement>` | — | Cible le champ (pour `ErrorSummary`) |
| `id` / `className` | `string` | — | — |

- ✅ Pour un périmètre **hiérarchique** (réseaux et lignes) : cocher un réseau sélectionne ses lignes.
- ✅ La sélection (`value`) est une liste de feuilles ; le chip et le résumé utilisent les libellés des nœuds **chargés** (sinon l’identifiant).
- ❌ Pour une liste plate sans hiérarchie : `Autocomplete multiple`. Pour parcourir sans champ ni périmètre retenu : `TreeView` seul.

### ServiceCalendar

Éditeur contrôlé, sans enregistrement réseau. Réutilise `DateRangePicker`, `DatePicker`, `Checkbox`, `SegmentedControl` et `GhostButton`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | requis | Titre et nom accessible de la section |
| `value` | `ServiceCalendarValue` | requis | État complet du calendrier |
| `onChange` | `(value: ServiceCalendarValue) => void` | requis | Nouvel état après édition |
| `disabled` | `boolean` | `false` | Désactive tous les contrôles d’édition |
| `className` | `string` | — | Classe additionnelle |

`ServiceCalendarValue` : `startDate` et `endDate` sont des dates civiles `YYYY-MM-DD` (ou `""` pendant la saisie), `weekdays` un tableau de `ServiceWeekday` (1 lundi à 7 dimanche), `exceptions` un tableau de `ServiceException` `{ date: string; type: "added" | "removed" }`. Une seule exception par date et des jours uniques doivent être fournis.

Les bornes sont inclusives. Une exception prend priorité sur la semaine type à l’intérieur de la période ; hors période, le service ne circule pas. Un calendrier sans jour régulier peut circuler seulement aux dates ajoutées. Aucun fuseau ni UTC n’est utilisé pour convertir les clés : les pickers utilisent des Date locales, adaptées en clés civiles à leur frontière.

- La date d’exception proposée initialement est le début de la période. Choisir une date puis « Appliquer l’exception » ajoute ou remplace son effet, sans doublon ; le bouton de retrait supprime l’exception.
- Un aperçu indique si la date choisie circule selon le calendrier actuel. Ce n’est pas un calcul de fréquence ou de nombre de courses.
- Une période absente/inversée est signalée ; l’ajout d’une exception hors période est refusé.
- Réduire la période ne supprime pas les exceptions existantes : celles hors période sont signalées pour correction. L’application reste responsable de la validation avant enregistrement ; le composant ne bloque pas une soumission de formulaire externe.
- Les utilitaires de calendrier sont internes : seuls le composant et ses types sont exportés.

```tsx
<ServiceCalendar label="Circulation" value={calendar} onChange={setCalendar} />
```

### RouteStopList

Liste ordonnée de passages, sans tri implicite ni conversion d’horaires. Les services nocturnes conservent leur notation, par exemple `24:20`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | requis | Titre et nom accessible de la section |
| `stops` | `RouteStop[]` | requis | Passages dans l’ordre d’affichage |
| `line` | `ReactNode` | — | Identité de ligne, généralement `LineBadge` |
| `loading` | `boolean` | `false` | Squelette à la place de la liste, région occupée |
| `onStopSelect` | `(stop: RouteStop) => void` | — | Ajoute un bouton « Voir l’arrêt » à chaque passage |
| `className` | `string` | — | Classe additionnelle |

`RouteStop` : `id` (identifiant unique du **passage**) et `name` requis ; `stopId`, `city`, `arrival`, `departure`, `note` optionnels (strings), `lines` optionnel (ReactNode), `skipped` optionnel (boolean, défaut faux).

- Une boucle peut répéter le même `stopId`, avec des `id` de passage distincts.
- Le premier et le dernier passage sont signalés « Origine » et « Terminus » ; un passage unique porte les deux mentions.
- `skipped` affiche « Non desservi » et masque ses horaires pour éviter de les présenter comme utilisables. `note` peut préciser le motif.
- En l’absence d’arrivée et de départ, affiche « Horaire non renseigné ». Les horaires fournis sont affichés tels quels, sans validation, calcul de retard ou conversion en heure civile.
- La liste vide utilise `EmptyState`. Pour une erreur de récupération, composer un `InlineAlert` ou `EmptyState variant="error"` au niveau de l’application.
- Adapté à la consultation de courses courtes à moyennes ; pas de virtualisation ni de carte géographique.

## Composants du lot 6 — synthèse et exploitation

Ces composants complètent les Page patterns existants (Analyse, Supervision, Liste, Formulaire). ✅ Garder un seul titre h1 par page. Le bandeau sombre se compose avec `PageHero` ; les formulaires gardent leurs panneaux verticaux sur fond clair. ❌ Ne pas utiliser un log technique comme seul message d’erreur métier.

### ScopePicker

Périmètre générique réseaux/lignes, arbre fourni entièrement par l’application. `DisruptionScopePicker` conserve son API historique.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| label | string | requis | Nom du groupe et du champ |
| nodes | ScopeNode[] | requis | Arbre chargé, identifiants globalement uniques |
| value | string[] | requis | Sélection contrôlée |
| onChange | (ids: string[]) => void | requis | Nouvelle sélection |
| presentation | "inline" ou "popover" | inline | Formulaire ou champ compact |
| selectionStrategy | "leaves" ou "parents" | leaves | Parents regroupe un sous-arbre intégralement sélectionné |
| loading / disabled | boolean | false | Chargement annoncé / contrôles inactifs |
| error / helperText | string | — | Erreur prioritaire sur l’aide |
| className | string | — | Classe racine |

`ScopeNode` : `id`, `label`, `children?: ScopeNode[]`, `disabled?`, `icon?`, `mode?`, `meta?` comme TreeNode, et `badge?: { code; mode?; color?; textColor? }` rendu en LineBadge sm décoratif. Pas de chargement différé interne. ✅ Un réseau coché couvre toutes ses feuilles sélectionnables ; les cases partielles sont indéterminées. La recherche ne supprime pas les sélections masquées ; cocher un parent filtré agit sur ses résultats visibles. Les identifiants de parents sont réétendus depuis les données actuelles, puis regroupés. ⚠️ Fournir des feuilles représentant les lignes pour que le compteur « lignes » soit correct. L’app valide la sélection et fournit l’erreur. ❌ Aucun contrôle interactif dans `meta`.

```tsx
<ScopePicker label="Périmètre d’export" nodes={networks} value={scope} onChange={setScope} selectionStrategy="parents" />
```

### SummaryList

Liste courte de synthèse, adaptée aux notifications et exports récents, sans date obligatoire.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| items | SummaryListItem[] | requis | Éléments dans l’ordre fourni |
| aria-label | string | requis | Nom de la section |
| onItemClick | (item: SummaryListItem) => void | — | Action principale de ligne, bouton natif |
| selectedId | string | — | Élément courant contrôlé |
| density | "comfortable" ou "compact" | comfortable | Espacement |
| loading | boolean | false | Squelette et annonce |
| emptyTitle | string | Aucun élément | État vide |
| onShowAll / showAllLabel | () => void / string | — / Voir tout | Action de pied |
| className | string | — | Classe racine |

`SummaryListItem` : `id`, `title` requis ; `description?`, `meta?` (strings), `icon?: IconName`, `avatar?: ReactNode` décoratif, `status?: IndicatorVariant`, `statusLabel?`, `unread?`, `disabled?`, `action?: { label; onClick; icon?; disabled? }`. ✅ L’action secondaire est un bouton frère de l’action principale. « Non lu » est écrit et annoncé. ❌ Ne pas passer de contrôle dans l’avatar. L’app groupe les notifications par jour en plusieurs listes nommées.

```tsx
<SummaryList aria-label="Exports récents" items={exports} onItemClick={openExport} />
```

### PageHero

Bandeau sombre de synthèse, titre et KPI. La tuile interactive montre une flèche et « Voir le détail », avec un unique bouton couvrant la tuile. Les statuts sont textuels ; aucune animation ne porte l’information.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| title | string | requis | Titre |
| headingLevel | 1 ou 2 | 1 | h2 si PageHeader porte déjà le h1 |
| description | string | — | Contexte |
| icon | IconName | — | Tuile d'icône à gauche du titre, teintée par `status` (couleurs sur fond sombre), statique ; neutre en chargement et en erreur |
| tone | "neutral", "positive", "warning" ou "critical" | "neutral" | Accent du bandeau : filet de 4px en haut et bordure du panneau d'action (vert sous contrôle, ambre à investiguer). ⚠️ Jamais seul : `status` / `statusLabel` disent l'état. Neutralisé en chargement et en erreur |
| valueLabel | string | — | Libellé du KPI principal (« Variation des courses ») |
| value / unit | number ou string / string | — | Valeur principale : nombre formaté fr-FR en mono, ou texte court ; unité courte en sans-serif (« courses ») |
| valueType | "number" ou "text" | selon `value` | `"number"` : mono 44px ; `"text"` : sans-serif 28px 600. Défaut : "number" pour un nombre, "text" pour une chaîne |
| valueCaption | string | — | Légende de la valeur, distincte de l'unité (« vs 26 août · −16 227 »), sans-serif secondaire |
| valueTone | "default", "warning" ou "critical" | "default" | Couleur d'alerte de la valeur. ⚠️ Jamais seule : fournir `status` / `statusLabel` |
| status / statusLabel | IndicatorVariant / string | — | Statut inverse |
| freshness | DataFreshnessProps, `updatedAt` pouvant être `null` | — | Dans l'en-tête, sous la description. Force inverse ; fournir now/timeZone si déterminisme requis. `updatedAt: null` : « Heure d'actualisation inconnue », jamais reconstruite. Masquée en chargement et en erreur |
| actionPanel | `{ title; description?; action?: { label; onClick; disabled? } }` | — | Panneau à côté du KPI principal (dessous sous 880px de large) : « 2 sujets à traiter », « Impact possible dès le 1er septembre », bouton clair de 44px « Examiner les anomalies » |
| kpis | PageHeroKpi[] | [] | Grille de tuiles responsive |
| actions | ReactNode | — | Actions compatibles avec fond sombre |
| state | "ready", "loading" ou "error" | "ready" | `"loading"` : squelettes, aucune valeur ancienne ; `"error"` : `errorMessage` + « Réessayer » (`onRetry`) |
| loading | boolean | false | Équivalent de `state="loading"` |
| errorMessage / onRetry | string / () => void | « Impossible de charger la synthèse. » / — | État `"error"` |
| className | string | — | Classe racine |

`PageHeroKpi` : `id`, `label`, `value` requis ; `valueType?` (même règle : une chaîne s'affiche en texte sans-serif 16px 600, « Intégrées · à vérifier », « 27 août · 15:41 » ; un nombre en mono 28px), `unit?`, `status?`, `statusLabel?`, `delta?: { value; unit?: "%" | "pt"; label? }`, `onClick?`, `actionLabel?` (défaut « Voir le détail » ; une action propre à chaque carte : « Consulter les flux »), `disabled?`. La variation est signée sans jugement métier implicite. ⚠️ Fournir des statuts textuels pertinents, pas uniquement une couleur. `Card` conserve son contrat d’action visible. Cartes sur 1 colonne sous 480px de large (largeur du bandeau), 2 jusqu'à 880px, puis jusqu'à 4 sur une ligne. ⚠️ Un nombre déjà formaté en chaîne (« 1 245 ») s'affiche en texte : passer le nombre, ou `valueType="number"`.

```tsx
<PageHero title="Flux temps réel" value={courses} unit="courses" status="active" statusLabel="En direct" kpis={kpis} />

{/* Supervision de publication : alerte, KPI libellé avec sa référence, panneau d'action */}
<PageHero
  title="Version du 27 août à vérifier"
  description="Version intégrée à 15:47"
  icon="alert-triangle"
  tone="warning"
  status="warning"
  statusLabel="À investiguer"
  valueLabel="Variation des courses"
  value="−5,1 %"
  valueType="number"
  valueCaption="vs 26 août · −16 227 courses"
  actionPanel={{ title: "2 sujets à traiter", description: "Impact possible dès le 1er septembre", action: { label: "Examiner les anomalies", onClick: examine } }}
  freshness={{ updatedAt }}
  kpis={[{ id: "realtime", label: "Temps réel", value: "2/2 flux reçus", status: "nominal", statusLabel: "Réception complète", onClick, actionLabel: "Consulter les flux" }]}
/>
```

- ✅ Toujours la référence de comparaison et le volume absolu avec une variation (`valueCaption`), signe conservé.
- ✅ Impact au conditionnel tant qu'il n'est pas confirmé ; nombre de sujets seulement s'il vient d'une source et d'un périmètre explicites.
- ✅ Une réception complète (« 2/2 flux reçus ») n'est pas une validation : statut « Réception complète », pas « Conforme ».
- ❌ Pas de `tone="warning"` déduit du seul signe négatif d'une variation : l'app applique une règle métier mesurable.

### SecretField

Le secret existant n’est jamais transmis au composant. L’affichage au repos ne connaît que son existence.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| label | string | requis | Nom du champ et des actions |
| isSet | boolean | requis | Secret déjà défini |
| onSave | (secret: string) => void ou Promise<void> | requis | Persistance par l’application ; rejeter en cas d’échec |
| disabled | boolean | false | Désactivation |
| helperText / error | string | — | Contexte / erreur prioritaire |
| className | string | — | Classe racine |

✅ Remplacer/Définir ouvre une saisie password ; Annuler efface le brouillon ; Enregistrer attend la promesse puis l’efface et rend le focus. Un rejet conserve le brouillon et affiche une erreur. L’app met à jour `isSet` après persistance. ❌ Ne pas affirmer « stocké chiffré » si le service ne le garantit pas ; ce texte reste fourni par l’app. Pas de bouton de révélation.

```tsx
<SecretField label="Jeton d’accès" isSet={hasToken} onSave={saveToken} />
```

### ValueComparison

Comparaison sémantique de champs ou de deux versions, empilée sur petit conteneur. Les libellés Avant/Après restent visibles.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| items | ValueComparisonItem[] | requis | Champs comparés |
| aria-label | string | requis | Nom de la région |
| layout | "fields" ou "versions" | fields | Champs en lignes ou deux cartes DescriptionList |
| beforeLabel / afterLabel | string | Avant / Après | Noms des versions |
| className | string | — | Classe racine |

`ValueComparisonItem` : `{ id; label: string; before?: ReactNode; after?: ReactNode; changed?: boolean }`. Sans changed : comparaison Object.is ; **fournir changed pour des ReactNode complexes**. Null/undefined/vide → « Non renseigné », false → « Non », zéro conservé. ✅ Un changement est écrit « Modifié » et souligné visuellement par un fond. ❌ Aucune décision de rollback implicite.

```tsx
<ValueComparison aria-label="Modifications" items={changes} layout="versions" />
```

### PresenceStrip

Observations binaires ou inconnues, une forme par état et un résumé lisible.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| items | PresenceObservation[] | requis | Ordre fourni |
| aria-label | string | requis | Nom du groupe |
| size | "sm" ou "md" | md | Cellule 16px ou panneau 24px |
| className | string | — | Classe racine |

`PresenceObservation` : `{ id; label; present: boolean | null; current?: boolean }`. Les labels décrivent chaque exécution ; null est inconnu, jamais absent. Chaque observation est nommée, focalisable et possède une infobulle. ✅ Réservé aux séries courtes (ex. 7 exécutions) ; résumé accessible conservé en sm. ⚠️ Une seule observation courante.

```tsx
<PresenceStrip aria-label="Présence du constat" items={observations} size="sm" />
```

### LogViewer

Journal technique ou extrait de fichier. Les messages sont du texte React échappé, sans interprétation HTML.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| title | string | requis | Titre h3, région nommée |
| lines | LogLine[] | requis | Lignes dans l’ordre |
| maxHeight | number | 320 | Hauteur maximale en px ; défilement clavier |
| startLine | number | 1 | Premier numéro de ligne |
| onDownload | () => void | — | Action de téléchargement déléguée à l’app |
| loading | boolean | false | Annonce et actions désactivées |
| emptyLabel | string | Aucune ligne | État vide |
| className | string | — | Classe racine |

`LogLine` : `{ id; message: string; timestamp?: string; level?: "debug" | "info" | "warning" | "error"; highlighted?: boolean }`. Horodatage préformaté par l’app ; niveaux écrits en français ; « Ligne signalée » pour le surlignage. La copie contient toutes les lignes affichées et signale son résultat. ⚠️ Pas de streaming ni de virtualisation : limiter les extraits côté app. Ne pas transmettre de secrets.

```tsx
<LogViewer title="Journal d’exécution" lines={logs} onDownload={downloadLogs} />
```

### Pictogrammes métier du lot 6

`Icons` accepte `database`, `layers`, `shield-check`, `target`, `activity`, `alert-circle`, `info-plain` (i sans cercle), `live` (signal radio), ainsi que les géométries métier fournies par Datapilot : `mobility-lignes`, `mobility-reseaux`, `mobility-compagnies`, `mobility-parcours`, `mobility-zones`, `mobility-modes-com`, `mobility-points`, `mobility-modes-phy`. Elles suivent currentColor et s’utilisent à 16/20/24px ; les libellés voisins portent leur sens. Aucun SVG distant.
