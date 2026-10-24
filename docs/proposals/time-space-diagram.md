# Proposition — `TimeSpaceDiagram` (graphique espace-temps de Marey)

Statut : **validée** (25 octobre 2026) : arrêts de haut en bas dans l'ordre de l'aller, théorique et réalisé ensemble, ↑/↓ le long de la course, échelles fit / 2 h / 1 h, filtrage par l'application au-delà de ~300 courses. Lot 0.9.5 de la
[feuille de route](0.9.0-dataviz-et-1.0.md) (§ 4 bis).

## 1. Besoin

Lire les **horaires d'une ligne** et leur exploitation sur une journée : une
course est une ligne brisée qui descend (ou monte) les arrêts au fil du temps.
C'est le graphique de référence des concepteurs d'offre et des régulateurs
(graphique de Marey), absent des bibliothèques génériques.

| Question | Réponse visuelle |
|---|---|
| Quelle est la fréquence, où sont les trous et les paquets ? | Espacement horizontal entre les courses d'un même sens |
| Où et quand les courses se croisent-elles (voie unique, terminus) ? | Croisement des lignes de sens opposés |
| Où la course perd-elle du temps ? | Pente plus faible (plus horizontale) sur un tronçon ; arrêt prolongé = palier |
| La course réalisée suit-elle l'horaire théorique ? | Tracé réalisé plein sur le théorique en pointillé, écart au survol |
| Où est la ligne maintenant ? | Repère vertical « maintenant » (option) |

Hors périmètre : édition des horaires (glisser une course), optimisation,
graphe réseau multi-lignes.

## 2. Maquette

```
 Ligne 13 — graphique espace-temps            ← Fenêtre  05h30 → 09h30   Échelle [Ajuster|2 h|1 h]   Voir les données
            05h30      06h00      06h30      07h00      07h30      08h00   maintenant ┆ 08h30
 St-Denis U ●╲─────────●╲───────────●╲────────╱●──────────●╲─────────●╲──────────┆─────────
 Basilique   ╲          ╲            ╲      ╱             ╲          ╲          ┆
 Pleyel        ╲          ╲            ╲  ╱                 ╲          ╲        ┆
 Saint-Ouen      ╲─╮        ╲            ╳                    ╲          ╲      ┆
 Garibaldi         ╰╲         ╲        ╱   ╲                    ╲          ╲    ┆
 Clichy              ╲          ╲    ╱       ╲                    ╲          ╲  ┆
 Saint-Lazare          ╲          ╲╱           ╲                    ╲          ╲┆
 Montparnasse           ●          ●             ●                    ●          ┆●
   ── réalisé   ┄┄ théorique   ╳ croisement   ─╮ palier (arrêt prolongé)
```

- **X** : heures de service (« 24h30 » après minuit, comme `LineChart serviceTime`), fenêtre réglable.
- **Y** : arrêts dans l'ordre de l'aller (de haut en bas), espacement **régulier** par défaut, à l'échelle des distances si chaque arrêt en a une — même règle que `LineDiagram`.
- **Courses** : une ligne brisée par course, une couleur par sens (aller / retour) **et** un motif de trait ; une course en incident ou supprimée a son style propre (§ 4).

## 3. API proposée

```ts
interface TimeSpaceStop {
  id: string;
  name: string;
  /** Position le long de la ligne (km) ; absente → espacement régulier. */
  distance?: number;
}

interface TimeSpacePassage {
  stopId: string;
  /** Heure de service « HH:mm » ou « HH:mm:ss » (jusqu'à 47:59). */
  arrival?: string;
  departure?: string;
}

interface TimeSpaceTrip {
  id: string;
  /** Numéro de course ou de parc, lu et affiché au survol (« 13-0712 »). */
  label: string;
  direction: "outbound" | "inbound";
  /** Horaire théorique, dans l'ordre de parcours. */
  scheduled: TimeSpacePassage[];
  /** Réalisé (temps réel ou historique) : tracé plein, l'horaire passe en pointillé. */
  actual?: TimeSpacePassage[];
  /** "cancelled" : course supprimée (tracé estompé barré) ; "incident" : incident en cours. */
  status?: "normal" | "cancelled" | "incident";
  note?: string;
}

interface TimeSpaceDiagramProps extends ChartCommonProps {           // title, états, framed, freshness, exportable…
  line: { code: string; color?: string; textColor?: string; mode?: LineMode };
  stops: TimeSpaceStop[];                                              // ordre de l'aller, de haut en bas
  trips: TimeSpaceTrip[];
  /** Fenêtre affichée (heures de service). Défaut : englobe les courses, arrondie au quart d'heure. */
  range?: [string, string];
  /** Échelles proposées dans le sélecteur (durée visible dans la largeur). Défaut ["fit", "2h", "1h"]. */
  scales?: ("fit" | "4h" | "2h" | "1h" | "30min")[];
  /** Repère « maintenant » (heure de service). */
  now?: string;
  /** Sens affichés. Défaut "both". */
  show?: "both" | "outbound" | "inbound";
  /** Libellés des sens. Défaut : « Vers <terminus> ». */
  directions?: { outbound?: string; inbound?: string };
  onTripClick?: (trip: TimeSpaceTrip) => void;
}
```

- **Contrôlé**, comme `LineDiagram` : l'application fournit les courses (GTFS `stop_times`, temps réel) ; aucune requête.
- **Fenêtre et échelle** reprennent le bandeau de `Timeline` / `JourneyTimeline` (`TimelineShell` : « Fenêtre », sélecteur d'échelle `SegmentedControl size="sm"`, défilement horizontal) : pas de zoom libre au départ.
- Contrat commun via `ChartFrame` : titre, états, `framed`, `freshness`, `exportable` ; « Voir les données » liste course · sens · premier et dernier passage · écart max.

## 4. Rendu et comportements

| Sujet | Proposition |
|---|---|
| Tracé | SVG, une polyligne par course (arrivée puis départ à chaque arrêt : le palier montre l'arrêt). Seules les courses qui coupent la fenêtre sont dessinées |
| Sens | Aller : `--cadence-dataviz-series-1` trait plein ; retour : `--cadence-dataviz-series-2` tireté court. Légende |
| Théorique / réalisé | Avec `actual` : réalisé plein, théorique en pointillé fin de la même couleur ; l'écart à chaque arrêt est au survol et dans l'annonce |
| Statuts | Supprimée : trait estompé + « supprimée » au survol ; incident : trait `--cadence-status-critical-fg` + picto au dernier passage connu |
| Survol | La course survolée s'épaissit, les autres s'estompent ; tooltip : course, sens, passage le plus proche (« Garibaldi 06h42, +3 min »), note |
| Maintenant | Trait vertical libellé « maintenant », à `now` |
| Grille | Lignes horizontales par arrêt, verticales aux graduations d'horloge (`clockTicks`, déjà utilisé par `Timeline`) |
| Volume | Cible : ~300 courses sur la journée, ~60 dans une fenêtre de 2 h ; au-delà, l'application filtre (sens, période) |

## 5. Accessibilité

- Conteneur `role="group"` nommé par le titre ; résumé : « 42 courses dans la fenêtre, 21 vers Montparnasse, 21 vers Saint-Denis Université, 2 supprimées, 1 incident ».
- **Clavier** : un seul arrêt de tabulation. ←/→ d'une course à la suivante dans le sens courant (ordre de départ), ↑/↓ d'un arrêt à l'autre **le long de la course** (annonce du passage), Maj + ↑/↓ change de sens, Début / Fin, Entrée ouvre la course, Échap.
- Annonce (`aria-live="polite"`) : « Course 13-0712 vers Montparnasse, Garibaldi : prévu 06h39, réalisé 06h42, retard 3 min ».
- Le sens et le statut ne reposent pas sur la couleur seule : motif de trait, libellé, picto.
- « Voir les données » : un vrai tableau (une ligne par course) ; le détail des passages d'une course reste dans l'application (`RouteStopList`) via `onTripClick`.

## 6. Limites de la première version

- Une ligne **linéaire** (pas de branches), comme `LineDiagram` v1.
- Pas d'édition ni de glisser-déposer des courses.
- Pas de rejeu animé ; « maintenant » est un repère fourni par l'application.
- Pas de rendu canvas : au-delà de quelques centaines de courses dans la fenêtre, filtrer.

## 7. Réutilisation

`TimelineShell` (fenêtre, échelle, défilement, aide), utilitaires horaires de
`timeline-utils` (`toMinutes`, `formatClock`, `clockTicks`, `pickTickStep`),
`stopFractions` de `LineDiagram` (espacement des arrêts), `ChartFrame`,
`ChartTooltip`, `LineBadge`, `ChartSyncGroup` (synchroniser la fenêtre avec un
`LineDiagram` : à étudier, hors v1).

## 8. Questions à trancher

1. **Axe Y** : arrêts de haut en bas dans l'ordre de l'aller (proposé), ou l'inverse ?
2. **Théorique / réalisé** : afficher les deux dès que `actual` est fourni (proposé), ou un bascule « théorique / réalisé / les deux » ?
3. **Clavier** : ↑/↓ le long de la course (proposé) — utile pour les régulateurs, ou suffit-il de parcourir les courses ?
4. **Échelles** : `["fit", "2h", "1h"]` par défaut vous convient-il pour une journée d'exploitation ?
5. **Volume** : filtrer côté application au-delà de ~300 courses est-il acceptable en v1 ?
