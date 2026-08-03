"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/validations/auth";
import { resetPasswordAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function ResetPasswordConfirmPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordInput) {
    setServerError(null);
    const result = await resetPasswordAction(values);
    if (result && "error" in result) setServerError(result.error);
    // On success, resetPasswordAction redirects to /sign-in.
  }

  return (
    <AuthCard eyebrow="Password reset" title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {serverError && <p className="text-sm text-alert">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthCard>
  );
}
