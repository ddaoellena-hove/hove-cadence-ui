import { useId, useMemo, useState } from "react";
import { TreeView, type TreeNode } from "./TreeView";
import { LineBadge, type LineBadgeProps } from "./LineBadge";
import { SearchInput } from "./SearchInput";
import { GhostButton } from "./GhostButton";
import { Badge } from "./Badge";
import { Popover } from "./Popover";
import { Skeleton } from "./Skeleton";
import { buildLabelMap, filterTree } from "./scope-picker-utils";
import { compactScopeSelection, expandScopeSelection } from "./scope-selection-utils";
import "./scope-picker.css";
export interface ScopeNode extends Omit<TreeNode, "children" | "hasChildren"> { children?: ScopeNode[]; badge?: Omit<LineBadgeProps, "size" | "className"> }
export interface ScopePickerProps {
  label: string;
  nodes: ScopeNode[];
  value: string[];
  onChange: (ids: string[]) => void;
  presentation?: "inline" | "popover";
  /** parents : un réseau entier est représenté par son identifiant. */
  selectionStrategy?: "leaves" | "parents";
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}
/** Périmètre générique : un contrôle par nœud, badges décoratifs, sélection persistante hors recherche. */
export const ScopePicker = ({ label, nodes, value, onChange, presentation = "inline", selectionStrategy = "leaves", loading = false, disabled = false, error, helperText, className }: ScopePickerProps) => {
  const id = useId();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const leaves = expandScopeSelection(nodes, value);
  const labels = buildLabelMap(nodes);
  const prepared = useMemo(() => {
    const walk = (list: ScopeNode[], parentDisabled = disabled): TreeNode[] => list.map(node => ({ ...node, disabled: parentDisabled || node.disabled, meta: node.badge ? <span aria-hidden="true"><LineBadge {...node.badge} size="sm" /></span> : node.meta, children: node.children ? walk(node.children, parentDisabled || node.disabled) : undefined }));
    return walk(nodes);
  }, [nodes, disabled]);
  const filtered = useMemo(() => filterTree(prepared, query), [prepared, query]);
  const commit = (ids: string[]) => { if (!disabled && !loading) onChange(selectionStrategy === "parents" ? compactScopeSelection(nodes, ids) : ids); };
  const panel = <div className="scope-picker__panel">
    <SearchInput value={query} onChange={setQuery} aria-label={`Rechercher — ${label}`} placeholder="Rechercher un réseau ou une ligne…" disabled={disabled || loading} />
    {loading ? <><Skeleton variant="rect" height={100} /><span role="status">Chargement du périmètre…</span></> : <TreeView aria-label={label} nodes={filtered.nodes} selection="multiple" selectedIds={leaves} onSelectionChange={commit} expandedIds={query ? [...new Set([...expanded, ...filtered.expandedIds])] : expanded} onExpandedChange={setExpanded} maxHeight={280} emptyLabel={query ? "Aucun résultat." : "Aucun réseau disponible."} />}
    <div className="scope-picker__footer"><span className="scope-picker__count" role="status" aria-atomic="true">{leaves.length} ligne{leaves.length > 1 ? "s" : ""} sélectionnée{leaves.length > 1 ? "s" : ""}</span><GhostButton label="Tout effacer" size="sm" disabled={disabled || loading || !value.length} onClick={() => commit([])} /></div>
  </div>;
  return <div className={["scope-picker", "scope-picker--generic", error ? "scope-picker--error" : "", disabled ? "scope-picker--disabled" : "", className].filter(Boolean).join(" ")} role="group" aria-labelledby={`${id}-label`} aria-describedby={error || helperText ? `${id}-help` : undefined} aria-invalid={Boolean(error) || undefined} aria-busy={loading || undefined}>
    <span id={`${id}-label`} className="scope-picker__label">{label}</span>
    {presentation === "inline" ? panel : <Popover title={label} width={360} renderTrigger={({ ref, toggle }) => <button ref={ref} type="button" className="scope-picker__field" disabled={disabled || loading} onClick={toggle} aria-label={`${label}, ${leaves.length} lignes sélectionnées`} aria-invalid={Boolean(error) || undefined}><span className="scope-picker__summary">{value.length ? `${labels[value[0]] ?? value[0]}${value.length > 1 ? ` +${value.length - 1}` : ""}` : "Choisir le périmètre"}</span></button>}>{panel}</Popover>}
    {value.length > 0 && <div className="scope-picker__chips">{value.map(v => <Badge key={v} label={labels[v] ?? v} dismissible={!disabled && !loading} onDismiss={() => commit(expandScopeSelection(nodes, value.filter(x => x !== v)))} />)}</div>}
    {(error || helperText) && <p id={`${id}-help`} className="scope-picker__helper" role={error ? "alert" : undefined}>{error || helperText}</p>}
  </div>;
};
