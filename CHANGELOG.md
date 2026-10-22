# Changelog — @ddaoellena/cadence-ui

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
