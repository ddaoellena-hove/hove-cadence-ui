/**
 * RepeatableFieldGroup — blocs de champs répétés (périodes, créneaux, canaux).
 * Gère ajout, retrait, limites, erreur par bloc, focus et annonces. Les valeurs
 * et les règles restent au formulaire.
 *
 * L'identité d'un bloc vient de `getId`, jamais de sa position : retirer le
 * deuxième bloc ne transfère ni valeurs ni erreurs au troisième.
 */
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GhostButton } from "./GhostButton";
import { PageSection } from "./PageSection";
import "./repeatable-field-group.css";

export interface RepeatableFieldGroupProps<T> {
  /** Nom du groupe, annoncé : « Périodes d'application ». */
  label: string;
  items: T[];
  /** Identifiant stable d'un bloc. */
  getId: (item: T) => string;
  /** Titre affiché ; la numérotation éventuelle est une présentation. */
  getTitle: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Erreur propre à un bloc. */
  getError?: (item: T) => string | undefined;
  onAdd: () => void;
  onRemove: (id: string) => void;
  /** Nombre minimal de blocs : le retrait est désactivé à cette limite. Défaut 0. */
  min?: number;
  /** Nombre maximal de blocs : l'ajout est désactivé à cette limite. */
  max?: number;
  /** Libellé du bouton d'ajout. Défaut « Ajouter ». */
  addLabel?: string;
  /** Niveau du titre de chaque bloc. Défaut 3. */
  headingLevel?: 3 | 4;
  className?: string;
}

// Premier contrôle du corps d'un bloc, hors de l'en-tête et de ses actions
const FOCUSABLE = "input, select, textarea, button, a[href], [tabindex]:not([tabindex='-1']), [contenteditable='true']";

export const RepeatableFieldGroup = <T,>({
  label,
  items,
  getId,
  getTitle,
  renderItem,
  getError,
  onAdd,
  onRemove,
  min = 0,
  max,
  addLabel = "Ajouter",
  headingLevel = 3,
  className,
}: RepeatableFieldGroupProps<T>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const countId = useId();
  const [announcement, setAnnouncement] = useState("");
  // Seule une action de l'utilisateur déplace le focus : un chargement de
  // données par le parent ne doit pas le voler.
  const pendingFocus = useRef<{ kind: "add" } | { kind: "remove"; index: number } | null>(null);
  const ids = items.map(getId);
  const idsKey = JSON.stringify(ids);

  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const blocks = rootRef.current?.querySelectorAll<HTMLElement>(":scope > .repeatable-group__list > .repeatable-group__item");
    const index = pending.kind === "add" ? (blocks?.length ?? 0) - 1 : pending.index;
    const block = blocks?.[Math.min(index, (blocks?.length ?? 0) - 1)];
    const target = block?.querySelector<HTMLElement>(`.page-section__body :is(${FOCUSABLE})`);
    (target ?? addRef.current)?.focus();
  }, [idsKey]);

  const atMax = max !== undefined && items.length >= max;
  const atMin = items.length <= min;
  const rootClass = ["repeatable-group", className].filter(Boolean).join(" ");

  return (
    <div ref={rootRef} className={rootClass} role="group" aria-label={label} aria-describedby={max !== undefined ? countId : undefined}>
      {items.length > 0 && (
        <ol className="repeatable-group__list">
          {items.map((item, index) => {
            const id = getId(item);
            const title = getTitle(item, index);
            const error = getError?.(item);
            return (
              <li key={id} className={`repeatable-group__item${error ? " repeatable-group__item--error" : ""}`}>
                <PageSection
                  title={title}
                  headingLevel={headingLevel}
                  gap={16}
                  actions={
                    <GhostButton
                      size="sm"
                      icon="trash"
                      tone="danger"
                      aria-label={`Retirer ${title}`}
                      disabled={atMin}
                      onClick={() => {
                        pendingFocus.current = { kind: "remove", index };
                        setAnnouncement(`${title} retiré.`);
                        onRemove(id);
                      }}
                    />
                  }
                >
                  {renderItem(item, index)}
                  {error && <p className="repeatable-group__error">{error}</p>}
                </PageSection>
              </li>
            );
          })}
        </ol>
      )}
      <div className="repeatable-group__footer">
        <GhostButton
          ref={addRef}
          size="sm"
          iconStart="plus"
          label={addLabel}
          disabled={atMax}
          onClick={() => {
            pendingFocus.current = { kind: "add" };
            setAnnouncement(`${addLabel} : bloc ${items.length + 1} ajouté.`);
            onAdd();
          }}
        />
        {max !== undefined && (
          <span id={countId} className="repeatable-group__count">
            {items.length} sur {max}{atMax ? " (maximum atteint)" : ""}
          </span>
        )}
      </div>
      <span className="repeatable-group__status" role="status">{announcement}</span>
    </div>
  );
};
