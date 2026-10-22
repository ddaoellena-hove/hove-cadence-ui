import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { AlertToast } from "./AlertToast";
import { toastStore, type ToastItem } from "./toast-store";
import "./toaster.css";

/** Écart vertical entre les toasts une fois la pile déployée. */
const GAP = 12;
/** Décalage de chaque carte en retrait quand la pile est repliée. */
const COLLAPSED_PEEK = 12;
const COLLAPSED_SCALE_STEP = 0.055;
const DEFAULT_DURATION = 4000;

export interface ToasterProps {
  /** Classe CSS additionnelle sur le conteneur. */
  className?: string;
}

const EMPTY: ToastItem[] = [];

/**
 * Toaster — zone d'affichage des toasts, à monter une seule fois (racine de
 * l'app). En bas à droite, les notifications s'empilent avec un effet de
 * profondeur (la plus récente au premier plan) ; au survol, la pile se déploie.
 * Les toasts non-`error` se ferment seuls (pause pendant le survol).
 *
 * Déclencher des toasts avec `useToast()` ou la fonction `toast()`.
 */
export function Toaster({ className }: ToasterProps) {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, () => EMPTY);
  const [expanded, setExpanded] = useState(false);
  // Hauteurs mesurées : déployer une pile de cartes de tailles variables sans chevauchement.
  const [heights, setHeights] = useState<Record<number, number>>({});
  const timers = useRef<Record<number, number>>({});

  const measure = (id: number) => (el: HTMLDivElement | null) => {
    if (el) {
      const h = el.offsetHeight;
      setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
    }
  };

  // Auto-dismiss, en pause tant que la pile est survolée (déployée).
  useEffect(() => {
    if (expanded) {
      for (const t of Object.values(timers.current)) window.clearTimeout(t);
      timers.current = {};
      return;
    }
    for (const item of toasts) {
      if (item.id in timers.current) continue;
      const duration = item.duration ?? (item.type === "error" ? 0 : DEFAULT_DURATION);
      if (duration > 0 && duration !== Infinity) {
        timers.current[item.id] = window.setTimeout(() => toastStore.remove(item.id), duration);
      }
    }
  }, [toasts, expanded]);

  // Purge des timers des toasts disparus.
  useEffect(() => {
    const live = new Set(toasts.map((t) => t.id));
    for (const key of Object.keys(timers.current)) {
      const id = Number(key);
      if (!live.has(id)) {
        window.clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
    }
  }, [toasts]);

  // Nettoyage au démontage.
  useEffect(
    () => () => {
      for (const t of Object.values(timers.current)) window.clearTimeout(t);
    },
    [],
  );

  if (toasts.length === 0) return null;

  const frontH = heights[toasts[0].id] ?? 0;
  const totalH = toasts.reduce((sum, t, i) => sum + (heights[t.id] ?? 0) + (i > 0 ? GAP : 0), 0);

  // depth 0 = premier plan (en bas) ; depth croissant = vers l'arrière.
  // zIndex local à la pile : `.toaster` porte la couche --cadence-z-toast.
  const styleFor = (depth: number): CSSProperties => {
    if (expanded) {
      let offset = 0;
      for (let i = 0; i < depth; i++) offset += (heights[toasts[i].id] ?? 0) + GAP;
      return { transform: `translateY(${-offset}px)`, opacity: 1, zIndex: toasts.length - depth, pointerEvents: "auto" };
    }
    const scale = Math.max(1 - depth * COLLAPSED_SCALE_STEP, 0.8);
    return {
      transform: `translateY(${-depth * COLLAPSED_PEEK}px) scale(${scale})`,
      opacity: depth <= 2 ? 1 : 0,
      zIndex: toasts.length - depth,
      pointerEvents: depth === 0 ? "auto" : "none",
    };
  };

  return (
    <div
      className={["toaster", className].filter(Boolean).join(" ")}
      style={{ height: expanded ? totalH : frontH }}
      role="region"
      aria-label="Notifications"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {toasts.map((item, depth) => (
        <div key={item.id} ref={measure(item.id)} className="toaster__item" style={styleFor(depth)}>
          <AlertToast
            type={item.type}
            title={item.title}
            description={item.description}
            actions={item.actions}
            dismissible={item.dismissible ?? true}
            onDismiss={() => toastStore.remove(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
