"use client";

import { useState } from "react";
import { toggleLostModeAction } from "@/actions/pets";
import { Button } from "@/components/ui/button";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics/track";

export function LostModeToggle({ petId, isLost }: { petId: string; isLost: boolean }) {
  const [pending, setPending] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(next: boolean) {
    setPending(true);
    setError(null);
    const result = await toggleLostModeAction({ petId, isLost: next, lastSeenNotes: notes });
    setPending(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    if (next) trackEvent(ANALYTICS_EVENTS.LOST_MODE_ENABLED, { petId });
  }

  if (isLost) {
    return (
      <div className="rounded-tag border border-alert/30 bg-alert/5 p-5">
        <p className="mb-3 text-sm font-medium text-alert">
          Lost mode is on — the public page shows a lost banner and finders are prompted to reach
          you.
        </p>
        {error && <p className="mb-2 text-xs text-alert">{error}</p>}
        <Button variant="ghost" disabled={pending} onClick={() => handleToggle(false)} className="w-auto">
          {pending ? "Updating…" : "Mark as found / turn off lost mode"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-tag border border-line bg-white/50 p-5">
      <p className="mb-3 text-sm font-medium text-ink">Gone missing?</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Last seen near… (optional, shown to finders)"
        className="mb-3 w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
        rows={2}
      />
      {error && <p className="mb-2 text-xs text-alert">{error}</p>}
      <Button disabled={pending} onClick={() => handleToggle(true)} className="w-auto bg-alert hover:bg-alert/90">
        {pending ? "Activating…" : "Activate lost mode"}
      </Button>
    </div>
  );
}
