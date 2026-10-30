# Étude de cas — migration de Traffic Report

Formulaire de déclaration de perturbation et tableau de bord, reconstruits depuis des captures, puis migrés vers Cadence entre le 28 et le 30 octobre 2026. Référence applicative : `57485ec2e81d0f861fef1f9e1d6ef9df31dab0a9`.

Ce document illustre le [guide de migration](../MIGRATION-TO-CADENCE.md). **Les décisions ci-dessous sont propres à Traffic Report** : elles ne deviennent pas des règles Cadence. Il s'agit d'un prototype à données fictives : aucun backend, aucune diffusion voyageurs, un stockage local au navigateur.

## Parcours migré

D'abord un prototype HTML/JS, puis React compilé avec esbuild, enfin React + Vite. Cadence est embarqué par une copie sélective (`vendor/cadence-ui`), avec un manifeste de provenance et les polices servies depuis `/fonts`.

Ordre suivi : contrôles élémentaires, coque, sections, feedback, tokens, validation, responsive, pied d'actions. Les premières versions recréaient des contrôles faute d'avoir consulté la source de Cadence : c'est la principale source de reprises.

## Résultat

- Tableau de bord (`#dashboard`) : quatre statuts, vue par perturbation ou par impact, recherche, filtres combinés, tri, pagination, sélection multiple.
- Déclaration (`#declaration`) : six étapes, dont Informations générales, commune, et cinq étapes propres à chaque impact (Objets impactés, Sévérité, Périodes / créneaux, Messages, Résumé).
- « Créer la perturbation » toujours visible, activé après validation des messages de tous les impacts et des informations générales ; le résumé n'est pas un prérequis.

Les documents antérieurs décrivant cinq étapes, les Options d'affichage ou un formulaire centré sur `ErrorSummary` sont historiques.

## Mapping principal

| Zone | Composition | Décision |
|---|---|---|
| Coque | `AppLayout`, `Sidebar`, `PageHeader`, `Breadcrumbs` | Réutiliser |
| Section | `PageSection`, avec une surface locale à titre extérieur | Composer, intégré depuis à Cadence (`surface="elevated"`) |
| Informations générales | `Accordion` « Détails de la perturbation » dans la section, `Indicator` « Remplie » / « À compléter » | Composer |
| Sévérité | `Dropdown` avec `divider` avant « Service modifié » | Réutiliser |
| Dates | Deux `DatePicker withTime` | Réutiliser : `DateRangePicker` ne gère pas les heures |
| Message | `TextArea` | Réutiliser. Texte riche de la maquette non repris |
| Liste du tableau de bord | `TableCard` + `TableHeader` + `Pagination` + `BulkActionBar` | Réutiliser. « DataCard » désignait la maquette, pas une API |
| Objets impactés | `PageSection surface="card"` avec `iconElement` | Composer |
| Consultation et suppression | `Drawer`, `Modal` | Réutiliser |
| Pied d'actions | `CompactImpactStepper`, `ProgressBar`, `FormActions` | Composer, intégré depuis à Cadence (`AppLayout footer`, `Stepper density="compact"`) |
| Schéma de conséquences | SVG animé spécifique | Spécifique justifié |

## Décisions et exceptions conservées

| Décision | Justification | Portée |
|---|---|---|
| Boutons `size="sm"` dans le formulaire | Choix de densité validé | Traffic Report ; la règle Cadence reste `md` en fin de formulaire |
| Disclosure en graisse 400, padding 16/20 | Alignement sur le titre de section | Local |
| Grille 2:1 intitulé/cause | Proportion voulue, que `FieldRow` aurait égalisée | Local |
| Cause en `Dropdown` | `SegmentedControl` non retenu | Local |
| Six couleurs de sévérité (`--tr-*`) | Métier ; contraste et officialisation non tranchés | Local, ne sont pas des tokens Cadence |
| Bus latéral animé | `ModeIcon mode="bus"` essayé sur une branche, puis abandonné : un pictogramme frontal perd le sens du déplacement | Ne pas réintroduire automatiquement |
| Schéma de conséquences | `LineDiagram` supervise des véhicules et ne montre ni ruptures ni demi-tours | Spécifique |
| Aucun style JSX applicatif | Convention du projet | Ne pas généraliser : Cadence autorise le layout inline |
| Toast plutôt qu'`ErrorSummary` pour les oublis | Le focus automatique du résumé renvoyait en haut de page, loin des actions | Local ; `ErrorSummary` reste pertinent ailleurs |
| Infobulles réduites au verbe (Dupliquer, Modifier, Consulter, Supprimer) | L'infobulle de `BaseButton` reprend `aria-label` ; le titre y était répété | Local, sans nouvelle prop |
| En-têtes d'objet à 44 px (icône 24 + padding 10 × 2) | Densité mesurée, sans hauteur fixe | Local |
| Progression sans arrondi | Demande produit, classe `declaration-progress` | Local |

## Défauts rencontrés

**Menus coupés.** `PageSection surface="card"` a coupé le menu Sévérité. Une fois ce point corrigé, `Accordion` a coupé le menu Cause. C'étaient deux ancêtres différents, et aucun `z-index` n'aurait suffi. Dans Cadence, `Accordion` ne coupe plus son contenu une fois ouvert ; `surface="card"` conserve son `overflow: hidden`.

**Date non confirmée.** Après passage à `DatePicker` en variante champ, une frappe en cours pouvait laisser valider l'ancienne valeur. Le produit suit un état `datePending` et stabilise ses `Date` par `useMemo`. Le contournement inspecte le DOM ; Cadence fournit depuis `onInputStateChange`.

**Avancement hérité.** Les étapes étaient déduites de l'index courant. Chaque impact porte désormais ses propres étapes ; modifier une étape invalide les suivantes.

**Drawer sans animation.** Monté directement ouvert après un chargement différé, le `Drawer` sautait son entrée. Le produit le montait fermé, puis l'ouvrait par un effet. Corrigé dans Cadence : ce contournement est retirable après mise à jour.

**Jonction de cartes.** Un fond blanc apparaissait derrière les coins arrondis, malgré un gap nul. Le fond du wrapper a été aligné sur celui de l'en-tête.

**Mobile.** À 390 px, la `Sidebar` ouverte rendait le formulaire inutilisable. La navigation est passée dans une `Modal`.

## Tests et limites

Dernier état applicatif rapporté : 37 tests de règles métier, contrôle statique des tokens et build Vite réussis. Les contrôles navigateur étaient ponctuels (notamment 390 et 1280 px) : ce n'est pas une suite end-to-end, ni une campagne sur tous les écrans.

Restent ouverts : géométrie limitée à six arrêts fictifs, identifiants locaux sans référentiel transport, fuseau du navigateur, absence de concurrence serveur, et propriétés d'informations générales en attente d'un catalogue. Un socle React + Vite ne prouve pas la tenue à fort volume.

## Après la mise à jour de Cadence

Traffic Report a synchronisé sa copie sur `cb11f6e` dans `691a373` et adopté `AppLayout footer`, `PageSection surface="elevated"`, `Stepper density="compact"`, le placement des surcouches, les erreurs de champs et `onInputStateChange`.

Choix produit conservés : sélecteur `Dropdown` sur mobile et `TextArea` pour les messages. Des surcharges de classes internes subsistent, suivies dans la [liste du refactoring v2](../proposals/refactoring-v2.md) (projet 12).
