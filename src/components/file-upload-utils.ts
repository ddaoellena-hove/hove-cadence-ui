/**
 * Utilitaires purs de FileUpload : formatage de taille et validation
 * type/taille (messages FR). Testables isolément.
 */

// Espace insécable en constante (évite un caractère irrégulier dans les gabarits).
const NBSP = " ";

/** Taille lisible en o / Ko / Mo (fr). */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}${NBSP}o`;
  const ko = bytes / 1024;
  if (ko < 1024) return `${ko < 10 ? ko.toFixed(1) : Math.round(ko)}${NBSP}Ko`;
  const mo = ko / 1024;
  return `${mo < 10 ? mo.toFixed(1) : Math.round(mo)}${NBSP}Mo`;
};

/** Extension en minuscules, point compris (« .zip »), ou "". */
const extensionOf = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
};

/**
 * Renvoie un message d'erreur FR si le fichier est rejeté (type ou taille),
 * sinon null. `accept` est une liste d'extensions (« .zip,.csv ») et/ou de
 * types MIME.
 */
export const rejectFile = (file: { name: string; size: number; type?: string }, accept?: string, maxSize?: number): string | null => {
  if (accept) {
    const allowed = accept
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);
    const ext = extensionOf(file.name);
    const mime = file.type?.toLowerCase() ?? "";
    const ok = allowed.length === 0 || allowed.some((a) =>
      a.startsWith(".") ? file.name.toLowerCase().endsWith(a) :
      a.endsWith("/*") ? mime.startsWith(a.slice(0, -1)) : mime === a,
    );
    if (!ok) {
      return `Format non pris en charge : ${ext || file.name}. Formats acceptés : ${allowed.join(", ")}.`;
    }
  }
  if (maxSize !== undefined && file.size > maxSize) {
    return `Fichier trop volumineux : ${formatFileSize(file.size)}. Maximum : ${formatFileSize(maxSize)}.`;
  }
  return null;
};
