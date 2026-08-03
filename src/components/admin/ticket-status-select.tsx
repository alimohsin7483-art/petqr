"use client";

import { useState } from "react";
import { updateTicketStatusAction } from "@/actions/admin";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export function TicketStatusSelect({
  ticketId,
  status,
}: {
  ticketId: string;
  status: (typeof STATUSES)[number];
}) {
  const [pending, setPending] = useState(false);

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={async (e) => {
        setPending(true);
        await updateTicketStatusAction(ticketId, e.target.value as any);
        setPending(false);
      }}
      className="rounded-lg border border-line bg-white px-2 py-1 font-mono text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
