import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase";
import { prisma } from "./db";
import type { UserRole } from "@prisma/client";

export class AuthError extends Error {}
export class ForbiddenError extends Error {}

/**
 * Resolves the current Supabase session and the matching PetLink `User` row.
 * Throws AuthError if there is no valid session — callers decide whether to
 * redirect (pages) or return a typed error (Server Actions/API routes).
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) throw new AuthError("Not signed in");

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
  });

  if (!user || user.deletedAt) throw new AuthError("Account not found");

  return { authUser, user };
}

/** Use in Server Components/pages that require auth: redirects instead of throwing. */
export async function requireUser() {
  try {
    return await getCurrentUser();
  } catch {
    redirect("/sign-in");
  }
}

/** Use in Server Actions/route handlers: enforces a role allow-list. */
export async function requireRole(...roles: UserRole[]) {
  const ctx = await getCurrentUser();
  if (!roles.includes(ctx.user.role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")}`);
  }
  return ctx;
}
