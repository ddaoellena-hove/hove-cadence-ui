import { toastStore, type ToastOptions } from "./toast-store";

export type { ToastOptions };

/** Déclenche un toast depuis n'importe où (sans hook). Renvoie son id. */
export const toast = (options: ToastOptions): number => toastStore.add(options);

/** Ferme un toast par id. */
export const dismissToast = (id: number): void => toastStore.remove(id);

/**
 * Hook d'accès au système de toasts. Nécessite un unique `<Toaster />` monté
 * (en général à la racine de l'app).
 *
 * ```tsx
 * const { toast } = useToast();
 * toast({ type: "success", title: "Scénario créé" });
 * ```
 */
export function useToast() {
  return { toast, dismiss: dismissToast };
}
