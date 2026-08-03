"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { signUpSchema, type SignUpInput } from "@/validations/auth";
import { signUpAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics/track";

export default function SignUpPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await signUpAction(values);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    trackEvent(ANALYTICS_EVENTS.SIGNUP, { method: "email" }, result.eventId);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthCard eyebrow="Step 1 of 2" title="Check your inbox">
        <p className="text-sm text-ink/70">
          We sent a verification link to your email. Open it to activate your account and
          register your first pet.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Create account"
      title="Give your pet a way home"
      subtitle="Takes about a minute. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brass-dark underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field
          label="Full name"
          type="text"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {serverError && <p className="text-sm text-alert">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
