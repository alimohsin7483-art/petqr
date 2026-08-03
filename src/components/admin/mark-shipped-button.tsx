"use client";

import { useState } from "react";
import { markOrderShippedAction } from "@/actions/shop-admin";
import { Button } from "@/components/ui/button";

export function MarkShippedButton({ orderId, alreadyShipped }: { orderId: string; alreadyShipped: boolean }) {
  const [pending, setPending] = useState(false);
  const [shipped, setShipped] = useState(alreadyShipped);

  if (shipped) return <span className="text-xs text-found">Shipped</span>;

  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await markOrderShippedAction(orderId);
        setPending(false);
        if ("success" in result) setShipped(true);
      }}
      className="w-auto text-xs"
    >
      {pending ? "Updating…" : "Mark shipped"}
    </Button>
  );
}
