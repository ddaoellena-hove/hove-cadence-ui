/**
 * ActionMenu component.
 *
 * Menu d'actions par ligne, déclenché par un bouton icône (« … »). Bâti sur la
 * primitive de menu partagée (menu-core) : portail, clavier complet, ARIA
 * `menu`/`menuitem`. À utiliser au-delà de 4 actions par ligne, ou dans le slot
 * `actions` d'une TableCard / la colonne d'actions d'un DataTable.
 */
import { GhostButton } from "./GhostButton";
import { Menu, type MenuItemSpec } from "./menu-core";
import type { IconName } from "./Icons";
import "./action-menu.css";

/** Une action du menu. */
export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: IconName;
  /** "danger" : libellé et picto en rouge. */
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Séparateur au-dessus de cet item. */
  divider?: boolean;
  onSelect: () => void;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Nom accessible du déclencheur icône. Défaut « Plus d'actions ». */
  label?: string;
  /** Libellé visible (variante bouton) au lieu de l'icône seule. */
  triggerLabel?: string;
  /** Icône du déclencheur. Défaut "dots-horizontal". */
  triggerIcon?: IconName;
  /** Bord d'alignement du menu sous le déclencheur. Défaut "end". */
  align?: "start" | "end";
  /** Classe CSS additionnelle. */
  className?: string;
}

export const ActionMenu = ({
  items,
  label = "Plus d'actions",
  triggerLabel,
  triggerIcon = "dots-horizontal",
  align = "end",
  className,
}: ActionMenuProps) => {
  const specs: MenuItemSpec[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    tone: item.tone,
    disabled: item.disabled,
    divider: item.divider,
    onSelect: item.onSelect,
  }));

  return (
    <Menu
      items={specs}
      label={label}
      align={align}
      className={["action-menu", className].filter(Boolean).join(" ")}
      renderTrigger={({ ref, toggle }) =>
        triggerLabel ? (
          <GhostButton ref={ref} size="sm" label={triggerLabel} iconStart={triggerIcon} onClick={toggle} />
        ) : (
          <GhostButton ref={ref} size="sm" icon={triggerIcon} aria-label={label} onClick={toggle} />
        )
      }
    />
  );
};
