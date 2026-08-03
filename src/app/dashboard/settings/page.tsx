"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import Link from "next/link";
import { updateProfileSchema, type UpdateProfileInput } from "@/validations/auth";
import { updateProfileAction } from "@/actions/auth";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({ resolver: zodResolver(updateProfileSchema) });

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        reset({ fullName: data.fullName ?? "", phone: data.phone ?? "" });
        setLoaded(true);
      });
  }, [reset]);

  async function onSubmit(values: UpdateProfileInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateProfileAction(values);
    if (result && "error" in result) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
  }

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Settings
      </p>
      <h1 className="mb-3 font-display text-3xl font-medium text-ink">Your profile</h1>
      <p className="mb-8 text-sm text-ink/60">
        Add a phone number to unlock the Call and WhatsApp buttons on your pets' public pages —
        without one, finders can only reach you through the message form.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <Field
          label="Phone number (with country code)"
          placeholder="+919876543210"
          error={errors.phone?.message}
          {...register("phone")}
        />
        {serverError && <p className="text-sm text-alert">{serverError}</p>}
        {saved && (
          <div className="rounded-tag border border-found/30 bg-found/5 p-4">
            <p className="mb-2 text-sm font-medium text-found">Saved ✓</p>
            <Link href="/dashboard" className="text-sm text-brass-dark underline underline-offset-4">
              ← Back to dashboard
            </Link>
          </div>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
