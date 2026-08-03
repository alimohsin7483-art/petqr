"use client";

import { useState } from "react";
import { updateContactPrefsAction } from "@/actions/pets";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink/50">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-ink" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function ContactPrefsPanel({
  petId,
  initialShowCall,
  initialShowWhatsapp,
  initialShowLastSeenNote,
}: {
  petId: string;
  initialShowCall: boolean;
  initialShowWhatsapp: boolean;
  initialShowLastSeenNote: boolean;
}) {
  const [showCallButton, setShowCallButton] = useState(initialShowCall);
  const [showWhatsappButton, setShowWhatsappButton] = useState(initialShowWhatsapp);
  const [showLastSeenNote, setShowLastSeenNote] = useState(initialShowLastSeenNote);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function save(next: { showCallButton: boolean; showWhatsappButton: boolean; showLastSeenNote: boolean }) {
    setPending(true);
    setSaved(false);
    await updateContactPrefsAction({ petId, ...next });
    setPending(false);
    setSaved(true);
  }

  return (
    <div className="rounded-tag border border-line bg-white/50 p-5">
      <p className="mb-1 text-sm font-medium text-ink">What finders can see</p>
      <p className="mb-2 text-xs text-ink/50">
        Control what shows up on your pet's public scan page. A message form is always available
        regardless of these settings.
      </p>
      <div className="divide-y divide-line">
        <Toggle
          label="Call button"
          description="Shows a masked number finders can tap to call you."
          checked={showCallButton}
          onChange={(v) => {
            setShowCallButton(v);
            save({ showCallButton: v, showWhatsappButton, showLastSeenNote });
          }}
        />
        <Toggle
          label="WhatsApp button"
          description="Lets finders message you on WhatsApp directly."
          checked={showWhatsappButton}
          onChange={(v) => {
            setShowWhatsappButton(v);
            save({ showCallButton, showWhatsappButton: v, showLastSeenNote });
          }}
        />
        <Toggle
          label="Last-seen location"
          description="Shows the note you leave when activating lost mode."
          checked={showLastSeenNote}
          onChange={(v) => {
            setShowLastSeenNote(v);
            save({ showCallButton, showWhatsappButton, showLastSeenNote: v });
          }}
        />
      </div>
      {pending && <p className="mt-2 text-xs text-ink/40">Saving…</p>}
      {saved && !pending && <p className="mt-2 text-xs text-found">Saved ✓</p>}
    </div>
  );
}
