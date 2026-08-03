"use client";

import { useState } from "react";
import { updatePlanProviderIdsAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function PlanProviderIdsForm({
  planId,
  stripePriceId,
  razorpayPlanId,
}: {
  planId: string;
  stripePriceId: string | null;
  razorpayPlanId: string | null;
}) {
  const [stripe, setStripe] = useState(stripePriceId ?? "");
  const [razorpay, setRazorpay] = useState(razorpayPlanId ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setPending(true);
    setSaved(false);
    await updatePlanProviderIdsAction(planId, stripe, razorpay);
    setPending(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Stripe Price ID</label>
        <input
          value={stripe}
          onChange={(e) => setStripe(e.target.value)}
          placeholder="price_..."
          className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Razorpay Plan ID</label>
        <input
          value={razorpay}
          onChange={(e) => setRazorpay(e.target.value)}
          placeholder="plan_..."
          className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
        />
      </div>
      <Button onClick={handleSave} disabled={pending} className="w-auto">
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </Button>
    </div>
  );
}
