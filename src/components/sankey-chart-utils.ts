// Mise en page du SankeyChart (pure, testée), sans d3-sankey : colonnes,
// hauteurs proportionnelles aux volumes, rubans entre nœuds.

export interface SankeyNodeInput {
  id: string;
  label: string;
  /** Colonne (étape) imposée, à partir de 0. Sinon déduite des liens. */
  column?: number;
}

export interface SankeyLinkInput {
  source: string;
  target: string;
  value: number;
}

export interface SankeyNode extends SankeyNodeInput {
  column: number;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Index de couleur : celui du nœud de première colonne d'où vient l'essentiel du flux. */
  group: number;
}

export interface SankeyLink extends SankeyLinkInput {
  index: number;
  width: number;
  /** Ordonnées du ruban au départ (source) et à l'arrivée (cible), au milieu de son épaisseur. */
  y0: number;
  y1: number;
  group: number;
}

/**
 * Colonnes : imposées si chaque nœud en a une, sinon plus long chemin depuis
 * une source. Les liens qui ne vont pas vers une colonne plus à droite
 * (cycles, retours) sont écartés.
 */
const assignColumns = (nodes: SankeyNodeInput[], links: SankeyLinkInput[]) => {
  const column = new Map<string, number>();
  if (nodes.every((n) => Number.isInteger(n.column) && (n.column as number) >= 0)) {
    for (const n of nodes) column.set(n.id, n.column as number);
    return column;
  }
  for (const n of nodes) column.set(n.id, 0);
  // Relaxation bornée (au plus n passes) : un cycle ne peut pas boucler indéfiniment
  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;
    for (const l of links) {
      const next = (column.get(l.source) ?? 0) + 1;
      if (next > (column.get(l.target) ?? 0) && next < nodes.length) {
        column.set(l.target, next);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return column;
};

export const layoutSankey = (
  nodesInput: SankeyNodeInput[],
  linksInput: SankeyLinkInput[],
  width: number,
  height: number,
  { nodeWidth = 12, nodeGap = 10 }: { nodeWidth?: number; nodeGap?: number } = {},
) => {
  const ids = new Set(nodesInput.map((n) => n.id));
  const candidate = linksInput.filter(
    (l) => ids.has(l.source) && ids.has(l.target) && l.source !== l.target && Number.isFinite(l.value) && l.value > 0,
  );
  const columnOf = assignColumns(nodesInput, candidate);
  const links = candidate.filter((l) => (columnOf.get(l.target) ?? 0) > (columnOf.get(l.source) ?? 0));
  const ignored = candidate.length - links.length;

  const inflow = new Map<string, number>();
  const outflow = new Map<string, number>();
  for (const l of links) {
    outflow.set(l.source, (outflow.get(l.source) ?? 0) + l.value);
    inflow.set(l.target, (inflow.get(l.target) ?? 0) + l.value);
  }
  const used = nodesInput.filter((n) => (inflow.get(n.id) ?? 0) + (outflow.get(n.id) ?? 0) > 0);
  const columns = Math.max(0, ...used.map((n) => columnOf.get(n.id) ?? 0)) + 1;
  const byColumn = Array.from({ length: columns }, (_, c) => used.filter((n) => (columnOf.get(n.id) ?? 0) === c));
  const valueOf = (id: string) => Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0);

  // Échelle commune : la colonne la plus chargée remplit la hauteur
  const k = Math.min(
    ...byColumn
      .filter((col) => col.length > 0)
      .map((col) => Math.max(0, height - nodeGap * (col.length - 1)) / Math.max(1e-9, col.reduce((sum, n) => sum + valueOf(n.id), 0))),
  );
  const step = columns > 1 ? (width - nodeWidth) / (columns - 1) : 0;

  const placed = new Map<string, SankeyNode>();
  byColumn.forEach((col, c) => {
    let y = 0;
    for (const n of col) {
      const h = valueOf(n.id) * k;
      placed.set(n.id, { ...n, column: c, value: valueOf(n.id), x0: c * step, x1: c * step + nodeWidth, y0: y, y1: y + h, group: 0 });
      y += h + nodeGap;
    }
  });

  // Couleur : première colonne dans l'ordre ; ensuite, celle de la plus grosse arrivée
  byColumn[0]?.forEach((n, i) => {
    const node = placed.get(n.id);
    if (node) node.group = i;
  });
  for (let c = 1; c < columns; c += 1) {
    for (const n of byColumn[c]) {
      const biggest = links.filter((l) => l.target === n.id).sort((a, b) => b.value - a.value)[0];
      const node = placed.get(n.id);
      if (node && biggest) node.group = placed.get(biggest.source)?.group ?? 0;
    }
  }

  // Rubans : empilés au départ par ordre des cibles, à l'arrivée par ordre des sources
  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();
  const sorted = links
    .map((l, index) => ({ ...l, index }))
    .sort((a, b) => {
      const sa = placed.get(a.source) as SankeyNode;
      const sb = placed.get(b.source) as SankeyNode;
      return sa.column - sb.column || sa.y0 - sb.y0 || (placed.get(a.target) as SankeyNode).y0 - (placed.get(b.target) as SankeyNode).y0;
    });
  const linkPos = new Map<number, { y0: number }>();
  for (const l of sorted) {
    const s = placed.get(l.source) as SankeyNode;
    const w = l.value * k;
    const off = outOffset.get(l.source) ?? 0;
    linkPos.set(l.index, { y0: s.y0 + off + w / 2 });
    outOffset.set(l.source, off + w);
  }
  const byTarget = [...sorted].sort((a, b) => {
    const ta = placed.get(a.target) as SankeyNode;
    const tb = placed.get(b.target) as SankeyNode;
    return ta.column - tb.column || ta.y0 - tb.y0 || (placed.get(a.source) as SankeyNode).y0 - (placed.get(b.source) as SankeyNode).y0;
  });
  const result: SankeyLink[] = [];
  for (const l of byTarget) {
    const t = placed.get(l.target) as SankeyNode;
    const w = l.value * k;
    const off = inOffset.get(l.target) ?? 0;
    inOffset.set(l.target, off + w);
    result.push({ ...l, width: w, y0: linkPos.get(l.index)?.y0 ?? 0, y1: t.y0 + off + w / 2, group: (placed.get(l.source) as SankeyNode).group });
  }
  // Ordre de lecture (clavier, tableau) : par source puis par cible
  const order = new Map(sorted.map((l, i) => [l.index, i]));
  result.sort((a, b) => (order.get(a.index) ?? 0) - (order.get(b.index) ?? 0));

  return { nodes: [...placed.values()], links: result, columns, ignored };
};

/** Ruban entre deux nœuds : bande à bords en courbe de Bézier, épaisseur constante. */
export const ribbonPath = (x0: number, y0: number, x1: number, y1: number, width: number) => {
  const xm = (x0 + x1) / 2;
  const h = width / 2;
  return `M${x0},${y0 - h}C${xm},${y0 - h} ${xm},${y1 - h} ${x1},${y1 - h}L${x1},${y1 + h}C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}Z`;
};
