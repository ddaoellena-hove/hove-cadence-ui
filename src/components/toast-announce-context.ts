import { createContext } from "react";

// Vrai dans le Toaster : les annonces passent par ses régions live
// permanentes, l'AlertToast affiché ne porte alors pas de rôle live.
export const ToastAnnouncedContext = createContext(false);
