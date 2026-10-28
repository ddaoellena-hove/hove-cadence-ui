interface ChartDataTableProps {
  caption: string;
  columns: string[];
  /** Cellules déjà formatées ; les colonnes `numeric` sont alignées à droite en mono. */
  rows: string[][];
  /** Index des colonnes numériques. */
  numeric?: number[];
  /** Affiché (« Voir les données ») ou masqué visuellement (toujours lu). */
  visible: boolean;
  /** En-têtes de ligne cliquables : action de la ligne i (undefined = texte simple). */
  rowActions?: ((() => void) | undefined)[];
  /** Ligne mise en avant (sélection côté app), signalée par aria-current. */
  currentRow?: number;
}

/** Alternative tabulaire d'un graphique (interne) : vrai <table>, toujours dans le DOM. */
export const ChartDataTable = ({ caption, columns, rows, numeric = [], visible, rowActions, currentRow }: ChartDataTableProps) => (
  // Affiché, il peut défiler : zone focusable et nommée, atteignable au clavier
  <div
    className={visible ? "chart-table-wrap" : "chart__sr-only"}
    tabIndex={visible ? 0 : undefined}
    role={visible ? "region" : undefined}
    aria-label={visible ? `Données : ${caption}` : undefined}
  >
    <table className="chart-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={currentRow === i ? "chart-table__row--current" : undefined}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th key={j} scope="row">
                  {rowActions?.[i] ? (
                    <button type="button" className="chart-table__row-button" tabIndex={visible ? 0 : -1} aria-current={currentRow === i ? "true" : undefined} onClick={rowActions[i]}>
                      {cell}
                    </button>
                  ) : (
                    cell
                  )}
                </th>
              ) : (
                <td key={j} className={numeric.includes(j) ? "chart-table__number" : undefined}>
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
