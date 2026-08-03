import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma client (avoids exhausting connections in dev/HMR).
 * Use this ONLY for admin/service-role contexts (webhooks, cron jobs,
 * migrations, seed scripts) where RLS should be bypassed intentionally
 * via the Supabase service role connection string.
 */
export const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

/**
 * Runs `callback` inside a transaction with the caller's Supabase JWT
 * claims applied to the Postgres session, so RLS policies defined in
 * supabase/migrations/0001_rls_and_triggers.sql are enforced exactly as
 * they would be for a direct PostgREST/Supabase client call.
 *
 * Every authenticated Server Action / route handler MUST use this instead
 * of the raw `prisma` export.
 */
export async function withRLS<T>(
  authUserId: string,
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Mirrors what Supabase's PostgREST layer does: expose the JWT's `sub`
    // claim to `auth.uid()` for the duration of this transaction only.
    await tx.$executeRawUnsafe(
      `select set_config('request.jwt.claims', $1, true)`,
      JSON.stringify({ sub: authUserId })
    );
    return callback(tx);
  });
}
