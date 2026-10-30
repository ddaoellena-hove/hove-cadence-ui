# Backlog issu de Traffic Report

État au 30 octobre 2026. Les éléments non réalisés sont des **propositions** : leurs noms ne sont pas des API. Priorités : P1 fondations et patterns déjà utilisés, P2 extension réutilisable, P3 bibliothèque métier distincte.

## Réalisé sur `feat/cadence-migration`

Non publié sur npm.

| Réf. | Livraison |
|---|---|
| E1 | `PageSection surface="elevated"` et `bodyPadding` |
| E2 | `Stepper density="compact"`, `context`, `tooltipPlacement`, `steps[].icon`, `steps[].available` |
| E3 | `AppLayout footer` et `footerPadding`, toasts au-dessus du pied |
| E4 | `Drawer` : entrée animée quand il est monté ouvert |
| — | `FieldRow` : repli en une colonne à 1024 px, conforme à ce qu'annonçait le pattern Formulaire |
| — | `Accordion` : le contenu ouvert ne coupe plus les menus |

Écart assumé pour E2 : pas de sélecteur `Dropdown` intégré sur mobile. Les icônes passent à la ligne, car `Dropdown` ne sait pas s'ouvrir vers le haut sans E5.

## Restant

| Réf. | Besoin | Priorité | Point de départ vérifié |
|---|---|---|---|
| N1 | `FormField` : libellé, aide, erreur, associations accessibles | P1 | Ne pas doubler les libellés de `TextInput` et `TimePicker` |
| N2 | Positionnement partagé des overlays | P1 | `placeAnchored` et `useAnchoredPanel` existent déjà, avec retournement et portail (`Popover`, menus, `ColumnManager`). À **étendre**, pas à recréer |
| E5 | Haut/bas et clipping de `Dropdown`, `Autocomplete`, `DatePicker`, `TimePicker`, `Tooltip` | P1 | `Dropdown`, `DatePicker`, `DateRangePicker` et `TimePicker` utilisent `usePopoverFit`, horizontal seulement. Fondé sur N2 |
| E6 | Contrat de saisie de `DatePicker` : en cours, confirmation, annulation, effacement | P1 | `onChange` ne remonte qu'une `Date` confirmée ; ne pas créer de `DateTimePicker` |
| E7 | Contrat de validation commun | P1 | `Dropdown` et `DatePicker` n'ont aucune prop d'erreur ; `TimePicker` a `error` ; `TextInput` a `state` + `helperText` |
| N3 | Éditeur de texte riche | P2 | Format stocké et assainissement à définir |
| N4 | Groupes de champs répétables | P2 | La numérotation n'est jamais l'identité |
| E8 | Case avec libellé compact | P2 | Examiner `RichCheckbox` d'abord |
| R1 | Recette : sélection transactionnelle multiple | P2 | `Drawer`, `Autocomplete`, `ModeFilter`, `TableCard` |
| R2 | Recette : périodes et créneaux récurrents | P2 | `DatePicker`, `TimePicker`, groupes répétables |
| R3 | Recette : messages par canal et traductions | P2 | Dépend de N3 pour le texte riche |
| M1 | Objets de transport et schéma de conséquence | P3 | Bibliothèque métier distincte, hors noyau |

Ordre conseillé : N2 puis E5 ; N1 puis E7 ; E6 ; puis N3 et N4 ; enfin les recettes. Chaque contribution comprend API, stories (états, libellés longs, clavier, responsive), tests, guidelines et retrait des contournements devenus inutiles.

## Points à arbitrer

- Mobile du `Stepper` compact : conserver les icônes à la ligne, ou prévoir un sélecteur une fois E5 livré.
- `surface="card"` garde `overflow: hidden` : ses menus internes peuvent être coupés. Retirer cette règle demanderait de vérifier les contenus bord à bord qui comptent sur l'arrondi.
- Couleurs de sévérité : officialisation éventuelle, après contrôle des contrastes.
- `FieldRow` se replie selon la fenêtre, pas selon la place disponible : à reconsidérer avec une container query si cela gêne dans un `Drawer` étroit sur grand écran.
