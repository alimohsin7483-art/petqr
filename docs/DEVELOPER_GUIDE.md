# Developer Guide

## Day-to-day commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build + serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run prisma:migrate` | Create + apply a new migration locally |
| `npm run prisma:deploy` | Apply committed migrations (CI/production) |
| `npm run prisma:seed` | Seed pricing tiers + demo data |
| `npm run prisma:generate` | Regenerate the Prisma client after a schema change without a new migration |

## Adding a feature end to end

Using "vaccination reminders via SMS" as a hypothetical example of the intended flow:

1. **Schema** (if needed) — edit `prisma/schema.prisma`, run `npm run prisma:migrate`, add RLS
   if it's a new tenant table.
2. **Service** — business logic in `src/services/<area>/`, framework-agnostic, unit-testable.
3. **Validation** — a Zod schema in `src/validations/`.
4. **Server Action** — thin wrapper in `src/actions/` that validates, calls the service, and
   returns `{ error }` / `{ success: true }` or redirects.
5. **UI** — a Server Component page for the read path, a small client component for the
   interactive bit (form/toggle), following the existing patterns in `src/components/ui/` and
   `src/components/pet/` or `src/components/admin/`.
6. **Tests** — at minimum, a unit test on the validation schema and, if there's real logic (like
   a limit check or a state transition), an integration test on the service with Prisma mocked
   (see `tests/integration/pets-service.test.ts` for the pattern).
7. **Notifications** (if relevant) — add a case to
   `src/services/notifications/email/templates.ts` (and the WhatsApp equivalent), call
   `queueNotification()` from wherever the event happens.
8. **Analytics** (if relevant) — add a name to `ANALYTICS_EVENTS` in
   `src/lib/analytics/track.ts`, fire it via `trackEvent()` client-side or
   `sendMetaConversionEvent()` server-side for high-value conversions.

## Debugging RLS issues

If a query returns nothing (or errors) that you expect to succeed:
1. Confirm you're calling it through `withRLS(authUserId, ...)`, not the raw `prisma` export.
2. Confirm the relevant policy exists in `supabase/migrations/0001_rls_and_triggers.sql` and was
   actually applied to your Supabase project (re-run it in the SQL Editor if unsure — it's
   idempotent via `create or replace` / `create policy` — drop-and-recreate if you've edited an
   existing policy, since `create policy` alone will error on a duplicate name).
3. Check `current_app_user_id()` resolves — it depends on `users.auth_user_id` matching the
   JWT's `sub` claim, which only exists for rows created through the normal sign-up flow.

## Working with the notification queue locally

Notifications write to `notification_jobs` immediately but aren't sent until the cron worker
runs. Locally, hit the route directly instead of waiting for Vercel Cron:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/process-notifications
```

## Code style

Prettier + ESLint are configured; there's no separate style guide beyond what's enforced by
those and the conventions in `CONTRIBUTING.md`.
