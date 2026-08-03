import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server component / Server Action / Route Handler usage.
 * Reads/writes the Supabase session from Next.js cookies.
 *
 * Browser/client-component usage lives in a separate file
 * (src/lib/supabase-browser.ts) — this file is server-only (imports
 * next/headers) and must never be imported from a "use client" component,
 * or the build fails since next/headers can't be bundled for the browser.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component with no request context — safe to ignore,
          // middleware will refresh the session on the next request.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // See note above.
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses RLS entirely. Use ONLY in webhook handlers
 * and background jobs that must operate outside a specific user's context.
 * Never expose this client to anything reachable from the browser.
 */
export function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
