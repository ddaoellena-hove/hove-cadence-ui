/**
 * FileUpload component.
 *
 * Zone de dépôt + bouton « Parcourir ». Valide le type (`accept`) et la taille
 * (`maxSize`) côté composant, puis remonte les fichiers retenus via `onFiles` :
 * **il n'envoie rien lui-même**. La liste `files` (contrôlée) affiche l'état
 * d'envoi (ProgressBar). Changements annoncés via `aria-live`.
 *
 * Chaque fichier est une carte : intitulé d'état en capitales, picto
 * document, nom et taille, action à droite (corbeille une fois importé,
 * croix sinon) et, pendant l'envoi, barre de progression et pourcentage.
 */
import { useId, useRef, useState, type DragEvent } from "react";
import { AlertCircle } from "@untitledui/icons/AlertCircle";
import { Upload01 } from "@untitledui/icons/Upload01";
import { CloseButton } from "./CloseButton";
import { PrimaryButton } from "./PrimaryButton";
import { ProgressBar } from "./ProgressBar";
import { formatFileSize, rejectFile } from "./file-upload-utils";
import "./file-upload.css";

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  /** `uploading` : 0–100. */
  progress?: number;
  /** `error` : message affiché. */
  error?: string;
}

export interface FileUploadProps {
  /** Extensions acceptées (« .zip,.csv »). */
  accept?: string;
  multiple?: boolean;
  /** Taille maximale en octets. */
  maxSize?: number;
  /** Fichiers retenus (type/taille valides). L'app gère l'envoi. */
  onFiles?: (files: File[]) => void;
  /** Liste contrôlée affichée avec son état d'envoi. */
  files?: UploadFile[];
  /** Retrait d'un fichier de la liste. */
  onRemove?: (id: string) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

// Intitulé d'état affiché en capitales au-dessus de chaque fichier.
const STATUS_CAPTION: Record<UploadFile["status"], string> = {
  pending: "Fichier en attente",
  uploading: "Fichier en cours d’import",
  success: "Fichier importé",
  error: "Échec de l’import",
};

// Espace insécable avant le %, en constante (évite un caractère irrégulier en source).
const NBSP = "\u00A0";

/** Picto document décoratif : dégradé ardoise, coin replié. */
const FileGlyph = () => {
  const gradientId = useId();
  return (
    <svg className="file-upload__glyph" width="28" height="38" viewBox="0 0 28 38" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="file-upload__glyph-top" />
          <stop offset="1" className="file-upload__glyph-bottom" />
        </linearGradient>
      </defs>
      <path d="M5 0h13l10 10v23a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z" fill={`url(#${gradientId})`} />
      <path className="file-upload__glyph-fold" d="M18 0l10 10h-7a3 3 0 0 1-3-3V0Z" />
    </svg>
  );
};

export const FileUpload = ({ accept, multiple = false, maxSize, onFiles, files = [], onRemove, className }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);
  const hintId = useId();

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(list)) {
      const reason = rejectFile(file, accept, maxSize);
      if (reason) rejected.push(reason);
      else accepted.push(file);
    }
    setRejections(rejected);
    if (accepted.length > 0) onFiles?.(multiple ? accepted : accepted.slice(0, 1));
  };

  const hasHint = Boolean(accept || maxSize !== undefined);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const rootClass = ["file-upload", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div
        className={`file-upload__zone${dragging ? " file-upload__zone--dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Upload01 className="file-upload__zone-icon" size={28} aria-hidden="true" />
        <p className="file-upload__zone-text">
          {multiple ? "Glissez vos fichiers ici, ou" : "Glissez votre fichier ici, ou"}
        </p>
        <PrimaryButton outline size="sm" label="Parcourir" onClick={() => inputRef.current?.click()} />
        {hasHint && (
          <p id={hintId} className="file-upload__hint">
            {accept ? `Formats acceptés : ${accept.split(",").join(", ")}` : "Tous les formats"}
            {maxSize !== undefined ? ` — ${formatFileSize(maxSize)} max.` : ""}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          className="file-upload__input"
          accept={accept}
          multiple={multiple}
          aria-label="Choisir des fichiers"
          aria-describedby={hasHint ? hintId : undefined}
          tabIndex={-1}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Erreurs de validation, annoncées. */}
      {rejections.length > 0 && (
        <div role="alert">
        <ul className="file-upload__errors">
          {rejections.map((msg, i) => (
            <li key={i} className="file-upload__error-item">
              <AlertCircle size={16} aria-hidden="true" />
              {msg}
            </li>
          ))}
        </ul>
        </div>
      )}

      {/* Liste des fichiers avec leur état. */}
      {files.length > 0 && (
        <ul className="file-upload__list" aria-live="polite">
          {files.map((file) => (
            <li key={file.id} className={`file-upload__file file-upload__file--${file.status}`}>
              <p className="file-upload__file-caption">
                {file.status === "error" && <AlertCircle size={14} aria-hidden="true" />}
                {STATUS_CAPTION[file.status]}
              </p>
              <div className="file-upload__file-row">
                <FileGlyph />
                <div className="file-upload__file-main">
                  <span className="file-upload__file-name">{file.name}</span>
                  <span className="file-upload__file-size">{formatFileSize(file.size)}</span>
                </div>
                {onRemove && (file.status === "success" ? (
                  <PrimaryButton
                    outline
                    tone="danger"
                    size="sm"
                    icon="trash"
                    aria-label={`Supprimer ${file.name}`}
                    className="file-upload__delete"
                    onClick={() => onRemove(file.id)}
                  />
                ) : (
                  <CloseButton
                    aria-label={file.status === "uploading" ? `Annuler l’import de ${file.name}` : `Retirer ${file.name}`}
                    className="file-upload__dismiss"
                    onClick={() => onRemove(file.id)}
                  />
                ))}
              </div>
              {file.status === "uploading" && (
                <div className="file-upload__file-progress">
                  <ProgressBar value={file.progress} aria-label={`Import de ${file.name}`} />
                  {typeof file.progress === "number" && Number.isFinite(file.progress) && (
                    <span className="file-upload__file-percent" aria-hidden="true">
                      {Math.round(Math.min(100, Math.max(0, file.progress)))}
                      {NBSP}%
                    </span>
                  )}
                </div>
              )}
              {file.status === "error" && file.error && (
                <p className="file-upload__file-error">{file.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
