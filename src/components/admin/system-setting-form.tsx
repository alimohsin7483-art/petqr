"use client";

import { useState } from "react";
import { upsertSystemSettingAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function SystemSettingForm({
  initialKey = "",
  initialValue = "",
}: {
  initialKey?: string;
  initialValue?: string;
}) {
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!key.trim()) return;
    setPending(true);
    setSaved(false);
    await upsertSystemSettingAction(key.trim(), value);
    setPending(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Key</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          disabled={!!initialKey}
          placeholder="feature_flag_x"
          className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs disabled:bg-paper disabled:text-ink/50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Value (JSON or plain string)</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='true, "some text", or {"a":1}'
          className="w-64 rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
        />
      </div>
      <Button onClick={handleSave} disabled={pending} className="w-auto">
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </Button>
    </div>
  );
}
