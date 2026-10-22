import { useId, type ReactNode } from "react";
import { StopLabel } from "./StopLabel";
import { Indicator } from "./Indicator";
import { GhostButton } from "./GhostButton";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";
import "./route-stop-list.css";

export interface RouteStop {
  /** Identifiant unique de passage, y compris pour une boucle revenant au même arrêt. */
  id: string;
  name: string;
  stopId?: string;
  city?: string;
  lines?: ReactNode;
  arrival?: string;
  departure?: string;
  skipped?: boolean;
  note?: string;
}
export interface RouteStopListProps {
  label: string;
  stops: RouteStop[];
  /** Identité de ligne, généralement un LineBadge. */
  line?: ReactNode;
  loading?: boolean;
  onStopSelect?: (stop: RouteStop) => void;
  className?: string;
}
/** Ordre fourni par l’application ; heures de service affichées sans conversion Date. */
export function RouteStopList({ label, stops, line, loading = false, onStopSelect, className }: RouteStopListProps) {
  const id = useId();
  return <section aria-labelledby={id} aria-busy={loading || undefined} className={["route-stop-list", className].filter(Boolean).join(" ")}>
    <div className="route-stop-list__heading">{line}<h3 id={id}>{label}</h3></div>
    {loading ? <><p role="status">Chargement des arrêts…</p><Skeleton lines={3} /></> : stops.length === 0 ? <EmptyState size="inline" title="Aucun arrêt renseigné" /> :
      <ol className="route-stop-list__list">
        {stops.map((stop, index) => <li key={stop.id} className="route-stop-list__stop">
          <span className="route-stop-list__marker" aria-hidden="true">{index + 1}</span>
          <div className="route-stop-list__body">
            <StopLabel name={stop.name} id={stop.stopId} city={stop.city} lines={stop.lines} />
            <div className="route-stop-list__details">
              {index === 0 && <span>Origine</span>}
              {index === stops.length - 1 && <span>Terminus</span>}
              {stop.skipped ? <Indicator variant="warning" label="Non desservi" /> : <>
                {stop.arrival && <span>Arrivée <strong className="route-stop-list__time">{stop.arrival}</strong></span>}
                {stop.departure && <span>Départ <strong className="route-stop-list__time">{stop.departure}</strong></span>}
                {!stop.arrival && !stop.departure && <span>Horaire non renseigné</span>}
              </>}
            </div>
            {stop.note && <p className="route-stop-list__note">{stop.note}</p>}
            {onStopSelect && <GhostButton size="sm" label="Voir l’arrêt" aria-label={`Voir l’arrêt ${stop.name}, passage ${index + 1}`} onClick={() => onStopSelect(stop)} />}
          </div>
        </li>)}
      </ol>}
  </section>;
}
