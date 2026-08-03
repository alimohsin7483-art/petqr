"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { AuthCard } from "@/components/auth/auth-card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) {
      setError("Couldn't resend right now. Try again shortly.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard eyebrow="Verify email" title="New link sent">
        <p className="text-sm text-ink/70">Check your inbox for a fresh verification link.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Verify email"
      title="Link expired or already used"
      subtitle="Enter your email and we'll send a new verification link."
    >
      <form onSubmit={handleResend} className="flex flex-col gap-5">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="text-sm text-alert">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Resend verification email"}
        </Button>
      </form>
    </AuthCard>
  );
}
