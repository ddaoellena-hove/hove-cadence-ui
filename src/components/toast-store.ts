// Store interne des toasts (observable, hors React) : permet d'appeler
// `toast()` depuis n'importe où, un seul `<Toaster />` s'y abonne pour rendre
// la pile. Non exporté par index.ts — l'API publique est useToast / Toaster.

import type { AlertToastAction, AlertToastType } from "./AlertToast";

export interface ToastOptions {
  /** Type sémantique (couleur + icône). Défaut « information ». */
  type?: AlertToastType;
  /** Titre (gras). */
  title: string;
  /** Texte secondaire optionnel. */
  description?: string;
  /**
   * Durée avant fermeture automatique, en ms. `0` ou `Infinity` = persistant.
   * Défaut : 4000 ms, sauf `type="error"` qui reste jusqu'à fermeture.
   */
  duration?: number;
  /** Affiche le bouton de fermeture. Défaut true. */
  dismissible?: boolean;
  /** Jusqu'à deux boutons d'action. */
  actions?: [AlertToastAction] | [AlertToastAction, AlertToastAction];
}

export interface ToastItem extends ToastOptions {
  id: number;
}

/** Nombre maximum de toasts conservés (les plus anciens sont retirés). */
const MAX = 3;

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

export const toastStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): ToastItem[] {
    return items;
  },
  /** Ajoute un toast (le plus récent en tête) et renvoie son id. */
  add(options: ToastOptions): number {
    const id = ++counter;
    items = [{ id, ...options }, ...items].slice(0, MAX);
    emit();
    return id;
  },
  /** Retire un toast par id. */
  remove(id: number): void {
    const next = items.filter((t) => t.id !== id);
    if (next.length !== items.length) {
      items = next;
      emit();
    }
  },
};
