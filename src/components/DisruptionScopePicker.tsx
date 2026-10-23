/**
 * DisruptionScopePicker — sélection du périmètre d'une perturbation dans
 * l'arborescence du réseau (réseau → ligne → parcours). Champ de 40 px qui
 * ouvre un `Popover` contenant une recherche et un `TreeView` en sélection
 * multiple (cases tri-état). Le périmètre retenu s'affiche en chips
 * (`Badge dismissible`) sous le champ, avec « Tout effacer ».
 *
 * Variante hiérarchique du multi-select : là où `Autocomplete multiple` filtre
 * une liste plate, ce composant gère la hiérarchie (cocher un réseau coche ses
 * lignes) et le chargement à la demande via `TreeView`.
 */
import { forwardRef, useId, useMemo, useState, type Ref } from "react";
import { Popover } from "./Popover";
import { SearchInput } from "./SearchInput";
import { TreeView } from "./TreeView";
import { Badge } from "./Badge";
import { GhostButton } from "./GhostButton";
import { Icons } from "./Icons";
import { buildLabelMap, filterTree } from "./scope-picker-utils";
import type { TreeNode } from "./tree-view-utils";
import "./scope-picker.css";

export interface DisruptionScopePickerProps {
  /** Libellé visible du champ. */
  label: string;
  /** Arbre du réseau. */
  nodes: TreeNode[];
  /** Périmètre sélectionné (contrôlé) : identifiants de feuilles. */
  value?: string[];
  /** Périmètre au montage (non contrôlé). */
  defaultValue?: string[];
  /** Changement du périmètre. */
  onChange?: (ids: string[]) => void;
  /** Chargement des enfants d'un nœud `hasChildren`. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** Texte quand rien n'est sélectionné. Défaut « Tout le réseau ». */
  placeholder?: string;
  /** Aide sous le champ (remplacée par l'erreur). */
  helperText?: string;
  /** `"error"` force le rendu d'erreur. */
  state?: "enabled" | "error";
  disabled?: boolean;
  required?: boolean;
  /** Placeholder du champ de recherche. Défaut « Rechercher une ligne… ». */
  searchPlaceholder?: string;
  id?: string;
  className?: string;
}

const mergeRefs =
  (...refs: (Ref<HTMLButtonElement> | undefined)[]) =>
  (el: HTMLButtonElement | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as { current: HTMLButtonElement | null }).current = el;
    }
  };

export const DisruptionScopePicker = forwardRef<HTMLButtonElement, DisruptionScopePickerProps>(
  (
    {
      label,
      nodes,
      value,
      defaultValue,
      onChange,
      loadChildren,
      placeholder = "Tout le réseau",
      helperText,
      state = "enabled",
      disabled = false,
      required = false,
      searchPlaceholder = "Rechercher une ligne…",
      id,
      className,
    },
    ref,
  ) => {
    const reactId = useId();
    const triggerId = id ?? `scope-${reactId}`;
    const helperId = `${triggerId}-helper`;
    const labelId = `${triggerId}-label`;
    const summaryId = `${triggerId}-summary`;

    const controlled = value !== undefined;
    const [inner, setInner] = useState<string[]>(defaultValue ?? []);
    const selected = controlled ? value : inner;
    const commit = (ids: string[]) => {
      if (!controlled) setInner(ids);
      onChange?.(ids);
    };

    const [query, setQuery] = useState("");
    const [userExpanded, setUserExpanded] = useState<string[]>([]);
    const { nodes: shownNodes, expandedIds: searchExpanded } = useMemo(() => filterTree(nodes, query), [nodes, query]);
    const expandedIds = query ? Array.from(new Set([...userExpanded, ...searchExpanded])) : userExpanded;

    const labelMap = useMemo(() => buildLabelMap(nodes), [nodes]);
    const count = selected.length;
    const firstLabel = count ? labelMap[selected[0]] ?? selected[0] : "";
    const summary = count === 0 ? placeholder : count === 1 ? firstLabel : `${firstLabel} +${count - 1}`;

    const rootClass = [
      "scope-picker",
      state === "error" ? "scope-picker--error" : "",
      disabled ? "scope-picker--disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClass}>
        <label id={labelId} className="scope-picker__label" htmlFor={triggerId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>

        <Popover
          title={label}
          width={360}
          align="start"
          renderTrigger={({ ref: triggerRef, toggle }) => (
            <button
              ref={mergeRefs(triggerRef, ref)}
              id={triggerId}
              type="button"
              className="scope-picker__field"
              disabled={disabled}
              aria-labelledby={`${labelId} ${summaryId}`}
              aria-invalid={state === "error" || undefined}
              aria-describedby={helperText ? helperId : undefined}
              onClick={toggle}
            >
              <span id={summaryId} className={count === 0 ? "scope-picker__placeholder" : "scope-picker__summary"}>{summary}</span>
              <Icons icon="chevron-down" size={16} />
            </button>
          )}
        >
          <div className="scope-picker__panel">
            <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
            <TreeView
              aria-label={label}
              nodes={shownNodes}
              selection="multiple"
              selectedIds={selected}
              onSelectionChange={commit}
              loadChildren={loadChildren}
              expandedIds={expandedIds}
              onExpandedChange={setUserExpanded}
              maxHeight={280}
              emptyLabel="Aucun résultat."
              className="scope-picker__tree"
            />
            <div className="scope-picker__footer">
              <span className="scope-picker__count">
                {count} sélectionné{count > 1 ? "s" : ""}
              </span>
              <GhostButton size="sm" label="Tout effacer" onClick={() => commit([])} disabled={count === 0} />
            </div>
          </div>
        </Popover>

        {count > 0 && !disabled && (
          <div className="scope-picker__chips">
            {selected.map((selId) => (
              <Badge key={selId} label={labelMap[selId] ?? selId} dismissible onDismiss={() => commit(selected.filter((x) => x !== selId))} />
            ))}
          </div>
        )}

        {helperText && (
          <p id={helperId} className="scope-picker__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

DisruptionScopePicker.displayName = "DisruptionScopePicker";
