# Audit complémentaire des interactions — 22 octobre 2026

Audit du code existant et corrections locales sur la branche `feat/additional-components`. Les modifications déjà présentes ont été conservées.

## Périmètre

Lecture des règles du projet, du manifeste, des configurations de compilation et des composants Modal, Drawer, primitives de surcouche, ErrorSummary, TimePicker, ActivityFeed, Accordion, FileUpload, ColumnManager et menu partagé. Priorité aux interactions entre composants et à la navigation clavier. Cet audit ciblé ne constitue pas une certification exhaustive d’accessibilité, de sécurité ou de compatibilité React 18.

## Problèmes corrigés

| Priorité | Constat | Correction |
|---|---|---|
| P1 | Plusieurs surcouches écoutaient Échap et Tab indépendamment, avec fermeture possible de plusieurs dialogues. | Pile partagée : seul le dernier ouvert traite le clavier. Un contrôle enfant peut toujours consommer Échap. |
| P1 | Fermer une surcouche en arrière-plan pouvait déverrouiller le scroll alors qu’une autre restait ouverte. | Verrouillage conservé jusqu’à la dernière fermeture ; fermeture en arrière-plan sans déplacement du focus. |
| P2 | Toutes les modales utilisaient `modal-title`, et une modale sans titre n’avait pas de nom accessible. | Identifiant React unique ; prop optionnelle `aria-label`, avec repli « Dialogue ». |
| P2 | La restauration du fond supprimait un `aria-hidden` préexistant. | Sauvegarde et restauration exactes des attributs `inert` et `aria-hidden`. |
| P2 | Le piège à focus incluait certains contrôles invisibles, hors tabulation ou désactivés par un fieldset. | Filtrage de la visibilité, du tabindex, de l’état natif disabled et des ancêtres inertes. |
| P2 | ErrorSummary pouvait cibler un input caché avant le bouton utilisable d’un conteneur. | Recherche du premier contrôle visible, non désactivé et non inerte. |

## Vérification

- Suite globale : 653 tests réussis dans 91 fichiers.
- Un scénario supplémentaire de confirmation Modal dans un Drawer ajouté ensuite : les 12 stories Modal passent, soit 654 tests distincts couverts au total.
- Régressions : titres distincts, Tab et Maj+Tab, Échap par niveau, fermeture en arrière-plan, restauration du scroll et des attributs, retour du focus, contrôles cachés/désactivés, confirmation dans un Drawer.
- TypeScript et ESLint des fichiers modifiés : réussis.
- Builds de la bibliothèque et de Storybook : réussis.
- Les nouvelles stories imposent les contrôles automatisés d’accessibilité (`a11y.test: error`).

## Limites et suite conseillée avant 1.0

- La suite globale émet encore des avertissements de dépréciation et deux avertissements React de champs contrôlés sans onChange dans les exemples existants. Ils n’échouent pas les tests ; leur nettoyage reste distinct des corrections ci-dessus.
- La compatibilité déclarée React 18/19 n’a pas été testée ici dans deux installations séparées.
- Avant publication, tester le paquet dans une application consommatrice, notamment les menus en portail dans des dialogues et les parcours au lecteur d’écran. Les tests automatisés ne remplacent pas cette vérification.
- Version conservée à 0.5.0. Pas de dépendance ajoutée.
