// Utilitaire des tests de CSS (non exporté par la lib) : retire les
// commentaires puis chaque var(...) entier, parenthèses imbriquées comprises,
// pour ne garder que les valeurs écrites en dur.
export const stripTokens = (css: string): string => {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("var(", i)) {
      let depth = 0;
      for (; i < text.length; i++) {
        if (text[i] === "(") depth++;
        else if (text[i] === ")" && --depth === 0) break;
      }
      out += "var()";
    } else {
      out += text[i];
    }
  }
  return out;
};
