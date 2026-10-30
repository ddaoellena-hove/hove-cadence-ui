/**
 * PageFooter — pied de site : copyright, liens et contact. Placé en dernier
 * dans la page, il défile avec elle. À ne pas confondre avec `actionBar`
 * d'AppLayout, qui porte les actions de la tâche en cours.
 */
import { Icons } from "./Icons";
import "./page-footer.css";

export interface PageFooterLink {
  label: string;
  /** Adresse, `mailto:` ou `tel:`. */
  href: string;
  /** Ouvre un nouvel onglet : icône, et annonce aux lecteurs d'écran. */
  external?: boolean;
}

export interface PageFooterProps {
  /** Mention de copyright. */
  copyright: string;
  links?: PageFooterLink[];
  className?: string;
}

export const PageFooter = ({ copyright, links = [], className }: PageFooterProps) => (
  <footer className={["page-footer", className].filter(Boolean).join(" ")}>
    <p className="page-footer__copyright">{copyright}</p>
    {links.length > 0 && (
      <ul className="page-footer__links">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="page-footer__link"
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
              {link.external && (
                <>
                  <Icons icon="link-external-01" size={14} />
                  <span className="page-footer__sr-only"> (nouvel onglet)</span>
                </>
              )}
            </a>
          </li>
        ))}
      </ul>
    )}
  </footer>
);
