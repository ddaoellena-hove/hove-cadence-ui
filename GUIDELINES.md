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
12. [Feedback](#feedback)
13. [Recettes de pages complètes](#recettes-de-pages-complètes)
14. [Référence API des composants](#référence-api-des-composants)

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
9. **Toujours passer `label`** sur les champs de formulaire (`TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker`, `CounterInput`).
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
| `--cadence-color-accent` | `#1b6cff` | Élément actif / sélectionné (Sidebar, options de menu). ⚠️ Réservé aux états : jamais pour une action |
| `--cadence-color-accent-subtle` | `#f0f6ff` | Survol d'un élément actif (Sidebar), ligne sélectionnée (`DataTable`) |
| `--cadence-color-white` | `#ffffff` | Surfaces de premier plan |
| `--cadence-color-surface-alt` | `#eef1f4` | Fonds de wrapper (TableCard, Badge), jours d'une période (`DateRangePicker`) |
| `--cadence-color-border` | `#e5e5e5` | Bordures par défaut |
| `--cadence-color-border-strong` | `#bfc9cb` | Bordures appuyées, états disabled |
| `--cadence-color-scrollbar-thumb` | `rgba(0, 40, 48, 0.2)` | Curseur des barres de défilement (`cadence-scrollbar`) ; `-hover` : `rgba(0, 40, 48, 0.36)` |
| `--cadence-color-divider` | `#f0f0f0` | Séparateurs internes |
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
| `--cadence-z-popover` | `100` | Popovers et bulles ancrés (DatePicker, tooltips) |
| `--cadence-z-dropdown` | `200` | Menus déroulants |
| `--cadence-z-modal` | `1000` | Modale et son voile |
| `--cadence-z-toast` | `1100` | Toasts en overlay |

La story **Foundation/Tokens** affiche tous ces tokens à partir des variables CSS.

### Règles

- ✅ Dans du code applicatif, référencer les tokens (`color: var(--cadence-color-primary)`) plutôt que les hex en dur.
- ✅ Statut dans du code applicatif → `--cadence-status-*` ; jamais un hex.
- ✅ Couches : `zIndex: "var(--cadence-z-toast)"` pour un toast, `var(--cadence-z-sticky)` pour un élément collant — pas de valeur inventée.
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
| Action principale de la vue (une seule) | `PrimaryButton` | `GhostButton` (secondaire) |
| Action secondaire, action inline de formulaire | `GhostButton` | `SecondaryButton` (déprécié) ; `Link` (3e action) |
| 3e action d'un groupe, action dans une phrase | `Link hideArrow` | `GhostButton` (action secondaire) |
| Navigation inline, action tertiaire discrète | `Link` | — |
| Petite action par ligne de liste (icône) | `GhostButton size="sm"` icône seule (`icon` + `aria-label`, infobulle intégrée) | `PrimaryButton` (trop appuyé dans une ligne) |
| Saisie de texte libre (1 ligne) | `TextInput` | — |
| Saisie de texte long (multi-lignes) | `TextArea` | — |
| Valeur numérique avec +/− | `CounterInput` | `TextInput type="number"` (interdit) |
| Choix dans une liste courte (≥ 3 options, sans recherche) | `Dropdown` | `Autocomplete` (longue liste à filtrer) |
| Période, date ou choix dans un dashboard | `DateRangePicker` / `DatePicker` / `Dropdown` avec `variant="button"` (à privilégier) | Variante champ (formulaire, `FilterBar`), `PrimaryButton outline` (action, pas de valeur) |
| Choix dans une longue liste avec recherche au clavier | `Autocomplete` | `Dropdown` (liste courte) |
| Choix exclusif 2-4 options **dans un formulaire** | `SegmentedControlAlt` | `SegmentedControl` (réservé navigation) |
| Bascule entre vues / modes d'affichage | `SegmentedControl` | `Tab` (navigation de page) |
| Navigation entre vues d'une même page (niveau page) | `Tab` | `SegmentedControl`, `SecondaryTab` (sous-niveau) |
| Sous-navigation dans une vue (filtres/statuts, avec compteurs) | `SecondaryTab` | `Tab` (niveau page) |
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
| Dialogue bloquant (confirmation, formulaire court) | `Modal` | `AlertToast` (non bloquant) |
| Notification temporaire non bloquante | `AlertToast` | `Modal` |
| Info contextuelle au survol | `Tooltip` / `TooltipTrigger` | `Modal` |
| Squelette d'application (navigation + contenu de page) | `AppLayout` | — |
| Navigation principale (sections de l'app) | `Sidebar` | — |
| Sélecteur de périmètre + profil utilisateur | `Sidebar` (`scope`, `user`) | — |
| Fil d'Ariane | `Breadcrumbs` | — |
| Sélecteur de contexte dans le breadcrumb (produit/module) | `Dropdown` `variant="button"` | `Dropdown` `variant="field"` (formulaires) |
| Identité utilisateur (initiales / photo) | `Avatar` | — |
| Graphique en barres | `DataVisualization` | — |
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
- ❌ Pas de largeur fixe en px sur les conteneurs de page (grille de `Card`, `DataVisualization`, `TableCard`, `DataTable`) : ils doivent s'étendre quand la Sidebar se replie.
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
<div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
  <Link hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
  <GhostButton label="Réinitialiser" onClick={onReset} />
  <PrimaryButton label="Créer le scénario" onClick={onSubmit} loading={isSaving} />
</div>
```

**Dashboard — tout l'en-tête en `sm` : actions en `outline`, action principale pleine**

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", gap: 4 }}>
    <Tab label="En cours" variant="active" />
    <Tab label="À venir" />
  </div>
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

Au-dessus d'une liste filtrable, utiliser `FilterBar` (recherche, filtres rapides, filtres actifs). Un tri hors `DataTable` se fait avec un `GhostButton size="sm" iconStart="switch-vertical-01"`, hors du flux des boutons d'action.

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
| `TextInput` | Texte libre — nom, description, recherche. |
| `TextArea` | Texte long multi-lignes — descriptions, commentaires. |
| `CounterInput` | Valeur numérique bornée avec +/−. |
| `Dropdown` | Choix parmi une liste fixe et courte (3 à ~10 options). |
| `Autocomplete` | Choix dans une longue liste, avec recherche au clavier. Sélection simple ou multiple (`multiple`). |
| `SegmentedControlAlt` | 2 à 4 options mutuellement exclusives. **À privilégier dans les formulaires.** |
| `DatePicker` | Sélection d'une date (option heure avec `withTime`). |
| `DateRangePicker` | Sélection d'une période (début → fin) avec préréglages ; jours entiers. |
| `Checkbox` | Option booléenne indépendante, ou sélection multiple. |
| `RadioButton` | Sélection exclusive parmi 2 à 5 options courtes. |
| `RichRadioButton` | Sélection exclusive avec description par option. |
| `RichCheckbox` | Sélection multiple avec description par option. |
| `Toggle` | Activation/désactivation à effet immédiat (hors soumission). |

### Règles

- ✅ Toujours passer la prop `label` sur `TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `DateRangePicker` et `CounterInput` — c'est le seul moyen de garantir la cohérence visuelle. Exceptions, qui prennent `aria-label` à la place : `DateRangePicker` en filtre rapide d'une `FilterBar`, et `DatePicker` / `DateRangePicker` / `Dropdown` en `variant="button"` dans un dashboard.
- ✅ Une période → un seul `DateRangePicker`, jamais deux `DatePicker` « Début » / « Fin » (sauf saisie avec heures, non gérée par `DateRangePicker` en v1).
- ✅ Utiliser la prop `helperText` de `TextInput`/`TextArea` pour les instructions.
- ✅ Afficher les erreurs avec `state="error"` + message dans `helperText`.
- ✅ Grouper les champs connexes avec un titre de section.
- ✅ Dans un formulaire, toujours `SegmentedControlAlt` — le `SegmentedControl` classique est réservé à la navigation.
- ❌ Ne pas utiliser `SegmentedControl` dans un formulaire.
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

## Navigation

### Rôle de chaque composant

| Composant | Rôle | Position |
|---|---|---|
| `AppLayout` | Squelette : Sidebar à gauche, contenu de page dans un conteneur blanc arrondi bordé d'un liseré. | Plein écran (`100vh`) |
| `Sidebar` | Navigation principale entre les grandes sections ; en pied, sélecteur de périmètre (`scope`) et utilisateur connecté (`user`). | Gauche, pleine hauteur, dans `AppLayout` |
| `Breadcrumbs` | Localisation dans l'arborescence + navigation ascendante. | Au-dessus du titre |
| `Dropdown` `variant="button"` | Sélecteur de contexte dans le breadcrumb (produit/module). | Dans le breadcrumb |
| `Tab` | Navigation entre vues au sein d'une même page. | Sous le titre de page |
| `SecondaryTab` | Sous-navigation (filtres/statuts, avec compteurs) à l'intérieur d'une vue ouverte via un `Tab`. | Sous la rangée de `Tab` |

### Règles

- ✅ Toute page vit dans `AppLayout`, qui reçoit la `Sidebar` (prop `sidebar`) et le contenu de la page (`children`).
- ✅ Le fond de l'app prend la couleur produit de la Sidebar : la Sidebar s'y fond, sans arrondi ni ombre. Seul le conteneur blanc défile.
- ✅ Quand la Sidebar se replie (280 px → 80 px), le conteneur s'élargit tout seul : pas de mesure de largeur, pas de `position: fixed`, pas de `marginLeft`.
- ✅ Périmètre (réseau, client) et utilisateur connecté vont en pied de Sidebar (`scope`, `user`). Il n'y a plus de `Header`.
- ✅ Afficher `Breadcrumbs` dès que l'utilisateur est à plus d'un niveau de profondeur.
- ✅ Le dernier item du breadcrumb est la page courante — sans `href`.
- ✅ L'onglet actif se marque avec `variant="active"` sur `Tab`.
- ✅ Pour un second niveau de navigation (sous-filtres/statuts d'une vue), utiliser `SecondaryTab` sous la rangée de `Tab` — plus compact, avec compteur optionnel.
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

## Statuts & étiquettes

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

## Feedback

### Choisir le bon composant

| Situation | Composant |
|---|---|
| Confirmation d'une action réussie | `AlertToast type="success"` |
| Erreur système ou action échouée | `AlertToast type="error"` |
| Avertissement non bloquant | `AlertToast type="warning"` |
| Info contextuelle sur un élément UI | `TooltipTrigger` |
| Explication d'un bouton désactivé | `TooltipTrigger` accolé au bouton `disabled` |
| Erreur de validation d'un champ | `TextInput state="error"` + `helperText` |
| Confirmation avant action irréversible | `Modal size="small"` |

### Règles

- ✅ `AlertToast` s'affiche en overlay (`position: fixed`, coin haut-droit) — jamais dans le flux du contenu.
- ✅ `success` et `information` : auto-dismiss après 4 secondes (à gérer côté app avec un `setTimeout`).
- ✅ `error` : reste visible jusqu'à fermeture manuelle (`dismissible` + `onDismiss`).
- ❌ Ne pas afficher plus de 3 toasts simultanément.
- ❌ Ne pas utiliser `Tooltip` pour du contenu long ou interactif.

```tsx
// Toast de confirmation
<AlertToast type="success" title="Scénario créé" dismissible onDismiss={() => setVisible(false)} />

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
import { AppLayout, Sidebar, Icons } from "@ddaoellena/cadence-ui";

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
    </AppLayout>
  );
};
```

- ✅ Le contenu commence par un `PageHeader` (titre, sous-titre, actions) : pas de padding à ajouter, `AppLayout` le fournit. Le `PageHeader` se colle en haut du conteneur au défilement.
- ✅ Le repli de la Sidebar élargit le conteneur sans code applicatif.
- ❌ Pas de `Header` (supprimé en 0.4.0) ni de wrapper `position: fixed`.

### Recette 2 — Page liste avec sélection multiple

Liste de `TableCard` avec en-têtes triables, sélection multiple, barre d'actions groupées et confirmation de suppression. Couvre : `TableHeader`, `TableCard`, `GhostButton` (actions par ligne), `Checkbox`, `Modal`, `AlertToast`, `Tab`, tri et filtres.

```tsx
import { useState } from "react";
import {
  Tab, PrimaryButton, GhostButton, Link, Checkbox, TableHeader, TableCard, Modal, AlertToast, Indicator,
} from "@ddaoellena/cadence-ui";

// Largeurs partagées entre TableHeader et TableCard — NE PAS désynchroniser
const COL = { date: 110, severity: 110 };

export const ScenarioListPage = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
        <div style={{ display: "flex", gap: 4 }}>
          <Tab label="En cours" variant="active" />
          <Tab label="À venir" />
          <Tab label="Passées" />
        </div>
        <PrimaryButton label="Créer un scénario" onClick={onCreate} />
      </div>

      {/* ── Barre de sélection (visible si ≥ 1 sélection) ── */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox state="checked" onChange={() => setSelected(new Set())} />
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
          onClick: () => { deleteSelected(); setConfirmOpen(false); setToast(true); },
        }}
      >
        Cette action est irréversible.
      </Modal>

      {/* ── Toast de confirmation ── */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1100 }}>
          <AlertToast type="success" title="Scénarios supprimés" dismissible onDismiss={() => setToast(false)} />
        </div>
      )}
    </div>
  );
};
```

### Recette 3 — Page formulaire

Formulaire en sections, largeur contenue, soumission en bas à droite. Les **panneaux de premier niveau** (formulaire puis synthèse) s'empilent verticalement ; le multi-colonnes n'apparaît qu'**à l'intérieur** des sections. Voir [Composition des panneaux](#composition-des-panneaux-sur-une-page-formulaire).

```tsx
import { PageHeader, TextInput, TextArea, Dropdown, DatePicker, CounterInput, SegmentedControlAlt, TableCard, PrimaryButton, Link, GhostButton } from "@ddaoellena/cadence-ui";

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
        <SegmentedControlAlt
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
      <TableCard
        title="Scénario à créer"
        columns={[
          { key: "type", content: <span>{type} · {cause}</span>, flex: 1 },
          { key: "periode", content: <span>{start} → {end}</span>, width: 220 },
        ]}
      />
    </div>

    {/* ══ Soumission ══ */}
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
      <Link hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
      <GhostButton label="Réinitialiser" onClick={onReset} />
      <PrimaryButton label="Créer le scénario" onClick={onSubmit} />
    </div>
  </div>
);
```

### Recette 4 — Empty state

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ fontFamily: "var(--cadence-font-sans)", color: "var(--cadence-color-text-muted)", fontSize: 14, margin: 0 }}>
    Aucun scénario créé pour ce réseau.
  </p>
  <PrimaryButton label="Créer le premier scénario" onClick={onCreate} />
</div>
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
        quickFilters={<Dropdown options={lineOptions} value={line} onChange={(id) => update(() => setLine(id))} />}
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

---

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
| `actions` | `[AlertToastAction]` ou `[AlertToastAction, AlertToastAction]` | — | 1 à 2 boutons `size="sm"` (`{ label, onClick?, outline? }`) : `outline` (défaut pour la 1re) → `GhostButton`, sinon `PrimaryButton` |
| `dismissible` | `boolean` | auto `true` si `actions` | Affiche le bouton × |
| `onDismiss` | `() => void` | — | Clic sur ×. ⚠️ Pas de prop `onClose`. |
| `className`, `style` | — | — | Échappatoires |

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

### Breadcrumbs

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | **requis** | `{ id, label, icon?, href?, onClick? }` — le dernier = page courante |
| `separator` | `ReactNode` | chevron | Séparateur custom |
| `onNavigate` | `(id: string) => void` | — | Clic sur un item |

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
| `defaultValue` | `number` | — | Mode non contrôlé |
| `min`, `max`, `step` | `number` | — | Bornes et pas |
| `unit` | `string` | — | Unité affichée (ex : `"min"`, `"km"`) |
| `label` | `string` | — | Label au-dessus |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(value: number) => void` | — | — |

Champ bordé de 40px ; les boutons − et + sont des `GhostButton size="sm"` icône seule (« Décrémenter », « Incrémenter »), posés dans le cadre et désactivés aux bornes `min` / `max`. Sans infobulle : leur sens est évident (le nom reste annoncé aux lecteurs d'écran). La valeur reste saisissable au clavier (Entrée valide, Échap annule).

### DataTable

Tableau dense pour les gros volumes. Vrai `<table>` (rôles ARIA explicites), en-tête collant, tri, sélection, navigation clavier, virtualisation optionnelle. Générique : `DataTable<T>`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `DataTableColumn<T>[]` | **requis** | Voir ci-dessous. ⚠️ Définir au niveau module ou via `useMemo` (une nouvelle référence recalcule le tri) |
| `data` | `T[]` | **requis** | Lignes. En mode serveur : la page courante, déjà triée |
| `getRowId` | `(row: T) => string` | **requis** | Identifiant unique et stable |
| `aria-label` | `string` | **requis** | Nom accessible du tableau |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` | 36px / 48px par ligne |
| `hiddenColumnIds` | `string[]` | `[]` | Colonnes masquées (le menu de colonnes est fourni par l'app) |
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
- ⚠️ Pas de `hideable`, de filtre de colonne ni de redimensionnement en v1.

### DataVisualization

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"stacked-vertical" \| "grouped-vertical" \| "horizontal"` | **requis** | Variante du graphique |
| `series` | `{ label, data: number[], color? }[]` | **requis** | Une entrée par série |
| `categories` | `string[]` | **requis** | Labels d'axe |
| `height` | `number` | `260` | Hauteur SVG (hors légende) |
| `showLegend` | `boolean` | `true` | — |
| `showGridLines` | `boolean` | `true` | — |
| `showValues` | `boolean` | `false` | Valeurs sur les barres |
| `showTooltip` | `boolean` | `true` | Tooltip au survol |

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
| `segmentedOptions` | `{ value, label }[]` | — | SegmentedControlAlt dans le popover (contrôlé via `segmentedValue` + `onSegmentChange`) |
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
| `options` | `DropdownOption[]` | **requis** | `{ id, label, icon?, disabled?, divider?, groupLabel? }` — ⚠️ clé `id`, pas `value`. `divider` = trait au-dessus de l'option ; `groupLabel` = en-tête de section au-dessus de l'option |
| `label` | `string` | — | Label au-dessus |
| `value` | `string` | — | `id` de l'option sélectionnée |
| `placeholder` | `string` | — | — |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(id: string) => void` | — | — |
| `variant` | `"field" \| "button"` | `"field"` | `"button"` : déclencheur en `PrimaryButton outline size="sm"` (icône, valeur, chevron). **À privilégier dans un dashboard** ; `"field"` dans un formulaire |
| `aria-label` | `string` | — | Nom accessible sans `label` visible (variante bouton) : « Devise » → annoncé « Devise : EUR € » |

⚠️ En variante bouton, l'icône de l'option sélectionnée (`icon`) s'affiche avant le libellé, ramenée à 12px.

Menu : même gabarit que les préréglages du `DateRangePicker` — options de 13px arrondies à 8px (`--cadence-radius-md`), fond `--cadence-color-surface-alt` au survol et à la sélection, option sélectionnée en gras avec une coche en pastille encre.

### FilterBar

Barre au-dessus d'une liste : ligne 1 = recherche · filtres rapides · actions (à droite) ; ligne 2 = filtres actifs · « Tout effacer » · nombre de résultats.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `search` | `{ value, onChange, placeholder?, "aria-label"? }` | — | `TextInput` de recherche. `onChange` est appelé 300 ms après la dernière frappe (ou sur Entrée) ; `value` reste contrôlée. Défauts : `"Rechercher…"` / `"Rechercher"` |
| `quickFilters` | `ReactNode` | — | Slot : `Dropdown`, `SegmentedControl`… |
| `activeFilters` | `{ id, label }[]` | `[]` | Affichés en `Badge dismissible` |
| `onRemoveFilter` | `(id: string) => void` | — | Croix d'un badge. Sans callback, les badges ne sont pas supprimables |
| `onClearAll` | `() => void` | — | « Tout effacer » (`GhostButton size="sm"`), affiché à partir de **2** filtres actifs |
| `resultCount` | `number` | — | « 12 430 résultats » / « 1 résultat » / « Aucun résultat » (annoncé aux lecteurs d'écran) |
| `actions` | `ReactNode` | — | Slot à droite : export, menu de colonnes… |
| `className` | `string` | — | — |

⚠️ Pas d'icône loupe : `TextInput` n'accepte pas d'icône.

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
| `title` | `string` | — | Titre (header sombre) |
| `children` | `ReactNode` | **requis** | Corps (scrollable si long) |
| `primaryAction` | `{ label, onClick, destructive? }` | — | Bouton droit du pied : `PrimaryButton` (`destructive` → `tone="danger"`) |
| `secondaryAction` | `{ label, onClick }` | — | Bouton gauche du pied : `GhostButton` |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | 400 / 560 / 800 px |
| `hideCloseButton` | `boolean` | `false` | — |

Comportements intégrés : fermeture sur Échap, scroll du body verrouillé, footer fixe quand le corps scrolle.

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

### SecondaryTab

Onglet de sous-navigation (niveau 2), sous une rangée de `Tab`. Style ghost (pastille douce sur l'onglet actif, inactifs en gris `#69797D`), avec compteur optionnel. Item-level : un `<SecondaryTab>` par onglet.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | — |
| `count` | `number` | — | Compteur affiché entre parenthèses après le libellé (ex. « (4) ») |
| `variant` | `"default" \| "active"` | `"default"` | ⚠️ Pas de prop booléenne `active` |
| `disabled` | `boolean` | `false` | — |
| `onClick` | `() => void` | — | — |

### SegmentedControl / SegmentedControlAlt

API identique pour les deux (`SegmentedControl` = navigation, `SegmentedControlAlt` = formulaires) :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `{ value, label }[]` | **requis** | 2 à 4 segments |
| `value` | `string` | — | Mode contrôlé |
| `defaultValue` | `string` | — | Mode non contrôlé |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | `false` | — |
| `aria-label` | `string` | — | Nom accessible du groupe |

### Sidebar

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `product` | `"datahub" \| "traffic-report" \| "insights"` | **requis** | Thème de couleur |
| `clientName` | `string` | **requis** | Nom client sous le logo |
| `sections` | `SidebarNavSection[]` | **requis** | `{ id, label, icon, items?, defaultOpen?, notification? }` — sans `items`, la section est un lien direct |
| `activeId` | `string` | — | Item ou section actif |
| `onItemClick` | `(id: string) => void` | — | — |
| `onCollapse` | `() => void` | — | Clic sur le bouton replier / déplier. ⚠️ N'indique pas l'état (replié ou non) : mesurer la largeur pour le connaître |
| `onLogout` | `() => void` | — | Bouton déconnexion |
| `scope` | `SidebarScope` | — | Sélecteur de périmètre en pied : `{ options, value?, onChange?, placeholder? }` (options au format `Dropdown`, ⚠️ clé `id`). Masqué quand la Sidebar est repliée ; le menu s'ouvre vers le haut |
| `user` | `SidebarUser` | — | Utilisateur connecté en pied : `{ name, email?, avatarSrc? }`. Avatar seul quand la Sidebar est repliée |

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
