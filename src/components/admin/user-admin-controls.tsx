"use client";

import { useState } from "react";
import { suspendUserAction, reinstateUserAction, setUserRoleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function UserAdminControls({
  userId,
  isSuspended,
  role,
}: {
  userId: string;
  isSuspended: boolean;
  role: "OWNER" | "ADMIN";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ error: string } | { success: true }>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if ("error" in result) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-alert">{error}</p>}
      <div className="flex gap-2">
        {isSuspended ? (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => reinstateUserAction(userId))}
            className="w-auto"
          >
            Reinstate account
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => suspendUserAction(userId))}
            className="w-auto text-alert"
          >
            Suspend account
          </Button>
        )}
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => setUserRoleAction(userId, role === "ADMIN" ? "OWNER" : "ADMIN"))}
          className="w-auto"
        >
          {role === "ADMIN" ? "Revoke admin" : "Make admin"}
        </Button>
      </div>
    </div>
  );
}
