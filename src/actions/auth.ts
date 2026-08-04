"use server";

import { createServerSupabaseClient } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  signUpSchema,
  signInSchema,
  requestResetSchema,
  resetPasswordSchema,
  updateProfileSchema,
  type SignUpInput,
  type SignInInput,
  type RequestResetInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
} from "@/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { queueNotification } from "@/services/notifications/queue";
import { sendMetaConversionEvent } from "@/services/analytics/meta-capi";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

type ActionResult = { error: string } | { success: true; eventId?: string };

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const limited = await checkRateLimit(`signup:${ip}`, 5, "1 h");
  if (!limited.success) return { error: "Too many attempts. Try again later." };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Could not create account. Try again." };

  // Mirror the auth user into our own `users` table immediately so every
  // other table's foreign keys (pets, subscriptions, etc.) have something
  // to point at even before the email is verified.
  let user;
  try {
    user = await prisma.user.upsert({
      where: { authUserId: data.user.id },
      update: {},
      create: {
        authUserId: data.user.id,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
      },
    });
  } catch (err) {
    // P2002 = unique constraint violation. Happens when this email already
    // has a row in `users` tied to a different authUserId — e.g. a prior
    // signup attempt, or Supabase issuing a fresh auth user id for an email
    // that was never confirmed. Surface a clean message instead of a 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        error: "An account with this email already exists. Try signing in instead, or reset your password if you've forgotten it.",
      };
    }
    throw err;
  }

  await queueNotification({
    channel: "EMAIL",
    templateKey: "welcome",
    entityType: "user",
    entityId: user.id,
    payload: { fullName: parsed.data.fullName },
  });

  const eventId = crypto.randomUUID();
  await sendMetaConversionEvent({
    eventName: "CompleteRegistration",
    eventId,
    email: parsed.data.email,
    clientIp: ip,
  });

  return { success: true, eventId };
}

export async function signInAction(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const limited = await checkRateLimit(`signin:${ip}:${parsed.data.email}`, 8, "10 m");
  if (!limited.success) return { error: "Too many attempts. Try again in a few minutes." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Deliberately generic message — never reveal whether the email exists.
  if (error) return { error: "Incorrect email or password." };

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function requestPasswordResetAction(
  input: RequestResetInput
): Promise<ActionResult> {
  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const limited = await checkRateLimit(`reset:${ip}`, 5, "1 h");
  if (!limited.success) return { error: "Too many attempts. Try again later." };

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`,
  });

  // Always return success — never confirm/deny whether the email is registered.
  return { success: true };
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  redirect("/sign-in");
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const { user } = await getCurrentUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
    },
  });

  return { success: true };
}