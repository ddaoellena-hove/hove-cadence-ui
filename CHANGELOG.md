# Changelog — @ddaoellena/cadence-ui

## 0.8.1 (non publiée)

Version mineure, sans rupture d’API.

### Ajouté

- **`ModeIcon`** : famille de **30 pictogrammes de mode de transport** remplis (métro, train, tram, funiculaire, bus à la demande, bus de substitution, autocar, gare routière, avion, bateau, voiture, covoiturage, taxi, vélo, parking vélo, parking, parking relais, station, réseau, marche lente/moyenne/rapide, course, domicile, travail, PMR, ticket…). SVG inline (gabarit 80), suit `currentColor`, même interface qu’`Icons` (`size`, `color`, `title`). Famille **distincte** des icônes d’interface en trait d’`Icons`. Liste ordonnée `MODE_NAMES`, libellés FR `MODE_LABELS` et type `ModeName` exportés (galerie, sélecteur). Fiche GUIDELINES + ligne d’intention.
- **`ModeFilter`** : filtre par mode de transport — rangée de **chips togglables** (`ModeIcon` + libellé), multi-sélection par défaut (`selection="single"` possible), boutons bascule (`aria-pressed`) dans un groupe nommé. Sélection vide = aucun filtre. Pour un tableau de bord ou une liste (dans une `FilterBar` / barre d’outils). Fiche GUIDELINES + ligne d’intention.
- **`SegmentedControl` `size="sm"`** : variante compacte de 29px (`--cadence-control-height-compact`), texte 12px, piste et pastille resserrées, pour un en-tête de dashboard ou une barre d’outils serrée (s’aligne sur les boutons `sm` et le `SearchInput`). `size="md"` (40px) reste le défaut. Le sélecteur d’échelle de `Timeline` passe en `sm`.
- **Graphiques — prop `framed`** (`LineChart`, `BarChart`, `Heatmap`, `BarList`, `Timeline`, `JourneyTimeline`) : encadre le graphique de la même surface qu’une `Card` (bordure, arrondi, marge), pour délimiter des graphiques voisins. Défaut `false`. Le pattern **Analyse** l’utilise pour tous ses graphiques.

### Modifié

- **`DatePicker` — saisie au clavier** (variante champ, défaut) : la date se tape dans des cases **JJ / MM / AAAA** (+ HH : mm avec `withTime`) séparées de « / » fixes, comme `TimePicker` ; passage automatique d’une case à l’autre, collage « 12/06/2026 » accepté. Cliquer le champ n’ouvre plus le calendrier : **seule l’icône calendrier** l’ouvre, positionné sur la date saisie, focus sur ce jour. Date inexistante ou hors bornes : message d’erreur sous le champ, `onChange` non appelé. `placeholder` ne sert plus qu’à la variante bouton. Sans changement de type ; story « Clavier » retirée au profit de « Saisie directe ».
- **`Sidebar` refondue** : largeur dépliée **220 px** (au lieu de 280 px ; repliée 80 px inchangée). Libellés de sections et « Se déconnecter » en **casse normale** 13px (plus de capitales), icônes ramenées à 18px. Lignes de 36px en retrait, aérées (4px entre deux lignes), arrondies au survol ; l’élément actif devient une **pastille claire en relief** sur le fond produit (texte blanc), à la place du fond blanc et de la barre bleue. Sous-éléments sans trait d’arborescence, alignés sur le libellé. Sans changement d’API ; `AppLayout` suit la nouvelle largeur.
- **`Sidebar` — utilisateur** : le pied n’affiche plus que l’avatar et le nom. `user.email` est **déprécié** et ignoré (toujours accepté, sans rupture de type) ; suppression prévue en 1.0.0.
- **`PrimaryButton` plein** : relief un peu plus marqué — léger dégradé vertical (haut éclairci, bas assombri), reflet et liseré de 1px plus nets, ombre portée de 2px. À l’appui, le reflet s’éteint (bouton enfoncé). Le ton `danger` suit le même relief ; `outline` et désactivé sont inchangés. Visuel uniquement, sans changement d’API.
- **Boutons `size="md"`** (`PrimaryButton`, `GhostButton`) : libellé en **13px** (au lieu de 12px), interlignage et interlettrage ajustés en proportion. Plus d’encre et une hiérarchie plus nette avec le `sm` (11px). Hauteur inchangée (34px) ; les boutons s’élargissent d’environ 8 % à libellé égal.

## 0.8.0 (non publiée)

Version mineure, sans rupture d’API. Thème : **Page patterns**.

### Ajouté

- **Primitives de mise en page** (catégorie « Structure et mise en page ») : **`PageSection`** (titre `h2`/`h3`/`h4` + description + actions, repère `region`), **`FieldRow`** (champs à largeurs égales, alignés par le bas), **`FormActions`** (barre d’actions, ordre `Link` → `Ghost` → `Primary`), **`CardGrid`** (grille fluide `auto-fill`/`auto-fit`). Elles remplacent le CSS inline répété dans les recettes.
- **Catalogue « Page patterns »** : section Storybook de premier niveau (entre `Composants` et `Recettes`), avec un test de garde de catégorie. **11 patterns** — Coque d’application, Liste / index, Liste + détail latéral, Page de détail, Formulaire, Assistant / import, Supervision, Analyse, Planification / temps, Paramètres, États de page. Chacun : un **gabarit vérifié** `src/patterns/<Nom>Pattern.tsx`, des stories `layout: "fullscreen"` (états `Défaut` / `Chargement` / `Vide` / `Erreur` selon le pattern, a11y en erreur), une page MDX `Page patterns/<Nom>/Documentation` (structure fixe) et une fiche GUIDELINES.
- Gabarits affichés **à l’identique par construction** : le MDX importe le fichier via `?raw` ; GUIDELINES référence le fichier vérifié (test de garde `patterns-gabarit`).

### Modifié

- GUIDELINES : la section « Recettes de pages complètes » est précédée de **« Page patterns »** (tableau *Intention → pattern*, correspondance *recette → pattern*). Les **instructions agents IA** demandent de **choisir d’abord un pattern** ; une page hors pattern est **signalée, pas inventée**.
- **Lot A — cohérence doc** : `Timeline`/`JourneyTimeline` ajoutés à Data visualisation ; `ColorField` et `DisruptionScopePicker` au tableau des hauteurs 40 px ; Feedback renvoie vers `useToast()` + `Toaster` ; exemple d’état vide en `text-secondary` (AA) ; `--cadence-color-primary` sans « modale » ; colonne d’actions collée de `DataTable` documentée.

### Documentation

- Stories de documentation migrées : page **« Recettes → Page patterns »** (correspondance et liens). Les stories `Recettes/*` restent disponibles comme exemples réalistes jusqu’à la 1.0.0. **Les liens Storybook changent** : les nouvelles pages sont sous `page-patterns-<nom>--…`.
- Audit responsive 1440 / 1280 / 1024 px des 11 patterns (`docs/audits/0.8.0/`) : aucun défilement horizontal de page.

### Décisions

- `Toolbar` et `SplitView` : **documentés** (règles / composition), pas de composant (couverts par `PageHeader`/`FilterBar` et `Drawer`).
- **`DataTable` : prop `stickyActions`** — colle la dernière colonne (actions) à droite au défilement horizontal, avec ombre de séparation. Remplace le CSS que l’app fournissait (A6). L’infobulle intégrée des boutons d’icône de la colonne collée est masquée (rognée au défilement) ; le nom accessible reste.
- Pattern Paramètres : **enregistrement explicite** par défaut ; un réglage à effet immédiat l’annonce.

## 0.7.6 (non publiée)

Version mineure, sans rupture d’API.

### Modifié

- **Police d’interface : ABC Diatype** remplace Inter. `@font-face` (poids 400 / 500 / 700 + italiques) dans `tokens.css`, `woff2` servis depuis `/fonts` ; `--cadence-font-sans` passe à `"ABC Diatype", "Inter", …`. Tous les composants suivent le token — aucun changement d’API.
- **Inter conservée** : toujours chargée (Google Fonts) et en tête de repli. Revenir à Inter ne demande que de la remettre en premier dans `--cadence-font-sans` (un seul endroit).

### Ajouté

- Stories **Typographie / Police d’interface — ABC Diatype vs Inter** : spécimen (glyphes, graisses, chiffres tabulaires) et interface réaliste, les deux polices côte à côte (surcharge de `--cadence-font-sans` par colonne).

> ⚠️ **Consommateurs de la lib** : ABC Diatype est commerciale. La lib ne distribue que la règle `@font-face` ; héberge les `woff2` sous `/fonts/` pour l’activer, sinon le rendu retombe sur Inter.

## 0.7.5 (non publiée)

Version mineure, sans rupture d’API.

### Ajouté

- **Police display Uxum Grotesque** réellement chargée : `@font-face` (poids 400 / 500 / 700, `font-display: swap`) dans `tokens.css`, fichiers `woff2` servis depuis `/fonts` (dossier `public`, repris par Storybook via `staticDirs`). Les titres (`PageHeader`) rendent désormais en Uxum Grotesque au lieu du repli Space Grotesk.

### Modifié

- `--cadence-font-display` : repli serif `Georgia` retiré — `"Uxum Grotesque", "Space Grotesk", sans-serif` (Space Grotesk reste le repli web si Uxum est absente). Fallback aligné dans `page-header.css`.

> ⚠️ **Consommateurs de la lib** : Uxum Grotesque est une police commerciale. La lib ne distribue que la règle `@font-face` (pas les fichiers) ; héberge les `woff2` sous `/fonts/` pour l’activer, sinon le rendu retombe sur Space Grotesk.

## 0.7.0 (non publiée)

Version mineure, sans rupture d’API.

### Ajouté

- **`ColorField`** : saisie d’une couleur de ligne GTFS (`route_color`) avec pastille, champ hex validé et aperçu `LineBadge` en direct. La pastille ouvre un sélecteur HEX dans un `Popover` (zone saturation / luminosité, réglette de teinte, champ HEX), à la place du sélecteur natif et de ses modes RGB / HSL ; contrôle de contraste (`line-badge-utils`) et bouton « Calculer la couleur du texte ».
- **`Timeline`** : plages horaires sur un axe temps, une ligne par entité, repère « maintenant », annotations, couleurs par `tone` doublées d’un motif ; navigation clavier, tooltip, « Voir les données », états `loading`/`empty`/`error`. Rendu HTML dans une carte : bandeau « Fenêtre » (`Jeu. 11/06/2026 07h55 → 08h35`, mono), sélecteur **Échelle** (`scales`, `defaultScale` : « Ajuster », 1 h, 30 min, 15 min, défilement horizontal), axe horaire en haut au format `08h15` (pas majeurs en gras), grille, gouttière de libellés collée au défilement, aide en pied (`hint`).
- **`JourneyTimeline`** : comparaison d’itinéraires sur une fenêtre de départ, même cadre que `Timeline`. Étapes marche / transport / attente (picto, `LineBadge`, teinte de la couleur GTFS), libellé `[n]` collé au départ, résumé calculé (durée, correspondances, marche) et mention « Recommandé » ; info-bulle par étape, clic sur un itinéraire (`onJourneyClick`), clavier, « Voir les données ».
- **`TreeView`** : arborescence dépliable (réseau → ligne → parcours, dépôt → véhicules). Motif ARIA `tree` aplati (`aria-level` / `aria-setsize` / `aria-posinset`), clavier complet (flèches, Début / Fin, `*` pour déplier les frères, saisie de la première lettre). Sélection `none` / `single` / `multiple` avec cases tri-état qui remontent vers le parent ; chargement à la demande (`loadChildren`, `Skeleton`, reprise « Réessayer ») ; virtualisation au-delà de 500 lignes visibles.
- **`DataFreshness`** : fraîcheur d’une donnée — point coloré (ton de statut) et libellé relatif compact (« Mis à jour il y a 3 min »), date absolue en `title` et pour les lecteurs d’écran ; ton selon l’âge (frais `nominal` / vieillissant `warning` / périmé `critical`).
- **`DisruptionScopePicker`** : sélection du périmètre réseau d’une perturbation — champ qui ouvre un `Popover` (recherche + `TreeView` en sélection multiple) ; périmètre retenu en chips `Badge dismissible`, résumé sur le champ, « Tout effacer ». Variante hiérarchique d’`Autocomplete multiple`.
- **Icônes** : `bus`, `tram`, `train`, `anchor` (Untitled UI) et `walk` (dessinée au même gabarit).
- **`SegmentedControl`** : option désactivée (`options[].disabled`), grisée et sautée par les flèches.

### Modifié

- **Croix de fermeture unifiée** : `Modal`, `Drawer`, `Popover`, `InlineAlert` et `AlertToast` utilisent le même `GhostButton size="sm"` icône `x-close`, sans infobulle (composant interne `CloseButton`). Le `Popover` perd l’infobulle « Fermer » sur sa croix, `FileUpload` celle de « Retirer / Annuler l’import » ; la croix « Effacer la recherche » de `SearchInput` devient la même croix (21px, ronde) ; les boutons maison de `Modal`, `Drawer`, `InlineAlert` et `AlertToast` disparaissent.
- **`Modal`** : nouveau design — carte blanche arrondie (`--cadence-radius-2xl`), en-tête sur fond discret (`--cadence-color-surface-subtle`) avec filet bas et titre 17px, pied sans filet. L’action secondaire passe de `GhostButton` à `PrimaryButton outline`. En-tête compact (48px). Un `children` en texte seul s’affiche comme un message centré (15px). API inchangée.

### Corrigé

- `SegmentedControl` : la pastille active débordait de 2px à droite (bordure hors largeur) ; sur le dernier choix, la marge passe de 2px à 4px comme les autres côtés.
- Règle des boutons `md` à côté d’un champ : l’action inline à côté d’un seul champ est désormais documentée comme une exception (règle et exemple alignés).
- CHANGELOG 0.6.0 : nom de token corrigé (`--cadence-color-field-focus-subtle`).
- Colonne d’actions de `DataTable` : largeur réservée, ombre de séparation et défilement horizontal à 800 px.
- `TreeView` : les libellés retombaient sur le serif du navigateur en isolation — police héritée du token `--cadence-font-sans`.

### Documentation

- Storybook : composants rangés en 10 catégories (`Composants/<Catégorie>/<Nom>` : Actions, Formulaires, Navigation, Structure et mise en page, Données et tableaux, Visualisation de données, Retours et statuts, Surcouches, Transport, Médias et icônes), ordre du menu fixé dans `.storybook/preview.ts`, test de garde. Les liens directs vers les anciennes stories (`components-…`) changent.
- Commentaires `tokens.css` (focus appliqué, couches z-index réelles) et JSDoc `CopyableText` (sans infobulle) à jour.
- Tableau des tokens de GUIDELINES complété (`--cadence-color-text-secondary`, `--cadence-color-skeleton`) + test de cohérence `tokens.css` ↔ GUIDELINES.
- `StopLabel` : doc alignée sur le code (identifiant en `Badge`, pas de `title`).
- Exemples des MDX de guidelines passés aux tokens, avec contrôle automatisé.
- Fiche `Modal` : règles d’usage face à `Drawer` et `Popover` (✅ / ❌), exemple de confirmation.
- Chip de filtre : `Badge dismissible` / `FilterBar activeFilters` documentés (pas de composant `Tag` dédié).
- Polices : nouveau test de garde — toute `font-family` des CSS de composants passe par un token `--cadence-font-*` (ou `inherit`), pour qu’un changement de police (ex. remplacer Inter) se fasse au seul endroit (`tokens.css`). Stories `TableHeader` / `Icons` passées au token.
- `ScheduleComparison` (proposition B5) : non retenu comme composant — comparaison d’horaires/offres couverte par un assemblage `DataTable` + `BarChart`/`Timeline` (recette), trop spécifique à l’app pour un composant générique.

## 0.6.0 (non publiée)

Version mineure, sans rupture d’API. La 0.5.0 n’a pas été publiée sur npm : une app qui passe de la 0.4.0 à la 0.6.0 reçoit aussi les changements de la section 0.5.0 ci-dessous.

### Corrigé

- **Portabilité hors Vite** : `LineBadge` lisait `import.meta.env.DEV`, propre à Vite ; à la construction de la lib il valait `false` et l’avertissement de contraste ne s’affichait jamais. Les avertissements de développement passent par un garde unique (`process.env.NODE_ENV`, remplacé par le bundler de l’app) qui ne plante plus quand `process` est absent (ESM chargé sans bundler). Un test interdit `import.meta` dans le code des composants.
- **`inert` sous React 18** : `Accordion` (panneau fermé) et `Drawer` (en sortie) passaient `inert={true}`, ignoré par React 18 : le contenu fermé restait focusable et lu. L’attribut est désormais rendu sous React 18 et 19 ; le typage compile avec `@types/react` 18 et 19.
- **Menus et popovers dans une surcouche** : `ActionMenu`, `ExportMenu` et `ColumnManager`, rendus en portail, passaient sous le voile d’une `Modal` ou d’un `Drawer` dont ils étaient ouverts. Ils prennent la couche juste au-dessus.
- **Annonce des toasts** : `AlertToast` portait `role="alert"` et `aria-live="polite"`. Annonce immédiate pour `error` et `warning`, polie pour `success` et `information`. Le `Toaster` rend toujours (même vide) deux régions live permanentes qui portent ces annonces ; les cartes de la pile n'ont plus de rôle, d'où une annonce unique et fiable.
- **`LineBadge`** : l'avertissement de contraste et le liseré ne pouvaient jamais se déclencher (sans `textColor`, la couleur calculée atteint toujours 4,5:1). Un avertissement de développement signale désormais une `textColor` fournie (route_text_color) sous 4,5:1 ; le liseré est retiré.
- **Couches** : `Toaster` utilise `--cadence-z-toast` au lieu de `z-index: 1100` en dur. Un test interdit les couches numériques dans les CSS des composants.
- **`BarChart`** : halo blanc sous les valeurs affichées (`showValues`), comme les libellés de seuil de `LineChart`.
- **`SegmentedControl`** : il épouse ses segments (`width: fit-content; max-width: 100%`) et ne s’étire plus dans une colonne flex ou une grille, comme le faisait la recette « Offre et qualité ».
- **Hauteur réelle des champs** : `TextInput`, `Dropdown`, `DatePicker` et `Autocomplete` (en `content-box`) mesuraient 42px au lieu de 40 ; ils passent en `border-box` et s'alignent sur les autres champs. ⚠️ Ces champs perdent 2px de hauteur.
- **`SegmentedControl`** : hauteur fixée à 40px (onglets à pleine hauteur), alignée sur les champs.
- **`InlineAlert`** : l'action passe de `GhostButton` à `PrimaryButton outline size="sm"`, plus visible sur le fond teinté.
- **Infobulles** : plus d'infobulle au survol du déclencheur d'un `Popover` ni du bouton de `CopyableText`, et plus de `title` natif sur la valeur tronquée ; les noms accessibles sont conservés.
- **Accessibilité** : contrôle a11y de Storybook en erreur pour toute la suite (`.storybook/preview.ts`). Corrigés au niveau des composants : case de `TableCard` nommée (nouvelle prop `checkboxLabel`) et carte désactivée en `aria-disabled` ; `TableHeader` dans une table ARIA (`role="table"` > `row` > `columnheader`) avec colonne sans libellé nommée (`ariaLabel`) ; contrastes AA (aide et succès de `TextArea`, e-mail d'`Avatar`, texte de remplacement de `DatePicker`, jours des mois voisins, libellés de groupe et descriptions d'`Autocomplete`) ; corps de `Modal` focusable quand il défile ; `nav` de `Sidebar` nommée par produit.
- **Menus et panneaux ancrés** : `ActionMenu`, `ExportMenu` et `ColumnManager` ne se ferment plus au moindre défilement ; comme `Popover`, ils sont replacés et ne se ferment que si leur déclencheur sort de la fenêtre (positionnement partagé `useAnchoredPanel`).
- **`FilterBar`** : les recettes placent les filtres rapides en `variant="button"` (un seul gabarit de 29px sur la rangée).
- **Stories** : plus d'avertissement React « value sans onChange » (stories `TextArea`).
- **Paquet** : `react` et `react-dom` ne sont plus dans `dependencies` (seulement `peerDependencies` `^18 || ^19` et `devDependencies`) ; `@tpitre/story-ui` passe en `devDependencies` ; la condition `types` vient en tête de `exports`.

### Ajouté

- **`Sparkline`** : mini-courbe pour une cellule de `DataTable` ou une ligne de liste, couleur encre ou série dataviz, nom accessible résumant la tendance (avec minimum et maximum quand un pic dépasse les extrémités). `Card` l’utilise pour `trend` (rendu inchangé).
- **`CopyableText`** : identifiant technique en mono avec bouton de copie, retour « Copié » annoncé (y compris pour une seconde copie rapprochée), repli `execCommand` hors contexte sécurisé.
- **`Popover`** : panneau non modal ancré à un bouton pour une aide riche, un mini-formulaire ou un détail (focus, Échap, clic extérieur, sortie au clavier). Replacé (et non fermé) au défilement et au redimensionnement, compatible avec un menu en portail dans son contenu et avec le mode contrôlé.
- **Token `--cadence-font-size-caption` (11px)** : taille des petits textes. Le fil d'Ariane (`Breadcrumbs`) passe de 13 à 11px, comme le texte d'aide sous les champs ; celui de `TimePicker` passe de 12 à 11px.
- **Tokens de rayon et de couleur** : tous les CSS de composants passent par les tokens (test `css-tokens`). Nouveaux : `--cadence-radius-2xl`, `--cadence-radius-pill` ; focus de champ (`--cadence-color-field-focus`, `--cadence-field-focus-ring`, `--cadence-color-field-focus-subtle`), `--cadence-color-control-border-active`, `--cadence-color-selected-surface`, `--cadence-color-scrim`, textes et fonds sur fond sombre (`--cadence-color-on-dark*`), `--cadence-color-accent-on-dark`, `--cadence-color-segmented-hover`. ⚠️ Harmonisations visibles : palette d'`Avatar` alignée sur les statuts (AA), texte des toasts à l'encre, voiles d'encre ramenés aux overlays de survol et d'appui, blancs sur fond sombre ramenés à trois niveaux.
- **Tokens de hauteur de contrôle** : `--cadence-control-height-compact` (29px : boutons `sm`, `SearchInput`, déclencheurs `variant="button"`) et `--cadence-control-height-field` (40px : champs d'une ligne, `SegmentedControl`), appliqués par les composants. GUIDELINES : composition sur une rangée et exceptions ; story `Foundation/Hauteurs de contrôle`.
- **`ColumnManager`** : réordonnancement par glisser-déposer (poignée, repère de dépôt) et au clavier (↑ / ↓ sur la poignée, position annoncée) ; boutons Monter / Descendre conservés.
- **CI React 18** : `npm run test:react18` (React 18 et ses types installés sans toucher `package.json`, puis `tsc`, Vitest et build de la lib) et workflow GitHub en matrice React 18 / 19.

### Documentation

- Titre de page à 22px dans `Typography.mdx`, comme `PageHeader` ; `PageHeader` remplace les `<h1>` faits main (story `AppLayout`, guides Navigation et Page formulaire).
- Recette 1 : `<Toaster />` monté à la racine. Recette 2 : toast via `useToast`, case « Tout désélectionner » nommée. Recette 3 : synthèse en `DescriptionList`, 8px entre les boutons de soumission, exception « saisie avec heures » explicitée.
- Échelle des couches `--cadence-z-*` décrite ; annonce des toasts par type.
- § Formulaires : `TimePicker` dans la règle des labels. `DataTable` : masquage et ordre des colonnes via `ColumnManager`, toujours ni filtre par colonne ni redimensionnement.
- Action avec libellé dans une ligne de `DataTable` : `PrimaryButton outline size="sm"` (recette « Détail d’une perturbation » adaptée).
- `SegmentedControl` : jamais pleine largeur.

## 0.5.0 (non publiée)

### FileUpload : cartes fichier

- Bouton « Parcourir » en `PrimaryButton outline size="sm"`.
- Chaque fichier devient une carte : intitulé d’état en capitales, picto document, nom et taille. Corbeille `PrimaryButton outline tone="danger"` (« Supprimer … ») une fois importé, croix `GhostButton` sinon (« Annuler l’import de … » pendant l’envoi). Barre fine accent et pourcentage pendant l’envoi.
- Les libellés d’état changent (« En attente » → « Fichier en attente », « Terminé » → « Fichier importé », etc.) : adapter les sélecteurs de test qui les ciblent.
- Nouveau token `--cadence-color-surface-subtle` (`#fafafa`).

### ProgressBar : remplissage accent

- Le remplissage par défaut (`tone="default"`) passe de l’encre `--cadence-color-primary` à `--cadence-color-accent` (`#1b6cff`). `success` et `danger` sont inchangés ; `AlertToast` garde sa barre à la couleur de sa variante.

### Stories TimePicker : focus stable

- Les scénarios d’interaction sont exécutés uniquement en mode test (Vitest). Consulter une story ne déclenche plus de clics et de saisies automatiques qui déplacent le focus ou modifient sa valeur.

### Ouverture du TimePicker depuis un champ

- Variante champ compacte (heure et icône horloge) ouvrant le même panneau ancré que la variante bouton, conformément au fonctionnement de DatePicker.
- Saisie clavier dans le panneau Heures/Minutes ; les deux variantes conservent le brouillon jusqu’à Valider/Entrée. Annulation sur Échap, clic extérieur ou sortie au clavier.
- Recette de planification et accès via ErrorSummary adaptés aux champs fermés.

### Refonte du TimePicker

- Présentation du module horaire de DatePicker : cases Heures/Minutes, flèches par unité, saisie et collage HH:mm au clavier. Module interne TimeFields partagé.
- Variante `button` outline sm : panneau avec validation explicite, annulation, Échap et retour du focus. Validation native également prise en charge lorsque le panneau est fermé.
- Heures nocturnes, bornes, erreurs et pas de minutes conservés. Ref/id désormais sur la case des heures ; recettes et tests adaptés.

### Premier lot métier transport

- `ServiceCalendar` : période inclusive, semaine type, exceptions ajoutées/retirées, remplacement par date, aperçu de circulation et signalement des exceptions hors période. État contrôlé en dates civiles.
- `RouteStopList` : passages ordonnés, origine/terminus, horaires nocturnes, arrêts non desservis, boucles, chargement et état vide.
- Recette « Offre et qualité » : navigation SegmentedControl + SecondaryTab, calendrier et course nocturne ; rapport qualité avec bilan global, filtres, recherche et détail en Drawer. Données locales, sans analyse GTFS ni backend.
- Types publics, stories avec contrôles d’accessibilité bloquants, tests des règles de calendrier et documentation des limites.

### Unification du SegmentedControl

- L’apparence de `SegmentedControlAlt` devient l’unique `SegmentedControl` ; ancienne implémentation supprimée. Migration : remplacer les imports et types `SegmentedControlAlt*` par `SegmentedControl*` (props conservées). L’export Alt est supprimé.
- Formulaires et bascules de vue utilisent le même composant. Les parcours à plusieurs niveaux associent `SegmentedControl` et `SecondaryTab` (dans un `TabList level="secondary"`).
- DatePicker réutilise ce composant au lieu d’une copie interne. Groupe radio, focus déplacé avec les flèches, Début/Fin, mesure du segment au redimensionnement et mouvement réduit.

### Audit complémentaire des interactions

- `Modal` : identifiants de titre uniques et prop `aria-label` pour les dialogues sans titre visible.
- `Modal`/`Drawer` : gestion commune de la pile, Échap limité au premier plan, restauration exacte de `inert`/`aria-hidden` et verrouillage du scroll jusqu’à la dernière fermeture, même dans un ordre différent de l’ouverture.
- Piège à focus : exclusion des contrôles masqués, hors tabulation ou désactivés par un fieldset.
- `ErrorSummary` : les liens vers un conteneur ignorent les champs cachés, désactivés et inertes pour atteindre le premier contrôle utilisable.
- Scénarios de régression navigateur pour ces interactions.

### Compléments avant 1.0

- **`ErrorSummary`** : résumé de soumission invalide, région nommée et focalisable, liens vers un champ ou une zone par id/ref. Réutilisé dans l'import réseau.
- **`DescriptionList`** : métadonnées sémantiques, densité compacte/confortable, disposition horizontale/empilée, repli mobile et valeur vide explicite. Intégré au détail et à la vérification d'import.
- **`ActivityFeed`** : historique d'événements avec auteur, date absolue/fuseau explicite, état textuel, chargement et état vide. Intégré au détail de perturbation.
- **`TimePicker`** : heure seule HH:mm, mode de service jusqu'à 47:59, bornes, pas, clavier, annulation et erreurs. Validité HTML synchronisée pour empêcher la soumission d'un brouillon invalide. Nouvelle recette de planification nocturne associant les quatre composants.
- `Modal`/`Drawer` traitent Échap après le contrôle actif : un premier Échap peut annuler le brouillon d’heure sans fermer le dialogue, un second le ferme.
- Stories avec tests d'interaction et accessibilité bloquante, tests des utilitaires d'heure et documentation API. Aucune dépendance ajoutée ; manifeste inchangé.

### Composants additionnels et audit du 22 octobre 2026

- Dix composants exportés et documentés : `ProgressBar`, `InlineAlert`, `LineBadge`, `StopLabel`, `Accordion`, `Stepper`, `FileUpload`, `ExportMenu`, `ColumnManager`, `Gauge`.
- `DataTable.columnOrder` ; `AlertToast` réutilise `ProgressBar` ; `ActionMenu` et `ExportMenu` partagent une primitive de menu interne.
- Corrections de focus/clavier des menus (y compris passage vers une modale et menu entièrement désactivé), défilement interne et bornage des panneaux à l'écran.
- `ColumnManager` complète un ordre partiel, ignore doublons/inconnus et reçoit le focus à l'ouverture. `Accordion` respecte le mode single dès le montage.
- `FileUpload` : jokers MIME, extensions composées, taille limite à zéro, erreurs dans une liste HTML valide, états textuels, progression indéterminée sans valeur.
- `LineBadge` : couleurs GTFS sans `#` normalisées, repli noir pour assurer AA lorsque blanc/encre ne suffisent pas. `Gauge` : libellé d'objectif atteint/non atteint, nombres français, avertissement contrasté et mouvement réduit.
- `Stepper` : états textuels et empilement sur petit écran. `Checkbox` évite de faire défiler la page à l'activation par Espace. `TextInput` conserve erreur/succès au focus et utilise un texte d'aide contrasté.
- Recette de supervision avec colonnes et téléchargement CSV ; nouvelles recettes de détail de perturbation et d'import local avec correction d'erreurs. `Autocomplete multiple` est réutilisé.
- README remplacé par la documentation du projet et rapport d'audit ajouté. Aucun changement de version ni publication npm.

### Data viz v2

- **`LineChart`** (nouveau) : évolution d'une à huit séries, temporelles (axe de dates fr-FR adapté à l'étendue) ou catégorielles ; aires empilées ou non ; `thresholds` libellés (côté défavorable signalé selon `goodDirection`) ; `annotations` (trait ou bande datés) ; tooltip partagé ; navigation ←/→ au clavier avec annonce ; mode `compact` pour une `Card`.
- **`Heatmap`** (nouveau) : grille jour × heure ou ligne × jour sur une rampe séquentielle en 7 classes, légende avec bornes, cellules vides hachurées, grille accessible au clavier (flèches, Début / Fin, Entrée), `onCellClick`.
- **`BarChart`** (nouveau) : barres empilées ou groupées (`layout`), verticales ou horizontales (`orientation`), bâti sur les mêmes fondations que `LineChart` ; motif de remplissage par série en plus de la couleur, tooltip par catégorie avec total, navigation au clavier, « Voir les données ».
- **`BarList`** (nouveau) : classement horizontal (libellé `ReactNode`, barre, valeur mono, variation selon `goodDirection`), `limit` + « Voir tout », lignes cliquables.
- **Communs** : titre et description reliés, états `loading` / `empty` / `error` (`onRetry`), alternative tabulaire « Voir les données », tooltip dans un portail, largeur fluide, `prefers-reduced-motion`.
- **Dépendances** : `d3-scale` 4.0.2, `d3-shape` 3.2.0, `d3-array` 3.2.4 (calculs seulement, rendu SVG Cadence), externes au bundle.

### Dépréciation

- **`DataVisualization` est déprécié** (suppression en 1.0.0), remplacé par `BarChart`. Il reste utilisable : c'est désormais une enveloppe de `BarChart`, avec un avertissement en développement. Migration :
  ```tsx
  <DataVisualization type="horizontal" categories={lignes} series={[{ label: "Travaux", data }]} />                                   // avant
  <BarChart title="Retard par ligne" layout="grouped" orientation="horizontal" categories={lignes} series={[{ id: "works", label: "Travaux", data }]} />  // après
  ```
  `stacked-vertical` → `layout="stacked"`, `grouped-vertical` → `layout="grouped"`, `horizontal` → `layout="grouped" orientation="horizontal"` ; `showGridLines` → `showGrid` ; `title` obligatoire. Rendu modifié : celui de `BarChart` (motifs, tooltip, légende cliquable, alternative tabulaire).

### Tokens

- **Séries de data viz** : `--cadence-dataviz-series-1..8` dans `tokens.css`. Les anciens `--CAI-dv-series-1..8` restent valides (alias).
- ⚠️ **`series-4` (ambre) passe de `#f1a21b` à `#b36b00`** : 2,12:1 → 4,18:1 sur blanc. Toutes les séries atteignent désormais 3:1 .
- **Nouveaux** : rampe séquentielle `--cadence-dataviz-seq-1..7` (pétrole, `#eaf4f5` → `#004650`), `--cadence-dataviz-threshold`, `--cadence-dataviz-threshold-breach`, `--cadence-dataviz-annotation`, `--cadence-dataviz-annotation-band`.

### Recherche

- **`SearchInput`** (nouveau) : champ de recherche de 29px (la hauteur des boutons `sm`) avec loupe et bouton « effacer » ; Échap vide le champ. Il s'aligne sur les filtres en `variant="button"` (même hauteur, même bordure) mais s'en distingue par une forme de champ : coins de 8px et léger creux, là où les boutons sont des pilules en relief.
- **`FilterBar`** : la recherche est un `SearchInput` au lieu d'un `TextInput` de 40px. Même API (`search`), même temporisation de 300 ms.

### États & surcouches

- **`Skeleton`** (nouveau) : forme de chargement `text` / `rect` / `circle`, décorative (`aria-hidden` ; le conteneur porte `aria-busy`), pulsation coupée sous `prefers-reduced-motion`. Adopté en interne par `DataTable` (lignes squelettes) et `Card` (`loading`) — **rendu visuel inchangé**.
- **`EmptyState`** (nouveau) : états `empty` / `no-results` / `error` (ces deux derniers en `role="status"`), tailles `page` / `inline`, action principale (`PrimaryButton`) et secondaire (`GhostButton`). Remplace la recette 4 ; s'insère dans `DataTable.emptyState`.
- **`ActionMenu`** (nouveau) : menu d'actions par ligne (déclencheur `GhostButton` icône), pattern ARIA `menu`/`menuitem`, clavier complet (flèches, Début/Fin, saisie de la 1re lettre, Échap, Tab). Rendu en portail : non rogné par l'overflow d'un `DataTable`, y compris en colonne collée à droite. Items `tone="danger"`, `divider`, `disabled`.
- **`Drawer`** (nouveau) : panneau latéral droit (`md` 480px / `lg` 720px) pour le détail d'un élément sans quitter la liste ; voile, Échap, clic voile, bouton fermer, piège à focus et retour du focus ; entrée/sortie en `transform` (250 ms), coupées sous `prefers-reduced-motion`.
- **`Modal`** : passe sur les primitives de surcouche partagées (piège à focus et retour du focus désormais corrects). **API et rendu inchangés.**
- **Tokens** : `--cadence-color-skeleton` (aliasé sur `--cadence-color-surface-alt`).

## 0.4.0 — 2026-10-21

### Nouveau layout d'application

- **`AppLayout`** (nouveau) : squelette d'application. La `Sidebar` est à gauche, fondue dans le fond de l'app (couleur produit). Le contenu de la page est dans un conteneur blanc arrondi, bordé d'un liseré, avec un padding de `24px 32px`. Seul ce conteneur défile, et il suit la largeur de la Sidebar dépliée ou repliée sans aucune mesure côté app.
- **`Sidebar`** : nouvelles props `scope` (sélecteur de périmètre, ex-`Header`) et `user` (avatar, nom et email), affichées en pied. La Sidebar n'a plus d'arrondi ni d'ombre.
- **`DatePicker`, `DateRangePicker`, `Dropdown`** : nouvelle prop `variant="button"`. Le déclencheur prend le gabarit d'un `PrimaryButton outline size="sm"` (icône, valeur, chevron), à privilégier dans un dashboard. `DatePicker` et `Dropdown` gagnent aussi `aria-label`.
- **Boutons icône seule** (`GhostButton`, `PrimaryButton`) : le nom accessible (`aria-label`) s'affiche en infobulle, au survol après 300 ms et au focus clavier.
- **`CounterInput`** : les boutons − et + pleins sont remplacés par des `GhostButton size="sm"` icône seule, plus discrets, dans le cadre du champ. Le label s'affiche aussi correctement sans `TextInput` sur la page.
- **`PageHeader`** (nouveau) : en-tête de page avec fil d'Ariane facultatif, titre (`<h1>` display 22px), sous-titre et actions. Il reste collé en haut du conteneur d'`AppLayout` au défilement et prend un liseré quand le contenu passe dessous.
- **Popovers de `DateRangePicker`, `DatePicker` et `Dropdown`** : ils se décalent vers la gauche pour rester dans l'écran ou le conteneur, barre de défilement exclue. Avant, un déclencheur au bord droit d'un en-tête faisait sortir le popover de l'écran.
- **Barres de défilement personnalisées** : nouvelle classe `cadence-scrollbar` (tokens `--cadence-color-scrollbar-thumb` et `-hover`). Barre fine sans fond, curseur arrondi en retrait. Appliquée à `AppLayout`, `DataTable`, au corps de `Modal` et au menu d'`Autocomplete` ; utilisable dans les apps.
- **Menu de `Dropdown`** : options alignées sur les préréglages du `DateRangePicker` (13px, arrondies à 8px, fond gris au survol et à la sélection, sélection en gras avec une coche en pastille encre au lieu du bleu). Les préréglages passent aussi à un arrondi de 8px.
- **`SecondaryTab`** (nouveau) : onglet de sous-navigation (niveau 2), style ghost, compteur optionnel (`count`), sous une rangée de `Tab`.
- **`Dropdown`** : `groupLabel` sur une option ouvre un groupe d'options avec en-tête.
- **`TabList`** (nouveau) : conteneur `role="tablist"` des rangées de `Tab` et de `SecondaryTab`. `aria-label` requis, *roving tabindex* (seul l'onglet actif est tabulable), ←/→ en boucle, Début / Fin, activation automatique (`activation="manual"` en option), `level="primary" | "secondary"` pour l'écart. `Tab` et `SecondaryTab` gagnent `id` / `controls` (lien vers le `tabpanel`) et avertissent en développement s'ils sont rendus hors d'un `TabList` (rendu inchangé).
- **`Breadcrumbs`** : `BreadcrumbItem.content` (`ReactNode`) remplace le rendu du libellé, par exemple `<Dropdown variant="button" />` comme sélecteur de contexte. Le `<li>` et les séparateurs sont conservés ; `label` reste requis et nomme l'élément.
- **`Card`** (nouveau) : carte de tableau de bord qui réunit les anciens `KpiCard` et `ActionCard`. Seul le titre est obligatoire ; elle peut porter une valeur et son évolution, une mini-courbe, un statut, une description, un bouton d'action `PrimaryButton outline sm` et une illustration. Interactive par `onClick` (toute la carte) ou par son bouton (exclusifs, imposé par le typage), elle se soulève alors au survol.

### Correctifs

- **`CounterInput`** : la valeur est arrondie au pas **puis** bornée. Elle ne dépasse plus `max` (`max={58} step={5}` donnait 60, donne maintenant 58). « − » et « + » ne se désactivent que si la valeur est déjà sur la borne : sinon ils vont jusqu'à elle (`value={5} step={15} min={0}` : « − » donne 0 au lieu d'être désactivé). Un pas décimal (`0.5`) ne produit plus d'erreur d'arrondi.
- **Accessibilité de `Dropdown`** :
  - la liste ouverte porte le nom du champ (`aria-labelledby` vers le `label`, sinon `aria-label`) au lieu d'un « Options » figé ;
  - les options d'un même `groupLabel` sont dans un `role="group"` nommé par son en-tête, qui n'est plus masqué aux lecteurs d'écran ;
  - le placeholder passe au contraste AA (`--cadence-color-placeholder`).

### ⚠️ Changements cassants

- **`KpiCard` est supprimé, remplacé par `Card`.** Migration : `label` devient `title` (rendu en titre `<h3>` par défaut, `headingLevel` pour l'ajuster) ; les autres props sont inchangées (`value`, `unit`, `format`, `delta`, `goodDirection`, `status`, `statusLabel`, `trend`, `description`, `loading`, `onClick`). Le type `KpiCardDelta` devient `CardDelta`.
- **`TableCardAction` est supprimé**, remplacé par `GhostButton size="sm"` en icône seule (infobulle intégrée) :
  ```tsx
  <TableCardAction icon="trash" label="Supprimer" destructive />                 // avant
  <GhostButton size="sm" icon="trash" aria-label="Supprimer" tone="danger" />  // après
  ```
- **`Header` est supprimé**, remplacé par les props `scope` et `user` de `Sidebar` (en pied) :
  ```tsx
  <Header leftContent={<Dropdown options={reseaux} value={reseau} onChange={setReseau} />} rightContent={<Avatar name="Hector Malot" showProfile />} />  // avant
  <Sidebar … scope={{ options: reseaux, value: reseau, onChange: setReseau }} user={{ name: "Hector Malot" }} />                                      // après
  ```
- **`NavigationDropdown` est supprimé**, remplacé par `Dropdown variant="button"` (avec `groupLabel` pour les sections) :
  ```tsx
  <NavigationDropdown label="Produit" items={produits} onSelect={setProduit} />                                    // avant
  <Dropdown variant="button" aria-label="Produit" options={produits} value={produit} onChange={setProduit} />      // après
  ```
- **Migration du layout.** Remplacer le squelette de l'ancienne recette 1 (Sidebar en `position: fixed`, `useElementWidth`, `marginLeft`, `HEADER_HEIGHT`) par `<AppLayout sidebar={<Sidebar … />}>{page}</AppLayout>`.
- **Usage de `--cadence-z-sticky`.** Le token est conservé, mais il ne sert plus à la Sidebar ni au Header.

## 0.3.1

Correctifs, aucune API cassée.

- **`DataTable` : accents des en-têtes rognés.** Les capitales accentuées (« ARRÊT », « DÉBUT », « SÉVÉRITÉ ») et la cédille étaient coupées (`line-height: 1` avec `overflow: hidden`). Hauteur d'en-tête inchangée (40px). Story de non-régression `DataTable / Accents`.
- **`Link variant="secondary"` retiré de nos exemples** (recette 3, guide « Page formulaire », stories de `Link`) : la variante est dépréciée depuis la 0.3.0. Un test empêche sa réapparition.
- **Plus de libellé de repli « Label » sur les boutons.** ⚠️ Changement de comportement : un `PrimaryButton` (ou un `SecondaryButton`) sans `label` ni `icon` n'affiche plus « Label ». Il reste vide, et une erreur est émise en développement (`label` ou `icon` + `aria-label` est requis). `GhostButton` se comporte désormais exactement de la même façon, y compris pour une icône seule sans `aria-label` (nom accessible déduit de l'icône, avec un avertissement).

## 0.3.0

### Boutons v2

Les actions s'organisent en **trois niveaux** :
1. `PrimaryButton` : action principale, un seul (plein) par vue ;
2. **`GhostButton`** (nouveau) : actions secondaires, sans fond ni bordure au repos — ou `PrimaryButton outline` pour les actions secondaires d'un **dashboard** ;
3. `Link hideArrow` : 3e action d'un groupe, ou action dans une phrase.

**Nouveau**
- `GhostButton`. Même API et mêmes dimensions que `PrimaryButton` :
  - `tone="default" | "danger"`, `size="sm" | "md"` (plus de grande taille) ;
  - `iconStart` / `iconEnd` ;
  - `icon` + `aria-label` (obligatoire, typé) ;
  - `loading`, `fullWidth`, `type`, `forwardRef`.
- `PrimaryButton` adopte la même API. Survol, appui et focus passent en CSS (plus de `state` JS). Sa variante **`outline`** est conservée (non dépréciée) : contour visible, pour les actions secondaires d'un dashboard.
- Textes d'action ramenés entre **11 et 13px** : boutons `sm` 11 / `md` 12px (contre 11 / 13), `Link` 11 / 12 / 13px (contre 12 / 14 / 16).
- **Plus de grande taille de bouton** : `size="large"` (0.2) est rendu en `md` (34px au lieu de 46px). Fins de formulaire, créations de dashboard et empty states passent en `md`.
- Focus clavier visible partout : `--cadence-focus-ring` sur `:focus-visible`.
- Nouveaux tokens :
  - `--cadence-color-danger-hover`, `-danger-active`, `-danger-text`, `-danger-border` ;
  - `--cadence-color-primary-hover`, `--cadence-color-link` ;
  - `--cadence-color-hover-overlay`, `-active-overlay`, `-danger-hover-overlay`, `-danger-active-overlay`.
- Story **Actions / Matrice** : tous les boutons × tons × tailles × états.

**Changements visuels**
- Le **bleu plein disparaît des actions**. Les anciens `SecondaryButton` pleins sont rendus en `PrimaryButton size="sm"` (encre). `--cadence-color-accent` est réservé aux états.
- **Les actions secondaires internes passent en ghost** (sans bordure, voile au survol) : pied de `Modal` (« Annuler »), 1re action d'`AlertToast`, « Annuler » de `DateRangePicker`. Les `PrimaryButton outline` des applications gardent leur contour.
- « Valider » de `DatePicker`, « Appliquer » de `DateRangePicker` et l'action pleine d'`AlertToast` passent du bleu à l'encre.
- « Tout effacer » de `FilterBar` passe d'un lien bleu à un `GhostButton size="sm"`.
- Les anciens `SecondaryButton` passent d'un rayon de 6px à la pilule. Les boutons à icône seule deviennent carrés.
- Le rouge plein passe de `#de353e` (4,48:1, sous AA) à `--cadence-color-danger` (`#da1e28`, 5,0:1).
- Reliefs internes des boutons plus discrets (liserés de 1px). Au survol, la couleur fonce d'un cran (plein et `outline`) au lieu d'ajouter une ombre portée.
- `Link` :
  - `#0f62fe` → `--cadence-color-link` (`#1d4ed8`, AA aussi sur `surface-alt`) ;
  - `#dc2626` → `--cadence-color-danger-text` ;
  - une action (`Link` sans `href`) ne se coupe plus sur plusieurs lignes.

**Dépréciations** (acceptées en 0.3.0, avertissement en développement une seule fois, **suppression en 1.0.0**)

| Avant | Après |
|---|---|
| `PrimaryButton outline` | inchangé (variante conservée) — ou `GhostButton` hors dashboard |
| `SecondaryButton outline` | `PrimaryButton outline size="sm"` |
| `SecondaryButton` plein | `PrimaryButton size="sm"` ou `GhostButton size="sm"` selon le rôle |
| `destructive` | `tone="danger"` |
| `size="medium"` / `"large"` | `"md"` (défaut, plus de grande taille) |
| `withIcon="left"` / `"right"` + `icon` | `iconStart` / `iconEnd` |
| `withIcon="only"` + `icon` | `icon` + `aria-label` |
| `state` | supprimé (`"disabled"` → `disabled`) |
| `Link variant="secondary"` | `Link` (identique) |

**Migration**

```bash
# Simulation (liste des fichiers et des « TODO buttons-v2 » à relire)
node node_modules/@ddaoellena/cadence-ui/scripts/codemods/buttons-v2.mjs --dry src
# Application
node node_modules/@ddaoellena/cadence-ui/scripts/codemods/buttons-v2.mjs src
```

- Le codemod traite les `.ts` / `.tsx` / `.js` / `.jsx` et les blocs ```tsx des `.md` / `.mdx`, et met à jour les imports. Il nécessite `typescript` dans le projet.
- Il ne sait pas deviner le rôle d'un `SecondaryButton` plein (principal ou secondaire ?). Il laisse alors un commentaire `TODO buttons-v2` à relire.

### Inclus depuis la 0.1.6 (0.2.0, non publiée)

- `DataTable` (tri, sélection, virtualisation, modes client / serveur), `Pagination`, `FilterBar`.
- `KpiCard`, `DateRangePicker` ; `DatePicker` navigable au clavier (calendrier interne partagé).
- `Checkbox` : `aria-label` optionnel.
- Tokens de statuts, thèmes produits, élévation, focus et couches (z-index).
- Libellés de `DatePicker` et d'`AlertToast` en français.
- Icônes `@untitledui/icons` en SVG inline (plus aucune URL distante).
- Nouvelles dépendances : `@tanstack/react-table`, `@tanstack/react-virtual`.
