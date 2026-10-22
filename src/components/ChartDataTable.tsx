interface ChartDataTableProps {
  caption: string;
  columns: string[];
  /** Cellules déjà formatées ; les colonnes `numeric` sont alignées à droite en mono. */
  rows: string[][];
  /** Index des colonnes numériques. */
  numeric?: number[];
  /** Affiché (« Voir les données ») ou masqué visuellement (toujours lu). */
  visible: boolean;
}

/** Alternative tabulaire d'un graphique (interne) : vrai <table>, toujours dans le DOM. */
export const ChartDataTable = ({ caption, columns, rows, numeric = [], visible }: ChartDataTableProps) => (
  <div className={visible ? "chart-table-wrap" : "chart__sr-only"}>
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
          <tr key={i}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th key={j} scope="row">
                  {cell}
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
