# Proposition — `SankeyChart` (flux)

Statut : **décisions prises à l'implémentation** (lot 0.9.6), à relire. Feuille de route :
[§ 4 bis](0.9.0-dataviz-et-1.0.md).

## Besoin

Montrer des **flux** entre étapes : origine → destination, correspondances entre modes,
répartition d'un volume. Complète la matrice origine-destination (`Heatmap showTotals`,
lot 0.9.2) quand on veut lire le chemin des volumes plutôt que les valeurs croisées.

## Décisions

| Sujet | Décision | Raison |
|---|---|---|
| Moteur | Mise en page **maison**, sans `d3-sankey` | `d3-sankey` 0.12.3 dépend de `d3-array` 1–2 et `d3-shape` 1 : doublons des versions 3 déjà utilisées |
| Colonnes | `column` explicite sur chaque nœud, sinon déduite (plus long chemin depuis une source) | Les flux transport ont souvent des étapes fixes (origine, correspondance, destination) |
| Ordre dans une colonne | Ordre fourni ; liens triés par position de la cible / de la source | Lisible et stable d'un rafraîchissement à l'autre |
| Couleur | Une couleur **et** un motif par nœud de la première colonne ; les rubans prennent la couleur de leur source | Suit l'origine du flux sans dépendre de la couleur seule (le chemin est aussi écrit) |
| Lisibilité | Pas de regroupement automatique : au-delà d'une douzaine de nœuds par colonne, regrouper côté application | Regrouper des nœuds oblige à réécrire leurs liens ; l'application connaît le bon regroupement (« Autres gares ») |
| Clavier | Parcours des **liens** (←/→), puis Entrée ; annonce « Châtelet → La Défense : 88 k voyages, 40 % des départs de Châtelet » | Le lien porte l'information ; les nœuds sont résumés dans le tableau |
| Alternative | « Voir les données » : origine, destination, volume, part de l'origine | — |
| Cycles | Non pris en charge (graphe orienté sans cycle) : les liens qui créent un cycle sont ignorés, signalés en développement | Un Sankey ne représente pas les boucles |

## Limites

- Pas de réordonnancement automatique pour minimiser les croisements (ordre fourni).
- Pas de glisser-déposer des nœuds.
