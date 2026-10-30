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

Sur `feat/overlays-placement` : **N2 + E5**. `usePopoverFit` gère aussi l'axe vertical ; `placement` (`auto`, `top`, `bottom`) sur `Dropdown`, `Autocomplete`, `DatePicker`, `DateRangePicker`, `TimePicker` ; `Autocomplete` adopte le recalage ; infobulle des boutons retournée. Portail non retenu : il obligerait à revoir clic extérieur, ARIA et focus de ces champs, alors que le retournement couvre les cas constatés.

Sur la même branche : **N1, E7, E6**. `FormField` ; `error`, `helperText`, `required` et ref sur `Dropdown`, `Autocomplete`, `DatePicker` ; `required` sur `TextInput` et `TextArea` ; `DatePicker` : `onInputStateChange`, `clearable`, `onClear`, comparaison de `value` par instant. `onChange` reste typé `Date` pour ne casser aucun consommateur : d'où `onClear`, distinct. `TextInput` garde `state` + `helperText`, sans `error`. Pas de lecture seule ajoutée.

Sur `feat/rich-text-repeatable` : **N3, N4**. `RichTextEditor`, `RichTextContent` et `RepeatableFieldGroup`. Format stocké : JSON restreint (`RichTextDocument`), jamais de HTML. Aucune dépendance ajoutée : `contentEditable` + `document.execCommand`, relus par liste blanche. Fonctions de la maquette non reprises : voir arbitrages.

Écart assumé pour E2 : pas de sélecteur `Dropdown` intégré sur mobile. Les icônes passent à la ligne ; un sélecteur peut désormais s'ouvrir vers le haut si le produit le préfère.

## Restant

| Réf. | Besoin | Priorité | Point de départ vérifié |
|---|---|---|---|
| E8 | Case avec libellé compact | P2 | Examiner `RichCheckbox` d'abord |
| R1 | Recette : sélection transactionnelle multiple | P2 | `Drawer`, `Autocomplete`, `ModeFilter`, `TableCard` |
| R2 | Recette : périodes et créneaux récurrents | P2 | `DatePicker`, `TimePicker`, groupes répétables |
| R3 | Recette : messages par canal et traductions | P2 | Dépend de N3 pour le texte riche |
| M1 | Objets de transport et schéma de conséquence | P3 | Bibliothèque métier distincte, hors noyau |

Ordre conseillé : E8, puis les recettes. Chaque contribution comprend API, stories (états, libellés longs, clavier, responsive), tests, guidelines et retrait des contournements devenus inutiles.

## Points à arbitrer

- Mobile du `Stepper` compact : conserver les icônes à la ligne, ou composer un sélecteur.
- `surface="card"` garde `overflow: hidden` : ses menus internes peuvent être coupés. Retirer cette règle demanderait de vérifier les contenus bord à bord qui comptent sur l'arrondi.
- `RichTextEditor` : `document.execCommand` est dépréciée. Si le navigateur la retire ou si Firefox et Safari divergent, passer à une bibliothèque d'édition (ProseMirror) sans changer le format stocké. Les fonctions avancées de la maquette ne sont pas reprises.
- Couleurs de sévérité : officialisation éventuelle, après contrôle des contrastes.
- `FieldRow` se replie selon la fenêtre, pas selon la place disponible : à reconsidérer avec une container query si cela gêne dans un `Drawer` étroit sur grand écran.
