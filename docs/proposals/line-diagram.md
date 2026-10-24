# Proposition — `LineDiagram` (thermomètre de ligne temps réel)

Statut : **validée** (24 octobre 2026) : espacement régulier par défaut, fourches en v2, pastille picto + numéro + écart, arrêts cliquables en seconde file, annonces « incidents » par défaut. Lot 0.9.4 de la
[feuille de route](0.9.0-dataviz-et-1.0.md) (§ 4 bis).

## 1. Besoin

Superviser **une ligne** en exploitation : où sont les véhicules entre les
arrêts, dans chaque sens, lesquels sont en retard ou en incident, quels arrêts
sont perturbés. C'est le « thermomètre » des postes de commande : une vue
linéaire, pas une carte.

| Question de l'exploitant | Réponse visuelle |
|---|---|
| Où sont mes véhicules, dans quel sens ? | Un pictogramme par véhicule, placé entre deux arrêts, sur la voie de son sens |
| Lesquels sont en retard, en avance, en incident ? | Teinte de statut **et** libellé court (« +4 », « −1 », picto d'alerte) |
| Y a-t-il des trous ou des trains de bus ? | Espacement visible entre véhicules d'un même sens |
| Quels arrêts sont perturbés ou fermés ? | Arrêt marqué (picto + motif), tronçon tireté |
| La donnée est-elle fraîche ? | `DataFreshness` dans l'en-tête (prop `freshness` existante) |

Hors périmètre : carte géographique, saisie, régulation (actions sur un véhicule
autres que « ouvrir le détail »).

## 2. Maquette

```
 Ligne 13 — supervision                                     Mis à jour il y a 12 s    Voir les données
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │  Vers Châtillon →        [🚇 4521 +4]          [🚇 4498]               [🚇 4530 ⚠]              │
 │  ●━━━━━━━●━━━━━━━●━━━━━━━●━━━━━━━●┅┅┅┅┅┅┅⊘┅┅┅┅┅┅┅●━━━━━━━●━━━━━━━●━━━━━━━●━━━━━━━●             │
 │  ← Vers Saint-Denis   [🚇 4477 −1]                       [🚇 4502]                            │
 │ St-Denis  Basilique  Carrefour  Mairie  Garibaldi  Brochant  Place   Liège  St-Lazare Miromesnil │
 │ Univ.                Pleyel     St-Ouen          (fermé)    Clichy                            │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘
   ● arrêt   ⊘ arrêt fermé   ┅ tronçon perturbé   [+4] retard en min   ⚠ incident
```

- **Voie** : trait épais à la couleur GTFS de la ligne (`LineBadge` en tête), arrêts en pastilles.
- **Deux files**, au-dessus (aller) et au-dessous (retour), libellées par leur destination.
- **Véhicule** : pastille avec `ModeIcon` + numéro de parc + écart à l'horaire ; teinte de statut (tokens `--cadence-status-*`) ; flèche du sens.
- **Libellés d'arrêts** sous la voie, sur deux rangs alternés quand la place manque ; défilement horizontal au-delà (≥ 64 px par interarrêt).

## 3. API proposée

```ts
interface LineDiagramStop {
  id: string;
  name: string;
  /** Position le long de la ligne (km) ; absente → espacement régulier. */
  distance?: number;
  /** "closed" : non desservi ; "disrupted" : perturbé (tronçon suivant tireté). */
  status?: "normal" | "disrupted" | "closed";
  /** Motif lu et affiché au survol (« Travaux jusqu'au 30/10 »). */
  note?: string;
}

interface LineDiagramVehicle {
  id: string;
  /** Numéro de parc ou de course, affiché (« 4521 »). */
  label: string;
  direction: "outbound" | "inbound";
  /** À l'arrêt `at`, ou entre `from` et `to` avec `progress` ∈ [0, 1]. */
  position: { at: string } | { from: string; to: string; progress?: number };
  /** Écart à l'horaire en minutes : positif = retard, négatif = avance. */
  delay?: number;
  /** Incident en cours (panne, agression…) : prioritaire sur le retard. */
  incident?: string;
  /** Taux de charge (%) : affiché au survol et dans le tableau. */
  load?: number;
}

interface LineDiagramProps extends ChartCommonProps {      // title, description, state, framed, freshness, exportable…
  line: { code: string; color?: string; textColor?: string; mode?: LineMode };
  stops: LineDiagramStop[];                                  // dans l'ordre de l'aller
  vehicles: LineDiagramVehicle[];
  /** Libellés des sens. Défaut : « Vers <dernier arrêt> » / « Vers <premier arrêt> ». */
  directions?: { outbound?: string; inbound?: string };
  /** Sens affichés. Défaut "both". */
  show?: "both" | "outbound" | "inbound";
  /** Seuils de retard (min) pour la teinte : défaut { late: 3, early: -1 }. */
  delayThresholds?: { late: number; early: number };
  /** Annonces aux lecteurs d'écran. Défaut "incidents" (voir § 5). */
  announce?: "none" | "incidents" | "all";
  onVehicleClick?: (vehicle: LineDiagramVehicle) => void;
  onStopClick?: (stop: LineDiagramStop) => void;
}
```

- **Contrôlé** : l'application fournit les positions à chaque rafraîchissement (polling, WebSocket) ; le composant ne fait aucune requête.
- Positions **interpolées** entre deux arrêts (`progress`), à l'échelle des distances si `distance` est fourni, sinon régulièrement.
- Contrat commun des graphiques via `ChartFrame` : `title`, états `loading` / `empty` / `error`, `framed`, `freshness`, `exportable` ; « Voir les données » liste les véhicules.

## 4. Comportements

| Sujet | Proposition |
|---|---|
| Mise à jour | Déplacement animé (600 ms) d'une position à la suivante ; aucune animation sous `prefers-reduced-motion` |
| Véhicules proches | Décalés verticalement dans leur file pour ne pas se chevaucher (empilement jusqu'à 3, puis « +n ») |
| Statut | Incident > retard (`delay ≥ late`) > avance (`delay ≤ early`) > à l'heure ; teinte **et** texte (« +4 », « −1 », picto) |
| Arrêts | Fermé : pastille barrée + « fermé » ; perturbé : tronçon suivant tireté ; `note` au survol |
| Tooltip | Véhicule : numéro, sens, position (« entre Garibaldi et Mairie de Saint-Ouen »), écart, charge, incident |
| Tableau | Véhicule · sens · position · écart · charge · incident ; CSV via `exportable` |

## 5. Accessibilité

- Conteneur `role="group"` nommé par le titre ; résumé en description : « 5 véhicules vers Châtillon, 4 vers Saint-Denis, 1 incident, 2 en retard ».
- **Clavier** : un seul arrêt de tabulation. ←/→ d'un véhicule au suivant dans la file (ordre de la ligne), ↑/↓ change de sens, Début / Fin, Entrée ouvre le véhicule. Les arrêts (si `onStopClick`) sont une seconde file atteinte par ↓ depuis la file du bas.
- **Annonces** (`aria-live="polite"`) : la position du véhicule focalisé quand elle change ; avec `announce="incidents"`, un nouvel incident ou un arrêt qui ferme, regroupés au plus toutes les 10 s pour ne pas saturer ; `"all"` ajoute les changements de statut de retard ; `"none"` coupe tout.
- Contrastes : pastilles de véhicule sur fond blanc (texte AA), voie à la couleur GTFS avec contour si contraste insuffisant (comme `LineBadge`).

## 6. Limites de la première version

- Ligne **linéaire** : pas de fourches (branches) ni de boucles ; une seule ligne à la fois.
- Jusqu'à ~60 arrêts confortablement (défilement horizontal au-delà) et quelques dizaines de véhicules.
- Pas de « train de bus » calculé : l'espacement se lit, il n'est pas jugé.
- Pas d'historique ni de rejeu (voir `TimeSpaceDiagram`, lot 0.9.5, pour l'espace-temps).

## 7. Réutilisation

`ChartFrame` (cadre, états, fraîcheur, export), `ChartTooltip`, `LineBadge` et sa
logique de contraste GTFS, `ModeIcon`, tokens `--cadence-status-*` (comme
`Indicator`), `RouteStopList` (même modèle d'arrêts, en liste verticale).

## 8. Questions à trancher

1. **Espacement** : régulier par défaut et à l'échelle si `distance` est fourni — ou l'inverse ?
2. **Fourches** : nécessaires dès la v1 (lignes à branches comme la 13) ou en v2 ?
3. **Véhicule** : pastille picto + numéro + écart (proposé) ou simple flèche colorée plus compacte ?
4. **Arrêts cliquables** au clavier (seconde file) : utile, ou les arrêts restent-ils seulement lus ?
5. **Annonces** : `"incidents"` par défaut vous convient-il pour un poste de supervision ?
