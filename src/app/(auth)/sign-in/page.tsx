"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { signInSchema, type SignInInput } from "@/validations/auth";
import { signInAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setServerError(null);
    const result = await signInAction(values);
    if (result && "error" in result) setServerError(result.error);
    // On success, signInAction redirects server-side.
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in"
      footer={
        <div className="flex flex-col gap-2">
          <Link href="/reset-password" className="text-brass-dark underline underline-offset-4">
            Forgot your password?
          </Link>
          <span>
            New to PetLink?{" "}
            <Link href="/sign-up" className="text-brass-dark underline underline-offset-4">
              Create an account
            </Link>
          </span>
        </div>
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
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {serverError && <p className="text-sm text-alert">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
