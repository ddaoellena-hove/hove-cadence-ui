import { useId, useState } from "react";
import { GhostButton } from "./GhostButton";
import { Indicator } from "./Indicator";
import { copyToClipboard } from "./copy-to-clipboard";
import "./log-viewer.css";
import "./scrollbar.css";
export interface LogLine { id: string; message: string; timestamp?: string; level?: "debug" | "info" | "warning" | "error"; highlighted?: boolean }
export interface LogViewerProps { title: string; lines: LogLine[]; maxHeight?: number; startLine?: number; onDownload?: () => void; loading?: boolean; emptyLabel?: string; className?: string }
const LEVEL = { debug: "Débogage", info: "Information", warning: "Avertissement", error: "Erreur" };
const TONE = { debug: "draft", info: "info", warning: "warning", error: "critical" } as const;
export const LogViewer = ({ title, lines, maxHeight = 320, startLine = 1, onDownload, loading = false, emptyLabel = "Aucune ligne", className }: LogViewerProps) => {
  const id = useId();
  const [copyStatus, setCopyStatus] = useState("");
  // Colonnes vides réservées dès qu'une ligne a un horodatage ou un niveau : alignement des messages
  const withTimestamp = lines.some(line => line.timestamp);
  const withLevel = lines.some(line => line.level);
  const copy = async () => { const ok = await copyToClipboard(lines.map(line => [line.timestamp, line.level ? LEVEL[line.level] : null, line.message].filter(Boolean).join(" ")).join("\n")); setCopyStatus(ok ? "Copié" : "Copie impossible"); };
  return <section className={["log-viewer", className].filter(Boolean).join(" ")} aria-labelledby={id} aria-busy={loading || undefined}>
    <header className="log-viewer__header"><h3 id={id}>{title}</h3><div className="log-viewer__actions"><GhostButton size="sm" label="Copier" iconStart="copy-01" disabled={loading || !lines.length} onClick={() => void copy()} />{onDownload && <GhostButton size="sm" label="Télécharger" iconStart="download-02" onClick={onDownload} disabled={loading || !lines.length} />}</div></header>
    <span role="status">{copyStatus}</span>
    <div className="log-viewer__body cadence-scrollbar" style={{ maxHeight }} tabIndex={0} role="region" aria-label={`Contenu — ${title}`}>
      {loading ? <p role="status">Chargement…</p> : !lines.length ? <p>{emptyLabel}</p> : <ol className="log-viewer__lines" start={startLine}>{lines.map((line, index) => <li key={line.id} className={`log-viewer__line${line.highlighted ? " log-viewer__line--highlighted" : ""}`}><span className="log-viewer__number">{startLine + index}</span>{withTimestamp && <span className="log-viewer__timestamp">{line.timestamp}</span>}{withLevel && <span className="log-viewer__level">{line.level && <Indicator variant={TONE[line.level]} label={LEVEL[line.level]} hideIcon />}</span>}{line.highlighted && <span className="log-viewer__highlight-label">Ligne signalée</span>}<code>{line.message}</code></li>)}</ol>}
    </div>
  </section>;
};
