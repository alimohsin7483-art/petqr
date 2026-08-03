"use client";

import { useState } from "react";
import { createProductAction, updateProductStripeIdAction, toggleProductActiveAction } from "@/actions/shop-admin";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function NewProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInr, setPriceInr] = useState("799");
  const [priceUsd, setPriceUsd] = useState("14.99");
  const [visualVariant, setVisualVariant] = useState("steel");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setPending(true);
    setError(null);
    const result = await createProductAction({
      name,
      description,
      priceUsd: parseFloat(priceUsd),
      priceInr: parseFloat(priceInr),
      visualVariant,
    });
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setName("");
    setDescription("");
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-3">
        <Field label="Price (INR)" value={priceInr} onChange={(e) => setPriceInr(e.target.value)} />
        <Field label="Price (USD, international)" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Tag color</label>
        <select
          value={visualVariant}
          onChange={(e) => setVisualVariant(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        >
          <option value="steel">Steel</option>
          <option value="brass">Brass</option>
          <option value="black">Matte black</option>
        </select>
      </div>
      {error && <p className="text-sm text-alert">{error}</p>}
      <Button onClick={handleCreate} disabled={pending} className="w-auto">
        {pending ? "Creating…" : "Create product"}
      </Button>
    </div>
  );
}

export function ProductStripeIdForm({
  productId,
  stripePriceId,
}: {
  productId: string;
  stripePriceId: string | null;
}) {
  const [value, setValue] = useState(stripePriceId ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink/50">Stripe Price ID (one-time)</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="price_..."
          className="rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs"
        />
      </div>
      <Button
        variant="ghost"
        className="w-auto"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setSaved(false);
          await updateProductStripeIdAction(productId, value);
          setPending(false);
          setSaved(true);
        }}
      >
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </Button>
    </div>
  );
}

export function ProductActiveToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      className="w-auto text-xs"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await toggleProductActiveAction(productId, !active);
        setPending(false);
        setActive(!active);
      }}
    >
      {pending ? "Updating…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}
