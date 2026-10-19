import { Dropdown } from "./Dropdown";
import { Icons } from "./Icons";
import {
  clampPage,
  formatNumber,
  formatRange,
  getPageCount,
  getPageItems,
} from "./pagination-utils";
import "./pagination.css";

export interface PaginationProps {
  /** Page courante (1-based). */
  page: number;
  /** Nombre d'éléments par page. */
  pageSize: number;
  /** Nombre total d'éléments (toutes pages confondues). */
  totalItems: number;
  /** Appelé avec la nouvelle page (1-based). */
  onPageChange: (page: number) => void;
  /** Tailles proposées. Défaut [25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Sans ce callback, le sélecteur de taille de page n'est pas affiché. */
  onPageSizeChange?: (size: number) => void;
  /** Nom accessible de la navigation. Défaut « Pagination ». */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];

/**
 * Navigation dans un résultat paginé : plage « 1–50 sur 12 430 »,
 * précédent / suivant, numéros de page avec ellipses et taille de page.
 * Composant contrôlé : l'app garde `page` et `pageSize`.
 */
export const Pagination = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) => {
  const pageCount = getPageCount(totalItems, pageSize);
  const current = clampPage(page, pageCount);
  const items = getPageItems(current, pageCount);
  const isFirst = current <= 1;
  const isLast = current >= pageCount;

  const goTo = (target: number) => {
    const next = clampPage(target, pageCount);
    if (next !== current) onPageChange(next);
  };

  // La taille courante est toujours proposée, même absente des options
  const sizes = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  const rootClass = ["pagination", className].filter(Boolean).join(" ");

  return (
    <nav className={rootClass} aria-label={ariaLabel}>
      <div className="pagination__summary">
        {onPageSizeChange && (
          <div className="pagination__size">
            <Dropdown
              options={sizes.map((size) => ({ id: String(size), label: `${formatNumber(size)} par page` }))}
              value={String(pageSize)}
              onChange={(id) => onPageSizeChange(Number(id))}
            />
          </div>
        )}
        <span className="pagination__range">{formatRange(current, pageSize, totalItems)}</span>
      </div>

      <ul className="pagination__pages">
        <li>
          <button
            type="button"
            className="pagination__button pagination__button--nav"
            onClick={() => goTo(current - 1)}
            disabled={isFirst}
          >
            <Icons icon="chevron-left" size={16} title="Page précédente" />
          </button>
        </li>

        {items.map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={`pagination__button${item === current ? " pagination__button--current" : ""}`}
                onClick={() => goTo(item)}
                aria-label={`Page ${formatNumber(item)}`}
                aria-current={item === current ? "page" : undefined}
              >
                {formatNumber(item)}
              </button>
            </li>
          ) : (
            <li key={item} className="pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            className="pagination__button pagination__button--nav"
            onClick={() => goTo(current + 1)}
            disabled={isLast}
          >
            <Icons icon="chevron-right" size={16} title="Page suivante" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
