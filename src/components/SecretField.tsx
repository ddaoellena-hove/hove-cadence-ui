import { useId, useRef, useState } from "react";
import { TextInput } from "./TextInput";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import "./secret-field.css";

export interface SecretFieldProps {
  label: string;
  /** Seul l'état est transmis, jamais le secret existant. */
  isSet: boolean;
  onSave: (secret: string) => void | Promise<void>;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}
/** Remplacement explicite d'un secret. Une promesse rejetée laisse le brouillon éditable. */
export const SecretField = ({ label, isSet, onSave, disabled = false, helperText, error, className }: SecretFieldProps) => {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const close = () => { setEditing(false); setDraft(""); setFailure(""); requestAnimationFrame(() => trigger.current?.focus()); };
  const save = async () => {
    if (!draft || disabled || saving) return;
    setSaving(true); setFailure("");
    try { await onSave(draft); close(); }
    catch { setFailure("L’enregistrement a échoué. Réessayez."); }
    finally { setSaving(false); }
  };
  return <div className={["secret-field", className].filter(Boolean).join(" ")} role="group" aria-label={label} onKeyDown={event => {
    if (!editing || saving) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key === "Enter" && event.target === input.current) { event.preventDefault(); void save(); }
  }}>
    {editing ? <>
      <TextInput ref={input} label={label} type="password" value={draft} onChange={e => setDraft(e.target.value)} disabled={disabled || saving} state={error || failure ? "error" : "enabled"} helperText={error || failure || helperText} />
      <div className="secret-field__actions"><GhostButton label="Annuler" disabled={saving} onClick={close} /><PrimaryButton label="Enregistrer" disabled={disabled || !draft} loading={saving} onClick={() => void save()} /></div>
    </> : <>
      <span id={id} className="secret-field__label">{label}</span>
      <div className="secret-field__display"><span aria-labelledby={id} className="secret-field__value">{isSet ? "Secret défini ••••••" : "Non défini"}</span><GhostButton ref={trigger} label={isSet ? "Remplacer" : "Définir"} aria-label={`${isSet ? "Remplacer" : "Définir"} — ${label}`} disabled={disabled} onClick={() => { setEditing(true); requestAnimationFrame(() => input.current?.focus()); }} /></div>
      {(error || helperText) && <p className="secret-field__help">{error || helperText}</p>}
    </>}
    <span role="status" className="secret-field__status">{saving ? "Enregistrement…" : failure}</span>
  </div>;
};
