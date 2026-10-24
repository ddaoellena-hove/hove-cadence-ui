// Export CSV d'un graphique (interne) : à partir de son alternative tabulaire,
// déjà formatée en fr-FR. Séparateur « ; » et BOM UTF-8 pour un tableur
// français ; les colonnes numériques perdent leurs espaces de groupement pour
// rester des nombres.

export interface CsvTable {
  columns: string[];
  rows: string[][];
  /** Index des colonnes numériques. */
  numeric?: number[];
}

const BOM = "\uFEFF";

/** Nombre fr-FR lisible par un tableur : espaces de groupement retirés, vrai signe moins remplacé par « - ». */
export const csvNumber = (cell: string) => cell.replace(/[\u202f\u00a0\s]/g, "").replace(/\u2212/g, "-");

/** Échappement d'un champ : entre guillemets s'il contient « ; », « " » ou un saut de ligne. */
export const csvField = (cell: string) => (/[;"\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);

/** Contenu CSV complet (BOM compris), lignes séparées par CRLF. */
export const toCsv = ({ columns, rows, numeric = [] }: CsvTable) =>
  BOM +
  [columns, ...rows.map((row) => row.map((cell, i) => (numeric.includes(i) ? csvNumber(cell) : cell)))]
    .map((line) => line.map(csvField).join(";"))
    .join("\r\n");

/** Nom de fichier sûr : « Retard moyen par heure » → « retard-moyen-par-heure.csv ». */
export const csvFileName = (name: string) =>
  `${
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "donnees"
  }.csv`;

/** Lit l'alternative tabulaire rendue (ChartDataTable) : en-têtes, cellules et colonnes numériques. */
export const readChartTable = (table: HTMLTableElement): CsvTable => {
  const columns = [...table.querySelectorAll("thead th")].map((th) => th.textContent ?? "");
  const bodyRows = [...table.querySelectorAll("tbody tr")];
  const rows = bodyRows.map((tr) => [...tr.children].map((cell) => cell.textContent ?? ""));
  const numeric = bodyRows[0] ? [...bodyRows[0].children].flatMap((cell, i) => (cell.classList.contains("chart-table__number") ? [i] : [])) : [];
  return { columns, rows, numeric };
};

/** Télécharge un CSV dans le navigateur (lien temporaire). */
export const downloadCsv = (fileName: string, csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
