"use client";

import { useState } from "react";
import { generateTagBatchAction } from "@/actions/shop-admin";
import { Button } from "@/components/ui/button";

export function GenerateBatchForm() {
  const [count, setCount] = useState(50);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    setDone(false);
    const result = await generateTagBatchAction(count);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">How many tags?</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
          className="w-32 rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
      </div>
      <Button onClick={handleGenerate} disabled={pending} className="w-auto">
        {pending ? "Generating…" : "Generate batch"}
      </Button>
      {done && <span className="text-sm text-found">Batch generated ✓</span>}
      {error && <span className="text-sm text-alert">{error}</span>}
    </div>
  );
}
