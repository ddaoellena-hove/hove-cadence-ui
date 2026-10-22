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
14. [Recettes de pages complètes](#recettes-de-pages-complètes)
15. [Référence API des composants](#référence-api-des-composants)

---

## Instructions pour agents IA

Règles impératives pour générer du code avec ce design system :

1. **Ne jamais inventer de prop.** Si une prop n'apparaît pas dans la [Référence API](#référence-api-des-composants), elle n'existe pas. En cas de doute, consulter la fiche du composant avant de l'utiliser.
2. **Ne jamais recréer un composant qui existe.** Avant de coder un bouton, un champ, une carte ou un badge custom, vérifier la table [Intention → composant](#intention--composant).
3. **Couleurs : uniquement les tokens.** Écrire `var(--cadence-color-primary)`, jamais de hex en dur. Les couleurs absentes des tokens (bleus, violets…) sont réservées aux composants internes — ne pas les réutiliser.
4. **Les règles ❌ sont bloquantes.** Ce ne sont pas des suggestions : un code qui viole un ❌ est incorrect.
5. **`Checkbox`, `Toggle`, `RadioButton`, `RichCheckbox` et `RichRadioButton` se pilotent par la prop `state`**, pas par une prop `checked` — elle n'existe pas. Exemple : `<Checkbox state={isChecked ? "checked" : "unchecked"} onChange={setIsChecked} />`.
6. **Le CSS custom est limité au layout.** `display: flex`, `gap`, `padding`, `margin`, largeurs : OK en style inline. Couleurs, polices, bordures, ombres custom : interdit — les composants et tokens couvrent ces besoins.
7. **Partir des [recettes](#recettes-de-pages-complètes)** pour toute page nouvelle, puis adapter. Ne pas réinventer la structure.
8. **Un seul `PrimaryButton` plein par vue.** Plusieurs `GhostButton` sont autorisés. 3e action d'un groupe : `Link hideArrow`. `SecondaryButton` est déprécié.
9. **Toujours passer `label`** sur les champs de formulaire (`TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker`, `CounterInput`, `TimePicker`). Exceptions, qui prennent `aria-label` à la place : la variante bouton (`variant="button"` de `DatePicker`, `DateRangePicker`, `Dropdown`, `TimePicker`) et le filtre rapide `DateRangePicker` d'une `FilterBar`.
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

La **Uxum Grotesque** (titres) est une police commerciale : si le projet la possède, la déclarer via `@font-face` — elle prendra automatiquement le pas sur Space Grotesk dans `--cadence-font-display`. Sinon Space Grotesk sert de fallback sans configuration.

### 3. Importer les composants

```tsx
import { PrimaryButton, GhostButton, TextInput, TableCard, Modal } from "@ddaoellena/cadence-ui";
```

### 4. Squelette d'application minimal

Voir la [recette Layout d'application](#recette-1--layout-dapplication) — toute app commence par ce squelette : `AppLayout`, avec la `Sidebar` repliable (280 px dépliée, 80 px repliée) à gauche et le contenu de la page dans un conteneur blanc arrondi qui suit sa largeur.

---

## Design tokens

Les couleurs, polices, rayons, ombres et couches (z-index) sont centralisés dans des variables CSS (`tokens.css`, chargé automatiquement avec la lib). Chaque usage interne garde un fallback en dur : le rendu reste correct même sans le fichier de tokens.

| Token | Valeur | Usage |
|---|---|---|
| `--cadence-color-primary` | `#002830` | Encre principale — texte fort, boutons, modale |
| `--cadence-color-label` | `#1a3e45` | Labels de formulaire, badges ; fond de `PrimaryButton` au repos |
| `--cadence-color-primary-hover` | `#10353d` | Survol d'un `PrimaryButton` : un cran plus foncé que le repos |
| `--cadence-color-text-muted` | `#809397` | Texte secondaire (heures, descriptions) |
| `--cadence-color-text-disabled` | `#808080` | Texte des états désactivés |
| `--cadence-color-placeholder` | `#737373` | Placeholders des champs |
| `--cadence-color-icon-muted` | `#69797d` | Icônes d'action discrètes |
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
| `--cadence-color-accent` | `#1b6cff` | Élément actif / sélectionné (Sidebar, options de menu), remplissage d'une `ProgressBar` en cours. ⚠️ Réservé aux états : jamais pour une action |
| `--cadence-color-accent-subtle` | `#f0f6ff` | Survol d'un élément actif (Sidebar), ligne sélectionnée (`DataTable`) |
| `--cadence-color-white` | `#ffffff` | Surfaces de premier plan |
| `--cadence-color-segmented-track` / `-disabled` | `#e6f0fa` / `#dde8f0` | Piste du SegmentedControl unique |
| `--cadence-color-surface-alt` | `#eef1f4` | Fonds de wrapper (TableCard, Badge), jours d'une période (`DateRangePicker`) |
| `--cadence-color-surface-subtle` | `#fafafa` | Fond de carte discret sur fond blanc (fichiers de `FileUpload`) |
| `--cadence-color-border` | `#e5e5e5` | Bordures par défaut |
| `--cadence-color-border-strong` | `#bfc9cb` | Bordures appuyées, états disabled |
| `--cadence-color-scrollbar-thumb` | `rgba(0, 40, 48, 0.2)` | Curseur des barres de défilement (`cadence-scrollbar`) ; `-hover` : `rgba(0, 40, 48, 0.36)` |
| `--cadence-color-divider` | `#f0f0f0` | Séparateurs internes |
| `--cadence-dataviz-series-1..8` | violet, bleu, teal, ambre `#b36b00`, magenta, corail, violet foncé, ardoise | Séries des graphiques, dans cet ordre ; toutes ≥ 3:1 sur blanc. Anciens noms `--CAI-dv-series-*` en alias |
| `--cadence-dataviz-seq-1..7` | `#eaf4f5` → `#004650` | Rampe séquentielle (`Heatmap`), teinte pétrole à clarté croissante |
| `--cadence-dataviz-threshold` / `-threshold-breach` | `#1a3e45` / `#b91c1c` | Ligne de seuil / côté défavorable d'un seuil |
| `--cadence-dataviz-annotation` / `-annotation-band` | `#55606e` / `rgba(85, 96, 110, 0.08)` | Trait ou bord d'annotation / remplissage d'une bande annotée |
| `--cadence-font-sans` | Inter | Texte d'interface |
| `--cadence-font-display` | Uxum Grotesque → Space Grotesk | Titres |
| `--cadence-font-mono` | Spline Sans Mono | Valeurs numériques |
| `--cadence-radius-sm` | `6px` | Petits éléments : badges, boutons d'icône |
| `--cadence-radius-md` | `8px` | Contenus internes |
| `--cadence-radius-lg` | `10px` | Champs et cards |
| `--cadence-radius-xl` | `12px` | Conteneurs : modale |

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
- ❌ Ne pas redéfinir les `--cadence-*` au niveau d'un composant — ce sont des valeurs globales du thème.

---

## Typographie

Trois polices, chacune réservée à un rôle précis. Ne pas les substituer.

| Police | Token | Rôle |
|---|---|---|
| **Inter** | `--cadence-font-sans` | Texte d'interface : labels, valeurs, boutons, navigation, messages |
| **Uxum Grotesque** (fallback Space Grotesk) | `--cadence-font-display` | Titres de page (`<h1>`) et nom produit |
| **Spline Sans Mono** | `--cadence-font-mono` | Valeurs numériques et données chiffrées |

### Règles

- ✅ Utiliser **Inter** pour tout texte d'interface — c'est déjà la police par défaut de tous les composants.
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
| Examiner les erreurs d’un import | Recette `Offre et qualité / Rapport qualité` | `ErrorSummary` (erreurs des champs d’un formulaire) |
| Action principale de la vue (une seule) | `PrimaryButton` | `GhostButton` (secondaire) |
| Action secondaire, action inline de formulaire | `GhostButton` | `SecondaryButton` (déprécié) ; `Link` (3e action) |
| 3e action d'un groupe, action dans une phrase | `Link hideArrow` | `GhostButton` (action secondaire) |
| Navigation inline, action tertiaire discrète | `Link` | — |
| Petite action par ligne de liste (icône) | `GhostButton size="sm"` icône seule (`icon` + `aria-label`, infobulle intégrée) | `PrimaryButton` (trop appuyé dans une ligne) |
| Action avec libellé dans une ligne de `DataTable` (« Consulter ») | `PrimaryButton outline size="sm"` | `GhostButton` avec libellé (se lit comme du texte dans la ligne) |
| Saisie de texte libre (1 ligne) | `TextInput` | — |
| Saisie de texte long (multi-lignes) | `TextArea` | — |
| Valeur numérique avec +/− | `CounterInput` | `TextInput type="number"` (interdit) |
| Choix dans une liste courte (≥ 3 options, sans recherche) | `Dropdown` | `Autocomplete` (longue liste à filtrer) |
| Période, date ou choix dans un dashboard | `DateRangePicker` / `DatePicker` / `Dropdown` avec `variant="button"` (à privilégier) | Variante champ (formulaire, `FilterBar`), `PrimaryButton outline` (action, pas de valeur) |
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
| État ou statut avec picto + couleur sémantique | `Indicator` | `Badge` (purement informatif) |
| En-tête de page (titre, sous-titre, actions), collé en haut au défilement | `PageHeader` | `<h1>` à la main |
| Indicateur chiffré + évolution (haut de tableau de bord) | `Card` (`value`, `delta`, `trend`) | `Indicator` (statut sans valeur) |
| Proposer une action dans une carte (titre + description + bouton) | `Card` (`actionLabel`, `onAction`) | `TableCard` (élément de liste) |
| Liste de gros volume (> 50 lignes, colonnes de données) | `DataTable` | `TableCard` (liste de cartes riches, peu nombreuses) |
| Élément de liste riche, peu nombreux (header + colonnes) | `TableCard` | `DataTable` (gros volumes) ; un `<table>` HTML custom |
| Ligne d'en-têtes de colonnes avec tri (au-dessus de `TableCard`) | `TableHeader` | en-têtes de `DataTable` (intégrés) |
| Navigation dans un résultat paginé | `Pagination` | — |
| Recherche + filtres rapides + filtres actifs au-dessus d'une liste | `FilterBar` | un `TextInput` + `Badge` assemblés à la main |
| Recherche seule (en-tête de dashboard, barre d'outils) | `SearchInput` | `TextInput` (champ de formulaire, 40px) |
| Dialogue bloquant (confirmation, formulaire court) | `Modal` | `AlertToast` (non bloquant) ; `Drawer` (non bloquant, détail) |
| Détail d'un élément sans quitter la liste | `Drawer` | `Modal` (dialogue bloquant) |
| Regrouper plus de 4 actions d'une ligne | `ActionMenu` | `GhostButton` icône seule (≤ 4 actions inline) |
| Chargement : réserver la place du contenu | `Skeleton` | spinner plein écran |
| Liste vide, sans résultat, ou erreur de chargement | `EmptyState` | état vide bricolé à la main |
| Notification temporaire non bloquante | `useToast()` + `Toaster` | `Modal` (bloquant) ; `AlertToast` seul (carte brute, hors pile) |
| Info contextuelle au survol | `Tooltip` / `TooltipTrigger` | `Modal` ; `Popover` (contenu interactif) |
| Aide riche, mini-formulaire ou détail ancré à un bouton | `Popover` | `Tooltip` (lecture seule, sans focus) ; `Modal` (bloquant) ; `Drawer` (détail long) |
| Squelette d'application (navigation + contenu de page) | `AppLayout` | — |
| Navigation principale (sections de l'app) | `Sidebar` | — |
| Sélecteur de périmètre + profil utilisateur | `Sidebar` (`scope`, `user`) | — |
| Fil d'Ariane | `Breadcrumbs` | — |
| Sélecteur de contexte dans le breadcrumb (produit/module) | `Dropdown` `variant="button"` | `Dropdown` `variant="field"` (formulaires) |
| Identité utilisateur (initiales / photo) | `Avatar` | — |
| Évolution dans le temps (retards, ponctualité, volumes) | `LineChart` | `BarChart` (comparaison de catégories) |
| Motif jour × heure, ligne × jour | `Heatmap` | `LineChart` (une seule dimension temporelle) |
| Classement (lignes les plus impactées) | `BarList` | `BarChart orientation="horizontal"` (plusieurs séries) |
| Comparaison de catégories (barres empilées / groupées) | `BarChart` | `BarList` (classement à une valeur) ; `DataVisualization` est déprécié |
| Mini-courbe dans une carte d'indicateur | `Card trend` (ou `LineChart compact`) | — |
| Tendance dans une cellule de `DataTable` ou une ligne de liste | `Sparkline` | `LineChart compact` (axe, tooltip, seuils) ; `Card trend` (déjà intégré à la carte) |
| Identité de ligne (code et couleur GTFS) | `LineBadge` | `Badge` (étiquette générique) |
| Nom, commune et identifiant d'arrêt | `StopLabel` | — |
| Identifiant technique à copier (arrêt, course, véhicule) | `CopyableText` | `StopLabel` (nom d'arrêt, identifiant en simple mention) ; `TextInput readOnly` |
| Message persistant dans la page | `InlineAlert` | `Toaster` (notification éphémère) |
| Sections dépliables | `Accordion` | `TabList` (navigation) |
| Étapes d'un import ou formulaire | `Stepper` | `ProgressBar` (avancement d'un traitement) |
| Déposer/sélectionner des fichiers | `FileUpload` | L'app assure l'envoi et la validation métier |
| Progression déterminée ou indéterminée | `ProgressBar` | `Gauge` (mesure, pas un traitement) |
| Proportion unique, objectif | `Gauge` | `Card` (KPI chiffré) |
| Choisir portée et format d'export | `ExportMenu` | L'app fabrique le fichier |
| Masquer/réordonner les colonnes | `ColumnManager` | `DataTable` applique l'état |
| Heure seule, y compris service après minuit | `TimePicker` | `DatePicker withTime` (date calendaire + heure) |
| Résumé d'erreurs avec accès aux champs | `ErrorSummary` | `InlineAlert` (message sans navigation de formulaire) |
| Métadonnées label/valeur d'un détail ou d'une synthèse | `DescriptionList` | `DataTable` (plusieurs lignes d'un même type) |
| Historique d'événements datés et attribués | `ActivityFeed` | `Timeline` (périodes sur une échelle de temps, reportée) |
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
const SIDEBAR_WIDTH = 280;            // largeur de la Sidebar dépliée (fixée par sidebar.css)
const SIDEBAR_WIDTH_COLLAPSED = 80;   // largeur de la Sidebar repliée (fixée par sidebar.css)
```

Ces valeurs ne sont pas des tokens CSS : ce sont les largeurs fixées par `sidebar.css`. `AppLayout` en tient compte tout seul (Sidebar et contenu dans la même ligne flex) : aucun décalage à calculer côté app.

### Règles

- ✅ Le layout (flex, grid, gap, margins) se fait en style inline ou CSS applicatif — c'est le seul CSS custom autorisé.
- ✅ La zone de contenu n'a pas de `max-width` : elle occupe toute la largeur du conteneur d'`AppLayout`.
- ✅ Largeurs de contenu : les formulaires sont limités à `max-width: 720px` (à l'intérieur de la zone de contenu) ; les listes, tableaux et tableaux de bord prennent toute la largeur.
- ❌ Pas de largeur fixe en px sur les conteneurs de page (grille de `Card`, graphiques, `TableCard`, `DataTable`) : ils doivent s'étendre quand la Sidebar se replie.
- ❌ Ne pas inventer de valeurs d'espacement hors échelle (pas de `gap: 7px` ou `padding: 13px`).

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

**Ghost ou Outline ?** `GhostButton` par défaut (formulaires, modales, popovers, barres d'outils, barres de sélection). `PrimaryButton outline` dans un dashboard, quand les actions secondaires doivent rester visibles au repos à côté de l'action de création.

### Règles

- ✅ Un seul `PrimaryButton` par vue.
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
- ❌ `SecondaryButton` est déprécié (suppression en 1.0.0) : le bleu plein n'est plus utilisé pour les actions, `--cadence-color-accent` est réservé aux états (sélection, élément actif).

### Taille selon le contexte

La taille ne porte **pas de sens** : elle suit le contexte, pas l'importance de l'action (l'importance, c'est le niveau).

| `size` | Hauteur | Texte | Contextes |
|---|---|---|---|
| `md` (défaut) | 34px | 12px | **Actions principales** : en début de page (page liste, page de détail) et en fin de formulaire. Aussi : modale, empty state, action inline de formulaire |
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

**Liste — barre de sélection, `size="sm"`**

```tsx
// Visible uniquement quand selectedCount > 0
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Checkbox aria-label="Tout désélectionner" state="checked" onChange={onDeselectAll} />
    <Link hideArrow onClick={onDeselectAll}>Tout désélectionner</Link>
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" onClick={onDuplicate} />
    <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Supprimer" onClick={onDelete} />
  </div>
</div>
```

**Actions par ligne** — `GhostButton size="sm"` icône seule, dans le header de chaque `TableCard`. L'`aria-label` s'affiche en infobulle au survol et au focus clavier :

```tsx
<>
  <GhostButton size="sm" icon="copy-01" aria-label="Dupliquer" onClick={onDuplicate} />
  <GhostButton size="sm" icon="edit-02" aria-label="Modifier" onClick={onEdit} />
  <GhostButton size="sm" icon="trash" aria-label="Supprimer" tone="danger" onClick={onDelete} />
</>
```

**Modale** — le pied est géré par `primaryAction` (`PrimaryButton`) et `secondaryAction` (`GhostButton`) de `Modal` : ne pas recréer de boutons dans `children`.

**Empty state**

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ color: "var(--cadence-color-text-muted)", fontSize: 14 }}>Aucun scénario créé pour ce réseau.</p>
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
| Liste — sélection multiple | À droite de la barre de sélection | `GhostButton` + `PrimaryButton tone="danger"`, `size="sm"` |
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

### Migration depuis la 0.2

Les anciennes props restent acceptées en 0.3.0 (avertissement en développement, une fois par prop) ; suppression en 1.0.0. Le codemod fait l'essentiel :

```bash
node node_modules/@ddaoellena/cadence-ui/scripts/codemods/buttons-v2.mjs --dry src
```

| 0.2 | 0.3 |
|---|---|
| `PrimaryButton outline` | inchangé (variante contour, réservée aux dashboards) — ou `GhostButton` hors dashboard |
| `SecondaryButton outline` | `PrimaryButton outline size="sm"` (ou `GhostButton size="sm"` hors dashboard) |
| `SecondaryButton` plein | `PrimaryButton size="sm"` **ou** `GhostButton size="sm"` selon le rôle (le codemod laisse un `TODO buttons-v2`) |
| `destructive` | `tone="danger"` |
| `size="medium"` / `"large"` | `"md"` (défaut, plus de grande taille) |
| `withIcon="left"` / `"right"` + `icon` | `iconStart` / `iconEnd` |
| `withIcon="only"` + `icon` | `icon` + `aria-label` |
| `state` | supprimé (`"disabled"` → `disabled`) |
| `Link variant="secondary"` | `Link` (identique à `"primary"`) |

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

- ✅ Toujours passer la prop `label` sur `TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker`, `CounterInput` et `TimePicker` — c'est le seul moyen de garantir la cohérence visuelle. Exceptions, qui prennent `aria-label` à la place : `DateRangePicker` en filtre rapide d'une `FilterBar`, et `DatePicker` / `DateRangePicker` / `Dropdown` / `TimePicker` en `variant="button"` dans un dashboard.
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

Combiner `Stepper`, `FileUpload`, `ProgressBar` et `InlineAlert` : l'app gère lecture, validation et transfert. Une étape terminée peut être revisitée via `onStepClick`. Une erreur de soumission est résumée en haut par `ErrorSummary`, qui donne accès aux champs par id ou ref. Conserver aussi le message d’erreur propre à chaque champ. La recette **Recettes/Parcours transport → Import réseau et reprise après erreur** couvre ce parcours.

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
- ✅ Quand la Sidebar se replie (280 px → 80 px), le conteneur s'élargit tout seul : pas de mesure de largeur, pas de `position: fixed`, pas de `marginLeft`.
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

`ColumnManager` pilote `hiddenColumnIds` et `columnOrder` de `DataTable`. `ExportMenu` expose sélection/page/résultat et CSV/Excel : ne proposer que les formats réellement implémentés. La recette **Liste de perturbations** télécharge un CSV local qui respecte les colonnes visibles et le tri de la page.

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

Une `Card` est **interactive** soit par `onClick` (toute la carte mène à la liste détaillée), soit par son bouton d'action — jamais les deux (le typage l'interdit). Interactive, elle se soulève de 4px au survol avec l'ombre `--cadence-shadow-raised` (ombre seule avec `prefers-reduced-motion`) ; informative, elle ne bouge pas.

- ✅ Toujours préciser `goodDirection` quand une hausse n'est pas favorable : `"down"` pour un retard, des suppressions, des perturbations ; `"neutral"` pour un volume sans jugement.
- ✅ La variation est un nombre signé (`-12` → « −12 % ») ; `unit: "pt"` pour une variation de taux en points (`94,8 %` → `94,2 %` = « −0,6 pt »).
- ✅ Bouton d'action : le libellé dit l'action (« Importer », « Configurer »), le titre dit ce que l'on obtient.
- ✅ En grille : `gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))"`, `gap: 16`. Les cartes d'une ligne prennent la même hauteur et les boutons s'alignent en bas.
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
| Quelles lignes sont les plus touchées ? | `BarList` |
| Comment se répartissent des catégories, série par série ? | `BarChart` (`layout="stacked" | "grouped"`, `orientation="vertical" | "horizontal"`) |
| Une valeur clé et sa tendance en haut de page ? | `Card` (`value`, `delta`, `trend`) |
| La tendance de chaque ligne d'un tableau ? | `Sparkline` dans une cellule de `DataTable` |

### Palette

- ✅ Les séries prennent les couleurs `--cadence-dataviz-series-1..8` **dans l'ordre** : la série principale en 1. Toutes atteignent 3:1 sur blanc (traits et marqueurs).
- ✅ Chaque série a aussi une **forme de marqueur** et un **motif de trait** (`LineChart`) ou un **motif de remplissage** (`BarChart` : hachures, points, lignes…), repris dans la légende et le tooltip : le sens ne repose jamais sur la couleur seule.
- ✅ Les valeurs ordonnées (intensité) utilisent la rampe séquentielle `--cadence-dataviz-seq-1..7` : une seule teinte, clarté croissante, lisible en daltonisme et en niveaux de gris.
- ❌ Pas de couleur en dur ni de palette maison : un statut (critique, avertissement) reste un `Indicator`, pas une couleur de série.

### Seuils et annotations

- ✅ Un objectif ou un seuil d'alerte est un `threshold` libellé (« Objectif 95 % », « Seuil d'alerte 5 min ») : ligne tiretée `--cadence-dataviz-threshold`. Avec `goodDirection`, les points du mauvais côté passent en `--cadence-dataviz-threshold-breach` et le libellé indique « franchi ».
- ✅ Un événement daté (grève, travaux, incident) est une `annotation` : trait vertical ou bande, toujours libellée (« Grève 14/10 »), rappelée dans le tooltip.
- ❌ Pas de seuil sans libellé, pas d'annotation sans date.

### Accessibilité

- ✅ Chaque graphique a un `title` (nom accessible) et, de préférence, une `description` (période, périmètre).
- ✅ Alternative tabulaire : « Voir les données » affiche un vrai tableau, présent dans le DOM même masqué (`LineChart`, `BarChart` avec le total par catégorie, `BarList`) ; la `Heatmap` est elle-même une grille (`role="grid"`) avec en-têtes de lignes et de colonnes.
- ✅ Clavier : `LineChart` (←/→, Début / Fin, tooltip annoncé), `BarChart` (←/→ ou ↑/↓ d'une catégorie à l'autre), `Heatmap` (flèches, Début / Fin, Ctrl+Début / Fin, Entrée), `BarList` (lignes cliquables = boutons nommés).
- ✅ États `loading`, `empty`, `error` (avec `onRetry`) plutôt qu'un graphique vide.
- ✅ Les graphiques suivent la largeur de leur conteneur : jamais de largeur fixe en px. Hauteurs par défaut : `LineChart` et `BarChart` vertical 280px (`LineChart compact` : 48px), `BarChart` horizontal 36px par catégorie, `Heatmap` 28px par ligne, `BarList` 32px par ligne.

---

### Proportion unique

`Gauge` complète les KPI : arc/anneau, sens favorable et seuils libellés. Employer une `Card` pour une valeur seule ; `ProgressBar` pour l'avancement d'une tâche.

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

## Recettes de pages complètes

Blocs prêts à copier. **Partir d'une recette puis adapter** — ne pas réinventer la structure.

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
          user={{ name: "Hector Malot", email: "hector.malot@hove.com" }}
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

Liste de `TableCard` avec en-têtes triables, sélection multiple, barre d'actions groupées et confirmation de suppression. Couvre : `TableHeader`, `TableCard`, `GhostButton` (actions par ligne), `Checkbox`, `Modal`, `useToast` (avec un `<Toaster />` monté à la racine de l'app), `TabList` + `Tab`, tri et filtres.

```tsx
import { useState } from "react";
import {
  Tab, TabList, PrimaryButton, GhostButton, Link, Checkbox, TableHeader, TableCard, Modal, Indicator, useToast,
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

      {/* ── Barre de sélection (visible si ≥ 1 sélection) ── */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox aria-label="Tout désélectionner" state="checked" onChange={() => setSelected(new Set())} />
            <Link hideArrow onClick={() => setSelected(new Set())}>Tout désélectionner</Link>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" onClick={onDuplicate} />
            <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Supprimer" onClick={() => setConfirmOpen(true)} />
          </div>
        </div>
      )}

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

Formulaire en sections, largeur contenue, soumission en bas à droite. Les **panneaux de premier niveau** (formulaire puis synthèse) s'empilent verticalement ; le multi-colonnes n'apparaît qu'**à l'intérieur** des sections. Voir [Composition des panneaux](#composition-des-panneaux-sur-une-page-formulaire).

```tsx
import { PageHeader, TextInput, TextArea, Dropdown, DatePicker, CounterInput, SegmentedControl, DescriptionList, PrimaryButton, Link, GhostButton } from "@ddaoellena/cadence-ui";

export const ScenarioFormPage = () => (
  // Conteneur de page : flexDirection "column" → les panneaux de premier niveau s'empilent
  <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
    <PageHeader title="Créer un scénario" />

    {/* ══ PANNEAU 1 — Formulaire ══ */}
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Section : informations générales ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
          Informations générales
        </h2>
        <TextInput label="Titre" placeholder="Ex : Tronçon Melun – Montereau" value={title} onChange={(e) => setTitle(e.target.value)} />
        {/* ✅ multi-colonnes AUTORISÉ à l'intérieur d'une section */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Dropdown label="Type" options={typeOptions} value={type} onChange={setType} placeholder="Sélectionner" />
          </div>
          <div style={{ flex: 1 }}>
            <Dropdown label="Cause" options={causeOptions} value={cause} onChange={setCause} placeholder="Sélectionner" />
          </div>
        </div>
        <SegmentedControl
          options={[{ value: "planned", label: "Planifiée" }, { value: "immediate", label: "Immédiate" }]}
          value={mode}
          onChange={setMode}
          aria-label="Mode de déclenchement"
        />
      </section>

      {/* ── Section : période ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
          Période
        </h2>
        {/* Exception « saisie avec heures » : DateRangePicker ne gère pas les heures,
            d'où deux DatePicker withTime. Sans heure → un seul DateRangePicker. */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <DatePicker label="Début" value={start} onChange={setStart} withTime />
          </div>
          <div style={{ flex: 1 }}>
            <DatePicker label="Fin" value={end} onChange={setEnd} withTime />
          </div>
        </div>
        <CounterInput label="Durée estimée" min={0} max={480} step={15} unit="min" value={duration} onChange={setDuration} />
        <TextArea label="Description" placeholder="Impacts attendus, mesures prises…" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </section>
    </div>

    {/* ══ PANNEAU 2 — Synthèse / vérification ══ */}
    {/* ❌ JAMAIS à droite du formulaire — toujours EN DESSOUS */}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
        Récapitulatif
      </h2>
      <DescriptionList
        aria-label="Scénario à créer"
        items={[
          { id: "title", label: "Titre", value: title },
          { id: "type", label: "Type et cause", value: type && cause ? `${type} · ${cause}` : undefined },
          { id: "period", label: "Période", value: start && end ? `${formatDateTime(start)} → ${formatDateTime(end)}` : undefined },
          { id: "duration", label: "Durée estimée", value: `${duration} min` },
        ]}
      />
    </div>

    {/* ══ Soumission ══ */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
      <Link hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
      <GhostButton label="Réinitialiser" onClick={onReset} />
      <PrimaryButton label="Créer le scénario" onClick={onSubmit} />
    </div>
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

Liste de gros volume paginée par l'API : `FilterBar` au-dessus, `DataTable` (tri et pagination côté serveur, sélection), barre de sélection, `Pagination` en dessous. Story complète : *Recettes / Liste de perturbations* (variante en mémoire).

```tsx
import { useEffect, useState } from "react";
import {
  FilterBar, DataTable, Pagination, Dropdown, Checkbox, Link, PrimaryButton, GhostButton, Badge, Indicator,
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

      {selectedIds.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox aria-label="Tout désélectionner" state="checked" onChange={() => setSelectedIds([])} />
            <Link hideArrow onClick={() => setSelectedIds([])}>Tout désélectionner</Link>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" />
            <PrimaryButton size="sm" iconStart="trash" tone="danger" label="Clôturer" onClick={onConfirm} />
          </div>
        </div>
      )}

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

Haut d'écran : période d'analyse, grille de `Card` indicateurs (cliquables par `onClick`) qui mènent à la liste filtrée, puis la liste (recette 5) filtrée par la même période.

```tsx
import { useState } from "react";
import { Card, DateRangePicker, PageHeader, type DateRange } from "@ddaoellena/cadence-ui";

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        <Card headingLevel={2} title="Courses réalisées" value={stats.trips} delta={{ value: stats.tripsDelta, label: "vs période précédente" }}
          loading={stats.loading} />
        <Card headingLevel={2} title="Ponctualité" value={stats.punctuality} unit="%" delta={{ value: stats.punctualityDelta, unit: "pt" }}
          trend={stats.punctualityTrend} loading={stats.loading} />
        <Card headingLevel={2} title="Retard moyen" value={stats.delay} unit="min" goodDirection="down"
          delta={{ value: stats.delayDelta, label: "vs période précédente" }} loading={stats.loading} />
        <Card headingLevel={2} title="Perturbations actives" value={stats.disruptions} goodDirection="down"
          status={stats.disruptions > 20 ? "critical" : undefined} statusLabel="Seuil dépassé"
          onClick={() => navigate("/perturbations?etat=actives")} loading={stats.loading} />
      </div>

      {/* Liste filtrée par la même période : voir la recette 5 */}
    </div>
  );
};
```

- ✅ La période vit au niveau de la page : elle filtre à la fois les indicateurs et la liste.
- ✅ `loading` sur chaque carte pendant le rechargement : la grille garde sa taille.
- ✅ Une carte cliquable ouvre la liste déjà filtrée (`onClick`) — pas de bouton « Voir » en plus.

### Recette 7 — Tableau de bord d'analyse

`PageHeader` (période en variante bouton), une ligne de `Card` indicateurs, l'évolution en `LineChart`, puis le motif jour × heure (`Heatmap`) à côté du classement (`BarList`). Chaque graphique gère ses états à partir de la requête.

```tsx
import { useState } from "react";
import { BarList, Card, DateRangePicker, Heatmap, LineChart, PageHeader, type DateRange } from "@ddaoellena/cadence-ui";

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        <Card headingLevel={2} title="Retard moyen" value={stats.kpis.delay} unit="min" goodDirection="down"
          delta={{ value: stats.kpis.delayDelta, label: "vs période précédente" }} trend={stats.kpis.delayTrend} loading={state === "loading"} />
        <Card headingLevel={2} title="Ponctualité" value={stats.kpis.punctuality} unit="%"
          delta={{ value: stats.kpis.punctualityDelta, unit: "pt" }} loading={state === "loading"} />
        <Card headingLevel={2} title="Perturbations" value={stats.kpis.disruptions} goodDirection="down"
          onClick={() => navigate("/perturbations")} loading={state === "loading"} />
      </div>

      <LineChart
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        <Heatmap
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
      </div>
    </div>
  );
};
```

- ✅ Un seul `h1` (le `PageHeader`) ; les cartes et les graphiques en `headingLevel={2}`.
- ✅ La même période pilote tous les blocs ; l'état de la requête (`loading`, `error` + `onRetry`) est passé à chaque graphique.
- ✅ Grilles fluides (`auto-fill` / `auto-fit`), jamais de largeur fixe : les graphiques suivent leur conteneur.

---

### Recette 8 — Détail d'une perturbation

Story **Recettes/Parcours transport → Détail d’une perturbation** : `AppLayout` + `Sidebar` + `PageHeader`, liste `DataTable`, ouverture d'un `Drawer`, `InlineAlert`, `Accordion`, `LineBadge` et `StopLabel`. Les métadonnées utilisent `DescriptionList` et l’historique local utilise `ActivityFeed`. La prise en compte est un état local de démonstration. Aucun backend ni historique réel n'est fourni.

### Recette 9 — Import réseau et correction des erreurs

Story **Recettes/Parcours transport → Import réseau et reprise après erreur** : `Stepper`, `TextInput`, `FileUpload`, résumé d'erreurs (`ErrorSummary` + refs), `Autocomplete multiple`, vérification et `ProgressBar`.

La démonstration lit un CSV UTF-8 et contrôle uniquement les en-têtes `stop_id`/`stop_name` (virgule ou point-virgule). Elle simule ensuite le traitement local. Elle ne remplace ni un parseur CSV complet ni un validateur GTFS. Les timers sont nettoyés au démontage ; l'app de production doit gérer ses propres requêtes, annulations et reprises.

### Recette 10 — Planification d'un service de nuit

Story **Recettes/Planification de service → Service de nuit et validation** : deux `TimePicker allowOvernight`, validation native et comparaison début/fin par l'app, `ErrorSummary` pour revenir au champ fautif, puis `DescriptionList` et `ActivityFeed` après enregistrement local. `25:30` est conservé comme heure de service, sans conversion de date. Le formulaire utilise `noValidate` et appelle donc explicitement `checkValidity()` avant d'enregistrer.

## Référence API des composants

**Source de vérité des props.** Si une prop n'est pas listée ici, elle n'existe pas — ne pas en inventer. Convention : les props sans défaut indiqué sont `undefined` ; ⚠️ signale les pièges courants.

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
| `onClick` | `() => void` | — | Toute la carte devient cliquable (bouton nommé par `title`). ⚠️ Exclusif avec `actionLabel` |
| `actionLabel` | `string` | — | Bouton `PrimaryButton outline size="sm"` en bas à gauche ; seul lui est cliquable. ⚠️ Exclusif avec `onClick` |
| `onAction` | `() => void` | — | Clic sur le bouton d'action (exige `actionLabel`) |
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
| `series` | `{ id, label, data: (number \| null)[], color? }[]` | **requis** | Une valeur par catégorie, dans l'ordre ; `color` : token attendu |
| `layout` | `"stacked" \| "grouped"` | `"stacked"` | Barres empilées ou côte à côte |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Horizontal pour des libellés longs ou de nombreuses catégories |
| `unit` | `string` | — | Tooltip, tableau |
| `format` | `Intl.NumberFormatOptions` | `{ maximumFractionDigits: 1 }` | — |
| `showValues` | `boolean` | `false` | Valeur au bout des barres (total de la pile si empilé) |
| `showLegend` | `boolean` | `true` | Légende cliquable (dès deux séries) |
| `showGrid` | `boolean` | `true` | Lignes de grille |
| `hideTitle` | `boolean` | `false` | En-tête masqué visuellement (titre toujours lu), ex. quand une `Card` affiche déjà le titre |
| `height` | `number` | `280` en vertical ; 36px par catégorie en horizontal | Hauteur du tracé |

Clavier : le tracé est focusable ; ←/→ (vertical) ou ↑/↓ (horizontal) d'une catégorie à l'autre, Début / Fin, Échap masque le tooltip ; la catégorie est annoncée (`aria-live`).

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
```

### BarList

Classement horizontal : libellé, barre proportionnelle (`--cadence-dataviz-series-1`), valeur en mono alignée à droite, variation facultative. Hauteur : 32px par ligne. Props communes des graphiques : `title` (**requis**), `description`, `headingLevel` (3), `state` (`"ready" | "loading" | "empty" | "error"`), `emptyMessage`, `errorMessage`, `onRetry`, `className`.

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

### Breadcrumbs

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | **requis** | `{ id, label, icon?, href?, onClick?, content? }` — le dernier = page courante |
| `separator` | `ReactNode` | chevron | Séparateur custom |
| `onNavigate` | `(id: string) => void` | — | Clic sur un item |
| `className` | `string` | — | — |

`BreadcrumbItem.content` (`ReactNode`) remplace le rendu du libellé — typiquement `<Dropdown variant="button" aria-label="…" />` comme sélecteur de contexte. Le `<li>` et les séparateurs sont conservés ; `label` reste requis et nomme l'élément (`role="group"`) ; `href`, `onClick` et `icon` sont ignorés. ⚠️ Le type de `label` ne change pas : toujours une `string`.

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
| `className` | `string` | — | — |

**`DataTableColumn<T>`**

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | **requis** | Clé de tri et de masquage |
| `header` | `string` | **requis** | Libellé FR (affiché en majuscules) |
| `accessor` | `(row: T) => string \| number \| Date \| boolean \| null \| undefined` | **requis** | Valeur brute : tri et rendu par défaut |
| `cell` | `(row: T) => ReactNode` | — | Rendu custom (`Badge`, `Indicator`…) |
| `align` | `"left" \| "right" \| "center"` | `"left"` (`"right"` si `numeric`) | — |
| `numeric` | `boolean` | `false` | Police mono + alignement à droite |
| `width` | `number` | — | Largeur fixe (px). Sans `width` : partage de l'espace restant |
| `minWidth` | `number` | `80` | Largeur minimale des colonnes sans `width` |
| `sortable` | `boolean` | `false` | — |

- Tri en mémoire : chaînes à la française (« Ligne 2 » avant « Ligne 10 », sans casse ni accents), nombres, dates ; valeurs vides toujours en dernier.
- Rendu par défaut : nombres `Intl.NumberFormat("fr-FR")`, dates `JJ/MM/AAAA HH:mm`, booléens « Oui » / « Non », vide « — ».
- ⚠️ La case d'en-tête sélectionne les lignes **affichées** (la page). « Sélectionner les N résultats » se fait dans la barre de sélection de l'app.
- ⚠️ Le masquage et l'ordre des colonnes passent par `ColumnManager` (branché sur `hiddenColumnIds` et `columnOrder`). Il n'y a toujours ni filtre par colonne ni redimensionnement.

### DataVisualization (déprécié)

⚠️ **Déprécié depuis la 0.5.0, supprimé en 1.0.0** : utiliser `BarChart`. C'est désormais une enveloppe de `BarChart` (avertissement en développement) ; l'API reste valide :

| Ancien `type` | Équivalent `BarChart` |
|---|---|
| `"stacked-vertical"` | `layout="stacked"` (défaut) |
| `"grouped-vertical"` | `layout="grouped"` |
| `"horizontal"` | `layout="grouped" orientation="horizontal"` |

Autres props : `series` `{ label, data, color? }[]` → `{ id, label, data, color? }[]` (un `id` par série) ; `height`, `showLegend`, `showValues` inchangés ; `showGridLines` → `showGrid` ; `showTooltip` est ignoré (tooltip toujours actif, au survol et au clavier). ⚠️ `BarChart` exige un `title` : l'enveloppe utilise « Graphique », masqué visuellement.

### DatePicker

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `Date \| null` | — | Date sélectionnée |
| `onChange` | `(date: Date) => void` | — | — |
| `label` | `string` | — | Label au-dessus |
| `placeholder` | `string` | `"JJ/MM/AAAA"` (`"JJ/MM/AAAA HH:mm"` avec `withTime`) | — |
| `disabled` | `boolean` | `false` | — |
| `minDate`, `maxDate` | `Date` | — | Bornes (jours hors bornes désactivés) |
| `withTime` | `boolean` | `false` | Heures/minutes + bouton de validation |
| `labelConfirm` | `string` | `"Valider"` | Libellé du bouton de validation (`withTime`) |
| `segmentedOptions` | `{ value, label }[]` | — | SegmentedControl dans le popover (contrôlé via `segmentedValue` + `onSegmentChange`) |
| `variant` | `"field" \| "button"` | `"field"` | `"button"` : déclencheur en `PrimaryButton outline size="sm"` (icône, valeur, chevron). **À privilégier dans un dashboard** ; `"field"` dans un formulaire |
| `aria-label` | `string` | — | Nom accessible sans `label` visible (variante bouton) : « Date » → annoncé « Date : 20/10/2026 » |

Affichage en français : format `JJ/MM/AAAA` (`JJ/MM/AAAA HH:mm` avec `withTime`), mois en toutes lettres (« Octobre 2026 »), semaine commençant le **lundi** (`Lu Ma Me Je Ve Sa Di`). ⚠️ Pas de prop `locale`.

Clavier : un seul jour dans l'ordre de tabulation ; ←/→ (jour), ↑/↓ (semaine), Début/Fin (lundi/dimanche), Page préc./suiv. (mois), Entrée pour choisir, Échap pour fermer (le focus revient au déclencheur). Les jours sont annoncés en toutes lettres (« lundi 19 octobre 2026 »).

### DateRangePicker

Sélection d'une période. Même déclencheur et même calendrier que `DatePicker`. Sélection en deux clics (la fin peut précéder le début : les dates sont inversées), validée par « Appliquer » ; un clic sur un préréglage applique directement. Le popover s'ouvre aligné à gauche du déclencheur et se décale vers la gauche s'il sortirait de l'écran ou du conteneur (idem `DatePicker` et le menu de `Dropdown`).

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

### Icons

SVG inline issu de `@untitledui/icons` — aucune requête réseau. L'icône suit `currentColor` : par défaut elle prend la couleur du texte parent.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `IconName` (≈ 89 valeurs) | `"search-md"` | Ex : `"trash"`, `"copy-01"`, `"edit-02"`, `"plus"`, `"calendar"`, `"chevron-down"`, `"switch-vertical-01"`… |
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

### Indicator

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"active" \| "upcoming" \| "completed" \| "draft" \| "warning" \| "info" \| "critical" \| "nominal"` | **requis** | Statut sémantique (picto + couleurs) |
| `label` | `string` | label de la variante | Surcharge du libellé |

### LineChart

Évolution d'une à huit séries, temporelles (`x: Date`, axe de dates fr-FR adapté à l'étendue : heures, jours ou mois) ou catégorielles. Tooltip partagé (toutes les séries à l'abscisse survolée), dans un portail. Hauteur par défaut 280px. Props communes : voir `BarList`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `series` | `{ id, label, data: { x: Date \| string, y: number \| null }[] }[]` | **requis** | `y: null` = trou dans la courbe |
| `variant` | `"line" \| "area"` | `"line"` | — |
| `stacked` | `boolean` | `false` | Aires empilées (`variant="area"`) |
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

### Link

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Texte du lien |
| `href` | `string` | — | Rend un `<a>` ; sans `href` + avec `onClick` → `<button>` |
| `variant` | `"primary" \| "destructive" \| "inverse"` | `"primary"` | `--cadence-color-link`, `--cadence-color-danger-text`, blanc. ⚠️ `"destructive"`, pas `"danger"`. `"secondary"` est déprécié (identique à `"primary"`) |
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
| `title` | `string` | — | Titre (header sombre), relié par un identifiant unique |
| `aria-label` | `string` | `"Dialogue"` | Nom accessible sans titre visible ; fournir un libellé précis |
| `children` | `ReactNode` | **requis** | Corps (scrollable si long) |
| `primaryAction` | `{ label, onClick, destructive? }` | — | Bouton droit du pied : `PrimaryButton` (`destructive` → `tone="danger"`) |
| `secondaryAction` | `{ label, onClick }` | — | Bouton gauche du pied : `GhostButton` |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | 400 / 560 / 800 px |
| `hideCloseButton` | `boolean` | `false` | — |

Comportements intégrés : fermeture sur Échap, scroll du body et du conteneur AppLayout verrouillé, footer fixe quand le corps scrolle. Avec plusieurs Modal/Drawer, seul le dernier ouvert gère Échap et le piège à focus. Fermer une surcouche en arrière-plan conserve le verrouillage et le focus de celle au premier plan. Les attributs `inert` et `aria-hidden` préexistants sont restaurés à la fermeture. Les contrôles masqués, désactivés (y compris par un fieldset) ou hors tabulation sont exclus du cycle Tab.

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

API identique pour les deux ; seul le rendu change (`PrimaryButton` plein ou contour, `GhostButton` sans fond ni bordure). Mêmes dimensions à taille égale.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** (sauf icône seule) | Libellé. ⚠️ Exclusif avec `icon`. Sans `label` ni `icon`, le bouton ne rend **aucun texte de repli** et une erreur est émise en développement |
| `icon` | nom d'icône `Icons` | — | Icône seule (bouton carré). ⚠️ `aria-label` **obligatoire** (typé) ; à défaut, le nom de l'icône sert de nom accessible avec un avertissement en développement. Le nom accessible s'affiche en **infobulle** sous le bouton, au survol (après 300 ms) et au focus clavier |
| `aria-label` | `string` | — | Nom accessible. Obligatoire avec `icon` |
| `iconStart`, `iconEnd` | nom d'icône `Icons` | — | Icône avant / après le libellé |
| `tone` | `"default" \| "danger"` | `"default"` | `"danger"` : action destructive (fond rouge / texte rouge) |
| `size` | `"sm" \| "md"` | `"md"` | 29 / 34px, texte 11 / 12px. Dépend du contexte, ne porte pas de sens. ⚠️ Pas de `"lg"` |
| `outline` | `boolean` | `false` | **`PrimaryButton` uniquement** : variante contour (fond blanc, bordure `--cadence-color-border-strong`), pour les actions secondaires d'un dashboard |
| `loading` | `boolean` | `false` | Clics ignorés, `aria-busy`, spinner (à la place de `iconStart`), largeur conservée |
| `disabled` | `boolean` | `false` | — |
| `fullWidth` | `boolean` | `false` | Occupe toute la largeur |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | — |
| `onClick` | `MouseEventHandler` | — | — |
| `className` | `string` | — | — |
| `ref` | `Ref<HTMLButtonElement>` | — | `forwardRef` vers le `<button>` |

- Contenu : le typage impose `label`, ou `icon` + `aria-label`, pour l'API v2 des deux composants. Il ne peut pas l'imposer aux appels qui utilisent encore les anciennes props de `PrimaryButton` (`withIcon`…) : l'API 0.2 rendait `label` et `icon` facultatifs (libellé « Label » et icône par défaut), les rendre obligatoires casserait la compilation de code existant. Ces appels sont couverts à l'exécution par la même erreur de développement.
- Survol, appui et focus sont gérés en CSS (`:hover`, `:active`, `:focus-visible` avec `--cadence-focus-ring`). Au survol, la couleur fonce d'un cran (plein : `--cadence-color-primary-hover` ; `outline` : voile d'encre sur le blanc ; danger : `--cadence-color-danger-hover`). Le bouton plein (default et danger) se soulève aussi d'une ombre portée douce, teintée de rouge en danger ; l'`outline` n'en a pas. ⚠️ Pas de prop `state`.
- Anciennes props de `PrimaryButton` (`withIcon`, `destructive`, `size="medium" | "large"`, `state`) : acceptées en 0.3.0 avec un avertissement en développement, supprimées en 1.0.0 (voir [Migration depuis la 0.2](#migration-depuis-la-02)). `outline` n'est **pas** déprécié. `GhostButton` n'accepte que l'API ci-dessus (ni `outline`, ni les anciennes props).

### SecondaryButton (déprécié)

⚠️ **Obsolète** — suppression en 1.0.0. En 0.3.0, c'est une enveloppe : `outline` → `PrimaryButton outline size="sm"`, plein → `PrimaryButton size="sm"`, `size="large"` → `"md"`. Ne plus l'utiliser dans du nouveau code.

### RadioButton

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "selected" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` |
| `onChange` | `() => void` | — | — |

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

Onglet de sous-navigation (niveau 2), sous un `SegmentedControl`. Style ghost (pastille douce sur l'onglet actif, inactifs en gris `--cadence-color-icon-muted`), avec compteur optionnel. Un `<SecondaryTab>` par onglet, dans un `TabList level="secondary"`.

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

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `{ value, label }[]` | **requis** | 2 à 4 segments |
| `value` | `string` | — | Mode contrôlé |
| `defaultValue` | `string` | — | Mode non contrôlé |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | `false` | — |
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
| `user` | `SidebarUser` | — | Utilisateur connecté en pied : `{ name, email?, avatarSrc? }`. Avatar seul quand la Sidebar est repliée |
| `className` | `string` | — | — |

**Repli** — géré en interne : le bouton « » fait passer la Sidebar de **280 px** (dépliée) à **80 px** (repliée), avec une transition de 250 ms. Il n'y a pas de prop pour piloter ou lire cet état. Dans `AppLayout`, le conteneur de la page suit cette largeur tout seul.

```tsx
<AppLayout
  sidebar={
    <Sidebar
      product="datahub"
      clientName="Bordeaux Métropole"
      sections={sections}
      scope={{ options: reseaux, value: reseauId, onChange: setReseauId }}
      user={{ name: "Hector Malot", email: "hector.malot@hove.com" }}
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
| `actions` | `ReactNode` | — | Slot — des `GhostButton size="sm"` icône seule (`icon` + `aria-label`, `tone="danger"` pour supprimer) |
| `columns` | `TableCardColumn[]` | `[]` | `{ key, content, width? \| flex? }` — `width` px fixe **ou** `flex` (jamais les deux) |
| `state` | `"default" \| "selected" \| "disabled"` | `"default"` | `selected` = fond bleu du wrapper |

### TableHeader

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `TableHeaderColumn[]` | **requis** | `{ key, label, sortable?, sortDirection?, onSort?, width? \| flex? }` |

`sortDirection` : `"asc" \| "desc" \| "none"`. Les `width`/`flex` doivent refléter ceux des `TableCard` en dessous (+ colonne spacer initiale ≈ 220).

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
| `type` | type HTML natif | `"text"` | ⚠️ Pas de `type="number"` — utiliser `CounterInput` |
| `disabled` | `boolean` | `false` | — |

### Toggle

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "active" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` ni `label` — accoler un `<span>` pour le texte |
| `onChange` | `(nextActive: boolean) => void` | — | — |

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

Clavier et focus : à l'ouverture, focus sur le premier élément focusable du contenu (sinon sur le panneau). Échap et « Fermer » ferment et rendent le focus au déclencheur ; Maj+Tab avant le premier élément aussi ; Tab après le dernier ferme et passe à l'élément qui suit le déclencheur. Le clic extérieur ferme ; un menu en portail ouvert depuis le contenu (`ActionMenu`, `ExportMenu`, `ColumnManager`) ne compte pas comme extérieur. Le défilement et le redimensionnement replacent le panneau sans le fermer (clavier virtuel sur mobile). Seuls les éléments affichés comptent pour la sortie au clavier. Fermé par le parent (mode contrôlé) alors que le focus y était, le focus revient au déclencheur ; une fermeture refusée par le parent laisse le panneau affiché. Dans une `Modal`, Échap ne ferme que le `Popover`. Le déclencheur reçoit `aria-haspopup="dialog"`, `aria-expanded` et `aria-controls`.

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
| `secondaryAction` | `{ label; onClick? }` | — | Action secondaire → `GhostButton` |
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

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `isOpen` | `boolean` | **requis** | Visibilité |
| `onClose` | `() => void` | **requis** | Échap, clic voile, bouton fermer |
| `title` | `string` | **requis** | Titre |
| `subtitle` | `string` | — | Sous-titre |
| `children` | `ReactNode` | **requis** | Corps défilant (`cadence-scrollbar`) |
| `primaryAction` | `{ label; onClick; destructive? }` | — | Pied → `PrimaryButton` (`destructive` → `tone="danger"`) |
| `secondaryAction` | `{ label; onClick }` | — | Pied → `GhostButton` |
| `width` | `"md" \| "lg"` | `"md"` | 480px / 720px |

Le panneau partage avec `Modal` la gestion des surcouches superposées : seule celle au premier plan possède le clavier ; le fond reste verrouillé jusqu’à la fermeture de la dernière.

⚠️ Mêmes règles d'actions que `Modal` : `GhostButton` (secondaire) + `PrimaryButton` (principale), jamais deux boutons pleins.

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
| `action` | `{ label: string; onClick: () => void }` | — | Action secondaire |
| `dismissible` | `boolean` | `false` | Affiche « Fermer » |
| `onDismiss` | `() => void` | — | L'app retire l'alerte au clic |
| `className` | `string` | — | Classe additionnelle |

Pour un résumé d’erreurs de soumission, utiliser `ErrorSummary`, qui réutilise `InlineAlert` et `Link` et prend en charge le focus. Voir la recette d’import.

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

⚠️ Exception à « tokens uniquement » : les couleurs de ligne sont des données métier. Une `textColor` explicite est respectée ; l'app doit vérifier son contraste. Les couleurs CSS nommées, RGB et alpha ne sont pas acceptées.

### CopyableText

Identifiant technique en police mono, tronqué avec ellipse (valeur complète en infobulle native), suivi d'un `GhostButton` de copie. Le retour « Copié » (ou « Copie impossible ») est écrit à côté du bouton et annoncé par une région `role="status"`, puis s'efface après 2 s. Copie via l'API Clipboard, avec repli `execCommand` hors contexte sécurisé.

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

Nom, commune et identifiant d'arrêt, avec lignes facultatives. Texte complet conservé dans le DOM et attribut `title` natif sur nom/id ; ce n'est pas une infobulle Cadence interactive.

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

### ColumnManager

Panneau non modal en portail : visibilité, déplacement par boutons et réinitialisation des colonnes. Focus à l'ouverture, Échap et sortie par Tab rendent le focus au déclencheur. Le défilement interne reste possible.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `ColumnManagerColumn[]` | **requis** | `{ id: string; label: string }` |
| `visibleIds` | `string[]` | **requis** | Colonnes visibles |
| `order` | `string[]` | **requis** | Ordre partiel ou complet ; doublons/inconnus ignorés, absentes ajoutées à la fin |
| `onChange` | `(next: { visibleIds: string[]; order: string[] }) => void` | **requis** | État contrôlé |
| `className` | `string` | — | Classe additionnelle |

Brancher `DataTable.hiddenColumnIds` sur le complément de `visibleIds`, et `DataTable.columnOrder` sur `order`. « Réinitialiser » restaure toutes les colonnes dans l'ordre de `columns`. L'app assure leur persistance si souhaité.

### Sparkline

Mini-courbe sans axe ni interaction, pour une cellule de `DataTable`, une ligne de liste ou une `Card` (qui l'utilise pour `trend`). Point final marqué. Nom accessible (`role="img"`) résumant la tendance : « Tendance en hausse : de 2,1 min à 3,9 min sur 7 points ».

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

Proportion unique en arc 270° ou anneau. Valeur formatée en français, indicateur textuel d'objectif atteint/non atteint ou niveau intermédiaire. Valeur graphique bornée à [0, max] ; nombre brut conservé. Pas d'animation sous `prefers-reduced-motion`.

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

### ActivityFeed

Historique d'événements ponctuels. Liste ordonnée avec icône, état **textuel**, auteur facultatif, date absolue et description. Ne trie pas les données et ne les récupère pas : l'app contrôle l'ordre, la pagination éventuelle et l'autorisation d'accès.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `ActivityItem[]` | **requis** | Voir ci-dessous |
| `aria-label` | `string` | **requis** | Nom de la région |
| `loading` | `boolean` | `false` | `aria-busy`, squelette et annonce de chargement ; masque temporairement les items |
| `emptyTitle` | `string` | `"Aucune activité"` | Titre de l'`EmptyState` intégré |
| `timeZone` | `string` | `"UTC"` | Fuseau IANA valide ; passer celui du produit explicitement |
| `className` | `string` | — | Classe additionnelle |

**`ActivityItem`** : `id: string` (unique), `title: string`, `date: Date`, `author?: string`, `description?: ReactNode`, `tone?: ActivityTone` (défaut `"neutral"`), `icon?: IconName` (surcharge de l'icône par défaut).

`ActivityTone` : `"neutral" | "success" | "warning" | "danger"`. Les états affichés sont « Information », « Succès », « Avertissement », « Erreur ». Dates formatées en `fr-FR`, avec `<time dateTime={date.toISOString()}>` ; une Date invalide affiche « Date indisponible ». Pas de temps relatif ni de mise à jour périodique. Le fuseau par défaut UTC garantit le même rendu serveur/client ; une configuration IANA invalide doit être corrigée par l'app.

⚠️ Ce composant ne remplace ni une frise de périodes (`Timeline`, toujours reportée), ni un journal d'audit serveur. Une erreur de récupération se compose avec `InlineAlert`/`EmptyState variant="error"`.

### TimePicker

Heure seule : champ compact affichant HH:mm et une icône horloge. Un clic (ou Entrée/Espace sur le champ focalisé) ouvre un panneau ancré comme celui de `DatePicker`. Le panneau contient deux cases **Heures / Minutes** éditables au clavier et leurs flèches, reprenant le module horaire partagé avec `DatePicker withTime`. Aucune conversion via Date : `25:30` reste une heure de service.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Label visible en variante champ ; à fournir pour un formulaire |
| `aria-label` | `string` | `"Heure"` | Nom en l’absence de label, notamment en variante bouton |
| `value` | `string` | requis | Heure valide `HH:mm` ou `""` |
| `onChange` | `(value: string) => void` | requis | Heure normalisée validée, jamais un brouillon invalide |
| `variant` | `"field" \| "button"` | `"field"` | Champ compact ou bouton outline sm ouvrant le même panneau horaire |
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

- **Champ** : déclencheur de 40 px avec label, heure et icône horloge ; le module horaire est affiché uniquement dans le panneau ouvert. Ce déclencheur est un bouton visuellement présenté comme un champ, comme DatePicker. La saisie clavier s’effectue dans le panneau.
- **Bouton** : déclencheur outline sm, comme DatePicker. Les deux variantes ouvrent le panneau avec le focus sur les heures ; les changements (saisie et flèches) restent en brouillon jusqu’à « Valider » ou Entrée, qui normalisent aussi (`9` et `5` deviennent `09:05`). « Annuler », Échap, clic extérieur ou sortie au clavier annulent les modifications. Validation/annulation explicite rend le focus au déclencheur.
- ↑/↓ modifie l’unité focalisée : une heure ou `minuteStep` minutes. Les minutes peuvent passer à l’heure suivante (23:55 + 15 min → 24:10 si autorisé). Les bornes ne bouclent pas. Depuis un éditeur vide, une flèche initialise la borne basse.
- Un collage HH:mm dans l’une des cases renseigne les deux. Vider les deux cases puis valider efface une heure facultative ; une seule case vide constitue une saisie incomplète.
- Échap ferme le panneau sans modifier la valeur dans les deux variantes. L’événement est consommé avant le Modal/Drawer parent.
- Les inputs utilisent `role="spinbutton"` et des noms distincts (« Heures — Départ », « Minutes — Départ »). Dans les deux variantes, l’éditeur reste monté mais caché quand fermé ; `checkValidity()` sur la ref invalide ouvre le panneau, comme une soumission HTML standard. Pour le focus via ErrorSummary, privilégier une cible conteneur incluant le bouton lorsque le panneau est fermé.
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
- Recette **Offre et qualité** : premier niveau `SegmentedControl` (« Offre / Qualité »), second niveau `SecondaryTab` dans `TabList level="secondary"`. L’onglet Offre montre le calendrier puis les courses ; Qualité compose le rapport décrit ci-dessous.
- **DataQualityReport est une recette interne, pas un export de la bibliothèque.** Elle compose `InlineAlert`, `FilterBar`, `DataTable`, `Drawer`, `DescriptionList` et `EmptyState`. L’application fournit les constats et décide quels niveaux bloquent l’import. Le résumé global reste indépendant du filtre ; aucun résultat de recherche ne signifie pas absence d’erreurs.

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
