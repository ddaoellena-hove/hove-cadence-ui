// Garde portable des avertissements de développement.
//
// `process.env.NODE_ENV` est écrit tel quel pour que le bundler de l'app
// (webpack, Next, Vite, esbuild…) le remplace par une constante. Sans bundler
// (ESM chargé tel quel par le navigateur), `process` n'existe pas : l'accès
// lève une ReferenceError, interceptée → avertissements coupés, sans planter.
// Ne jamais lire les variables d'environnement propres à Vite : elles
// n'existent pas chez une app construite par un autre outil.

declare const process: { env: { NODE_ENV?: string } };

/** Vrai hors production ; faux si l'environnement est inconnu. */
export const isDevMode = (): boolean => {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
};
