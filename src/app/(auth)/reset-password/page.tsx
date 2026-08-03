"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { requestResetSchema, type RequestResetInput } from "@/validations/auth";
import { requestPasswordResetAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function ResetPasswordRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({ resolver: zodResolver(requestResetSchema) });

  async function onSubmit(values: RequestResetInput) {
    await requestPasswordResetAction(values);
    setSubmitted(true); // always show the same state, whether or not the email exists
  }

  if (submitted) {
    return (
      <AuthCard eyebrow="Password reset" title="Check your inbox">
        <p className="text-sm text-ink/70">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Reset your password"
      subtitle="We'll email you a secure link."
      footer={
        <Link href="/sign-in" className="text-brass-dark underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
