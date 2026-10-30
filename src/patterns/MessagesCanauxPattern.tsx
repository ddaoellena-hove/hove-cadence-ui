import { useState } from "react";
import {
  PageHeader, PageSection, SegmentedControl, Checkbox, FormField, RichTextEditor, RepeatableFieldGroup,
  Dropdown, FormActions, PrimaryButton, InlineAlert,
  isRichTextEmpty, richTextToPlainText, type RichTextDocument,
} from "@ddaoellena/cadence-ui";

// Pattern — Messages par canal et traductions (R3).
// Sélection des canaux, message commun ou personnalisé, traductions. Changer de
// mode conserve les saisies. Ce gabarit n'envoie rien : la diffusion, la
// traduction automatique et la synthèse vocale sont des intégrations produit.
const CHANNELS = [
  { id: "email", label: "E-mail", plainOnly: false },
  { id: "app", label: "Application", plainOnly: false },
  { id: "sms", label: "SMS", plainOnly: true, description: "Texte simple uniquement" },
];
const LANGUAGES = [{ id: "en", label: "Anglais" }, { id: "es", label: "Espagnol" }];
const EMPTY: RichTextDocument = { blocks: [] };

interface Translation { id: string; language: string; message: RichTextDocument }

export const MessagesCanauxPattern = () => {
  const [channels, setChannels] = useState(["email"]);
  const [mode, setMode] = useState("common");
  const [common, setCommon] = useState(EMPTY);
  const [perChannel, setPerChannel] = useState<Record<string, RichTextDocument>>({});
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [nextId, setNextId] = useState(1);
  const [checked, setChecked] = useState(false);

  const messageOf = (id: string) => (mode === "common" ? common : perChannel[id] ?? EMPTY);
  const channelError = (id: string) => (checked && isRichTextEmpty(messageOf(id)) ? "Rédigez le message de ce canal." : undefined);
  const channelsError = checked && channels.length === 0 ? "Choisissez au moins un canal." : undefined;
  const commonError = checked && mode === "common" && isRichTextEmpty(common) ? "Rédigez le message." : undefined;
  const valid = channels.length > 0 && channels.every((id) => !isRichTextEmpty(messageOf(id)));
  const smsPreview = channels.includes("sms") ? richTextToPlainText(messageOf("sms")) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <PageHeader title="Messages voyageurs" subtitle="Préparez les messages de chaque canal." />

      <FormField label="Canaux" required error={channelsError || undefined}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CHANNELS.map((channel) => (
            <Checkbox
              key={channel.id}
              label={channel.label}
              description={channel.description}
              state={channels.includes(channel.id) ? "checked" : "unchecked"}
              onChange={(on) => setChannels((list) => (on ? [...list, channel.id] : list.filter((id) => id !== channel.id)))}
            />
          ))}
        </div>
      </FormField>

      <SegmentedControl
        aria-label="Rédaction"
        value={mode}
        onChange={setMode}
        options={[{ value: "common", label: "Message commun" }, { value: "custom", label: "Par canal" }]}
      />

      {mode === "common" ? (
        <RichTextEditor label="Message" required value={common} onChange={setCommon} maxLength={500} error={commonError || undefined} />
      ) : (
        CHANNELS.filter((channel) => channels.includes(channel.id)).map((channel) => (
          <RichTextEditor
            key={channel.id}
            label={`Message — ${channel.label}`}
            required
            value={perChannel[channel.id] ?? EMPTY}
            onChange={(next) => setPerChannel((map) => ({ ...map, [channel.id]: next }))}
            error={channelError(channel.id)}
          />
        ))
      )}

      {smsPreview && (
        <PageSection bodyPadding="all" title="Aperçu SMS">
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{smsPreview}</p>
        </PageSection>
      )}

      <PageSection bodyPadding="all" title="Traductions">
      <RepeatableFieldGroup
        label="Traductions"
        items={translations}
        max={LANGUAGES.length}
        addLabel="Ajouter une traduction"
        getId={(item) => item.id}
        getTitle={(item) => `Traduction ${LANGUAGES.find((language) => language.id === item.language)?.label ?? ""}`.trim()}
        onAdd={() => {
          const free = LANGUAGES.find((language) => !translations.some((item) => item.language === language.id));
          setTranslations((list) => [...list, { id: `t${nextId}`, language: free?.id ?? "", message: EMPTY }]);
          setNextId(nextId + 1);
        }}
        onRemove={(id) => setTranslations((list) => list.filter((item) => item.id !== id))}
        renderItem={(item) => (
          <>
            <Dropdown
              label="Langue"
              value={item.language}
              options={LANGUAGES.map((language) => ({ ...language, disabled: translations.some((other) => other.id !== item.id && other.language === language.id) }))}
              onChange={(language) => setTranslations((list) => list.map((other) => (other.id === item.id ? { ...other, language } : other)))}
            />
            <RichTextEditor
              label="Texte traduit"
              value={item.message}
              onChange={(message) => setTranslations((list) => list.map((other) => (other.id === item.id ? { ...other, message } : other)))}
            />
          </>
        )}
      />
      </PageSection>

      {checked && valid && <InlineAlert type="success">Messages prêts. Aucun envoi n'est effectué ici.</InlineAlert>}
      <FormActions>
        <PrimaryButton label="Vérifier les messages" onClick={() => setChecked(true)} />
      </FormActions>
    </div>
  );
};
